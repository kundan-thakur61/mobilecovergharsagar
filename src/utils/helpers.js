const PUBLIC_ASSET_PREFIXES = [
  '/frames/',
  '/payment-icons/',
  '/assets/',
  '/src/',
  '/@fs/',
];

const normalizeSlashes = (value = '') => String(value).replace(/\\/g, '/');

const ensureLeadingSlash = (value = '') => (value.startsWith('/') ? value : `/${value}`);

const normalizeFrontendAssetCandidate = (value = '') => {
  if (!value) return '';
  const sanitized = normalizeSlashes(String(value).trim()).toLowerCase();
  const withoutLeadingSlashes = sanitized.replace(/^\/+/g, '');
  const withoutRelativeSegments = withoutLeadingSlashes.replace(/^(\.?\.\/)+/g, '');
  return ensureLeadingSlash(withoutRelativeSegments);
};

const isPublicFrontendAsset = (value = '') => {
  if (!value) return false;
  const normalized = normalizeFrontendAssetCandidate(value);
  return PUBLIC_ASSET_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};

const buildPublicAssetUrl = (value = '') => {
  const normalized = ensureLeadingSlash(value);
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  if (!base || base === '/') {
    return normalized;
  }
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${trimmedBase}${normalized}`;
};
// Format price with currency
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Generate order number
export const generateOrderNumber = (id) => {
  return `ORD-${id.slice(-8).toUpperCase()}`;
};

// Generate custom order number
export const generateCustomOrderNumber = (id) => {
  return `CUST-${id.slice(-8).toUpperCase()}`;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'indigo',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
    approved: 'green',
    rejected: 'red',
    'in_production': 'orange',
  };
  return colors[status] || 'gray';
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Calculate discount percentage
export const calculateDiscount = (originalPrice, salePrice) => {
  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.round(discount);
};

// Check if product is in stock
export const isInStock = (product) => {
  return product.variants.some(variant => variant.stock > 0 && variant.isActive);
};

// Get available variants
export const getAvailableVariants = (product) => {
  return product.variants.filter(variant => variant.stock > 0 && variant.isActive);
};

// Get product image
export const getProductImage = (product) => {
  try {
    // If the product stores a custom design, prefer its screen image as the product thumbnail
    if (product && product.design && product.design.imgSrc) {
      return resolveImageUrl(product.design.imgSrc);
    }
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      if (variant.images && variant.images.length > 0) {
        const primaryImage = variant.images.find(img => img.isPrimary);
        const pickUrl = (img) => img && (img.url || img.secure_url || img.path || img.publicUrl || img.secureUrl || img.publicUrl || '');
        const resolved = primaryImage ? pickUrl(primaryImage) : pickUrl(variant.images[0]);
        if (resolved) return resolveImageUrl(resolved);
      }
    }
  } catch (error) {
    console.warn('Error getting product image:', error);
  }
  // Use Vite base URL so public assets work when app is served from a subpath
  const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/';
  return `${base}placeholder-image.svg`;
};

// Exact screen area used inside frame (shared constant)
export const SCREEN_RECT = { left: 34, top: 62, width: 192, height: 396 };

const stripTrailingSlash = (value = '') => String(value).trim().replace(/\/+$/, '');

const getAssetBaseUrl = () => {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

  // Prefer explicit asset/upload base URLs when provided via env
  const explicit = env.VITE_UPLOADS_BASE_URL || env.VITE_ASSET_BASE_URL;
  if (explicit) return stripTrailingSlash(explicit);

  // Fall back to backend/api URL (strip trailing /api) when available
  const apiOrBackend = env.VITE_BACKEND_URL || env.VITE_API_URL;
  if (apiOrBackend) {
    // If a relative api path like "/api" is provided, anchor it to the dev backend when on a different port
    if (apiOrBackend.startsWith('/')) {
      if (typeof window !== 'undefined') {
        const { hostname, port, origin } = window.location || {};
        if (hostname === 'localhost' && port && port !== '4000') {
          return 'http://localhost:4000';
        }
        if (origin) {
          return stripTrailingSlash(`${origin}${apiOrBackend.replace(/\/api\/?$/, '')}`);
        }
      }
      // fallback to relative root (will be handled below)
      return stripTrailingSlash(apiOrBackend.replace(/\/api\/?$/, ''));
    }
    return stripTrailingSlash(apiOrBackend.replace(/\/api\/?$/, ''));
  }

  // Dev-friendly fallback: if running on a different frontend port, default to backend port 4000
  if (typeof window !== 'undefined') {
    const { origin, hostname, port } = window.location || {};
    if (hostname === 'localhost' && port && port !== '4000') {
      return `http://localhost:4000`;
    }
    if (origin) return origin;
  }

  return '';
};

const normalizeAssetPath = (raw) => {
  if (!raw) return '';
  const stringVal = String(raw).trim();
  if (stringVal === 'undefined' || stringVal === 'null') return '';
  const value = normalizeSlashes(stringVal);
  if (/^(?:https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  if (isPublicFrontendAsset(value)) {
    const normalized = normalizeFrontendAssetCandidate(value);
    return buildPublicAssetUrl(normalized);
  }
  const baseUrl = getAssetBaseUrl();
  if (!baseUrl) return value;
  if (value.startsWith('/')) {
    return `${baseUrl}${value}`;
  }
  return `${baseUrl}/${value}`;
};

// Resolve image object or string to a usable URL while supporting backend-served uploads
export const resolveImageUrl = (image) => {
  if (!image) return '';
  try {
    const candidate = typeof image === 'string'
      ? image
      : image.url || image.secure_url || image.path || image.publicUrl || image.secureUrl || '';
    return normalizeAssetPath(candidate);
  } catch (error) {
    console.warn('Error resolving image URL:', error);
    return '';
  }
};

// Scroll to top
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Local storage helpers
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};