/**
 * @file corrections.ts
 * @description  The Corr class stores a set of coefficients for a periodic term used in refining the Moon’s computed position. Each coefficient represents a multiplier for an angle (or its sine) that corrects the mean value.
 */

/**
 * Represents a correction term used to refine the Moon's computed longitude.
 */
export class Corr {
  /**
   * @param {number} mlcor - Coefficient for the Moon's mean anomaly.
   * @param {number} mscor - Coefficient for the Sun's mean anomaly.
   * @param {number} fcor - Coefficient for the Moon's argument.
   * @param {number} dcor - Coefficient for the Moon's elongation.
   * @param {number} lcor - The amplitude (in arcseconds) of the correction term.
   */
  constructor(
    public mlcor: number,
    public mscor: number,
    public fcor: number,
    public dcor: number,
    public lcor: number
  ) {}
}

/**
 * Represents an additional correction term for the Moon's position.
 */
export class Corr2 {
  /**
   * @param {number} l - Amplitude of the correction.
   * @param {number} ml - Coefficient for the Moon's mean anomaly.
   * @param {number} ms - Coefficient for the Sun's mean anomaly.
   * @param {number} f - Coefficient for the Moon's argument.
   * @param {number} d - Coefficient for the Moon's elongation.
   */
  constructor(
    public l: number,
    public ml: number,
    public ms: number,
    public f: number,
    public d: number
  ) {}
}
