import Link from "next/link";

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

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Set Up OpenClaw
            <br />
            <span className="text-brand-600">Without the Pain</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Interactive step-by-step guide with AI assistance on every step.
            From zero to a fully running OpenClaw agent on Google Cloud or your local machine.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="bg-brand-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-600/25"
            >
              Start Setup Guide
            </Link>
            <Link
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition"
            >
              See What You Get
            </Link>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What You Get After Completing the Guide
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Every item below is a verified, working result you will have at the end.
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Step-by-Step Structure
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((s) => (
              <div key={s.num} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center font-bold text-sm mb-3">
                  {s.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Each step has interactive checklists, copy-paste commands, and an AI assistant ready to help.
            </p>
          </div>
        </div>
      </section>

      {/* AI Feature */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI Assistant on Every Step
            </h2>
            <p className="text-gray-600 mb-8">
              Stuck on an error? Paste the error text or upload a screenshot.
              The AI knows exactly which step you are on and gives you specific fixes.
            </p>
            <div className="bg-gray-900 rounded-xl p-6 text-left">
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
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simple Pricing
          </h2>
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Access</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-gray-900">$29</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Full interactive guide (local + remote)",
                  "AI assistant on every step",
                  "Screenshot error analysis",
                  "Progress saving & checklists",
                  "Cancel anytime in one click",
                ].map((f) => (
                  <li key={f} className="flex gap-2 text-gray-600 text-sm">
                    <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full bg-brand-600 text-white text-center py-3 rounded-lg font-medium hover:bg-brand-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Set Up OpenClaw?
          </h2>
          <p className="text-brand-100 mb-8 max-w-xl mx-auto">
            Join the guide, follow the steps, and have your AI agent running in a few hours — not days.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-brand-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-50 transition"
          >
            Start Now
          </Link>
        </div>
      </section>
    </div>
  );
}
