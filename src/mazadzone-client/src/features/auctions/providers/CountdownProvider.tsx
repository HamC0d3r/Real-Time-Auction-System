"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const CountdownContext = createContext<number>(0);

export function CountdownProvider({ children }: { children: React.ReactNode }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CountdownContext.Provider value={tick}>
      {children}
    </CountdownContext.Provider>
  );
}

export function useCountdownTick() {
  return useContext(CountdownContext);
}
