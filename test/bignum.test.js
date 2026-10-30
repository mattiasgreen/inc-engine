import { describe, it, expect } from './runner.js';
import { BigNum } from '../src/engine/bignum.js';

describe('BigNum Seam', () => {
  it('constructs from number, string, and BigNum instance', () => {
    const a = new BigNum(42);
    expect(a.toNumber()).toBe(42);

    const b = new BigNum('1.5e6');
    expect(b.toNumber()).toBe(1500000);

    const c = new BigNum(b);
    expect(c.toNumber()).toBe(1500000);

    const zero = new BigNum(0);
    expect(zero.toNumber()).toBe(0);
    expect(zero.isZero()).toBe(true);
  });

  it('normalizes mantissa and exponent correctly', () => {
    const num = new BigNum(12345);
    // 12345 = 1.2345e4
    expect(num.m).toBeCloseTo(1.2345);
    expect(num.e).toBe(4);
  });

  it('performs addition and subtraction accurately across exponent scales', () => {
    const a = new BigNum(100);
    const b = new BigNum(25);
    expect(a.add(b).toNumber()).toBe(125);
    expect(a.sub(b).toNumber()).toBe(75);

    // Negatives or clamped zero subtraction
    expect(b.sub(a).toNumber()).toBe(-75);

    // Extreme scale difference: adding 1 to 1e20 changes nothing due to float precision
    const large = new BigNum('1e20');
    expect(large.add(1).toString()).toBe('1e20');
  });

  it('performs multiplication and division correctly', () => {
    const a = new BigNum(2.5e10);
    const b = new BigNum(4e5);
    const prod = a.mul(b); // 1e16
    expect(prod.m).toBeCloseTo(1.0);
    expect(prod.e).toBe(16);

    const div = prod.div(b);
    expect(div.m).toBeCloseTo(2.5);
    expect(div.e).toBe(10);
  });

  it('supports powers, roots, log10, and comparisons', () => {
    const base = new BigNum(10);
    expect(base.pow(3).toNumber()).toBe(1000);

    const square = new BigNum(256);
    expect(square.sqrt().toNumber()).toBe(16);

    const mill = new BigNum(1000000);
    expect(mill.log10()).toBeCloseTo(6);

    const fl = new BigNum(12.75);
    expect(fl.floor().toNumber()).toBe(12);
    expect(fl.ceil().toNumber()).toBe(13);

    const a = new BigNum(100);
    const b = new BigNum(200);
    expect(a.lt(b)).toBe(true);
    expect(b.gt(a)).toBe(true);
    expect(a.eq(new BigNum(100))).toBe(true);
    expect(a.cmp(b)).toBe(-1);
    expect(b.cmp(a)).toBe(1);
    expect(a.cmp(100)).toBe(0);
  });

  it('formats numbers into standard suffixes, scientific, and engineering notation', () => {
    expect(new BigNum(0).format()).toBe('0');
    expect(new BigNum(999).format()).toBe('999');
    expect(new BigNum(1234).format()).toBe('1.23K');
    expect(new BigNum(1234567).format()).toBe('1.23M');
    expect(new BigNum('1.5e15').format()).toBe('1.50Qa');
    expect(new BigNum('1.234e45').format()).toBe('1.23e45');

    // Engineering notation (exponent multiple of 3)
    expect(new BigNum(12345).format({ notation: 'engineering' })).toBe('12.34e3');
    expect(new BigNum(123456).format({ notation: 'engineering' })).toBe('123.46e3');
  });

  it('serializes to and from JSON', () => {
    const original = new BigNum('7.89e123');
    const json = JSON.stringify(original);
    const parsed = BigNum.fromJSON(JSON.parse(json));
    expect(parsed.eq(original)).toBe(true);
  });
});
