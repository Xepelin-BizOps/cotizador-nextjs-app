"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Country } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function adminLogin(email: string, password: string) {
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return { success: false, message: "Credenciales inválidas" };
  }

  const token = jwt.sign({ role: "ADMIN", email }, JWT_SECRET, {
    expiresIn: "2h",
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: "admin_token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 3600 * 2,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return { success: true };
}

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) {
    throw new Error("No autorizado");
  }
  const payload = jwt.verify(token, JWT_SECRET) as { role: string };
  if (payload.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return true;
}

interface CompanyData {
  businessIdentifier: string;
  companyName: string;
  email: string;
  country: Country;
  currencyId: number;
}

export async function createCompany(data: CompanyData) {
  await verifyAdmin();
  try {
    await prisma.company.create({
      data: {
        businessIdentifier: data.businessIdentifier,
        companyName: data.companyName,
        email: data.email,
        country: data.country,
        currency: { connect: { id: data.currencyId } },
      },
    });
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return { success: false, message };
  }
}

export async function getCurrencies() {
  await verifyAdmin();
  return prisma.currency.findMany({ select: { id: true, value: true } });
}
