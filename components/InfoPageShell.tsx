"use client";

import { useCallback } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { MaybeCityProvider } from "@/context/CityContext";
import {
  useEscapeKey,
  useHeaderScroll,
  useScrollProgressFallback,
  useScrollReveal,
} from "@/hooks/useSiteEffects";
import { useConfettiCursor } from "@/hooks/useConfettiCursor";
import { Background } from "@/components/Background";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
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
  useHeaderScroll();
  useScrollProgressFallback();
  useConfettiCursor();
  useEscapeKey(onEscape);

  return null;
}

function InfoPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteEffects />
      <ScrollProgress />
      <Background />
      <ConfettiCursor />
      <TopBar />
      <Header />
      <a id="top" />
      {children}
      <Footer />
      <CartDrawer />
      <MobMenu />
      <Toast />
      <FabContacts />
    </>
  );
}

export function InfoPageShell({ children }: { children: React.ReactNode }) {
  return (
    <MaybeCityProvider>
      <AppProvider>
        <InfoPageLayout>{children}</InfoPageLayout>
      </AppProvider>
    </MaybeCityProvider>
  );
}
