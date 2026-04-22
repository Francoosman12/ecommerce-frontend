/**
 * generateSitemap.js
 * Ejecutar con: node generateSitemap.js
 * Genera /public/sitemap.xml consultando los productos y categorías del backend
 *
 * Agregar al package.json:
 * "scripts": {
 *   "sitemap": "node generateSitemap.js"
 * }
 */

import fs from 'fs';
import axios from 'axios';

const BASE_URL    = 'https://margarita-accesorios.com.ar';
const API_URL     = 'https://tu-backend.vercel.app/api'; // ← Cambiar por tu URL de producción
const OUTPUT_FILE = './public/sitemap.xml';

const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { url: '/',         priority: '1.0', changefreq: 'daily'   },
  { url: '/login',    priority: '0.3', changefreq: 'yearly'  },
  { url: '/register', priority: '0.3', changefreq: 'yearly'  },
];

const generateSitemap = async () => {
  try {
    console.log('📡 Consultando productos...');
    const [productsRes, categoriesRes] = await Promise.all([
      axios.get(`${API_URL}/products`),
      axios.get(`${API_URL}/categories`),
    ]);

    const products   = productsRes.data;
    const categories = categoriesRes.data;

    const productUrls = products.map(p => ({
      url:        `/product/${p._id}`,
      lastmod:    new Date(p.updatedAt).toISOString().split('T')[0],
      priority:   '0.9',
      changefreq: 'weekly'
    }));

    // Las categorías las mostramos como filtros del home
    const categoryUrls = categories.map(cat => ({
      url:        `/?categoria=${cat.slug}`,
      priority:   '0.7',
      changefreq: 'weekly'
    }));

    const allUrls = [
      ...staticPages.map(p => ({ ...p, lastmod: today })),
      ...categoryUrls.map(p => ({ ...p, lastmod: today })),
      ...productUrls,
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(({ url, lastmod, priority, changefreq }) => `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(OUTPUT_FILE, xml);
    console.log(`✅ Sitemap generado con ${allUrls.length} URLs → ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ Error generando sitemap:', error.message);
  }
};

generateSitemap();