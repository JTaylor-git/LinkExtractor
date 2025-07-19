import { NavLink } from "react-router-dom";
import {
  GaugeCircle, FolderKanban, Activity, PlugZap, Globe, Users,
  FileText, FileBarChart2, Settings, LayoutTemplate
} from "lucide-react";

const links = [
  { to: "/",           label: "Dashboard", icon: GaugeCircle },
  { to: "/projects",   label: "Projects",  icon: FolderKanban },
  { to: "/analytics",  label: "Analytics", icon: Activity },
  { to: "/plugins",    label: "Plugins",   icon: PlugZap },
  { to: "/globe",      label: "Globe",     icon: Globe },
  { to: "/teams",      label: "Teams",     icon: Users },
  { to: "/templates",  label: "Templates", icon: FileText },
  { to: "/logs",       label: "Logs",      icon: FileBarChart2 },
  { to: "/settings",   label: "Settings",  icon: Settings },
  { to: "/workspace",  label: "Workspace", icon: LayoutTemplate }
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4">
      <h1 className="mb-6 flex items-center text-xl font-semibold">
        <span className="mr-2 rounded bg-emerald-400 px-2 py-1 font-black text-zinc-900">⚡</span>
        Clippr
      </h1>

      <nav className="space-y-1 text-sm">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded px-3 py-2
               ${isActive ? "bg-zinc-800 text-emerald-400" : "hover:bg-zinc-800"}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}