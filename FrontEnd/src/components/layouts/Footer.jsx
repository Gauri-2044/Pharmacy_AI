import { Link } from "react-router-dom";
import { Bot, Shield, Heart } from "lucide-react";

export default function Footer() {
  const isLoggedIn = !!localStorage.getItem("token");
  const chatTarget = isLoggedIn ? "/chat" : "/login";
  const chatState = !isLoggedIn ? { from: { pathname: "/chat" } } : undefined;

  return (
    <footer className="bg-[#071322] border-t border-blue-900/60 text-slate-400 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Bot className="h-4 w-4" />
              </div>
              <span>Pharmacy AI</span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Next-generation autonomous healthcare assistant providing 24/7 prescription processing, voice-driven ordering, and clinical allergy safety enforcement.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px]">Platform</p>
            <ul className="space-y-1.5">
              <li>
                <a href="#features" className="hover:text-blue-400 transition">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-blue-400 transition">How It Works</a>
              </li>
              <li>
                <a href="#safety" className="hover:text-blue-400 transition">Safety & Compliance</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-blue-400 transition">Frequently Asked Questions</a>
              </li>
            </ul>
          </div>

          {/* Patient Portal */}
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px]">Patient Services</p>
            <ul className="space-y-1.5">
              <li>
                <Link to={chatTarget} state={chatState} className="hover:text-blue-400 transition">AI Pharmacist Chat</Link>
              </li>
              <li>
                <Link to={isLoggedIn ? "/dashboard" : "/login"} className="hover:text-blue-400 transition">Health Dashboard</Link>
              </li>
              <li>
                <Link to={isLoggedIn ? "/history" : "/login"} className="hover:text-blue-400 transition">Order History</Link>
              </li>
              <li>
                <Link to={isLoggedIn ? "/profile" : "/login"} className="hover:text-blue-400 transition">Profile & Allergies</Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-blue-950 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Pharmacy AI Autonomous Systems. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered with care for autonomous clinical healthcare</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
