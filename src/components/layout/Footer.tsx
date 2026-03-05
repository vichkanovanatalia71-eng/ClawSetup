import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="font-bold text-lg text-gray-900">ClawSetup</span>
            </div>
            <p className="text-gray-500 text-sm">
              Interactive step-by-step guide for setting up OpenClaw with AI-powered assistance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/#features" className="hover:text-gray-900">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-gray-900">Pricing</Link></li>
              <li><Link href="/#faq" className="hover:text-gray-900">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} ClawSetup. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
