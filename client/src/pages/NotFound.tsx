import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-4xl font-bold text-red-500">404</p>
      <Link to="/" className="rounded bg-emerald-500 px-4 py-2 text-zinc-900">
        Back to dashboard
      </Link>
    </div>
  );
}