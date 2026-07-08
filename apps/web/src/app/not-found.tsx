import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-6 text-center">
      <h2>Page Not Found</h2>
      <Link href="/" className="mt-4 inline-block text-blue-600 underline">
        Go to Homepage
      </Link>
    </div>
  );
}

