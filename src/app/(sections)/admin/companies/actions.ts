"use server";

import { prisma } from "@/lib/prisma";
import { createCompanySchema } from "@/schemas/company/company.schema";
import type { CreateCompanyDto } from "@/schemas/company/company.dto";
import { Country } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getCompanies() {
  const companies = await prisma.company.findMany({
    include: { currency: true },
    orderBy: { id: "desc" },
  });
  return companies;
}

export async function createCompany(formData: FormData) {
  const data: CreateCompanyDto = {
    businessIdentifier: String(formData.get("businessIdentifier") || ""),
    country: formData.get("country") as Country,
    currencyId: Number(formData.get("currencyId")),
    companyName: String(formData.get("companyName") || ""),
    address: (formData.get("address") as string) || null,
    rfc: (formData.get("rfc") as string) || null,
    email: String(formData.get("email") || ""),
    phone: (formData.get("phone") as string) || null,
    logoUrl: (formData.get("logoUrl") as string) || null,
  };

  const parsed = createCompanySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  await prisma.company.create({ data: parsed.data });
  revalidatePath("/admin/companies");
}
