"use client";

import { useCallback } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { MaybeCityProvider } from "@/context/CityContext";
import {
  useCountUp,
  useEscapeKey,
  useHeaderScroll,
  useRisingLetters,
  useScrollProgressFallback,
  useScrollReveal,
  useHashScroll,
} from "@/hooks/useSiteEffects";
import {
  useConfettiCursor,
  useHeroParallax,
} from "@/hooks/useConfettiCursor";
import { Background } from "@/components/Background";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Collections } from "@/components/Collections";
import { Shop } from "@/components/Shop";
import { HowItWorks } from "@/components/HowItWorks";
import { WhySection } from "@/components/WhySection";
import { GuaranteeSection } from "@/components/GuaranteeSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { FAQSection } from "@/components/FAQSection";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { MobMenu } from "@/components/MobMenu";
import { Toast } from "@/components/Toast";
import { FabContacts } from "@/components/FabContacts";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ConfettiCursor } from "@/components/ConfettiCursor";

function SiteEffects() {
  const { closeAll, closeMob } = useApp();
  const onEscape = useCallback(() => {
    closeAll();
    closeMob();
  }, [closeAll, closeMob]);

  useScrollReveal();
  useHashScroll();
  useHeaderScroll();
  useCountUp();
  useRisingLetters();
  useScrollProgressFallback();
  useConfettiCursor();
  useHeroParallax();
  useEscapeKey(onEscape);

  return null;
}

export default function SitePage({
  faqItems,
}: {
  faqItems?: { q: string; a: string }[];
} = {}) {
  return (
    <MaybeCityProvider>
      <AppProvider>
      <SiteEffects />
      <ScrollProgress />
      <Background />
      <ConfettiCursor />
      <TopBar />
      <Header />
      <a id="top" />
      <Hero />
      <Collections />
      <Shop previewLimit={4} />
      <HowItWorks />
      <WhySection />
      <GuaranteeSection />
      <ReviewsSection />
      <FAQSection items={faqItems} />
      <FinalCTA />
      <Footer />
      <CartDrawer />
      <MobMenu />
      <Toast />
      <FabContacts />
      </AppProvider>
    </MaybeCityProvider>
  );
}
