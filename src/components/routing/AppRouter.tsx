/**
 * AppRouter — Central route configuration.
 *
 * Routes:
 * - / → Marketing (scaffold navigator for now)
 * - /auth/* → Auth screens
 * - /onboarding → 7-step onboarding
 * - /app/* → Authenticated app (AppShell layout)
 * - /demo/* → Demo mode (DemoProvider wrapper)
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "../layout/AppShell";
import { App as ScaffoldNavigator } from "@/App";

// Auth pages
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Callback from "@/pages/auth/Callback";

// Onboarding
import Onboarding from "@/pages/Onboarding";

// App pages
import Home from "@/pages/app/Home";
import LoamMap from "@/pages/app/LoamMap";
import Weather from "@/pages/app/Weather";
import Planner from "@/pages/app/Planner";
import CommonYear from "@/pages/app/CommonYear";
import Source from "@/pages/app/Source";
import Memory from "@/pages/app/Memory";
import NRIChat from "@/pages/app/NRIChat";
import Philosophy from "@/pages/app/Philosophy";
import Settings from "@/pages/app/Settings";
import Harvest from "@/pages/app/Harvest";
import Succession from "@/pages/app/Succession";
import Phenology from "@/pages/app/Phenology";
import Notifications from "@/pages/app/Notifications";

// Community pages
import People from "@/pages/community/People";
import Workdays from "@/pages/community/Workdays";
import Sharing from "@/pages/community/Sharing";
import Messages from "@/pages/community/Messages";
import Hours from "@/pages/community/Hours";
import GardenMap from "@/pages/community/GardenMap";

// Ancient Library pages
import AncientHome from "@/pages/ancient/AncientHome";
import AncientPlants from "@/pages/ancient/Plants";
import AncientTechniques from "@/pages/ancient/Techniques";
import AncientTraditions from "@/pages/ancient/Traditions";
import AncientCalendar from "@/pages/ancient/Calendar";
import { AncientLibraryProvider } from "@/ancientLibrary";

// Coordinator pages
import CoordinatorDashboard from "@/pages/coordinator/Dashboard";
import CoordinatorGardenDetail from "@/pages/coordinator/GardenDetail";
import CoordinatorVisitLog from "@/pages/coordinator/VisitLog";
import CoordinatorRouteOptimizer from "@/pages/coordinator/RouteOptimizer";
import CoordinatorReports from "@/pages/coordinator/Reports";

// Resilience pages (use existing components directly)
import { FoodSystemMap } from "@/components/FoodSystemMap";
import { FoodResilienceScore } from "@/components/FoodResilienceScore";
import { YieldDashboard } from "@/components/YieldDashboard";
import { SeedExchangeBoard } from "@/components/SeedExchangeBoard";
import { EconomicImpact } from "@/components/EconomicImpact";
import { CompostTracker } from "@/components/CompostTracker";
import { GardenReadyFinder } from "@/components/GardenReadyFinder";

export function AppRouter() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<Callback />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* App shell — all authenticated routes */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="land" element={<LoamMap />} />
        <Route path="weather" element={<Weather />} />
        <Route path="planner" element={<Planner />} />
        <Route path="succession" element={<Succession />} />
        <Route path="harvest" element={<Harvest />} />
        <Route path="phenology" element={<Phenology />} />
        <Route path="commonyear" element={<CommonYear />} />
        <Route path="source" element={<Source />} />
        <Route path="logs" element={<Memory />} />
        <Route path="nri" element={<NRIChat />} />
        <Route path="philosophy" element={<Philosophy />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />

        {/* Resilience features */}
        <Route path="food-map" element={<FoodSystemMap />} />
        <Route path="resilience" element={<FoodResilienceScore />} />
        <Route path="yield" element={<YieldDashboard />} />
        <Route path="seed-exchange" element={<SeedExchangeBoard />} />
        <Route path="impact" element={<EconomicImpact />} />
        <Route path="compost" element={<CompostTracker />} />
        <Route path="garden-ready" element={<GardenReadyFinder />} />

        {/* Coordinator */}
        <Route path="coordinator" element={<CoordinatorDashboard />} />
        <Route path="coordinator/garden/:gardenId" element={<CoordinatorGardenDetail />} />
        <Route path="coordinator/visits" element={<CoordinatorVisitLog />} />
        <Route path="coordinator/route" element={<CoordinatorRouteOptimizer />} />
        <Route path="coordinator/reports" element={<CoordinatorReports />} />

        {/* Community */}
        <Route path="community/people" element={<People />} />
        <Route path="community/workdays" element={<Workdays />} />
        <Route path="community/map" element={<GardenMap />} />
        <Route path="community/sharing" element={<Sharing />} />
        <Route path="community/messages" element={<Messages />} />
        <Route path="community/hours" element={<Hours />} />
      </Route>

      {/* Ancient Library */}
      <Route path="/ancient" element={<AncientLibraryProvider><AppShell /></AncientLibraryProvider>}>
        <Route index element={<AncientHome />} />
        <Route path="plants" element={<AncientPlants />} />
        <Route path="plants/:plantId" element={<AncientPlants />} />
        <Route path="techniques" element={<AncientTechniques />} />
        <Route path="techniques/:techId" element={<AncientTechniques />} />
        <Route path="traditions" element={<AncientTraditions />} />
        <Route path="traditions/:tradId" element={<AncientTraditions />} />
        <Route path="calendar" element={<AncientCalendar />} />
      </Route>

      {/* Scaffold navigator at root */}
      <Route path="/" element={<ScaffoldNavigator />} />

      {/* Fallback — unknown routes go to home */}
      <Route path="*" element={<Navigate to="/app/home" replace />} />
    </Routes>
  );
}
