import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

// Caché simple en memoria — persiste mientras la pestaña está abierta
// Evita refetch innecesarios al navegar entre páginas
const cache = {
  public: { data: null, ts: 0 },
  all:    { data: null, ts: 0 },
};
const CACHE_TTL = 60 * 1000; // 1 minuto

export const useProducts = (includeAll = false) => {
  const cacheKey = includeAll ? 'all' : 'public';

  const [products, setProducts] = useState(cache[cacheKey].data || []);
  const [loading, setLoading]   = useState(!cache[cacheKey].data);
  const [error, setError]       = useState(null);

  const fetchProducts = useCallback(async (force = false) => {
    const cached = cache[cacheKey];
    const isFresh = cached.data && (Date.now() - cached.ts) < CACHE_TTL;

    // Si hay caché fresca y no es forzado, usamos la caché
    if (isFresh && !force) {
      setProducts(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const endpoint  = includeAll ? '/products?all=true' : '/products';
      const { data }  = await axiosClient.get(endpoint);

      // Guardar en caché
      cache[cacheKey] = { data, ts: Date.now() };
      setProducts(data);
      setError(null);
    } catch {
      setError("No se pudo cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }, [includeAll, cacheKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // refetch forzado (limpia caché)
  const refetch = () => {
    cache[cacheKey] = { data: null, ts: 0 };
    fetchProducts(true);
  };

  return { products, loading, error, refetch };
};