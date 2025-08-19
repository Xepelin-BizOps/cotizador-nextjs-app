import { getCurrencies, verifyAdmin } from "../actions";
import CompanyForm from "./CompanyForm";

export default async function Page() {
  await verifyAdmin();
  const currencies = await getCurrencies();
  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold mb-4">Crear empresa</h2>
      <CompanyForm currencies={currencies} />
    </div>
  );
}
