/**
 * getImageUrl — Resuelve URLs de imágenes del backend.
 *
 * Reglas:
 *  - Si ya es una URL absoluta (http/https), la devuelve tal cual.
 *  - Si es una ruta relativa (/uploads/...), le antepone la base del backend.
 *  - Si es null / undefined / vacío, devuelve null para que el componente
 *    muestre el fallback.
 *
 * La base se deriva de VITE_API_URL quitando el segmento "/api",
 * por ej: "https://mi-back.railway.app/api" → "https://mi-back.railway.app"
 * En localhost: "http://localhost:5000/api"  → "http://localhost:5000"
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Quita el trailing "/api" (con o sin barra final)
export const BACKEND_BASE = API_URL.replace(/\/api\/?$/, '')

export function getImageUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path          // ya es absoluta
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${BACKEND_BASE}${clean}`
}
