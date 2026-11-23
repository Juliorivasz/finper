import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
import { LandingHero } from "@/features/landing/components/LandingHero";
import { LandingFeatures } from "@/features/landing/components/LandingFeatures";
import { LandingCTA } from "@/features/landing/components/LandingCTA";
import { LandingFooter } from "@/features/landing/components/LandingFooter";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white overflow-x-hidden">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
