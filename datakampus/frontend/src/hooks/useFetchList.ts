import { useCallback, useEffect, useState } from "react";
import { apiRequest, errorMessage } from "../api";
import type { ListState } from "../types";

/** Mengambil daftar data dari API dan menyediakan status loading/error serta reload. */
export function useFetchList<T>(path: string): ListState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await apiRequest<T[]>(path));
    } catch (err) {
      setError(errorMessage(err, "Data tidak dapat dimuat."));
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, loading, error, reload };
}
