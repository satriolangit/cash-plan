import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-danger mb-4">Oops!</h1>
        <p className="text-muted mb-8">
          Something went wrong during authentication. Please try again.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center bg-primary text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
