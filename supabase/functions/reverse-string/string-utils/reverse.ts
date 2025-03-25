/**
 * Reverses the input string
 *
 * @param text The string to reverse
 * @returns The reversed string
 */
export function reverseString(text: string): string {
  // Use Array.from to correctly handle Unicode surrogate pairs (including emojis)
  return Array.from(text).reverse().join('')
}
