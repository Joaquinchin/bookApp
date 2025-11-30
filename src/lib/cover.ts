// src/lib/cover.ts
interface ImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

export function pickCover(imageLinks?: ImageLinks, size: 'small' | 'medium' | 'large' = 'large'): string {
  if (!imageLinks) {
    return "";
  }

  let selectedUrl = "";

  switch (size) {
    case 'small':
      selectedUrl = imageLinks.smallThumbnail || imageLinks.thumbnail || "";
      break;
    case 'large':
      selectedUrl = imageLinks.large || imageLinks.extraLarge || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail || "";
      break;
    case 'medium':
    default:
      selectedUrl = imageLinks.medium || imageLinks.thumbnail || imageLinks.small || imageLinks.large || imageLinks.smallThumbnail || "";
      break;
  }
  //APLICAR normalizeCover automáticamente
  const finalUrl = normalizeCover(selectedUrl);
  return finalUrl;
}

export function normalizeCover(url?: string | null): string {
  if (!url) {
    return "";
  }
  
  // Convert HTTP to HTTPS for security
  const httpsUrl = url.replace(/^http:/, 'https:');
  
  // También asegurar que sea la versión más grande disponible
  // Google Books permite cambiar el parámetro &edge=curl para obtener mejor calidad
  return httpsUrl.replace(/&edge=curl/g, '') + '&edge=curl';
}