type ChartCardProps = {
  title: string;
  points: { label: string; value: number }[];
};

export function ChartCard({ title, points }: ChartCardProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <section className="rounded-2xl border border-[#e3daf7] bg-white p-5 shadow-[0_12px_34px_rgba(111,43,255,0.08)]">
      <h3 className="text-lg font-black text-[#0f144a]">{title}</h3>
      <div className="mt-5 flex items-end justify-between gap-3">
        {points.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end rounded-xl bg-[#f5f1ff] p-1">
              <div
                className="w-full rounded-lg bg-mechpro-gradient transition-all"
                style={{ height: `${Math.max((point.value / maxValue) * 100, 8)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#6b77aa]">{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
