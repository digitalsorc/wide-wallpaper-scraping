import { describe, expect, it } from 'vitest';
import { greet } from '../src/utils/greet';

describe('greet', () => {
  it('should return a greeting message for a valid name', () => {
    const result = greet('World');
    expect(result).toBe('Hello, World!');
  });

  it('should return a greeting for a name with spaces', () => {
    const result = greet('John Doe');
    expect(result).toBe('Hello, John Doe!');
  });

  it('should throw an error for an empty string', () => {
    expect(() => greet('')).toThrow('Name cannot be empty');
  });

  it('should throw an error for a whitespace-only string', () => {
    expect(() => greet('   ')).toThrow('Name cannot be empty');
  });
});
