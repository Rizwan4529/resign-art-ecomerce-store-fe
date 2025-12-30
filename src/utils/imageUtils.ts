/**
 * Image utility functions for handling product images
 */

// Get the base server URL (without /api)
const getServerBaseUrl = (): string => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  // Remove /api from the end to get server base URL
  return apiBaseUrl.replace(/\/api$/, '');
};

/**
 * Get the full URL for a product image
 * @param imagePath - The image path from the backend (e.g., "/uploads/products/image.jpg")
 * @returns The full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return '';
  }

  // If it's already a full URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path, prepend the server base URL
  const serverBase = getServerBaseUrl();
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${serverBase}${path}`;
};

/**
 * Get the first image URL from a product's images array
 * @param images - Array of image paths
 * @returns The full URL to the first image, or empty string if no images
 */
export const getFirstImageUrl = (images: string[] | undefined | null): string => {
  if (!images || images.length === 0) {
    return '';
  }
  return getImageUrl(images[0]);
};
