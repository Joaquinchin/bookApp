interface ImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

export function pickCover(imageLinks?: ImageLinks, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!imageLinks) {
    return "";
  }

  switch (size) {
    case 'small':
      return imageLinks.smallThumbnail || imageLinks.thumbnail || "";
    case 'large':
      return imageLinks.large || imageLinks.extraLarge || imageLinks.medium || imageLinks.thumbnail || "";
    case 'medium':
    default:
      return imageLinks.medium || imageLinks.thumbnail || imageLinks.small || "";
  }
}