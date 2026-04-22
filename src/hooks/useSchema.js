import { useEffect } from 'react';

/**
 * Inyecta JSON-LD de Schema.org en el <head>
 * Google usa esto para mostrar precio, disponibilidad y reseñas en los resultados
 */

// Schema para la organización/negocio
export const useOrganizationSchema = () => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Margarita Accesorios",
      "url": window.location.origin,
      "logo": `${window.location.origin}/logo.png`,
      "description": "Bufandones artesanales y accesorios de moda femenina en San Miguel de Tucumán.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "San Miguel de Tucumán",
        "addressRegion": "Tucumán",
        "addressCountry": "AR"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+54-9-381-522-5633",
        "contactType": "customer service",
        "availableLanguage": "Spanish"
      },
      "sameAs": [
        "https://www.instagram.com/margarita_accesorios.11"
      ]
    };
    injectSchema('org-schema', schema);
    return () => removeSchema('org-schema');
  }, []);
};

// Schema para un producto específico
export const useProductSchema = (product) => {
  useEffect(() => {
    if (!product) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description || `${product.name} - Margarita Accesorios`,
      "sku": product.sku,
      "image": product.images?.map(img => img.url) || [],
      "brand": {
        "@type": "Brand",
        "name": "Margarita Accesorios"
      },
      "category": product.category?.name || "Accesorios",
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "ARS",
        "price": product.prices?.cash || product.priceBase,
        "availability": product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Margarita Accesorios"
        }
      }
    };

    injectSchema('product-schema', schema);
    return () => removeSchema('product-schema');
  }, [product?._id]);
};

// Schema para la tienda (BreadcrumbList)
export const useBreadcrumbSchema = (items) => {
  useEffect(() => {
    if (!items?.length) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": item.name,
        "item": item.url
      }))
    };

    injectSchema('breadcrumb-schema', schema);
    return () => removeSchema('breadcrumb-schema');
  }, [JSON.stringify(items)]);
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const injectSchema = (id, schema) => {
  removeSchema(id);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id   = id;
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
};

const removeSchema = (id) => {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
};