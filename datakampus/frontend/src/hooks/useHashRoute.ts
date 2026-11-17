import { useEffect, useState } from "react";

export type Route = "dashboard" | "mahasiswa" | "users";

const ROUTES: readonly string[] = ["dashboard", "mahasiswa", "users"];

function readRoute(): Route {
  const hash = window.location.hash.slice(1);
  return ROUTES.includes(hash) ? (hash as Route) : "dashboard";
}

/** Menu aktif ditentukan oleh bagian #hash pada URL (#dashboard, #mahasiswa, #users). */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}
