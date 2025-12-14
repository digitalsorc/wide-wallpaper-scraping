import { describe, expect, it } from 'vitest';
import { add, multiply } from '../src/utils/math';

describe('add', () => {
  it('should add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should add negative numbers', () => {
    expect(add(-2, -3)).toBe(-5);
  });

  it('should add positive and negative numbers', () => {
    expect(add(5, -3)).toBe(2);
  });

  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
  });
});

describe('multiply', () => {
  it('should multiply two positive numbers', () => {
    expect(multiply(2, 3)).toBe(6);
  });

  it('should multiply negative numbers', () => {
    expect(multiply(-2, -3)).toBe(6);
  });

  it('should multiply positive and negative numbers', () => {
    expect(multiply(5, -3)).toBe(-15);
  });

  it('should handle zero', () => {
    expect(multiply(0, 5)).toBe(0);
    expect(multiply(5, 0)).toBe(0);
  });
});
