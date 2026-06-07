import { LeadCaptureForm } from "@/components/marketing/LeadCaptureForm";
import { Reveal } from "@/components/marketing/Reveal";

export default function ContactPage() {
  return (
    <main className="section-wrap py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mechpro-purple">Contact Sales</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Let us design your MechPro operating program</h1>
        <p className="mt-5 text-base text-mechpro-ink/70">
          Share your fleet size, geography, and service priorities. Our B2B onboarding desk will connect within 24
          hours.
        </p>
      </div>

      <Reveal className="mt-10">
        <LeadCaptureForm />
      </Reveal>
    </main>
  );
}
