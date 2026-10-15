import { useEffect } from "react";
import { useBlocker } from "react-router";

/**
 * Varování před odchodem s neuloženými změnami – při zavření/obnovení stránky
 * (beforeunload) i při přepnutí sekce administrace (react-router).
 */
export function useLeaveGuard(dirty: boolean) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("Máte neuložené změny. Opravdu odejít a změny zahodit?")) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}
