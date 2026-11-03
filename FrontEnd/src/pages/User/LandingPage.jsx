import HeroSection from "../../components/LandingPage/HeroSection";
import MetricsBar from "../../components/LandingPage/MetricsBar";
import HowItWorksSection from "../../components/LandingPage/HowItWorksSection";
import FeaturesSection from "../../components/LandingPage/FeaturesSection";
import SafetySection from "../../components/LandingPage/SafetySection";
import FAQSection from "../../components/LandingPage/FAQSection";
import CTASection from "../../components/LandingPage/CTASection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1F3A] via-[#091526] to-[#0B1F3A] text-slate-100 flex flex-col">
      <HeroSection />
      <MetricsBar />
      <HowItWorksSection />
      <FeaturesSection />
      <SafetySection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
