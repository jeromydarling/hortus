import { createContext, useContext, useState, type ReactNode } from "react";
import { DEMO_FIXTURE, DEMO_COMMUNITY } from "./fixture";

interface DemoObservation {
  id: string;
  type: string;
  content: string;
  phaseAtTime: string;
  createdAt: string;
  tags: string[];
}

interface DemoContextType {
  isDemo: true;
  land: typeof DEMO_FIXTURE.land;
  plots: typeof DEMO_FIXTURE.plots;
  observations: (typeof DEMO_FIXTURE.observations[number] | DemoObservation)[];
  weather: typeof DEMO_FIXTURE.weather;
  activePlan: typeof DEMO_FIXTURE.activePlan;
  community: typeof DEMO_COMMUNITY;
  nriMessageCount: number;
  incrementNRICount: () => void;
  addObservation: (obs: DemoObservation) => void;
  sessionObservations: DemoObservation[];
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [nriMessageCount, setNRIMessageCount] = useState(0);
  const [sessionObservations, setSessionObservations] = useState<
    DemoObservation[]
  >([]);

  return (
    <DemoContext.Provider
      value={{
        isDemo: true,
        land: DEMO_FIXTURE.land,
        plots: DEMO_FIXTURE.plots,
        observations: [...sessionObservations, ...DEMO_FIXTURE.observations],
        weather: DEMO_FIXTURE.weather,
        activePlan: DEMO_FIXTURE.activePlan,
        community: DEMO_COMMUNITY,
        nriMessageCount,
        incrementNRICount: () => setNRIMessageCount((n) => n + 1),
        addObservation: (obs: DemoObservation) =>
          setSessionObservations((prev) => [obs, ...prev]),
        sessionObservations,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextType {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}

export { DemoContext };
