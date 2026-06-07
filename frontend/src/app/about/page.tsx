import { Reveal } from "@/components/marketing/Reveal";

const principles = [
  "Business-first operating model with structured SLAs",
  "Verified workshop ecosystem with audit-driven onboarding",
  "Documentation transparency across claims, quotations, invoices and payments",
  "Dedicated claim consultants to reduce turnaround time",
];

export default function AboutPage() {
  return (
    <main className="section-wrap py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mechpro-purple">About MechPro Experts</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Built for high-stakes automotive operations</h1>
        <p className="mt-5 text-base text-mechpro-ink/70">
          MechPro Experts is a premium B2B2C platform enabling corporates, insurance stakeholders, and fleet owners to
          orchestrate vehicle service, claim and inspection journeys with full visibility.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {principles.map((item) => (
          <Reveal key={item}>
            <div className="glass-card rounded-2xl p-6">
              <p className="text-sm font-semibold text-mechpro-ink/85">{item}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10">
        <div className="rounded-3xl bg-mechpro-ink p-8 text-white md:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Mission</p>
          <h2 className="mt-3 text-3xl font-black">Make every claim and service journey calm, transparent and accountable.</h2>
          <p className="mt-4 max-w-3xl text-sm text-white/75">
            We align business client goals, partner workshop efficiency, and end-customer trust in one operating layer.
          </p>
        </div>
      </Reveal>
    </main>
  );
}
