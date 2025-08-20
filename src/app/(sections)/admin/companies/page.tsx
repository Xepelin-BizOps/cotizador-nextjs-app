import { Country } from "@prisma/client";
import { getCurrenciesCatalog } from "../../home/_actions";
import { createCompany, getCompanies } from "./actions";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await getCompanies();
  const currencies = await getCurrenciesCatalog();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Compañías</h1>

      <form action={createCompany} className="space-y-2 max-w-md">
        <input
          name="companyName"
          placeholder="Nombre"
          className="border p-2 w-full"
          required
        />
        <input
          name="businessIdentifier"
          placeholder="Identificador"
          className="border p-2 w-full"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          required
        />
        <select name="currencyId" className="border p-2 w-full" required>
          <option value="">Moneda</option>
          {currencies.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select name="country" className="border p-2 w-full" required>
          {Object.values(Country).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input name="address" placeholder="Dirección" className="border p-2 w-full" />
        <input name="rfc" placeholder="RFC" className="border p-2 w-full" />
        <input name="phone" placeholder="Teléfono" className="border p-2 w-full" />
        <input name="logoUrl" placeholder="Logo URL" className="border p-2 w-full" />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Crear
        </button>
      </form>

      <div>
        <h2 className="font-semibold mb-2">Listado</h2>
        <ul className="space-y-1">
          {companies.map((c) => (
            <li key={c.id}>
              {c.companyName} - {c.businessIdentifier}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
