import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/20 bg-mechpro-ink py-16 text-white">
      <div className="section-wrap grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-2xl font-black">MechPro Experts</p>
          <p className="mt-4 max-w-md text-sm text-white/65">
            End-to-end car management, inspection, claims and workshop partner orchestration for enterprise clients.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Company</p>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <Link href="/about" className="block hover:text-white">About Us</Link>
            <Link href="/services" className="block hover:text-white">Services</Link>
            <Link href="/contact" className="block hover:text-white">Contact</Link>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Reach</p>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <p>hello@mechproexperts.in</p>
            <p>+91 22 4988 1107</p>
            <p>Mumbai, Maharashtra</p>
          </div>
        </div>
      </div>

      <div className="section-wrap mt-12 border-t border-white/10 pt-6 text-xs text-white/45">
        © 2026 MechPro Experts. All rights reserved.
      </div>
    </footer>
  );
}
