/**
 * @file Panchang.ts
 * @description Calculates Panchang (almanac) data by computing the positions of the Moon and Sun.
 * The computed values include tithi, nakshatra, yoga, karana, ayanamsa, and raasi.
 */

import {
  corrMoon2Data,
  corrMoonData,
  DEGREE_TO_RADIAN,
  KARANAS,
  NAKSHATRAS,
  RADIAN_TO_DEGREE,
  TITHIS,
  WEEKDAYS,
  YOGAS,
  RASHIS,
} from "./constants";
import { Corr, Corr2 } from "./corrections";

/**
 * The PanchangUtils namespace contains low‑level helper functions and constants
 * for astronomical and calendrical calculations. These include functions for converting
 * between date formats, computing celestial positions (e.g. Moon and Sun longitudes),
 * and applying periodic corrections.
 */
namespace PanchangUtils {
  /**
   * An array of correction terms for the Moon.
   * @type {Corr[]}
   */
  export const corrMoon: Corr[] = corrMoonData.map((data) => new Corr(...data));

  /**
   * An array of additional correction terms.
   * @type {Corr2[]}
   */
  export const corrMoon2: Corr2[] = corrMoon2Data.map(
    (data) => new Corr2(...data)
  );

  // ------------------- Global Mutable Variables -------------------
  // (These are used as temporary storage during calculations.)
  export let LmoonYoga: number = 0;
  export let LsunYoga: number = 0;
  export let dt: number = 0;
  export let kyear: number = 0,
    kmon: number = 0,
    kday: number = 0;
  export let ayanamsa: number = 0;

  // ------------------- Helper Functions -------------------

  /**
   * Normalizes an angle to the range [0, 360) degrees.
   * @param {number} v - The angle in degrees.
   * @returns {number} The normalized angle.
   */
  export function fix360(v: number): number {
    while (v < 0) {
      v += 360;
    }
    while (v >= 360) {
      v -= 360;
    }
    return v;
  }

  /**
   * Converts a Gregorian date to a Julian Day number.
   * @param {number} m - Month (1-12).
   * @param {number} d - Day (can be fractional).
   * @param {number} y - Year.
   * @returns {number} The Julian Day corresponding to the given date.
   */
  export function mdy2julian(m: number, d: number, y: number): number {
    const im = 12 * (y + 4800) + m - 3;
    let j = (2 * (im - Math.floor(im / 12) * 12) + 7 + 365 * im) / 12;
    j = Math.floor(j) + d + Math.floor(im / 48) - 32083;
    if (j > 2299171) {
      j += Math.floor(im / 4800) - Math.floor(im / 1200) + 38;
    }
    return j - 0.5;
  }

  /**
   * Compute ΔT (in hours) for the given Julian day.
   */
  export function dTime(jd: number): number {
    const efdt = [
      124, 85, 62, 48, 37, 26, 16, 10, 9, 10, 11, 11, 12, 13, 15, 16, 17, 17,
      13.7, 12.5, 12, 7.5, 5.7, 7.1, 7.9, 1.6, -5.4, -5.9, -2.7, 10.5, 21.2, 24,
      24.3, 29.2, 33.2, 40.2, 50.5, 56.9, 65.7, 75.5,
    ];
    const sDate = calData(jd);
    const dgod = kyear + (kmon - 1) / 12 + (kday - 1) / 365.25;
    const t = (jd - 2378497) / 36525; // centuries
    let dtVal: number;
    if (dgod >= 1620 && dgod < 2010) {
      const i1 = Math.floor((dgod - 1620) / 10);
      const di = dgod - (1620 + i1 * 10);
      dtVal = efdt[i1] + ((efdt[i1 + 1] - efdt[i1]) * di) / 10;
    } else {
      if (dgod >= 2010) dtVal = 25.5 * t * t - 39;
      else if (dgod >= 948 && dgod < 1620) dtVal = 25.5 * t * t;
      else dtVal = 1361.7 + 320 * t + 44.3 * t * t;
    }
    return dtVal / 3600;
  }

  /**
   * Convert a Julian day to a Date. Also sets kyear, kmon, kday.
   */
  export function calData(jd: number): Date {
    const z1 = jd + 0.5;
    const z2 = Math.floor(z1);
    const f = z1 - z2;
    let a: number;
    if (z2 < 2299161) {
      a = z2;
    } else {
      const alf = Math.floor((z2 - 1867216.25) / 36524.25);
      a = z2 + 1 + alf - Math.floor(alf / 4);
    }
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const dVal = Math.floor(365.25 * c);
    const e = Math.floor((b - dVal) / 30.6001);
    const days = b - dVal - Math.floor(30.6001 * e) + f;
    kday = Math.floor(days);
    kmon = e < 13.5 ? e - 1 : e - 13;
    kyear = kmon > 2.5 ? c - 4716 : c - 4715;
    const fractionalHours = (days - kday) * 24;
    const hr = Math.floor(fractionalHours);
    const fractionalMinutes = (fractionalHours - hr) * 60;
    const min = Math.floor(fractionalMinutes);
    const sec = Math.floor((fractionalMinutes - min) * 60);
    return new Date(kyear, kmon - 1, kday, hr, min, sec);
  }

  /** Return the day of week (0 = Sunday … 6 = Saturday) for the given Julian day. */
  export function weekDay(jd: number): number {
    let jd0 = Math.floor(jd) + 0.5;
    if (jd < jd0) {
      jd0 -= 1;
    }
    const jdn = jd0 + 1.5;
    const dn1 = Math.floor(jdn / 7) * 7;
    return Math.floor(jdn - dn1);
  }

  /** Solve Kepler’s equation iteratively (returns eccentric anomaly in radians). */
  export function kepler(m: number, ex: number, err: number): number {
    m *= DEGREE_TO_RADIAN;
    let u0 = m;
    err *= DEGREE_TO_RADIAN;
    let delta = 1;
    while (Math.abs(delta) >= err) {
      delta = (m + ex * Math.sin(u0) - u0) / (1 - ex * Math.cos(u0));
      u0 += delta;
    }
    return u0;
  }

  /** Calculate nutation in longitude (in degrees). */
  export function nutation(jd: number): number {
    const t = (jd - 2415020) / 36525;
    const t2 = t * t;
    let ls = 279.6967 + 36000.7689 * t + 0.000303 * t2;
    let l = 270.4341639 + 481267.8831417 * t - 0.0011333333 * t2;
    let ms = 358.4758333333334 + 35999.04974999958 * t - 1.5e-4 * t2;
    let ml =
      296.1046083333757 + 477198.8491083336 * t + 0.0091916667090522 * t2;
    let d =
      350.7374861110581 + 445267.1142166667 * t - 1.436111132303874e-3 * t2;
    let om = 259.1832750002543 - 1934.142008333206 * t + 0.0020777778 * t2;
    ls *= DEGREE_TO_RADIAN;
    l *= DEGREE_TO_RADIAN;
    ms *= DEGREE_TO_RADIAN;
    ml *= DEGREE_TO_RADIAN;
    d *= DEGREE_TO_RADIAN;
    om *= DEGREE_TO_RADIAN;
    const l2 = l * l;
    const ls2 = ls * ls;
    let nut = (-17.2327 - 0.01737 * t) * Math.sin(om);
    nut += 0.2088 * Math.sin(2 * om);
    nut += 0.0675 * Math.sin(ml);
    nut -= 0.0149 * Math.sin(ml - d * d);
    nut -= 0.0342 * Math.sin(l2 - om);
    nut += 0.0114 * Math.sin(l2 - ml);
    nut -= 0.2037 * Math.sin(l2);
    nut -= 0.0261 * Math.sin(l2 + ml);
    nut += 0.0124 * Math.sin(ls2 - om);
    nut += 0.0214 * Math.sin(ls2 - ms);
    nut -= 1.2729 * Math.sin(ls2);
    nut -= 0.0497 * Math.sin(ls2 + ms);
    nut += 0.1261 * Math.sin(ms);
    return nut / 3600;
  }

  /** Calculate the ayanamsa (in degrees). */
  export function calcayan(jd: number): number {
    const t = (jd - 2415020) / 36525;
    const om =
      259.183275 -
      1934.142008333206 * t +
      0.0020777778 * t * t +
      0.0000022222222 * t * t * t;
    const ls = 279.696678 + 36000.76892 * t + 0.0003025 * t * t;
    let aya =
      17.23 * Math.sin(DEGREE_TO_RADIAN * om) +
      1.27 * Math.sin(DEGREE_TO_RADIAN * ls * 2) -
      (5025.64 + 1.11 * t) * t;
    return (aya - 80861.27) / 3600;
  }

  /** Calculate the geocentric Moon longitude (in degrees). */
  export function moon(jd: number): number {
    const tdays = jd - 2415020;
    const t = tdays / 36525;
    const t2 = t * t;
    const t3 = t2 * t;

    // Mean lunar longitude (degrees)
    let l =
      270.4337361 +
      13.176396544528099 * tdays -
      (5.86 * t2) / 3600 +
      (0.0068 * t3) / 3600;
    // Mean elongation (Moon - Sun)
    let d =
      350.7374861110581 +
      445267.1142166667 * t -
      1.436111132303874e-3 * t2 +
      1.888889e-6 * t3;
    // Moon’s perigee
    const pe =
      334.329556 +
      (14648522.52 * t) / 3600 -
      (37.17 * t2) / 3600 -
      (0.045 * t3) / 3600;
    // Sun’s mean anomaly
    let ms =
      358.4758333333334 +
      35999.04974999958 * t -
      1.5e-4 * t2 -
      3.3333333623078e-6 * t3;
    // Moon’s mean anomaly (difference from perigee)
    let ml = fix360(l - pe);
    // Moon’s ascending node
    const om =
      259.183275 -
      (6962911.23 * t) / 3600 +
      (7.48 * t2) / 3600 +
      (0.008 * t3) / 3600;
    // Argument from node
    let f = fix360(l - om);

    const r2rad = 360 * DEGREE_TO_RADIAN;
    const tb = tdays * 1e-12;
    const t2c = tdays * tdays * 1e-16;

    const a1 = Math.sin(r2rad * (0.53733431 - 10104982 * tb + 191 * t2c));
    const a2 = Math.sin(r2rad * (0.71995354 - 147094228 * tb + 43 * t2c));
    const c2 = Math.cos(r2rad * (0.71995354 - 147094228 * tb + 43 * t2c));
    const a3 = Math.sin(r2rad * (0.14222222 + 1536238 * tb));
    const a4 = Math.sin(r2rad * (0.48398132 - 147269147 * tb + 43 * t2c));
    const c4 = Math.cos(r2rad * (0.48398132 - 147269147 * tb + 43 * t2c));
    const a5 = Math.sin(r2rad * (0.52453688 - 147162675 * tb + 43 * t2c));
    const a6 = Math.sin(r2rad * (0.84536324 - 11459387 * tb));
    const a7 = Math.sin(r2rad * (0.23363774 + 1232723 * tb + 191 * t2c));
    const a8 = Math.sin(r2rad * (0.5875 + 9050118 * tb));
    const a9 = Math.sin(r2rad * (0.61043085 - 67718733 * tb));

    const dlm =
      0.84 * a3 + 0.31 * a7 + 14.27 * a1 + 7.261 * a2 + 0.282 * a4 + 0.237 * a6;
    const dpm = -2.1 * a3 - 2.076 * a2 - 0.84 * a4 - 0.593 * a6;
    const dkm = 0.63 * a3 + 95.96 * a2 + 15.58 * a4 + 1.86 * a5;
    const dls = -6.4 * a3 - 0.27 * a8 - 1.89 * a6 + 0.2 * a9;
    let dgc = (-4.318 * c2 - 0.698 * c4) / (3600 * 360);
    dgc = 1.000002708 + 139.978 * dgc;

    ml = DEGREE_TO_RADIAN * (ml + (dlm - dpm) / 3600);
    ms = DEGREE_TO_RADIAN * (ms + dls / 3600);
    f = DEGREE_TO_RADIAN * (f + (dlm - dkm) / 3600);
    d = DEGREE_TO_RADIAN * (d + (dlm - dls) / 3600);

    let lk = 0;
    let lk1 = 0;
    const i1corr = 1.0 - 6.832e-8 * tdays;
    const i2corr = dgc * dgc;

    for (let i = 0; i < 93; i++) {
      const arg =
        corrMoon[i].mlcor * ml +
        corrMoon[i].mscor * ms +
        corrMoon[i].fcor * f +
        corrMoon[i].dcor * d;
      let sinarg = Math.sin(arg);
      if (corrMoon[i].mscor !== 0) {
        sinarg *= i1corr;
        if (corrMoon[i].mscor === 2 || corrMoon[i].mscor === -2) {
          sinarg *= i1corr;
        }
      }
      if (corrMoon[i].fcor !== 0) {
        sinarg *= i2corr;
      }
      lk += corrMoon[i].lcor * sinarg;
    }
    for (let i = 0; i < 27; i++) {
      const arg =
        corrMoon2[i].ml * ml +
        corrMoon2[i].ms * ms +
        corrMoon2[i].f * f +
        corrMoon2[i].d * d;
      lk1 += corrMoon2[i].l * Math.sin(arg);
    }

    let dlid = 0.822 * Math.sin(r2rad * (0.3248 - 0.0017125594 * tdays));
    dlid += 0.307 * Math.sin(r2rad * (0.14905 - 0.0034251187 * tdays));
    dlid += 0.348 * Math.sin(r2rad * (0.68266 - 0.0006873156 * tdays));
    dlid += 0.662 * Math.sin(r2rad * (0.65162 + 0.0365724168 * tdays));
    dlid += 0.643 * Math.sin(r2rad * (0.88098 - 0.0025069941 * tdays));
    dlid += 1.137 * Math.sin(r2rad * (0.85823 + 0.036448727 * tdays));
    dlid += 0.436 * Math.sin(r2rad * (0.71892 + 0.036217918 * tdays));
    dlid += 0.327 * Math.sin(r2rad * (0.97639 + 0.000173491 * tdays));

    l = l + nutation(jd) + (dlm + lk + lk1 + dlid) / 3600;
    LmoonYoga = l; // Save for yoga calculation
    return fix360(l);
  }

  /** Calculate the geocentric apparent Sun longitude (in degrees). */
  export function sun(jd: number): number {
    const tdays = jd - 2415020;
    const t = tdays / 36525;
    const t2 = t * t;
    const t3 = t * t2;

    let ls = 279.696678 + 0.9856473354 * tdays + (1.089 * t2) / 3600;
    const pes =
      101.220833 +
      (6189.03 * t) / 3600 +
      (1.63 * t2) / 3600 +
      (0.012 * t3) / 3600;
    let ms = fix360(ls - pes + 180);
    const g =
      ms +
      (0.266 * Math.sin((31.8 + 119.0 * t) * DEGREE_TO_RADIAN) +
        6.4 * Math.sin((231.19 + 20.2 * t) * DEGREE_TO_RADIAN) +
        (1.882 - 0.016 * t) *
          Math.sin((57.24 + 150.27 * t) * DEGREE_TO_RADIAN)) /
        3600;
    const oms = 259.18 - 1934.142 * t;
    const ex = 0.01675104 - 0.0000418 * t - 0.000000126 * t2;

    const l_dummy =
      270.4337361 +
      13.176396544528099 * tdays -
      (5.86 * t2) / 3600 +
      (0.0068 * t3) / 3600;
    const ml_dummy =
      296.1046083333757 +
      477198.8491083336 * t +
      0.0091916667090522 * t2 +
      0.0000143888893 * t3;
    const le = 99.696678 + 0.9856473354 * tdays + (1.089 * t2) / 3600;
    const om =
      259.183275 -
      (6962911.23 * t) / 3600 +
      (7.48 * t2) / 3600 +
      (0.008 * t3) / 3600;

    const u = kepler(g, ex, 0.0000003);
    const b = Math.sqrt((1 + ex) / (1 - ex));
    let truanom =
      Math.abs(Math.PI - u) < 1e-10 ? u : 2 * Math.atan(b * Math.tan(u / 2));
    truanom = fix360(truanom * RADIAN_TO_DEGREE);

    const u1 = (153.23 + 22518.7541 * t) * DEGREE_TO_RADIAN;
    const u2 = (216.57 + 45037.5082 * t) * DEGREE_TO_RADIAN;
    const u3 = (312.69 + 32964.3577 * t) * DEGREE_TO_RADIAN;
    const u4 = (350.74 + 445267.1142 * t - 0.00144 * t2) * DEGREE_TO_RADIAN;
    const u6 = (353.4 + 65928.71550000001 * t) * DEGREE_TO_RADIAN;
    const u5 = (315.6 + 893.3 * t) * DEGREE_TO_RADIAN;

    let dl =
      0.00134 * Math.cos(u1) +
      0.00154 * Math.cos(u2) +
      0.002 * Math.cos(u3) +
      0.00179 * Math.sin(u4) +
      (0.202 * Math.sin(u5)) / 3600;
    let dr =
      0.00000543 * Math.sin(u1) +
      0.00001575 * Math.sin(u2) +
      0.00001627 * Math.sin(u3) +
      0.00003076 * Math.cos(u4) +
      9.27e-6 * Math.sin(u6);

    const il = ls + dl + truanom - ms;
    const r1 =
      (1.0000002 * (1 - ex * ex)) /
      (1 + ex * Math.cos(truanom * DEGREE_TO_RADIAN));
    const rs = r1 + dr;
    const ab = (20.496 * (1 - ex * ex)) / rs / 3600;
    ls = il + nutation(jd) - ab;
    LsunYoga = ls; // Save for yoga
    return fix360(ls);
  }

  /** Interface for a time interval. */
  export interface TimeSpan {
    start: Date;
    end: Date;
  }

  /**
   * Calculate the start and end times for a given tithi (or karana) interval.
   *
   * @param jd Julian day
   * @param n1 Starting index (tithi/karana number)
   * @param tzone Timezone offset (hours)
   * @param len Angular span (12 for tithi, 6 for karana)
   */
  export function tithi(
    jd: number,
    n1: number,
    tzone: number,
    len: number
  ): TimeSpan {
    let result: TimeSpan = { start: new Date(), end: new Date() };
    let jdt = jd;
    const knv = Math.floor(((jd - 2415020) / 365.25) * 12.3685);
    for (let itit = n1; itit < n1 + 2; itit++) {
      const aspect = len * itit;
      let flag = 0;
      if (aspect === 0) {
        jdt = novolun(jd, knv);
        flag = 1;
      }
      if (aspect === 360) {
        jdt = novolun(jd, knv + 1);
        flag = 1;
      }
      while (flag < 1) {
        const Lsun0 = sun(jdt);
        const Lmoon0 = moon(jdt);
        const a = fix360(Lsun0 + aspect);
        let asp1 = a - Lmoon0;
        if (asp1 > 180) {
          asp1 -= 360;
        }
        if (asp1 < -180) {
          asp1 += 360;
        }
        flag = 1;
        if (Math.abs(asp1) > 0.001) {
          jdt += asp1 / (skor - 1);
          flag = 0;
        }
      }
      if (itit === n1) {
        result.start = calData(jdt + (tzone - dt) / 24);
      }
      if (itit === n1 + 1) {
        result.end = calData(jdt + (tzone - dt) / 24);
      }
    }
    return result;
  }

  /**
   * Calculate the start and end times for a nakshatra interval.
   */
  export function nakshatra(
    jd: number,
    n_naksh: number,
    tzone: number
  ): TimeSpan {
    let result: TimeSpan = { start: new Date(), end: new Date() };
    let jdt = jd;
    for (let inak = n_naksh; inak < n_naksh + 2; inak++) {
      const n1 = fix360((inak * 80) / 6);
      let flag = 0;
      while (flag < 1) {
        const Lmoon0 = fix360(moon(jdt) + ayanamsa);
        let asp1 = n1 - Lmoon0;
        if (asp1 > 180) {
          asp1 -= 360;
        }
        if (asp1 < -180) {
          asp1 += 360;
        }
        flag = 1;
        if (Math.abs(asp1) > 0.001) {
          jdt += asp1 / skor;
          flag = 0;
        }
      }
      if (inak === n_naksh) {
        result.start = calData(jdt + (tzone - dt) / 24);
      }
      if (inak === n_naksh + 1) {
        result.end = calData(jdt + (tzone - dt) / 24);
      }
    }
    return result;
  }

  /**
   * Calculate the start and end times for a yoga interval.
   */
  export function yoga(jd: number, zyoga: number, tzone: number): TimeSpan {
    let result: TimeSpan = { start: new Date(), end: new Date() };
    let jdt = jd;
    let z = zyoga;
    const nn_yoga: number[] = [
      (Math.floor((z * 6) / 80) * 80) / 6,
      ((Math.floor((z * 6) / 80) + 1) * 80) / 6,
    ];
    for (let iyog = 0; iyog < 2; iyog++) {
      let flag = 0;
      while (flag < 1) {
        const Lsun0 = sun(jdt);
        const Lmoon0 = moon(jdt);
        const dmoonYoga = LmoonYoga + ayanamsa - 491143.07698973856;
        const dsunYoga = LsunYoga + ayanamsa - 36976.91240579201;
        z = dmoonYoga + dsunYoga;
        let asp1 = nn_yoga[iyog] - z;
        flag = 1;
        if (Math.abs(asp1) > 0.001) {
          jdt += asp1 / (skor + 1.0145616633);
          flag = 0;
        }
      }
      if (iyog === 0) {
        result.start = calData(jdt + (tzone - dt) / 24);
      }
      if (iyog === 1) {
        result.end = calData(jdt + (tzone - dt) / 24);
      }
    }
    return result;
  }

  /** Estimate the time of the new moon near the given Julian day. */
  export function novolun(jd: number, knv: number): number {
    const t = (jd - 2415020) / 36525;
    const t2 = t * t;
    const t3 = t * t2;
    let jdnv =
      2415020.75933 + 29.53058868 * knv + 0.0001178 * t2 - 0.000000155 * t3;
    jdnv +=
      0.00033 *
      Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * DEGREE_TO_RADIAN);
    let m = 359.2242 + 29.10535608 * knv - 0.0000333 * t2 - 0.00000347 * t3;
    let ml = 306.0253 + 385.81691806 * knv + 0.0107306 * t2 + 0.00001236 * t3;
    let f = 21.2964 + 390.67050646 * knv - 0.0016528 * t2 - 0.00000239 * t3;
    m *= DEGREE_TO_RADIAN;
    ml *= DEGREE_TO_RADIAN;
    f *= DEGREE_TO_RADIAN;
    let djd = (0.1734 - 0.000393 * t) * Math.sin(m);
    djd += 0.0021 * Math.sin(2 * m);
    djd -= 0.4068 * Math.sin(ml);
    djd += 0.0161 * Math.sin(2 * ml);
    djd -= 0.0004 * Math.sin(3 * ml);
    djd += 0.0104 * Math.sin(2 * f);
    djd -= 0.0051 * Math.sin(m + ml);
    djd -= 0.0074 * Math.sin(m - ml);
    djd += 0.0004 * Math.sin(2 * f + m);
    djd -= 0.0004 * Math.sin(2 * f - m);
    djd -= 0.0006 * Math.sin(2 * f + ml);
    djd += 0.001 * Math.sin(2 * f - ml);
    djd += 0.0005 * Math.sin(m + 2 * ml);
    return jdnv + djd;
  }

  /** Convert a longitude (in degrees) to a string in deg, min, sec. */
  export function lon2dms(x: number): string {
    x = Math.abs(x);
    const d = Math.floor(x);
    const ss0 = Math.round((x - d) * 3600);
    const m = Math.floor(ss0 / 60);
    const s = ss0 % 60;
    return `${d}° ${m}' ${s}"`;
  }

  // A global value computed by the moon() function and later used in tithi(), etc.
  export let skor: number = 0;
}

/**
 * The Panchang class computes almanac data (Panchang) for a given date.
 * It determines the positions of the Moon and Sun and computes derived values
 * such as tithi, nakshatra, karana, yoga, ayanamsa, and raasi.
 */
export class Panchang {
  public day: { name: string } = { name: "" };
  public tithi: { name: string; start?: Date; end?: Date } = { name: "" };
  public nakshatra: { name: string; start?: Date; end?: Date } = { name: "" };
  public karana: { name: string; start?: Date; end?: Date } = { name: "" };
  public yoga: { name: string; start?: Date; end?: Date } = { name: "" };
  public ayanamsa: { name: string } = { name: "" };
  public raasi: { name: string } = { name: "" };
  public version: string = "0.2";

  /**
   * Calculates the Panchang details for the specified local date.
   * @param {Date} d - The local date.
   * @param {Function} [cb] - Optional callback function to invoke after calculation.
   */
  public calculate(d: Date, cb?: () => void): void {
    // Extract local components.
    const day = d.getDate();
    const mon = d.getMonth() + 1;
    const year = d.getFullYear();
    let hr = d.getHours() + d.getMinutes() / 60;
    const tzone = -d.getTimezoneOffset() / 60; // local offset in hours

    // Compute Julian day for local time.
    const dayhr = day + hr / 24;
    const jdlt = PanchangUtils.mdy2julian(mon, dayhr, year);
    const n_wday = PanchangUtils.weekDay(jdlt);
    this.day.name = WEEKDAYS[n_wday];

    // Compute Julian day at beginning of day (UT).
    const jd0 = PanchangUtils.mdy2julian(mon, day, year);
    const jdut = jd0 + (hr - tzone) / 24;
    PanchangUtils.dt = PanchangUtils.dTime(jdut);
    const jd = jdut + PanchangUtils.dt / 24;

    // Compute ayanamsa.
    PanchangUtils.ayanamsa = PanchangUtils.calcayan(jd);

    // Compute Moon and Sun longitudes.
    const Lmoon = PanchangUtils.moon(jd);
    const Lsun = PanchangUtils.sun(jd);

    // --- Yoga ---
    const dmoonYoga =
      PanchangUtils.LmoonYoga + PanchangUtils.ayanamsa - 491143.07698973856;
    const dsunYoga =
      PanchangUtils.LsunYoga + PanchangUtils.ayanamsa - 36976.91240579201;
    const zyoga = dmoonYoga + dsunYoga;
    let n_yoga = (zyoga * 6) / 80;
    while (n_yoga < 0) {
      n_yoga += 27;
    }
    while (n_yoga > 27) {
      n_yoga -= 27;
    }
    const s_yoga = PanchangUtils.yoga(jd, zyoga, tzone);

    // --- Nakshatra ---
    let Lmoon0 = PanchangUtils.fix360(Lmoon + PanchangUtils.ayanamsa);
    const n_naksh = Math.floor((Lmoon0 * 6) / 80);
    const s_naksh = PanchangUtils.nakshatra(jd, n_naksh, tzone);

    // --- Tithi ---
    let Lsun0 = Lsun;
    Lmoon0 = Lmoon;
    if (Lmoon0 < Lsun0) {
      Lmoon0 += 360;
    }
    const n_tithi = Math.floor((Lmoon0 - Lsun0) / 12);
    const s_tithi = PanchangUtils.tithi(jd, n_tithi, tzone, 12);

    // --- Karana ---
    Lmoon0 = Lmoon;
    Lsun0 = Lsun;
    if (Lmoon0 < Lsun0) {
      Lmoon0 += 360;
    }
    const nk = Math.floor((Lmoon0 - Lsun0) / 6);
    let n_karana: number;
    if (nk === 0) {
      n_karana = 10;
    } else if (nk >= 57) {
      n_karana = nk - 50;
    } else {
      n_karana = nk - 1 - Math.floor((nk - 1) / 7) * 7;
    }
    const s_karana = PanchangUtils.tithi(jd, nk, tzone, 6);

    const z = Math.floor(
      Math.abs(PanchangUtils.fix360(Lmoon + PanchangUtils.ayanamsa)) / 30
    );

    this.ayanamsa.name = PanchangUtils.lon2dms(PanchangUtils.ayanamsa);
    this.raasi.name = RASHIS[z];
    this.nakshatra.name = NAKSHATRAS[n_naksh];
    this.nakshatra.start = s_naksh.start;
    this.nakshatra.end = s_naksh.end;

    this.karana.name = KARANAS[n_karana];
    this.karana.start = s_karana.start;
    this.karana.end = s_karana.end;

    this.yoga.name = YOGAS[Math.floor(n_yoga)];
    this.yoga.start = s_yoga.start;
    this.yoga.end = s_yoga.end;

    this.tithi.name = TITHIS[n_tithi];
    this.tithi.start = s_tithi.start;
    this.tithi.end = s_tithi.end;

    if (cb) {
      cb();
    }
  }
}
