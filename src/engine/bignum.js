// src/engine/bignum.js
// Pure ES6 immutable BigNum value object supporting up to 10^(9e15)

const SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'
];

export class BigNum {
  constructor(mantissa = 0, exponent = 0) {
    if (mantissa instanceof BigNum) {
      this.m = mantissa.m;
      this.e = mantissa.e;
      return;
    }

    if (typeof mantissa === 'string') {
      const parsed = BigNum.fromString(mantissa);
      this.m = parsed.m;
      this.e = parsed.e;
      return;
    }

    if (typeof mantissa === 'object' && mantissa !== null && 'm' in mantissa && 'e' in mantissa) {
      this.m = Number(mantissa.m);
      this.e = Math.floor(Number(mantissa.e));
      this._normalize();
      return;
    }

    let m = Number(mantissa);
    let e = Math.floor(Number(exponent));

    if (!Number.isFinite(m) || Number.isNaN(m)) {
      this.m = 0;
      this.e = 0;
      return;
    }

    this.m = m;
    this.e = e;
    this._normalize();
  }

  static from(val) {
    if (val instanceof BigNum) return val;
    return new BigNum(val);
  }

  static fromString(str) {
    const trimmed = str.trim();
    if (!trimmed || trimmed === '0') return new BigNum(0, 0);

    const eIndex = trimmed.toLowerCase().indexOf('e');
    if (eIndex !== -1) {
      const mPart = parseFloat(trimmed.slice(0, eIndex));
      const ePart = parseInt(trimmed.slice(eIndex + 1), 10);
      return new BigNum(mPart, ePart);
    }

    const val = parseFloat(trimmed);
    return new BigNum(val);
  }

  static fromJSON(json) {
    if (!json) return new BigNum(0, 0);
    return new BigNum(json.m, json.e);
  }

  _normalize() {
    if (this.m === 0 || !Number.isFinite(this.m)) {
      this.m = 0;
      this.e = 0;
      return;
    }

    let sign = this.m < 0 ? -1 : 1;
    let absM = Math.abs(this.m);

    if (absM >= 10 || absM < 1) {
      const shift = Math.floor(Math.log10(absM));
      if (Number.isFinite(shift) && shift !== 0) {
        absM /= Math.pow(10, shift);
        this.e += shift;
      }
    }

    // Secondary fine normalization against floating point error (e.g. 9.999999999999999)
    if (absM >= 10) {
      absM /= 10;
      this.e += 1;
    } else if (absM < 1 && absM > 0) {
      absM *= 10;
      this.e -= 1;
    }

    this.m = sign * absM;
  }

  isZero() {
    return this.m === 0;
  }

  isNegative() {
    return this.m < 0;
  }

  abs() {
    return new BigNum(Math.abs(this.m), this.e);
  }

  negate() {
    return new BigNum(-this.m, this.e);
  }

  add(other) {
    const b = BigNum.from(other);
    if (this.isZero()) return b;
    if (b.isZero()) return this;

    const expDiff = this.e - b.e;
    if (expDiff > 16) return this;
    if (expDiff < -16) return b;

    if (expDiff >= 0) {
      const m = this.m + b.m * Math.pow(10, -expDiff);
      return new BigNum(m, this.e);
    } else {
      const m = this.m * Math.pow(10, expDiff) + b.m;
      return new BigNum(m, b.e);
    }
  }

  sub(other) {
    const b = BigNum.from(other);
    return this.add(b.negate());
  }

  mul(other) {
    const b = BigNum.from(other);
    if (this.isZero() || b.isZero()) return new BigNum(0, 0);
    return new BigNum(this.m * b.m, this.e + b.e);
  }

  div(other) {
    const b = BigNum.from(other);
    if (b.isZero()) throw new RangeError('Division by zero in BigNum');
    if (this.isZero()) return new BigNum(0, 0);
    return new BigNum(this.m / b.m, this.e - b.e);
  }

  pow(power) {
    const p = typeof power === 'number' ? power : power.toNumber();
    if (p === 0) return new BigNum(1, 0);
    if (this.isZero()) return new BigNum(0, 0);

    // (m * 10^e)^p = m^p * 10^(e*p)
    const newLog10 = (Math.log10(Math.abs(this.m)) + this.e) * p;
    const newE = Math.floor(newLog10);
    const newM = Math.pow(10, newLog10 - newE);
    const sign = this.m < 0 && p % 2 !== 0 ? -1 : 1;
    return new BigNum(sign * newM, newE);
  }

  sqrt() {
    return this.pow(0.5);
  }

  root(n) {
    if (n === 0) throw new RangeError('Root cannot be 0');
    return this.pow(1 / n);
  }

  log10() {
    if (this.m <= 0) return -Infinity;
    return Math.log10(this.m) + this.e;
  }

  floor() {
    if (this.isZero() || this.e < 0) {
      return this.m < 0 ? new BigNum(-1, 0) : new BigNum(0, 0);
    }
    if (this.e >= 16) return this;
    const val = Math.floor(this.toNumber());
    return new BigNum(val);
  }

  ceil() {
    if (this.isZero() || this.e < 0) {
      return this.m > 0 ? new BigNum(1, 0) : new BigNum(0, 0);
    }
    if (this.e >= 16) return this;
    const val = Math.ceil(this.toNumber());
    return new BigNum(val);
  }

  cmp(other) {
    const b = BigNum.from(other);
    if (this.isZero() && b.isZero()) return 0;
    if (this.m > 0 && b.m <= 0) return 1;
    if (this.m < 0 && b.m >= 0) return -1;

    // Same sign
    const sign = this.m > 0 ? 1 : -1;
    if (this.e > b.e) return sign;
    if (this.e < b.e) return -sign;

    // Within floating point precision tolerance
    if (Math.abs(this.m - b.m) < 1e-11) return 0;

    if (this.m > b.m) return 1;
    if (this.m < b.m) return -1;
    return 0;
  }

  eq(other) {
    return this.cmp(other) === 0;
  }

  lt(other) {
    return this.cmp(other) < 0;
  }

  lte(other) {
    return this.cmp(other) <= 0;
  }

  gt(other) {
    return this.cmp(other) > 0;
  }

  gte(other) {
    return this.cmp(other) >= 0;
  }

  toNumber() {
    if (this.isZero()) return 0;
    if (this.e > 308) return this.m > 0 ? Infinity : -Infinity;
    if (this.e < -308) return 0;
    return this.m * Math.pow(10, this.e);
  }

  toString() {
    if (this.isZero()) return '0';
    if (this.e === 0) return this.m.toString();
    return `${this.m}e${this.e}`;
  }

  toJSON() {
    return { m: this.m, e: this.e };
  }

  format(options = {}) {
    if (this.isZero()) return '0';

    if (options.notation === 'engineering') {
      const engExp = Math.floor(this.e / 3) * 3;
      const engM = this.m * Math.pow(10, this.e - engExp);
      const prec = options.precision ?? 2;
      return `${engM.toFixed(prec)}e${engExp}`;
    }

    if (options.notation === 'scientific') {
      const prec = options.precision ?? 2;
      return `${this.m.toFixed(prec)}e${this.e}`;
    }

    if (this.e < 3 && this.e >= 0) {
      const val = this.toNumber();
      return Number.isInteger(val) ? val.toString() : val.toFixed(options.precision ?? 2);
    }

    // Standard suffix up to Decillion (or custom)
    const suffixGroup = Math.floor(this.e / 3);
    if (suffixGroup < SUFFIXES.length && this.e >= 3 && suffixGroup > 0) {
      const scaledM = this.m * Math.pow(10, this.e % 3);
      const suffix = SUFFIXES[suffixGroup];
      const prec = options.precision ?? 2;
      return `${scaledM.toFixed(prec)}${suffix}`;
    }

    // Scientific notation default
    const prec = options.precision ?? 2;
    return `${this.m.toFixed(prec)}e${this.e}`;
  }
}
