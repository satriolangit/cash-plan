"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">FW</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Family Wallet
          </h1>
          <p className="text-lg text-muted mb-8">
            Kelola keuangan keluarga lebih mudah, transparan, dan real-time
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center bg-primary text-white rounded-xl px-8 py-3 text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="bg-white border-t border-border px-6 py-12">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-medium">Budget Tracking</h3>
              <p className="text-sm text-muted">
                Monitor pengeluaran bulanan keluarga dengan mudah
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <div>
              <h3 className="font-medium">Shared Household</h3>
              <p className="text-sm text-muted">
                Semua anggota keluarga bisa mencatat dan melihat keuangan
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <h3 className="font-medium">Monthly Reports</h3>
              <p className="text-sm text-muted">
                Lihat tren pengeluaran dan breakdown per kategori
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 Family Wallet. Built with ❤️
        </p>
      </footer>
    </div>
  );
}
