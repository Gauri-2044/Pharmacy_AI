import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A] flex flex-col items-center justify-center px-4 py-8">

      {/* Brand Header (Plus button removed) */}
      <div className="flex flex-col items-center mb-8">
        <Link to="/" className="flex items-center gap-2.5 mb-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <Bot className="h-5 w-5" />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">
            Pharmacy AI
          </span>
        </Link>
        <p className="text-[#9FB7C8] text-sm">
          Intelligence for modern healthcare
        </p>
      </div>

      {children}

      {/* Footer */}
      <div className="mt-10 text-[#5F8FA8] text-xs flex gap-6">
        <span className="cursor-pointer hover:text-white">SECURITY</span>
        <span className="cursor-pointer hover:text-white">PRIVACY</span>
        <span className="cursor-pointer hover:text-white">SUPPORT</span>
      </div>
    </div>
  );
}
