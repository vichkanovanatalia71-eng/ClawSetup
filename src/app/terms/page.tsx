import Link from "next/link";

export const metadata = {
  title: "Terms of Service — ClawSetup",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="rounded-2xl shadow-neu p-8 bg-neu-bg">
        <h1 className="text-3xl font-bold text-neu-text mb-8">Terms of Service</h1>

        <div className="space-y-6 text-sm text-neu-muted leading-relaxed">
          <p className="text-neu-text font-medium">Last updated: March 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ClawSetup (&quot;Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to all terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">2. Description of Service</h2>
            <p>
              ClawSetup provides an interactive, step-by-step guide for installing and configuring the OpenClaw AI agent
              on Google Cloud Platform or local machines. The Service includes AI-powered assistance, progress tracking,
              and copy-protected instructional content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">3. Account Registration</h2>
            <p>
              You must register for an account to access protected content. You agree to provide accurate information
              and are responsible for maintaining the confidentiality of your credentials. You must notify us immediately
              of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">4. Subscription and Payment</h2>
            <p>
              Access to the guide requires a paid subscription at $29/month (or the then-current rate). Payments are
              processed through Stripe. Subscriptions renew automatically unless canceled. You may cancel at any time
              from your profile page; access continues until the end of your billing period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">5. Refund Policy</h2>
            <p>
              We offer refunds on a case-by-case basis within 7 days of the initial purchase. To request a refund,
              contact us at the email listed below. No refunds are provided after the 7-day window or for renewal charges.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">6. Intellectual Property</h2>
            <p>
              All content, including text, code examples, images, and guide structure, is the intellectual property of
              ClawSetup. You may not copy, redistribute, publish, or create derivative works from the content without
              explicit written permission. The watermarking and copy-protection measures are part of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">7. AI Assistant</h2>
            <p>
              The AI assistant provides guidance based on the current step context. While we strive for accuracy,
              AI responses may contain errors. You are responsible for verifying commands before executing them on your
              systems. ClawSetup is not liable for any damage caused by following AI recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">8. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Share your account credentials with others</li>
              <li>Attempt to bypass copy protection or watermarking</li>
              <li>Scrape, download, or automate access to the content</li>
              <li>Use the AI assistant for purposes unrelated to OpenClaw setup</li>
              <li>Reverse engineer the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">9. Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties. ClawSetup shall not be liable for any
              indirect, incidental, or consequential damages arising from your use of the Service, including but not
              limited to damages to your cloud infrastructure or local systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account for violation of these terms. Upon termination,
              your access to the guide content ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">11. Changes to Terms</h2>
            <p>
              We may update these terms at any time. Continued use of the Service after changes constitutes acceptance.
              We will notify registered users of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">12. Contact</h2>
            <p>
              For questions about these terms, contact us at{" "}
              <span className="text-brand-600">support@clawsetup.com</span>.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-neu-dark/15">
          <Link href="/" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
