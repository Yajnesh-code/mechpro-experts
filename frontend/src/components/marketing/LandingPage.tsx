"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

const tabs = ["Request Demo", "Register Business", "Become Partner", "Contact Sales"];

const serveCards = [
  { icon: "🏢", title: "Large Corporates", desc: "Fleet management, employee vehicle services, preventive maintenance, and doorstep support at scale.", tags: ["Fleet Mgmt", "Doorstep"] },
  { icon: "🤝", title: "Insurance Brokers & Agents", desc: "Pre-inspection, claim coordination, survey follow-up, and documentation handled end-to-end.", tags: ["Claims", "Inspection"] },
  { icon: "🌐", title: "Web Aggregators", desc: "Seamless integration for inspection and claim services at the point of policy purchase.", tags: ["API Ready", "Policy"] },
  { icon: "🚚", title: "Fleet Owners", desc: "Breakdown support, multi-vehicle management, priority repairs, and real-time fleet tracking.", tags: ["Priority", "Breakdown"] },
  { icon: "🏦", title: "Insurance Companies", desc: "Dedicated claim inspection, settlement advisory up to INR 50K, and survey support.", tags: ["Survey", "Settlement"] },
  { icon: "🔧", title: "Workshop Partners", desc: "Join our verified network. Get qualified leads, transparent job flow, and guaranteed payment cycles.", tags: ["Partner", "Network"] },
];

const serviceCards = [
  { num: "01", icon: "💬", title: "Service Consultancy", desc: "Expert second opinion on car issues before committing to any repair or service.", tags: ["2nd Opinion", "Expert Advice"] },
  { num: "02", icon: "📦", title: "Service Packages", desc: "Flexible bundled service options - doorstep, breakdown, or garage - for your fleet.", tags: ["Doorstep", "Breakdown", "Garage"] },
  { num: "03", icon: "🚑", title: "Accident Repairs", desc: "End-to-end accident repair management from inspection to claim settlement up to INR 50K.", tags: ["Claim Inspection", "Settlement 50K", "Preferred Partner"] },
  { num: "04", icon: "📋", title: "Claim Management", desc: "Full insurance coordination with survey follow-up, documentation, and settlement transparency.", tags: ["Insurance Coord.", "Docs"] },
  { num: "05", icon: "🔍", title: "Inspection & Pre-inspection", desc: "Post-accident inspection and pre-purchase inspection with certified assessors.", tags: ["Post Accident", "Pre-policy"] },
  { num: "06", icon: "✨", title: "Detailing & Part Procurement", desc: "Premium detailing, interior restoration, and genuine parts through verified supply chains.", tags: ["Detailing", "Genuine Parts"] },
];

const steps = [
  ["🏢", "Business", "Registers", "Demo or signup"],
  ["📝", "Raise", "Lead", "Customer profile"],
  ["🚗", "Vehicle", "Details", "RC + photos"],
  ["🔧", "Partner", "Matched", "Best workshop"],
  ["💰", "Quotation", "", "Uploaded & approved"],
  ["⚙️", "Repair /", "Claim", "Work begins"],
  ["📄", "Invoice", "", "Transparent billing"],
  ["💳", "Payment", "", "Real-time tracked"],
  ["⭐", "Feedback &", "Completion", "Rated & closed"],
] as const;

const whyCards = [
  "Verified Partner Network",
  "Real-Time Transparency",
  "In-house Claim Expertise",
  "2-Hour Response SLA",
  "End-to-End Digital Flow",
  "Scales with Your Business",
];

const whyDesc = [
  "Every workshop is multi-point verified: certifications, equipment, track record, and compliance.",
  "Live dashboards show every lead, quotation, job status, and payment without update chasing.",
  "Claim consultants handle insurance coordination, survey follow-up, and settlement support up to INR 50K.",
  "Industry-leading response times with dedicated account managers for enterprise clients.",
  "RC uploads, car photos, quotations, invoices, and feedback are digital, documented, and auditable.",
  "From 10-vehicle fleets to large corporate programs, MechPro scales without compromising quality.",
];

const testimonials = [
  {
    avatar: "RK",
    text: "MechPro transformed how we handle fleet claims. What used to take weeks now takes days. Their partner network is genuinely impressive across Mumbai.",
    name: "Rajesh Kumar",
    role: "Fleet Manager, TechCorp India",
  },
  {
    avatar: "PS",
    text: "As an insurance broker, I recommend MechPro to every client. Their claim coordination is unmatched and the transparency gives clients real confidence.",
    name: "Priya Sharma",
    role: "Senior Broker, InsureWell",
    bg: "linear-gradient(135deg,#EC4899,#F72585)",
  },
  {
    avatar: "AJ",
    text: "Our entire pre-inspection workflow runs through MechPro now. Seamless digital documentation and a 2-hour SLA they actually honor.",
    name: "Arun Joshi",
    role: "Operations Head, PolicyFirst",
    bg: "linear-gradient(135deg,#4f46e5,#7C3AED)",
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll(".fade-up").forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      io.disconnect();
    };
  }, []);

  const submitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <nav id="nav" className={scrolled ? "scrolled" : ""}>
        <a className="nav-logo" href="#home">
          <div className="logo-mark">
            <Image src="/images/mechpro-logo-clean.png" alt="MechPro Experts logo" width={1047} height={780} priority />
          </div>
          <div className="logo-wordmark">
            <strong>MechPro Experts</strong>
            <span>B2B2C Automotive Platform</span>
            <em>Automotive Affinity Program</em>
          </div>
        </a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#business">For Business</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#cities">Cities</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-end">
          <Link className="btn-nav-ghost" href="/login">Login</Link>
          <a className="btn-nav-primary" href="#lead-form">Get Started</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot">✦</div>
            India&apos;s #1 B2B Car Management Platform
          </div>
          <h1>
            Manage every car
            <br />
            claim <span className="grad">faster,</span>
            <br />
            <span className="magenta">smarter</span>
          </h1>
          <p className="hero-sub">
            MechPro Experts bridges insurance companies, large corporates, and fleet operators to verified service
            partners, making every claim seamless, transparent, and stress-free.
          </p>
          <div className="hero-actions">
            <a className="btn-lg btn-primary-lg" href="#lead-form">Request Demo →</a>
            <a className="btn-lg btn-ghost-lg" href="#lead-form">Become Partner</a>
          </div>
          <div className="hero-stats">
            <div><div className="stat-val">500+</div><div className="stat-lbl">Partner Workshops</div></div>
            <div><div className="stat-val">98%</div><div className="stat-lbl">Claim Success Rate</div></div>
            <div><div className="stat-val">2hrs</div><div className="stat-lbl">Avg. Response Time</div></div>
          </div>
        </div>

        <div className="hero-right">
          <div className="dashboard-card hero-photo-card" style={{ position: "relative", zIndex: 2 }}>
            <Image
              src="/images/hero-claim-mechpro.png"
              alt="A confident woman sitting next to her car after a hassle-free claim experience with MechPro"
              width={1672}
              height={941}
              className="hero-photo"
              priority
            />
          </div>
          <div className="hero-kpi-row">
            <div className="hero-badge">
              <span className="hero-badge-icon success">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.7 19.3 14.4 12c.7-2 .2-4.3-1.5-6a6.1 6.1 0 0 0-6.4-1.4l3.8 3.8-2.8 2.8-3.9-3.7A6.1 6.1 0 0 0 5 14c1.7 1.7 4 2.2 6 1.5l7.3 7.3c.4.4 1 .4 1.4 0l2-2c.4-.5.4-1.1 0-1.5Z" /></svg>
              </span>
              <span>
                <strong>500+</strong>
                <small>Verified Workshops</small>
              </span>
            </div>
            <div className="hero-badge">
              <span className="hero-badge-icon price">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v2.4h-4.1c.6.5 1 1.2 1.2 2.1H18v2.3h-2.9c-.4 2.4-2.3 4-5.2 4.2l5.5 5H11.8l-5.6-5.2v-2.2h2.9c1.6 0 2.7-.6 3.1-1.8H6V8.5h6.1A2.9 2.9 0 0 0 9.4 6.4H6V4Z" /></svg>
              </span>
              <span>
                <strong>INR 50K</strong>
                <small>Settlement Support</small>
              </span>
            </div>
            <div className="hero-badge">
              <span className="hero-badge-icon time">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" /></svg>
              </span>
              <span>
                <strong>5 Cities</strong>
                <small>Mumbai Region Live</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-strip">
        <div className="trust-lbl">Trusted by India&apos;s leading businesses and insurers</div>
        <div className="trust-logos">{["TATA AIG", "BAJAJ ALLIANZ", "HDFC ERGO", "ICICI LOMBARD", "RELIANCE GIC", "SBI GENERAL"].map((i) => <div key={i} className="trust-logo">{i}</div>)}</div>
      </div>

      <div className="trusted-marquee" aria-label="Business categories that trust MechPro">
        <div className="marquee-track">
          {[
            "Trusted by",
            "Large Corporates",
            "Insurance Brokering Houses",
            "Fleet Operators",
            "Policy Aggregators",
            "Verified Service Partners",
            "Accident Repair Specialists",
            "Claims Consultants",
            "Workshop Networks",
            "Pre-inspection Teams",
            "Corporate Mobility Teams",
          ].map((item) => (
            <span className={item === "Trusted by" ? "marquee-label" : "marquee-item"} key={item}>
              {item}
            </span>
          ))}
          {[
            "Trusted by",
            "Large Corporates",
            "Insurance Brokering Houses",
            "Fleet Operators",
            "Policy Aggregators",
            "Verified Service Partners",
            "Accident Repair Specialists",
            "Claims Consultants",
            "Workshop Networks",
            "Pre-inspection Teams",
            "Corporate Mobility Teams",
          ].map((item) => (
            <span className={item === "Trusted by" ? "marquee-label" : "marquee-item"} key={`${item}-repeat`} aria-hidden="true">
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="about" id="about">
        <div className="about-grid">
          <div>
            <span className="s-tag">About MechPro</span>
            <h2 className="s-h2">Insurance claim support<br />and car service<br />management for <span className="g">businesses.</span></h2>
            <p className="s-sub">We manage vehicle insurance claims from first notification of loss to settlement. Our team coordinates with policyholders, garages, surveyors, and service partners so the car owner gets a smoother, more transparent experience.</p>
            <div className="about-pts">
              <AboutPt icon="🔗" title="B2B2C Flow" text="Business → MechPro → Service Partner → Customer. Seamless at every step." />
              <AboutPt icon="🛡️" title="Verified Partner Network" text="500+ rigorously vetted workshops across Mumbai, Thane, Navi Mumbai and beyond." />
              <AboutPt icon="📊" title="Real-Time Claim Tracking" text="Full transparency from lead creation to invoice. Every stakeholder stays informed." />
            </div>
          </div>
          <div className="about-visual">
            <div className="metric-card mc-1 fade-up"><div className="mc-num">10K+</div><div className="mc-lbl">Claims managed successfully</div><div className="mc-bar" style={{ width: "65%" }} /></div>
            <div className="metric-card mc-2 fade-up"><div className="mc-num">INR 50K</div><div className="mc-lbl">Claim settlement up to</div><div className="mc-bar" style={{ width: "80%", background: "var(--grad-r)" }} /><div className="mc-tags"><span className="mc-tag">Mumbai</span><span className="mc-tag">Thane</span><span className="mc-tag">Navi Mumbai</span></div></div>
          </div>
        </div>
      </section>

      <section className="serve" id="business">
        <div className="s-center"><span className="s-tag">Who We Serve</span><h2 className="s-h2">Built for <span className="g">enterprise-grade</span> clients</h2><p className="s-sub">From large corporates to insurance aggregators, MechPro is designed for business-first operations at scale.</p></div>
        <div className="serve-grid">
          {serveCards.map((c) => (
            <div className="serve-card fade-up" key={c.title}>
              <div className="sc-icon">{c.icon}</div>
              <div className="sc-h">{c.title}</div>
              <div className="sc-p">{c.desc}</div>
              <div className="sc-tags">{c.tags.map((t) => <span className="sc-tag" key={t}>{t}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="services" id="services">
        <div className="services-intro">
          <div><span className="s-tag">Our Services</span><h2 className="s-h2">Everything your<br />business needs,<br /><span className="g">in one</span><br /><span className="m">platform</span></h2></div>
          <div style={{ display: "flex", alignItems: "center" }}><p className="s-sub">From accident claims to parts procurement, powered by verified partners across 5 cities.</p></div>
        </div>
        <div className="services-grid">
          {serviceCards.map((s) => (
            <div className="svc-card fade-up" key={s.title}>
              <div className="svc-num">{s.num}</div>
              <div className="svc-icon-wrap">{s.icon}</div>
              <div className="svc-h">{s.title}</div>
              <div className="svc-p">{s.desc}</div>
              <div className="svc-tags">{s.tags.map((t) => <span className="svc-tag" key={t}>{t}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="hiw" id="how-it-works">
        <div className="s-center"><span className="s-tag">How It Works</span><h2 className="s-h2">From lead to <span className="g">completion</span> in one flow</h2><p className="s-sub">A transparent, trackable journey from the first click to the final invoice. Nothing falls through the cracks.</p></div>
        <div className="hiw-steps">
          {steps.map((s) => (
            <div className="hiw-step fade-up" key={`${s[1]}-${s[2]}`}>
              <div className="hiw-dot">{s[0]}</div>
              <h4>{s[1]}<br />{s[2]}</h4>
              <p>{s[3]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="why">
        <div className="s-center"><span className="s-tag">Why MechPro</span><h2 className="s-h2">The <span className="g">unfair advantage</span><br />for your business</h2><p className="s-sub">Technology, verified networks, and domain expertise combined to deliver what no one else can.</p></div>
        <div className="why-grid">
          {whyCards.map((w, i) => (
            <div className="why-card fade-up" key={w}><div className="why-n">{String(i + 1).padStart(2, "0")}</div><div className="why-h">{w}</div><div className="why-p">{whyDesc[i]}</div></div>
          ))}
        </div>
      </section>

      <section className="cities" id="cities">
        <div className="s-center"><span className="s-tag">Cities We Serve</span><h2 className="s-h2">Currently operational across <span className="g">Maharashtra</span></h2><p className="s-sub">Rapidly expanding. Your city may be next.</p></div>
        <div className="cities-wrap">
          {[
            ["🏙️", "Mumbai", "Live", "city-live", false],
            ["🌆", "Thane", "Live", "city-live", false],
            ["🌇", "Navi Mumbai", "Live", "city-live", false],
            ["🏘️", "Panvel", "Live", "city-live", false],
            ["🌳", "Palghar", "Live", "city-live", false],
            ["🌄", "Pune", "Soon", "city-soon", true],
            ["🏔️", "Nashik", "Soon", "city-soon", true],
          ].map((c) => (
            <div className="city-card fade-up" key={String(c[1])} style={c[4] ? { opacity: 0.5 } : undefined}>
              <div className="city-icon">{c[0]}</div>
              <div className="city-name">{c[1]}</div>
              <span className={`city-status ${c[3]}`}>{c[2]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="testi">
        <div className="s-center"><span className="s-tag">Testimonials</span><h2 className="s-h2">What our <span className="g">clients</span> say</h2><p className="s-sub">Real words from real business partners who trust MechPro every day.</p></div>
        <div className="testi-grid">
          {testimonials.map((t) => (
            <div className="testi-card fade-up" key={t.name}>
              <div className="testi-stars">{Array.from({ length: 5 }).map((_, i) => <span className="star" key={i} />)}</div>
              <p className="testi-q">&quot;{t.text}&quot;</p>
              <div className="testi-author">
                <div className="t-ava" style={t.bg ? { background: t.bg } : undefined}>{t.avatar}</div>
                <div><div className="t-name">{t.name}</div><div className="t-role">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="form-sec" id="lead-form">
        <div className="s-center"><span className="s-tag">Get In Touch</span><h2 className="s-h2">Start your <span className="g">partnership</span><br />with MechPro</h2><p className="s-sub">Fill in your details and our enterprise team will reach out within 24 hours.</p></div>
        <div className="form-box" id="contact">
          <div className="form-tabs">
            {tabs.map((tab) => (
              <button key={tab} className={`f-tab ${activeTab === tab ? "active" : ""}`} type="button" onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>
          <div className="form-body">
            <form onSubmit={submitForm}>
              <div className="f-grid">
                <Field label="Company Name *" placeholder="Acme Corp Pvt. Ltd." required />
                <Field label="Contact Person *" placeholder="Rajesh Kumar" required />
                <Field label="Email Address *" placeholder="rajesh@company.com" type="email" required />
                <Field label="Phone Number *" placeholder="+91 98765 43210" type="tel" required />
                <Select label="Business Type *" required options={["Large Corporate", "Insurance Broker / Agent", "Insurance Web Aggregator", "Fleet Owner", "Insurance Company", "Workshop / Service Partner"]} />
                <Select label="City *" required options={["Mumbai", "Thane", "Navi Mumbai", "Panvel", "Palghar", "Other"]} />
                <Select label="Number of Vehicles" options={["1 - 10", "11 - 50", "51 - 200", "200+"]} />
                <Select label="Service Interested In" options={["Service Consultancy", "Accident Repairs", "Claim Management", "Inspection / Pre-inspection", "Fleet Management", "Partner Enrollment", "All Services"]} />
                <div className="f-grp full">
                  <label className="f-lbl">Message</label>
                  <textarea placeholder="Tell us about your requirements or any specific questions..." />
                </div>
              </div>
              <div className="f-submit"><button type="submit" className="btn-submit" style={submitted ? { background: "linear-gradient(135deg,#059669,#10B981)", boxShadow: "0 4px 20px rgba(5,150,105,0.35)" } : undefined} disabled={submitted}>{submitted ? "Submitted! We will contact you within 24 hours." : `Submit ${activeTab} →`}</button></div>
              <p className="f-note">Your data is secure. We never share your information with third parties.</p>
            </form>
          </div>
        </div>
      </section>

      <section className="cta-sec">
        <span className="s-tag" style={{ color: "rgba(255,255,255,0.4)" }}>Ready to Transform?</span>
        <h2 className="s-h2">India&apos;s most trusted<br /><span className="g">B2B automotive platform</span></h2>
        <p className="cta-sub">Join 500+ workshops, 50+ enterprise clients, and thousands of satisfied car owners in the MechPro ecosystem.</p>
        <div className="cta-btns">
          <a className="btn-cta-primary" href="#lead-form">Get Started Today →</a>
          <a className="btn-cta-ghost" href="tel:+912245678900">Call Us Now</a>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="fb-brand">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="footer-logo-mark">
                <Image src="/images/mechpro-logo-clean.png" alt="MechPro Experts logo" width={1047} height={780} />
              </div>
              <div style={{ lineHeight: 1.2 }}><strong style={{ fontSize: "13px", color: "#fff", display: "block" }}>MechPro Experts</strong><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>B2B2C Platform</span></div>
            </div>
            <p>End-to-end car management, claim solutions, and workshop network built for businesses that demand the best.</p>
            <div className="footer-socials">
              <a className="soc-btn linkedin" href="#" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.34 8h4.32v14H.34V8Zm7.35 0h4.14v1.91h.06c.58-1.1 1.99-2.26 4.1-2.26 4.38 0 5.19 2.88 5.19 6.63V22h-4.32v-6.85c0-1.63-.03-3.73-2.27-3.73-2.28 0-2.63 1.78-2.63 3.61V22H7.69V8Z" /></svg>
              </a>
              <a className="soc-btn twitter" href="#" aria-label="X">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 1.5h3.68l-8.04 9.19L24 22.5h-7.41l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.5h7.6l5.24 6.93L18.9 1.5Zm-1.29 18.92h2.04L6.49 3.47H4.3l13.31 16.95Z" /></svg>
              </a>
              <a className="soc-btn facebook" href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" /></svg>
              </a>
              <a className="soc-btn instagram" href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.22-.41a3.71 3.71 0 0 1-1.38-.9 3.71 3.71 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.34 2.68.92 3.35.62 4.14.32 4.9.12 5.78.06 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91.05-1.28.06-1.69.06-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.39-2.13A5.87 5.87 0 0 0 19.86.62c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" /></svg>
              </a>
            </div>
          </div>
          <div className="footer-col"><h4>Services</h4><a href="#">Service Consultancy</a><a href="#">Accident Repairs</a><a href="#">Claim Management</a><a href="#">Inspection</a><a href="#">Detailing</a><a href="#">Part Procurement</a></div>
          <div className="footer-col"><h4>Company</h4><a href="#">About Us</a><a href="#">Partner Network</a><a href="#">For Business</a><a href="#">Careers</a><a href="#">Blog</a></div>
          <div className="footer-col"><h4>Contact</h4><a href="mailto:hello@mechproexperts.in">hello@mechproexperts.in</a><a href="tel:+912245678900">+91 22 4567 8900</a><a href="#">Mumbai, Maharashtra</a><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
        </div>
        <div className="footer-bot"><span>© 2026 <span className="footer-brand-text">MechPro Experts</span>. All rights reserved.</span><span>Made with care in Mumbai</span></div>
      </footer>
    </>
  );
}

function AboutPt({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="about-pt fade-up">
      <div className="apt-icon">{icon}</div>
      <div><div className="apt-h">{title}</div><div className="apt-p">{text}</div></div>
    </div>
  );
}

function LeadRow({
  initials,
  name,
  detail,
  badge,
  badgeClass,
  avatarBg,
}: {
  initials: string;
  name: string;
  detail: string;
  badge: string;
  badgeClass: string;
  avatarBg?: string;
}) {
  return (
    <div className="dc-lead">
      <div className="dc-avatar" style={avatarBg ? { background: avatarBg } : undefined}>{initials}</div>
      <div className="dc-lead-info"><div className="dc-lead-name">{name}</div><div className="dc-lead-sub">{detail}</div></div>
      <span className={`dc-badge ${badgeClass}`}>{badge}</span>
    </div>
  );
}

function Field({ label, placeholder, type = "text", required = false }: { label: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <div className="f-grp">
      <label className="f-lbl">{label}</label>
      <input type={type} placeholder={placeholder} required={required} />
    </div>
  );
}

function Select({ label, options, required = false }: { label: string; options: string[]; required?: boolean }) {
  return (
    <div className="f-grp">
      <label className="f-lbl">{label}</label>
      <select required={required} defaultValue="">
        <option value="" disabled>{`Select ${label.replace(" *", "").toLowerCase()}`}</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}
