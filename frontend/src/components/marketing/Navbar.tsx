import Image from "next/image";
import Link from "next/link";
import { navLinks } from "@/lib/site";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-mechpro-purple/10 bg-white/80 backdrop-blur-xl">
      <div className="section-wrap flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-mechpro-purple/20">
            <Image src="/images/mechpro-logo.png" alt="MechPro logo" width={40} height={40} className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-mechpro-ink">MechPro Experts</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-mechpro-purple/70">B2B2C Automotive Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-mechpro-ink/75 transition hover:bg-mechpro-mist hover:text-mechpro-purple"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className="rounded-lg px-4 py-2 text-sm font-medium text-mechpro-ink/75 transition hover:bg-mechpro-mist hover:text-mechpro-purple">
            For Business
          </Link>
          <Link href="/services" className="rounded-lg px-4 py-2 text-sm font-medium text-mechpro-ink/75 transition hover:bg-mechpro-mist hover:text-mechpro-purple">
            Partners
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button href="/login" variant="ghost">
            Login
          </Button>
          <div className="hidden sm:block">
            <Button href="/contact">Get Started</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
