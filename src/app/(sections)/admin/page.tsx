import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Administración</h1>
      <ul className="list-disc pl-4 space-y-2">
        <li>
          <Link href="/admin/companies" className="text-blue-600 hover:underline">
            Compañías
          </Link>
        </li>
      </ul>
    </div>
  );
}
