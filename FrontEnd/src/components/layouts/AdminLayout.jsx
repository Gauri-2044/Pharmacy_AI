import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Package, Activity, ExternalLink, Menu, X, Shield } from "lucide-react";
import axios from "axios";
import Tooltip from "../common/Tooltip";
import { useToast } from "../common/useToast";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
    } catch {
      // ignore
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    toast.success("Signed out from Admin console.", "Logged Out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#09121f] text-slate-100 flex flex-col">
      {/* Sticky Top Admin Header */}
      <nav className="sticky top-0 z-50 h-16 bg-[#0e1d33]/90 backdrop-blur-md border-b border-blue-900/60 shadow-lg px-4 sm:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2.5 font-bold text-lg text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Shield className="h-4 w-4" />
            </div>
            <span className="bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
              Pharmacy AI Admin
            </span>
          </Link>
        </div>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 transition py-1 hover:text-blue-400 ${
              isActive("/admin", true) ? "text-blue-400 font-semibold" : ""
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/medicines"
            className={`flex items-center gap-1.5 transition py-1 hover:text-blue-400 ${
              isActive("/admin/medicines") ? "text-blue-400 font-semibold" : ""
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Inventory (CRUD)</span>
          </Link>

          <Link
            to="/admin/tracking"
            className={`flex items-center gap-1.5 transition py-1 hover:text-blue-400 ${
              isActive("/admin/tracking") ? "text-blue-400 font-semibold" : ""
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Agent Monitoring</span>
          </Link>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Tooltip text="Switch to Patient Portal">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#132d4b]/60 hover:bg-[#1a3c63] text-xs font-medium text-slate-200 transition cursor-pointer border border-blue-900/50"
            >
              <span>User Portal</span>
              <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
            </Link>
          </Tooltip>

          <Tooltip text="Sign Out">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-medium transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </Tooltip>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#132d4b] transition cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-blue-900/60 bg-[#0e1d33] px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium ${
              isActive("/admin", true) ? "bg-blue-600 text-white" : "text-slate-300"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/medicines"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium ${
              isActive("/admin/medicines") ? "bg-blue-600 text-white" : "text-slate-300"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Inventory CRUD</span>
          </Link>

          <Link
            to="/admin/tracking"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium ${
              isActive("/admin/tracking") ? "bg-blue-600 text-white" : "text-slate-300"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Agent Monitoring</span>
          </Link>

          <div className="border-t border-blue-900/60 pt-3 flex items-center justify-between">
            <Link
              to="/dashboard"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              Go to User Portal <ExternalLink className="h-3 w-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-rose-300 flex items-center gap-1 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800"
            >
              <LogOut className="h-3 w-3" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Outlet Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
