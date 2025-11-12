export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">Sorry, the page you are looking for does not exist.</p>
      <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Go Home</a>
    </div>
  );
}
