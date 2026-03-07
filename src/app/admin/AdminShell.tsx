"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export default function AdminShell({
  children,
  navItems,
  panelTitle,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  panelTitle: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const navContent = (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setDrawerOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
            pathname === item.href
              ? "shadow-neu-inset-sm text-neu-text font-medium"
              : "text-neu-muted hover:shadow-neu-flat hover:text-neu-text"
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
          </svg>
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-neu-bg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 p-4">
        <div className="rounded-2xl shadow-neu p-4 bg-neu-bg h-full">
          <h2 className="text-lg font-bold text-neu-text mb-6 px-3">{panelTitle}</h2>
          {navContent}
        </div>
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-[72px] left-4 z-40">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-11 h-11 rounded-xl shadow-neu flex items-center justify-center bg-neu-bg"
          aria-label="Open admin menu"
        >
          <svg className="w-5 h-5 text-neu-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 p-4 bg-neu-bg shadow-xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 px-3">
                <h2 className="text-lg font-bold text-neu-text">{panelTitle}</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-xl shadow-neu-sm flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5 text-neu-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="flex-1 p-4 pt-16 lg:pt-4 lg:p-8">{children}</div>
    </div>
  );
}
