import { Prisma } from "@prisma/client";

export type companyById = Prisma.CompanyGetPayload<{ include: {} }>;


export interface ResponseDetails {
    success: boolean;
    data: companyById | null;
    message: string;
}