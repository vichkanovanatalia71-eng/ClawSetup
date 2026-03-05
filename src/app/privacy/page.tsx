import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — ClawSetup",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="rounded-2xl shadow-neu p-8 bg-neu-bg">
        <h1 className="text-3xl font-bold text-neu-text mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-sm text-neu-muted leading-relaxed">
          <p className="text-neu-text font-medium">Last updated: March 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Account data:</strong> name, email address, hashed password</li>
              <li><strong>Payment data:</strong> processed by Stripe; we store Stripe customer/subscription IDs but never credit card numbers</li>
              <li><strong>Usage data:</strong> step completion progress, AI assistant queries, login timestamps</li>
              <li><strong>Technical data:</strong> IP address, browser type, device type (via server logs)</li>
              <li><strong>Uploaded content:</strong> screenshots sent to the AI assistant (temporarily processed, not permanently stored)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Provide and maintain the Service</li>
              <li>Track your progress through the setup guide</li>
              <li>Process subscription payments</li>
              <li>Provide AI-powered assistance contextual to your current step</li>
              <li>Send transactional emails (welcome, password reset, payment receipts)</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Improve the Service based on usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">3. AI Assistant Data</h2>
            <p>
              When you interact with the AI assistant, your messages and uploaded screenshots are sent to the
              Anthropic Claude API for processing. We log the query metadata (timestamp, step context, user ID)
              for rate limiting and service improvement. Screenshots are not permanently stored after processing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Stripe</strong> — payment processing (<a href="https://stripe.com/privacy" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>)</li>
              <li><strong>Anthropic Claude API</strong> — AI assistant responses</li>
              <li><strong>Google OAuth</strong> — optional sign-in method (if enabled)</li>
              <li><strong>Railway</strong> — application hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">5. Data Security</h2>
            <p>
              We implement appropriate security measures including: password hashing (bcrypt), HTTPS encryption,
              secure session management (JWT), and access control. However, no method of transmission over the
              Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">6. Data Retention</h2>
            <p>
              Account data is retained for the lifetime of your account. After account deletion, personal data
              is removed within 30 days. Anonymized usage statistics may be retained indefinitely. Payment records
              are retained as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data in a machine-readable format</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at{" "}
              <span className="text-brand-600">support@clawsetup.com</span>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use advertising
              or tracking cookies. Session cookies expire when you close your browser; authentication tokens
              expire after the configured session duration.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">9. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for users under 16 years of age. We do not knowingly collect personal
              data from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">10. Changes to This Policy</h2>
            <p>
              We may update this policy periodically. We will notify registered users of significant changes
              via email and update the &quot;Last updated&quot; date above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neu-text mb-2">11. Contact</h2>
            <p>
              For privacy-related questions, contact us at{" "}
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
