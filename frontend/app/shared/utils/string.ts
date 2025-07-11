/**
 * String utility functions for common string operations
 */

/**
 * Capitalizes the first character of a string
 * @param str - The string to capitalize
 * @returns The string with the first character capitalized
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalizes the first character of each word in a string
 * @param str - The string to title case
 * @returns The string with each word capitalized
 */
export function titleCase(str: string): string {
  if (!str) return str;
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}
