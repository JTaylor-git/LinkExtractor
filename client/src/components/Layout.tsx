import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-900 text-zinc-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}