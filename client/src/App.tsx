import { Route, Routes, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Plugins from "./pages/Plugins";
import Globe from "./pages/Globe";
import Teams from "./pages/Teams";
import Templates from "./pages/Templates";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import Workspace from "./pages/Workspace";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Force dark mode for Clippr
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/plugins" element={<Plugins />} />
              <Route path="/globe" element={<Globe />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/workspace" element={<Workspace />} />
            </Route>

            <Route path="/" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
