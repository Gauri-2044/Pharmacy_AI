import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function CTASection() {
  const isLoggedIn = !!localStorage.getItem("token");
  const chatTarget = isLoggedIn ? "/chat" : "/login";
  const chatState = !isLoggedIn ? { from: { pathname: "/chat" } } : undefined;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 relative">
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-blue-950 via-[#0e2a4f] to-blue-950 border border-blue-700/60 p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-cyan-300 border border-blue-500/40">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>JOIN THOUSANDS OF SATISFIED PATIENTS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Ready to experience the future of medicine ordering?
        </h2>

        <p className="text-blue-200/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Order your prescriptions with instant voice & chat intelligence. Zero waiting times, proactive refill reminders, and verified pharmacy inventory.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to={chatTarget}
            state={chatState}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Launch AI Pharmacist Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#132d4b] hover:bg-[#1a3c63] border border-blue-800/60 text-slate-200 hover:text-white font-semibold text-sm transition flex items-center justify-center cursor-pointer"
          >
            <span>Create Patient Account</span>
          </Link>
        </div>

        <p className="text-xs text-blue-300/80 pt-2 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>No credit card required to consult • 100% Free AI assessment</span>
        </p>

      </div>
    </section>
  );
}
