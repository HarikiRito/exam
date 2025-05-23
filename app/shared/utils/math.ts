/**
 * Adds two numbers together
 * @param a - First number
 * @param b - Second number
 * @returns The sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Multiplies two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The product of a and b
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Checks if a number is even
 * @param num - Number to check
 * @returns True if the number is even, false otherwise
 */
export function isEven(num: number): boolean {
  return num % 2 === 0;
}
