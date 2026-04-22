import { useEffect } from 'react';

/**
 * Hook para manejar meta tags dinámicos por página
 * Uso: useSEO({ title, description, image, url, type })
 */
const useSEO = ({
  title       = 'Margarita Accesorios — Bufandones y Accesorios de Moda',
  description = 'Bufandones artesanales, accesorios y moda femenina en San Miguel de Tucumán. Diseños únicos, materiales seleccionados y envíos a toda Argentina.',
  image       = '/og-image.jpg',
  url         = typeof window !== 'undefined' ? window.location.href : '',
  type        = 'website',
  price       = null,
  availability = null,
  sku         = null,
}) => {
  useEffect(() => {
    // ── Title ──────────────────────────────────────────────────────────
    document.title = title;

    const setMeta = (selector, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        // Extraer el atributo del selector: [name="x"] o [property="x"]
        const nameMatch     = selector.match(/name="([^"]+)"/);
        const propertyMatch = selector.match(/property="([^"]+)"/);
        if (nameMatch)     el.setAttribute('name',     nameMatch[1]);
        if (propertyMatch) el.setAttribute('property', propertyMatch[1]);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // ── SEO básico ─────────────────────────────────────────────────────
    setMeta('[name="description"]',          description);
    setMeta('[name="robots"]',               'index, follow');

    // ── Open Graph (Facebook, WhatsApp, LinkedIn) ──────────────────────
    setMeta('[property="og:title"]',         title);
    setMeta('[property="og:description"]',   description);
    setMeta('[property="og:image"]',         image);
    setMeta('[property="og:url"]',           url);
    setMeta('[property="og:type"]',          type);
    setMeta('[property="og:site_name"]',     'Margarita Accesorios');
    setMeta('[property="og:locale"]',        'es_AR');

    // ── Twitter Card ───────────────────────────────────────────────────
    setMeta('[name="twitter:card"]',         'summary_large_image');
    setMeta('[name="twitter:title"]',        title);
    setMeta('[name="twitter:description"]',  description);
    setMeta('[name="twitter:image"]',        image);

    // ── Producto (solo en páginas de detalle) ──────────────────────────
    if (price) {
      setMeta('[property="product:price:amount"]',   price);
      setMeta('[property="product:price:currency"]', 'ARS');
    }

  }, [title, description, image, url, type, price]);
};

export default useSEO;