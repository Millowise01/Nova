import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="nova-card max-w-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-600">The route does not exist in this frontend scaffold.</p>
        <Link to="/" className="nova-button-primary mt-6 inline-flex">
          Go home
        </Link>
      </div>
    </div>
  );
}