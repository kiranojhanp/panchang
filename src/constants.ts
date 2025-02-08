/**
 * This file contains constants and helper classes used for Panchang calculations.
 */

/** Conversion factor from degrees to radians. */
export const DEG_TO_RAD: number = Math.PI / 180;
/** Conversion factor from radians to degrees. */
export const RAD_TO_DEG: number = 180 / Math.PI;

/** Zodiac signs (Raasi). */
export const ZODIAC_SIGNS: string[] = [
  "Mesha",
  "Vrushabha",
  "Mithuna",
  "Karkataka",
  "Simha",
  "Kanya",
  "Tula",
  "Vrushchika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Meena",
];

/** Weekday names. */
export const WEEKDAYS: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** (Unused) range array from original code. */
export const RANGE: number[] = [
  1, 31, 0, 0, -3000, 4000, 0, 23, 0, 59, -12, 12, 0, 59,
];

/** Nakshatra names. */
export const NAKSHATRAS: string[] = [
  "Ashwini",
  "Bharani",
  "Kruthika",
  "Rohini",
  "Mrugasira",
  "Aarudra",
  "Punarwasu",
  "Pushyami",
  "Aslesha",
  "Makha",
  "Pubha",
  "Uttara",
  "Hasta",
  "Chitta",
  "Swati",
  "Visakha",
  "Anuradha",
  "Jyesta",
  "Mula",
  "Purva-Shada",
  "Uttara-Shaada",
  "Sravanam",
  "Dhanista",
  "Satabhisham",
  "Purva-Bhadra",
  "Uttara-Bhadra",
  "Revathi",
];

/** Tithi names. */
export const TITHIS: string[] = [
  "Padyami",
  "Vidhiya",
  "Thadiya",
  "Chavithi",
  "Panchami",
  "Shasti",
  "Sapthami",
  "Ashtami",
  "Navami",
  "Dasami",
  "Ekadasi",
  "Dvadasi",
  "Trayodasi",
  "Chaturdasi",
  "Punnami",
  "Padyami",
  "Vidhiya",
  "Thadiya",
  "Chaviti",
  "Panchami",
  "Shasti",
  "Sapthami",
  "Ashtami",
  "Navami",
  "Dasami",
  "Ekadasi",
  "Dvadasi",
  "Trayodasi",
  "Chaturdasi",
  "Amavasya",
];

/** Karana names. */
export const KARANAS: string[] = [
  "Bawa",
  "Balava",
  "Kaulava",
  "Taitula",
  "Garaja",
  "Vanija",
  "Vishti",
  "Sakuna",
  "Chatushpada",
  "Nagava",
  "Kimstughana",
];

/** Yoga names. */
export const YOGAS: string[] = [
  "Vishkambha",
  "Prithi",
  "Ayushman",
  "Saubhagya",
  "Sobhana",
  "Atiganda",
  "Sukarman",
  "Dhrithi",
  "Soola",
  "Ganda",
  "Vridhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyan",
  "Parigha",
  "Siva",
  "Siddha",
  "Sadhya",
  "Subha",
  "Sukla",
  "Bramha",
  "Indra",
  "Vaidhruthi",
];

/** Additional nakshatra index corrections. */
export const TIPNAKS: number[] = [
  2, 5, 6, 0, 1, 4, 3, 2, 4, 5, 5, 0, 2, 1, 3, 6, 1, 4, 4, 5, 0, 3, 3, 3, 5, 0,
  1,
];

/**
 * Class representing a correction coefficient for the Moon’s calculations.
 */
export class Corr {
  /**
   * @param mlcor - Coefficient for mean anomaly of Moon.
   * @param mscor - Coefficient for mean anomaly of Sun.
   * @param fcor - Coefficient for argument F.
   * @param dcor - Coefficient for elongation.
   * @param lcor - Correction (in arc-seconds or arc-units).
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
 * Class representing an additional correction coefficient.
 */
export class Corr2 {
  /**
   * @param l - Correction for longitude.
   * @param ml - Coefficient for mean anomaly of Moon.
   * @param ms - Coefficient for mean anomaly of Sun.
   * @param f - Coefficient for argument F.
   * @param d - Coefficient for elongation.
   */
  constructor(
    public l: number,
    public ml: number,
    public ms: number,
    public f: number,
    public d: number
  ) {}
}

/** Correction array for the Moon’s primary corrections. */
export const CORR_MOON: Corr[] = [
  new Corr(0, 0, 0, 4, 13.902),
  new Corr(0, 0, 0, 2, 2369.912),
  new Corr(1, 0, 0, 4, 1.979),
  new Corr(1, 0, 0, 2, 191.953),
  new Corr(1, 0, 0, 0, 22639.5),
  new Corr(1, 0, 0, -2, -4586.465),
  new Corr(1, 0, 0, -4, -38.428),
  new Corr(1, 0, 0, -6, -0.393),
  new Corr(0, 1, 0, 4, -0.289),
  new Corr(0, 1, 0, 2, -24.42),
  new Corr(0, 1, 0, 0, -668.146),
  new Corr(0, 1, 0, -2, -165.145),
  new Corr(0, 1, 0, -4, -1.877),
  new Corr(0, 0, 0, 3, 0.403),
  new Corr(0, 0, 0, 1, -125.154),
  new Corr(2, 0, 0, 4, 0.213),
  new Corr(2, 0, 0, 2, 14.387),
  new Corr(2, 0, 0, 0, 769.016),
  new Corr(2, 0, 0, -2, -211.656),
  new Corr(2, 0, 0, -4, -30.773),
  new Corr(2, 0, 0, -6, -0.57),
  new Corr(1, 1, 0, 2, -2.921),
  new Corr(1, 1, 0, 0, -109.673),
  new Corr(1, 1, 0, -2, -205.962),
  new Corr(1, 1, 0, -4, -4.391),
  new Corr(1, -1, 0, 4, 0.283),
  new Corr(1, -1, 0, 2, 14.577),
  new Corr(1, -1, 0, 0, 147.687),
  new Corr(1, -1, 0, -2, 28.475),
  new Corr(1, -1, 0, -4, 0.636),
  new Corr(0, 2, 0, 2, -0.189),
  new Corr(0, 2, 0, 0, -7.486),
  new Corr(0, 2, 0, -2, -8.096),
  new Corr(0, 0, 2, 2, -5.741),
  new Corr(0, 0, 2, 0, -411.608),
  new Corr(0, 0, 2, -2, -55.173),
  new Corr(0, 0, 2, -4, 0.025),
  new Corr(1, 0, 0, 1, -8.466),
  new Corr(1, 0, 0, -1, 18.609),
  new Corr(1, 0, 0, -3, 3.215),
  new Corr(0, 1, 0, 1, 18.023),
  new Corr(0, 1, 0, -1, 0.56),
  new Corr(3, 0, 0, 2, 1.06),
  new Corr(3, 0, 0, 0, 36.124),
  new Corr(3, 0, 0, -2, -13.193),
  new Corr(3, 0, 0, -4, -1.187),
  new Corr(3, 0, 0, -6, -0.293),
  new Corr(2, 1, 0, 2, -0.29),
  new Corr(2, 1, 0, 0, -7.649),
  new Corr(2, 1, 0, -2, -8.627),
  new Corr(2, 1, 0, -4, -2.74),
  new Corr(2, -1, 0, 2, 1.181),
  new Corr(2, -1, 0, 0, 9.703),
  new Corr(2, -1, 0, -2, -2.494),
  new Corr(2, -1, 0, -4, 0.36),
  new Corr(1, 2, 0, 0, -1.167),
  new Corr(1, 2, 0, -2, -7.412),
  new Corr(1, 2, 0, -4, -0.311),
  new Corr(1, -2, 0, 2, 0.757),
  new Corr(1, -2, 0, 0, 2.58),
  new Corr(1, -2, 0, -2, 2.533),
  new Corr(0, 3, 0, -2, -0.344),
  new Corr(1, 0, 2, 2, -0.992),
  new Corr(1, 0, 2, 0, -45.099),
  new Corr(1, 0, 2, -2, -0.179),
  new Corr(1, 0, -2, 2, -6.382),
  new Corr(1, 0, -2, 0, 39.528),
  new Corr(1, 0, -2, -2, 9.366),
  new Corr(0, 1, 2, 0, 0.415),
  new Corr(0, 1, 2, -2, -2.152),
  new Corr(0, 1, -2, 2, -1.44),
  new Corr(0, 1, -2, -2, 0.384),
  new Corr(2, 0, 0, 1, -0.586),
  new Corr(2, 0, 0, -1, 1.75),
  new Corr(2, 0, 0, -3, 1.225),
  new Corr(1, 1, 0, 1, 1.267),
  new Corr(1, -1, 0, -1, -1.089),
  new Corr(0, 0, 2, -1, 0.584),
  new Corr(4, 0, 0, 0, 1.938),
  new Corr(4, 0, 0, -2, -0.952),
  new Corr(3, 1, 0, 0, -0.551),
  new Corr(3, 1, 0, -2, -0.482),
  new Corr(3, -1, 0, 0, 0.681),
  new Corr(2, 0, 2, 0, -3.996),
  new Corr(2, 0, 2, -2, 0.557),
  new Corr(2, 0, -2, 2, -0.459),
  new Corr(2, 0, -2, 0, -1.298),
  new Corr(2, 0, -2, -2, 0.538),
  new Corr(1, 1, -2, -2, 0.426),
  new Corr(1, -1, 2, 0, -0.304),
  new Corr(1, -1, -2, 2, -0.372),
  new Corr(0, 0, 4, 0, 0.418),
  new Corr(2, -1, 0, -1, -0.352),
];

/** Additional correction array for the Moon. */
export const CORR_MOON2: Corr2[] = [
  new Corr2(0.127, 0, 0, 0, 6),
  new Corr2(-0.151, 0, 2, 0, -4),
  new Corr2(-0.085, 0, 0, 2, 4),
  new Corr2(0.15, 0, 1, 0, 3),
  new Corr2(-0.091, 2, 1, 0, -6),
  new Corr2(-0.103, 0, 3, 0, 0),
  new Corr2(-0.301, 1, 0, 2, -4),
  new Corr2(0.202, 1, 0, -2, -4),
  new Corr2(0.137, 1, 1, 0, -1),
  new Corr2(0.233, 1, 1, 0, -3),
  new Corr2(-0.122, 1, -1, 0, 1),
  new Corr2(-0.276, 1, -1, 0, -3),
  new Corr2(0.255, 0, 0, 2, 1),
  new Corr2(0.254, 0, 0, 2, -3),
  new Corr2(-0.1, 3, 1, 0, -4),
  new Corr2(-0.183, 3, -1, 0, -2),
  new Corr2(-0.297, 2, 2, 0, -2),
  new Corr2(-0.161, 2, 2, 0, -4),
  new Corr2(0.197, 2, -2, 0, 0),
  new Corr2(0.254, 2, -2, 0, -2),
  new Corr2(-0.25, 1, 3, 0, -2),
  new Corr2(-0.123, 2, 0, 2, 2),
  new Corr2(0.173, 2, 0, -2, -4),
  new Corr2(0.263, 1, 1, 2, 0),
  new Corr2(0.13, 3, 0, 0, -1),
  new Corr2(0.113, 5, 0, 0, 0),
  new Corr2(0.092, 3, 0, 2, -2),
];
