import React from "react";
import { ShieldCheck, Lock, Database, UserCheck, Stethoscope } from "lucide-react";

export default function SafetySection() {
  const safetyPillars = [
    {
      icon: <Lock className="h-5 w-5 text-cyan-400" />,
      title: "End-to-End Encryption",
      desc: "All health records, prescription photos, and personal allergy notes are encrypted with industry-standard protocols.",
    },
    {
      icon: <Database className="h-5 w-5 text-blue-400" />,
      title: "Ground Truth Formulation",
      desc: "Zero hallucination guarantee. Every AI recommendation is validated against verified drug databases and stock records.",
    },
    {
      icon: <Stethoscope className="h-5 w-5 text-emerald-400" />,
      title: "Clinical Interaction Protocol",
      desc: "Automated checks for maximum daily dosages and severe contraindications with immediate emergency physician referrals.",
    },
    {
      icon: <UserCheck className="h-5 w-5 text-amber-400" />,
      title: "Human Pharmacist Oversight",
      desc: "Administrative audit trails allow licensed pharmacists to review, adjust, and approve automated agent determinations.",
    },
  ];

  return (
    <section id="safety" className="px-4 sm:px-6 lg:px-8 py-20 bg-[#081528]/80 border-y border-blue-900/50">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3.5 py-1 rounded-full border border-emerald-800/60">
            SAFETY & COMPLIANCE FIRST
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built with Uncompromising Clinical Standards
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Automating pharmacy operations demands absolute accuracy. Our system blends generative AI intelligence with rigorous healthcare safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0e223d]/70 border border-blue-900/40 hover:border-emerald-500/40 transition shadow-xl space-y-4"
            >
              <div className="p-3 bg-blue-950/90 border border-blue-800/60 rounded-2xl w-fit">
                {pillar.icon}
              </div>

              <h3 className="text-base font-bold text-white">{pillar.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

