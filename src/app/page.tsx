"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "next-intl";

function PricingToggle() {
  const [annual, setAnnual] = useState(false);
  const t = useTranslations("landing");
  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm ${!annual ? "text-neu-text font-medium" : "text-neu-muted"}`}>{t("pricingMonthly")}</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${annual ? "bg-brand-500" : "shadow-neu-inset-sm bg-neu-bg"}`}
        >
          <motion.div
            animate={{ x: annual ? 28 : 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
          />
        </button>
        <span className={`text-sm ${annual ? "text-neu-text font-medium" : "text-neu-muted"}`}>
          {t("pricingAnnual")} <span className="text-green-600 text-xs font-medium">{t("pricingSave")}</span>
        </span>
      </div>
      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl shadow-neu p-8 bg-neu-bg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-brand-600" />
          <AnimatePresence mode="wait">
            <motion.div
              key={annual ? "annual" : "monthly"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-bold text-neu-text mb-2">
                {annual ? t("pricingAnnualAccess") : t("pricingMonthlyAccess")}
              </h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-neu-text">
                  {annual ? "$278" : "$29"}
                </span>
                <span className="text-neu-muted">{annual ? t("pricingYear") : t("pricingMonth")}</span>
                {annual && (
                  <span className="text-sm text-green-600 font-medium ml-2">{t("pricingApprox")}</span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          <ul className="space-y-3 mb-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="flex gap-3 text-neu-text text-sm">
                <div className="w-5 h-5 rounded-md shadow-neu-inset-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {t(`pricingFeature${i}`)}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="block w-full neu-btn-primary rounded-full text-center py-3.5 text-base"
          >
            {t("startNow")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl shadow-neu-sm bg-neu-bg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-5 text-left"
      >
        <span className="font-semibold text-neu-text">{q}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5 text-neu-muted flex-shrink-0 ml-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-6 pb-5 text-neu-muted text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LandingPage() {
  const t = useTranslations("landing");

  const benefits = Array.from({ length: 10 }, (_, i) => t(`benefit${i}`));
  const steps = Array.from({ length: 7 }, (_, i) => ({
    num: t(`step${i}num`),
    title: t(`step${i}title`),
    desc: t(`step${i}desc`),
  }));
  const testimonials = Array.from({ length: 4 }, (_, i) => ({
    name: t(`testimonial${i}name`),
    role: t(`testimonial${i}role`),
    quote: t(`testimonial${i}quote`),
  }));
  const faqs = Array.from({ length: 6 }, (_, i) => ({
    q: t(`faq${i}q`),
    a: t(`faq${i}a`),
  }));

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Set Up OpenClaw AI Agent",
    description: "Interactive step-by-step guide to set up OpenClaw on Google Cloud or locally.",
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="bg-neu-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Hero */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block rounded-2xl shadow-neu p-10 mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-neu-text mb-4">
                {t("heroTitle")}
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-brand-500 bg-clip-text text-transparent">
                  {t("heroSubtitle")}
                </span>
              </h1>
              <p className="text-lg text-neu-muted max-w-2xl mx-auto">
                {t("heroDescription")}
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            <Link
              href="/register"
              className="neu-btn-primary rounded-full px-8 py-3.5 text-lg"
            >
              {t("startGuide")}
            </Link>
            <Link
              href="#features"
              className="neu-btn rounded-full px-8 py-3.5 text-lg text-neu-muted hover:text-neu-text"
            >
              {t("seeFeatures")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What you get */}
      <motion.section
        id="features"
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-neu-text mb-4">
            {t("benefitsTitle")}
          </h2>
          <p className="text-neu-muted text-center mb-12 max-w-2xl mx-auto">
            {t("benefitsDescription")}
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 p-4 rounded-xl shadow-neu-sm bg-neu-bg"
              >
                <div className="w-6 h-6 rounded-lg shadow-neu-inset-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-neu-text text-sm">{b}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-neu-text mb-12">
            {t("stepsTitle")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl shadow-neu p-6 bg-neu-bg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-brand-600 shadow-neu-xs flex items-center justify-center font-bold text-white text-sm mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-neu-text mb-1">{s.title}</h3>
                <p className="text-neu-muted text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-neu-muted text-sm">
              Each step has interactive checklists, copy-paste commands, and an AI assistant ready to help.
            </p>
          </div>
        </div>
      </motion.section>

      {/* AI Feature */}
      <motion.section
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-neu-text mb-4">
              {t("aiTitle")}
            </h2>
            <p className="text-neu-muted mb-8">
              {t("aiDescription")}
            </p>
            <div className="rounded-2xl shadow-neu-inset bg-gray-900 p-6 text-left">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-3 font-mono text-sm">
                <p className="text-red-400">Error: ACCESS_TOKEN_SCOPE_INSUFFICIENT</p>
                <p className="text-gray-400">{">"} AI: This error means your VM&apos;s access scopes don&apos;t include &quot;cloud-platform&quot;.</p>
                <p className="text-gray-400">{">"} Fix: Stop VM → Edit → Access scopes → &quot;Allow full access to all Cloud APIs&quot; → Save → Start</p>
                <p className="text-green-400">{">"} After restart, run: gcloud auth list</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-neu-text mb-4">
            {t("testimonialsTitle")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl shadow-neu p-6 bg-neu-bg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-brand-500 flex items-center justify-center text-white font-bold text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-neu-text text-sm">{item.name}</p>
                    <p className="text-neu-muted text-xs">{item.role}</p>
                  </div>
                </div>
                <p className="text-neu-muted text-sm leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section
        id="pricing"
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-neu-text mb-4">
            {t("pricingTitle")}
          </h2>
          <PricingToggle />
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        id="faq"
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-neu-text mb-12">
            {t("faqTitle")}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto rounded-2xl shadow-neu p-12 text-center bg-neu-bg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-brand-600/5 pointer-events-none" />
            <h2 className="text-3xl font-bold text-neu-text mb-4 relative">
              {t("ctaTitle")}
            </h2>
            <p className="text-neu-muted mb-8 max-w-xl mx-auto relative">
              {t("ctaDescription")}
            </p>
            <Link
              href="/register"
              className="relative inline-block neu-btn-primary rounded-full px-10 py-4 text-lg"
            >
              {t("startNow")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
