export const PLACEHOLDER_IMG = (w, h, label) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect fill="#e5e5e5" width="${w}" height="${h}"/><rect fill="#d4d4d4" x="${w * 0.3}" y="${h * 0.3}" width="${w * 0.4}" height="${h * 0.3}" rx="8"/><circle fill="#d4d4d4" cx="${w * 0.4}" cy="${h * 0.25}" r="${Math.min(w, h) * 0.08}"/><text fill="#a3a3a3" font-family="system-ui, sans-serif" font-size="14" x="${w / 2}" y="${h * 0.75}" text-anchor="middle">${label || `${w}×${h}`}</text></svg>`
  )}`
