import React from "react";
import { 
  MessageSquare, 
  FileText, 
  RotateCcw, 
  ShieldCheck, 
  Package, 
  Activity, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FeaturesSection() {
  const isLoggedIn = !!localStorage.getItem("token");
  const chatTarget = isLoggedIn ? "/chat" : "/login";
  const chatState = !isLoggedIn ? { from: { pathname: "/chat" } } : undefined;

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-400" />,
      title: "Conversational Voice & Chat",
      description:
        "Speak or type naturally. The agent understands symptoms, brand names, and complex medication inquiries with contextual memory.",
      badge: "Real-Time AI",
    },
    {
      icon: <FileText className="h-6 w-6 text-cyan-400" />,
      title: "Prescription Vision OCR",
      description:
        "Upload doctor slips or physical prescriptions. Multi-modal AI reads handwriting, verifies dosages, and matches active medicines.",
      badge: "Gemini Vision",
    },
    {
      icon: <RotateCcw className="h-6 w-6 text-amber-400" />,
      title: "Predictive Refill Intelligence",
      description:
        "Learns your dosage schedule and alerts you proactively before you run out of essential chronic medications.",
      badge: "Proactive Care",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      title: "Allergy & Contraindication Safeguard",
      description:
        "Cross-checks every order against recorded patient allergies and flags hazardous drug-drug interactions automatically.",
      badge: "Zero-Risk Protocol",
    },
    {
      icon: <Package className="h-6 w-6 text-purple-400" />,
      title: "Synchronized Inventory Ledger",
      description:
        "Directly integrates with dispensary stock counts, preventing out-of-stock orders and alerting admins to replenish inventory.",
      badge: "Live Database",
    },
    {
      icon: <Activity className="h-6 w-6 text-rose-400" />,
      title: "Enterprise Agent Traceability",
      description:
        "Every decision, tool call, and latency spike is logged to Langfuse and PostgreSQL for strict medical compliance and auditability.",
      badge: "Full Observability",
    },
  ];

  return (
    <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950/70 px-3.5 py-1 rounded-full border border-blue-800/60">
            COMPREHENSIVE CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Patient Safety & Clinical Speed
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            From handwritten prescriptions to continuous adherence tracking, our AI platform coordinates every facet of your healthcare supplies.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-[#0e223d]/80 border border-blue-900/60 hover:border-blue-500/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-5 hover:-translate-y-1 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-950 border border-blue-800/60 rounded-2xl group-hover:scale-105 transition">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-cyan-300 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>

              <div className="pt-3 border-t border-blue-900/40">
                <Link
                  to={chatTarget}
                  state={chatState}
                  className="text-xs text-blue-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Explore feature in Chat</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
