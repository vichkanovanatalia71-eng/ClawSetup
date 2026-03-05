import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neu-bg mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl shadow-neu p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-brand-600 shadow-neu-xs flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <span className="font-bold text-lg text-neu-text">ClawSetup</span>
              </div>
              <p className="text-neu-muted text-sm leading-relaxed">
                Interactive step-by-step guide for setting up OpenClaw with AI-powered assistance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-neu-text mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-neu-muted">
                <li>
                  <Link href="/#features" className="hover:text-neu-text transition-colors duration-200">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-neu-text transition-colors duration-200">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-neu-text transition-colors duration-200">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-neu-text mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-neu-muted">
                <li>
                  <Link href="/terms" className="hover:text-neu-text transition-colors duration-200">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-neu-text transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neu-dark/20 text-center text-sm text-neu-muted">
            &copy; {new Date().getFullYear()} ClawSetup. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
