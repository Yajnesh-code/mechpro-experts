type StatusBadgeProps = {
  status: "pending" | "in-progress" | "completed" | "active";
};

const statusMap = {
  pending: "bg-amber-100 text-amber-700",
  "in-progress": "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  active: "bg-sky-100 text-sky-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusMap[status]}`}>
      {status.replace("-", " ")}
    </span>
  );
}
