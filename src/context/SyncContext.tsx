import { createContext, useContext, useState } from "react";

interface SyncContextValue {
  syncInProgress: boolean;
  setSyncInProgress: (v: boolean) => void;
}

const SyncContext = createContext<SyncContextValue>({
  syncInProgress: false,
  setSyncInProgress: () => {},
});

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncInProgress, setSyncInProgress] = useState(false);
  return (
    <SyncContext.Provider value={{ syncInProgress, setSyncInProgress }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSyncContext = () => useContext(SyncContext);
