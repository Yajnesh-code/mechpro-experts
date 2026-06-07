import { coreServices } from "@/lib/site";
import { Reveal } from "@/components/marketing/Reveal";

export default function ServicesPage() {
  return (
    <main className="section-wrap py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mechpro-purple">Service Portfolio</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Comprehensive automotive + claim operations stack</h1>
        <p className="mt-5 text-base text-mechpro-ink/70">
          Built to support enterprises from first-notice lead creation to post-job settlement, reporting and feedback.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coreServices.map((item, index) => (
          <Reveal key={item.title}>
            <div className="glass-card rounded-2xl p-6">
              <p className="text-xs font-bold text-mechpro-magenta">Service {String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 text-lg font-extrabold">{item.title}</h2>
              <p className="mt-2 text-sm text-mechpro-ink/70">{item.summary}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
