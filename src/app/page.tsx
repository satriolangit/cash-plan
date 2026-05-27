import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Family Wallet
        </h1>
        <p className="text-muted mb-8">
          Simple family finance management
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center gap-2 bg-white border border-border rounded-xl px-6 py-3 text-sm font-medium hover:bg-accent/5 transition-colors"
        >
          Continue with Google
        </Link>
      </div>
    </div>
  );
}
