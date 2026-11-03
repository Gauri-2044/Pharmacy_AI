import React from "react";
import { Mic, FileUp, Sparkles, CheckCircle2, PackageCheck, BellRing } from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorksSection() {
  const isLoggedIn = !!localStorage.getItem("token");
  const chatTarget = isLoggedIn ? "/chat" : "/login";
  const chatState = !isLoggedIn ? { from: { pathname: "/chat" } } : undefined;

  const steps = [
    {
      num: "01",
      title: "Speak, Type, or Upload Slip",
      description:
        "Input your symptoms, speak in natural voice, or snap a photo of any handwritten doctor prescription for AI vision extraction.",
      icon: <Mic className="h-6 w-6 text-blue-400" />,
      tag: "Multi-Modal Input",
    },
    {
      num: "02",
      title: "Clinical Safe-Guard & Inventory Check",
      description:
        "The agent autonomously verifies live stock availability, dosage safety, and cross-checks your medical history for allergic contraindications.",
      icon: <Sparkles className="h-6 w-6 text-cyan-400" />,
      tag: "Gemini Intelligence",
    },
    {
      num: "03",
      title: "Instant Order & Predictive Refills",
      description:
        "Your order is immediately recorded in the dispensary system, and proactive refill alerts remind you when medication runs low.",
      icon: <PackageCheck className="h-6 w-6 text-emerald-400" />,
      tag: "Automated Continuity",
    },
  ];

  return (
    <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-transparent via-[#091526]/50 to-transparent">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-3.5 py-1 rounded-full border border-cyan-800/50">
            SIMPLIFIED PATIENT JOURNEY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Pharmacy AI Works in 3 Steps
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate tedious paperwork, long drugstore queues, and missed dosages with our end-to-end autonomous pharmacy pipeline.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#0e223d]/80 border border-blue-900/60 hover:border-blue-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-6 relative group"
            >
              {/* Step Number Watermark */}
              <span className="text-5xl font-black text-blue-950 group-hover:text-blue-900/50 transition select-none">
                {step.num}
              </span>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-blue-950 border border-blue-800/60">
                    {step.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-blue-300 px-2.5 py-0.5 rounded-full bg-blue-900/40 border border-blue-700/40">
                    {step.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>

              <div className="pt-2 border-t border-blue-900/40 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero hassle • Instant response</span>
              </div>
            </div>
          ))}
        </div>

        {/* Callout Link */}
        <div className="text-center pt-4">
          <Link
            to={chatTarget}
            state={chatState}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95"
          >
            <span>Experience Autonomous Ordering Now</span>
            <span className="text-xs">→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}

