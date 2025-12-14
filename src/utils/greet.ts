/**
 * Greeting utility function
 */

/**
 * Creates a greeting message for the given name
 * @param name - The name to greet
 * @returns A greeting message
 */
export function greet(name: string): string {
  if (!name || name.trim() === '') {
    throw new Error('Name cannot be empty');
  }
  return `Hello, ${name}!`;
}
