"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const benefits = [
  "Fully configured VM on Google Cloud for OpenClaw (Ubuntu 24.04)",
  "Stable SSH access with host key management explained",
  "Proper Service Account + IAM roles + Access scopes (no more 403 errors)",
  "Vertex AI authorization via ADC without JSON service-account keys",
  "Node.js 22+ and OpenClaw installed via npm without root issues",
  "OpenClaw gateway as a systemd user service with auto-start after reboot",
  "Telegram bot connected via onboard + pairing for remote control",
  "Dashboard access via SSH tunnel (no open ports to the internet)",
  "Autonomy controls: sudo whitelist for bot install/deploy operations",
  "VM backup and restore (snapshots / machine images) for safe experimentation",
];

const steps = [
  { num: "0", title: "GCP Project Setup", desc: "Billing, APIs, Service Account, IAM roles" },
  { num: "1", title: "Create VM", desc: "Ubuntu 24.04, 2 vCPU + 4GB, static IP" },
  { num: "2", title: "SSH Access", desc: "Key generation, connection, host key management" },
  { num: "3-6", title: "Install Stack", desc: "Ubuntu packages, gcloud, ADC, Node.js, OpenClaw" },
  { num: "7-9", title: "Configure", desc: "Env file, gateway service, auto-start" },
  { num: "10-12", title: "Integrate", desc: "Onboard, Telegram bot, pairing" },
  { num: "13-17", title: "Operate", desc: "Dashboard, diagnostics, security, backups" },
];

const faqs = [
  {
    q: "What is OpenClaw?",
    a: "OpenClaw is an AI agent that can be deployed locally or on a remote server. It integrates with various services (Telegram, Vertex AI, OpenAI) and can be managed through a web dashboard or Telegram bot.",
  },
  {
    q: "Do I need prior experience with Google Cloud or Linux?",
    a: "No! This guide is designed for complete beginners. Every step is explained in detail, with copy-paste commands and troubleshooting for common errors.",
  },
  {
    q: "What does the AI assistant do?",
    a: "On each step, you can paste error text or upload a screenshot. The AI analyzes your specific issue in the context of that step and gives you exact commands or configuration changes to fix it.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel in one click from your profile. You'll keep access until the end of your paid period.",
  },
  {
    q: "What if I break my VM?",
    a: "The guide teaches you to create snapshots before risky changes. You can restore your VM to a working state in 5-10 minutes.",
  },
  {
    q: "Is there a local setup option?",
    a: "Yes, the guide covers both remote (Google Cloud VM) and local installation scenarios.",
  },
];

function FAQItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl shadow-neu-sm bg-neu-bg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-5 text-left"
      >
        <span className="font-semibold text-neu-text">{faq.q}</span>
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
            <p className="px-6 pb-5 text-neu-muted text-sm leading-relaxed">{faq.a}</p>
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
  return (
    <div className="bg-neu-bg">
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
                Set Up OpenClaw
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-brand-500 bg-clip-text text-transparent">
                  Without the Pain
                </span>
              </h1>
              <p className="text-lg text-neu-muted max-w-2xl mx-auto">
                Interactive step-by-step guide with AI assistance on every step.
                From zero to a fully running OpenClaw agent on Google Cloud or your local machine.
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
              Start Setup Guide
            </Link>
            <Link
              href="#features"
              className="neu-btn rounded-full px-8 py-3.5 text-lg text-neu-muted hover:text-neu-text"
            >
              See What You Get
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
            What You Get After Completing the Guide
          </h2>
          <p className="text-neu-muted text-center mb-12 max-w-2xl mx-auto">
            Every item below is a verified, working result you will have at the end.
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
            Step-by-Step Structure
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
              AI Assistant on Every Step
            </h2>
            <p className="text-neu-muted mb-8">
              Stuck on an error? Paste the error text or upload a screenshot.
              The AI knows exactly which step you are on and gives you specific fixes.
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
          <h2 className="text-3xl font-bold text-center text-neu-text mb-12">
            Simple Pricing
          </h2>
          <div className="max-w-lg mx-auto">
            <div className="rounded-2xl shadow-neu p-8 bg-neu-bg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-brand-600" />
              <h3 className="text-xl font-bold text-neu-text mb-2">Monthly Access</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-neu-text">$29</span>
                <span className="text-neu-muted">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Full interactive guide (local + remote)",
                  "AI assistant on every step",
                  "Screenshot error analysis",
                  "Progress saving & checklists",
                  "Cancel anytime in one click",
                ].map((f) => (
                  <li key={f} className="flex gap-3 text-neu-text text-sm">
                    <div className="w-5 h-5 rounded-md shadow-neu-inset-sm flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full neu-btn-primary rounded-full text-center py-3.5 text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
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
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} faq={faq} />
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
              Ready to Set Up OpenClaw?
            </h2>
            <p className="text-neu-muted mb-8 max-w-xl mx-auto relative">
              Join the guide, follow the steps, and have your AI agent running in a few hours — not days.
            </p>
            <Link
              href="/register"
              className="relative inline-block neu-btn-primary rounded-full px-10 py-4 text-lg"
            >
              Start Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
