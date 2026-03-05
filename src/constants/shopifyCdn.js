export const SHOPIFY_CDN = {
  staging: 'https://cdn.shopify.com/s/files/1/0618/5153/3389/files/',
  production: 'https://cdn.shopify.com/s/files/1/0894/3186/7695/files/',
}

export const SHOPIFY_CDN_OUTPUT = {
  staging: 'https://www.staging.fashionphile.com/cdn/shop/files/',
  production: 'https://www.fashionphile.com/cdn/shop/files/',
}

/**
 * Replace internal cdn.shopify.com image URLs with fashionphile.com proxy URLs for output HTML.
 */
export function rewriteImageCdnForOutput(html) {
  if (!html) return html
  let result = html
  result = result.replaceAll(SHOPIFY_CDN.staging, SHOPIFY_CDN_OUTPUT.staging)
  result = result.replaceAll(SHOPIFY_CDN.production, SHOPIFY_CDN_OUTPUT.production)
  return result
}
