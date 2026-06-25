import { Card } from "@/components/ui/Card";

interface TableRow {
  id: string;
  label: string;
  status: string;
  amount: string;
}

export function DataTable({ rows }: { rows: TableRow[] }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="py-2">ID</th>
            <th className="py-2">Label</th>
            <th className="py-2">Status</th>
            <th className="py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-2">{row.id}</td>
              <td className="py-2">{row.label}</td>
              <td className="py-2">{row.status}</td>
              <td className="py-2">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
