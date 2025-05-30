import React, { Profiler, ProfilerOnRenderCallback, useCallback } from "react";

interface DevProfilerProps {
  id: string;
  threshold: number; // Threshold in milliseconds
  children: React.ReactNode;
}

export const DevProfiler: React.FC<DevProfilerProps> = ({ id, threshold, children }) => {

  const onRenderCallback: ProfilerOnRenderCallback = useCallback(
    (profilerId, phase, actualDuration) => {
    if (actualDuration > threshold) {
      console.log(
        `%cProfiler [${profilerId}] Phase: ${phase} - actual duration: ${actualDuration.toFixed(2)}ms exceeds threshold of ${threshold}ms`,
        "color: red"
      );
    }
  }, [threshold]);

  if (process.env.NODE_ENV === "production") {
    return <>{children}</>;
  }

  

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};
