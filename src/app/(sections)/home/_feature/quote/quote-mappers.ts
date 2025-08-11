import { EditQuoteDto } from "@/schemas/quote/quote.dto";
import { QuotesWithRelations } from "./quote-types";



export const mapQuoteListToFormValues = (quote: QuotesWithRelations): EditQuoteDto => ({
    id: quote.id,
    companyId: quote.companyId,
    clientId: quote.clientId,
    quotationDate: quote.quotationDate,
    status: quote.status,
    items: quote.items.map(item => ({
        productName: item.productName,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
    })),
    totalAmount: Number(quote.totalAmount),
    note: quote.note || ""
});