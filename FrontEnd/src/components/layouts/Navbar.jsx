import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../config/api";
import { LogOut, User, Menu, X, Bot } from "lucide-react";
import { useState } from "react";
import Tooltip from "../common/Tooltip";
import { useToast } from "../common/useToast";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const token = localStorage.getItem("token");
  const storedUser = getStoredUser();
  const isLoggedIn = !!token;
  const userRole = storedUser?.role || storedUser?.user_role || "user";
  const userName = storedUser?.name || storedUser?.username || "";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        apiUrl("/api/auth/logout"),
        {},
        { withCredentials: true }
      );
    } catch {
      // Continue client cleanup even if network fails
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    toast.success("You have been signed out safely.", "Logged Out");
    navigate("/login");
  };

  const handleScrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0B1F3A]/90 border-b border-blue-900/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link
          to={isLoggedIn ? (userRole === "admin" ? "/admin" : "/dashboard") : "/"}
          className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight group"
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <Bot className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
            Pharmacy AI
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {!isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => handleScrollToSection("features")}
                className="hover:text-blue-400 transition cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => handleScrollToSection("how-it-works")}
                className="hover:text-blue-400 transition cursor-pointer"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => handleScrollToSection("safety")}
                className="hover:text-blue-400 transition cursor-pointer"
              >
                Safety & Compliance
              </button>
              <button
                type="button"
                onClick={() => handleScrollToSection("faq")}
                className="hover:text-blue-400 transition cursor-pointer"
              >
                FAQs
              </button>
            </>
          ) : userRole === "admin" ? (
            <>
              <Link
                to="/admin"
                className={`transition hover:text-blue-400 ${
                  location.pathname === "/admin" ? "text-blue-400 font-semibold" : ""
                }`}
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/medicines"
                className={`transition hover:text-blue-400 ${
                  location.pathname === "/admin/medicines" ? "text-blue-400 font-semibold" : ""
                }`}
              >
                Inventory
              </Link>
              <Link
                to="/admin/tracking"
                className={`transition hover:text-blue-400 ${
                  location.pathname === "/admin/tracking" ? "text-blue-400 font-semibold" : ""
                }`}
              >
                Agent Tracking
              </Link>
              <Link
                to="/chat"
                className={`transition hover:text-blue-400 ${
                  location.pathname === "/chat" ? "text-blue-400 font-semibold" : ""
                }`}
              >
                AI Pharmacist
              </Link>
              <Link
                to="/profile"
                className={`transition hover:text-blue-400 ${
                  location.pathname === "/profile" ? "text-blue-400 font-semibold" : ""
                }`}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`transition hover:text-blue-400 ${
                  location.pathname === "/dashboard" ? "text-blue-400 font-semibold" : ""
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className={`transition hover:text-blue-400 ${
                  location.pathname === "/chat" ? "text-blue-400 font-semibold" : ""
                }`}
              >
                AI Pharmacist
              </Link>
              <Link
                to="/history"
                className={`transition hover:text-blue-400 ${
                  location.pathname === "/history" ? "text-blue-400 font-semibold" : ""
                }`}
              >
                Order History
              </Link>
              <Link
                to="/profile"
                className={`transition hover:text-blue-400 ${
                  location.pathname === "/profile" ? "text-blue-400 font-semibold" : ""
                }`}
              >
                Profile
              </Link>
            </>
          )}
        </nav>

        {/* Right Section Actions */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-xl font-medium transition shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {userName && (
                <span className="text-xs text-slate-400 font-medium hidden lg:inline">
                  Hi, {userName}
                </span>
              )}

              <Tooltip text="User Profile">
                <Link
                  to="/profile"
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    location.pathname === "/profile"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-[#132d4b]/60 text-slate-300 hover:bg-[#132d4b] hover:text-white"
                  }`}
                  aria-label="View user profile"
                >
                  <User className="h-4.5 w-4.5" />
                </Link>
              </Tooltip>

              <Tooltip text="Sign Out">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-[#132d4b]/60 text-slate-300 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/50 border border-transparent transition cursor-pointer"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Mobile Menu Hamburger Button */}
        <div className="md:hidden flex items-center gap-2">
          {isLoggedIn && (
            <Link
              to="/profile"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/40"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#132d4b] transition cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-blue-900/60 bg-[#0B1F3A]/98 backdrop-blur-xl px-4 py-5 space-y-4 shadow-2xl animate-in slide-in-from-top-2">
          {!isLoggedIn ? (
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => handleScrollToSection("features")}
                className="text-left text-slate-200 hover:text-blue-400 py-2 text-base font-medium cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => handleScrollToSection("how-it-works")}
                className="text-left text-slate-200 hover:text-blue-400 py-2 text-base font-medium cursor-pointer"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => handleScrollToSection("safety")}
                className="text-left text-slate-200 hover:text-blue-400 py-2 text-base font-medium cursor-pointer"
              >
                Safety & Compliance
              </button>
              <button
                type="button"
                onClick={() => handleScrollToSection("faq")}
                className="text-left text-slate-200 hover:text-blue-400 py-2 text-base font-medium cursor-pointer"
              >
                FAQs
              </button>

              <div className="border-t border-blue-900/60 pt-4 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-blue-800 text-slate-200 hover:bg-blue-900/30 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-lg shadow-blue-600/30"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl text-base font-medium transition ${
                  location.pathname === "/dashboard"
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-[#132d4b]"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl text-base font-medium transition ${
                  location.pathname === "/chat"
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-[#132d4b]"
                }`}
              >
                AI Pharmacist Chat
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl text-base font-medium transition ${
                  location.pathname === "/history"
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-[#132d4b]"
                }`}
              >
                Order History
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl text-base font-medium transition ${
                  location.pathname === "/profile"
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-[#132d4b]"
                }`}
              >
                Profile Settings
              </Link>

              {userRole === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-xl text-base font-medium text-blue-300 bg-blue-950/60 border border-blue-800/60 ${
                    location.pathname.startsWith("/admin") ? "border-blue-400" : ""
                  }`}
                >
                  Admin Console
                </Link>
              )}

              <div className="border-t border-blue-900/60 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/50 text-sm font-medium hover:bg-rose-900/60 transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
