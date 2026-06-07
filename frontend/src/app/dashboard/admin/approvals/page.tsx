import { approvalUsers } from "@/lib/auth";
import { StatusBadge } from "@/components/dashboard/RoleBadge";

function statusTone(status: string) {
  if (status === "Approved" || status === "Verified") return "green" as const;
  if (status === "Rejected" || status === "Incomplete") return "red" as const;
  if (status === "Suspended") return "purple" as const;
  return "amber" as const;
}

export default function AdminApprovalsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white px-4 py-10 text-[#0f0f1a]">
      <div className="pointer-events-none fixed -right-28 -top-24 h-[460px] w-[460px] rounded-full bg-violet-100 blur-3xl" />
      <section className="relative mx-auto max-w-7xl rounded-[2rem] border border-[#e8e4f4] bg-white p-6 shadow-[0_24px_80px_rgba(124,58,237,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-violet-600">Admin Verification</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">User Approvals</h1>
            <p className="mt-1 text-sm font-semibold text-[#64748b]">Review and approve registered business accounts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All Roles", "All Status", "All Cities"].map((filter) => <button key={filter} className="rounded-xl border border-[#e8e4f4] bg-[#f8f7ff] px-4 py-2 text-sm font-black text-[#0f0f1a]">{filter} ⌄</button>)}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e8e4f4]">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-[#f8f7ff] text-xs uppercase tracking-[.1em] text-[#94a3b8]">
              <tr>{["Company Name", "Contact Person", "Role", "City", "Email", "Mobile", "Docs", "Status", "Submitted", "Action"].map((head) => <th key={head} className="px-4 py-4 font-black">{head}</th>)}</tr>
            </thead>
            <tbody>
              {approvalUsers.map((user) => (
                <tr key={user.company} className="border-t border-[#e8e4f4]">
                  <td className="px-4 py-4 font-black">{user.company}</td>
                  <td className="px-4 py-4 font-semibold text-[#64748b]">{user.contact}</td>
                  <td className="px-4 py-4"><StatusBadge label={user.role} tone="purple" /></td>
                  <td className="px-4 py-4 font-semibold text-[#64748b]">{user.city}</td>
                  <td className="px-4 py-4"><StatusBadge label={user.email} tone={statusTone(user.email)} /></td>
                  <td className="px-4 py-4"><StatusBadge label={user.mobile} tone={statusTone(user.mobile)} /></td>
                  <td className="px-4 py-4"><StatusBadge label={user.docs} tone={statusTone(user.docs)} /></td>
                  <td className="px-4 py-4"><StatusBadge label={user.status} tone={statusTone(user.status)} /></td>
                  <td className="px-4 py-4 font-semibold text-[#64748b]">{user.submitted}</td>
                  <td className="px-4 py-4"><button className="rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 px-3 py-2 text-xs font-black text-white shadow-sm">View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
