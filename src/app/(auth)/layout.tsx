import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="container-page flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-extrabold text-primary-700">
              amaz<span className="text-gray-900">ra</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-primary-700">
            Back to Home
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
