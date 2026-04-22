import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID    = import.meta.env.VITE_GA_ID;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

// ─── Inicializar GA4 ──────────────────────────────────────────────────────
const initGA = () => {
  if (!GA_ID || window.gtag) return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src   = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script1);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false }); // Lo enviamos manualmente
};

// ─── Inicializar Meta Pixel ───────────────────────────────────────────────
const initMetaPixel = () => {
  if (!PIXEL_ID || window.fbq) return;

  /* eslint-disable */
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', PIXEL_ID);
};

// ─── Hook principal: trackeo de páginas ───────────────────────────────────
export const useAnalytics = () => {
  const location = useLocation();

  // Inicializar una sola vez
  useEffect(() => {
    initGA();
    initMetaPixel();
  }, []);

  // Trackear cada cambio de ruta
  useEffect(() => {
    const path  = location.pathname + location.search;
    const title = document.title;

    // GA4 — page view
    if (GA_ID && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path:  path,
        page_title: title,
      });
    }

    // Meta Pixel — page view
    if (PIXEL_ID && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);
};

// ─── Eventos de ecommerce (usar en los componentes) ───────────────────────

// Cuando el cliente ve un producto
export const trackViewProduct = (product) => {
  if (GA_ID && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'ARS',
      value:    product.prices?.cash,
      items: [{
        item_id:       product._id,
        item_name:     product.name,
        item_category: product.category?.name,
        price:         product.prices?.cash,
      }]
    });
  }

  if (PIXEL_ID && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids:  [product._id],
      content_name: product.name,
      content_type: 'product',
      value:        product.prices?.cash,
      currency:     'ARS',
    });
  }
};

// Cuando agrega al carrito
export const trackAddToCart = (product, quantity = 1) => {
  if (GA_ID && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'ARS',
      value:    product.prices?.cash * quantity,
      items: [{
        item_id:       product._id,
        item_name:     product.name,
        item_category: product.category?.name,
        price:         product.prices?.cash,
        quantity,
      }]
    });
  }

  if (PIXEL_ID && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids:  [product._id],
      content_name: product.name,
      content_type: 'product',
      value:        product.prices?.cash * quantity,
      currency:     'ARS',
    });
  }
};

// Cuando inicia el checkout
export const trackBeginCheckout = (cartItems, total) => {
  if (GA_ID && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'ARS',
      value:    total,
      items: cartItems.map(item => ({
        item_id:       item._id,
        item_name:     item.name,
        item_category: item.category?.name,
        price:         item.prices?.cash,
        quantity:      item.qty,
      }))
    });
  }

  if (PIXEL_ID && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: cartItems.map(i => i._id),
      num_items:   cartItems.length,
      value:       total,
      currency:    'ARS',
    });
  }
};

// Cuando completa una compra
export const trackPurchase = (order) => {
  if (GA_ID && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: order._id,
      currency:       'ARS',
      value:          order.totalAmount,
      items: order.items?.map(item => ({
        item_id:   item.product,
        item_name: item.name,
        price:     item.priceUnit,
        quantity:  item.quantity,
      })) || []
    });
  }

  if (PIXEL_ID && window.fbq) {
    window.fbq('track', 'Purchase', {
      value:    order.totalAmount,
      currency: 'ARS',
      content_ids: order.items?.map(i => i.product) || [],
    });
  }
};