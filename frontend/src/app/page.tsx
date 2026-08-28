import type { Metadata } from "next";
import {
  LandingNavbar,
  LandingHero,
  LandingFeatures,
  LandingHowItWorks,
  LandingAbout,
  LandingContact,
  LandingCtaSection,
  LandingFooter,
} from "@/components/landing";

export const metadata: Metadata = {
  title: "RunSheet — Cloud-Native Event Operations & Team Coordination",
  description:
    "Plan, organize, and manage events all in one place. Organize events, manage teams, assign tasks, track progress, and keep everyone informed from one centralized platform.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary scroll-smooth">
      {/* Navigation Header */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Modern SaaS Hero */}
        <LandingHero />

        {/* 6 Real Core Features */}
        <LandingFeatures />

        {/* 4-Step Execution Workflow */}
        <LandingHowItWorks />

        {/* About Us */}
        <LandingAbout />

        {/* Contact Us */}
        <LandingContact />

        {/* Closing Actionable CTA */}
        <LandingCtaSection />
      </main>

      {/* Minimal Footer */}
      <LandingFooter />
    </div>
  );
}
