import type { DashboardRow } from "@/lib/portal-data";
import { StatusBadge } from "./StatusBadge";

type TableProps = {
  rows: DashboardRow[];
  title: string;
};

export function Table({ rows, title }: TableProps) {
  return (
    <section className="rounded-2xl border border-[#e3daf7] bg-white p-5 shadow-[0_12px_34px_rgba(111,43,255,0.08)]">
      <h3 className="text-lg font-black text-[#0f144a]">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-xs font-black uppercase tracking-[0.08em] text-[#7e88b5]">
              <th className="pb-2">ID</th>
              <th className="pb-2">Details</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#efebfb]">
                <td className="py-3 text-sm font-bold text-[#19204f]">{row.id}</td>
                <td className="py-3">
                  <p className="text-sm font-bold text-[#19204f]">{row.primary}</p>
                  <p className="text-xs font-medium text-[#6f7aa9]">{row.secondary}</p>
                </td>
                <td className="py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="py-3 text-sm font-bold text-[#475087]">{row.amount ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
