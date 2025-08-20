import { Prisma } from "@prisma/client";

export type QuotesWithRelations = Prisma.QuotationGetPayload<{
    include: {
        client: true;
        items: true
    };
}>;

// Nuevo tipo para frontend, donde pasamos Decimal a number
export type PlainQuotationItem = Omit<QuotesWithRelations['items'][number], 'unitPrice' | 'totalPrice'> & {
    unitPrice: number;
    totalPrice: number;
};

export interface QuoteSection {
    title: string;
    content: string;
}

export type PlainQuotesWithRelations = Omit<QuotesWithRelations, 'items' | 'totalAmount' | 'sections'> & {
    totalAmount: number;
    items: PlainQuotationItem[];
    sections: QuoteSection[] | null;
};


export interface ResQuoteList {
    success: boolean | null;
    message: string;
    data: PlainQuotesWithRelations[];
    total: number;
}


export type QuotesDetails = Prisma.QuotationGetPayload<{
    include: {
        company: true;
        client: true;
        items: {
            include: {
                product: true
            }
        }
    };
}>;

// V: plana para frontend
// export type PlainQuotesDetails = Omit<
//     QuotesDetails,
//     'totalAmount' | 'items' | 'createdAt' | 'updatedAt'
// > & {
//     totalAmount: number;
//     createdAt: string;
//     updatedAt: string;
//     items: (Omit<
//         QuotesDetails['items'][number],
//         'unitPrice' | 'totalPrice' | 'product'
//     > & {
//         unitPrice: number;
//         totalPrice: number;
//         product: Omit<QuotesDetails['items'][number]['product'], 'price'> & {
//             price: number;
//         };
//     })[];
// };

export type PlainQuotesDetails = Omit<
    QuotesDetails,
    "totalAmount" | "items" | "sections"
> & {
    totalAmount: number;
    items: (Omit<QuotesDetails["items"][number], "unitPrice" | "totalPrice"> & {
        unitPrice: number;
        totalPrice: number;
    })[];
    sections: QuoteSection[] | null;
};

export interface ResponseDetails {
    success: boolean;
    data: PlainQuotesDetails;
    message: string;
}

