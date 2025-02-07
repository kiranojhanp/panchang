/**
 * Conversion factor: degrees to radians.
 * @constant {number}
 */
export const DEGREE_TO_RADIAN = Math.PI / 180;

/**
 * Conversion factor: radians to degrees.
 * @constant {number}
 */
export const RADIAN_TO_DEGREE = 180 / Math.PI;

/**
 * Names of the 12 zodiac signs.
 * @constant {string[]}
 */
export const RASHIS: string[] = [
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

/**
 * Names of the weekdays.
 * @constant {string[]}
 */
export const WEEKDAYS: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Names of the 27 nakshatras.
 * @constant {string[]}
 */
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

/**
 * Names of the tithis (lunar days).
 * @constant {string[]}
 */
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

/**
 * Names of the karanas (half-tithis).
 * @constant {string[]}
 */
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

/**
 * Names of the yogas (a derived lunar-solar measure).
 * @constant {string[]}
 */
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

/**
 * Correction data for the Moon’s ecliptic longitude.
 * Each entry is an array of five numbers representing
 * [mlcor, mscor, fcor, dcor, lcor] (coefficients and amplitude).
 * @constant {Array.<[number, number, number, number, number]>}
 */
export const corrMoonData: [number, number, number, number, number][] = [
  [0, 0, 0, 4, 13.902],
  [0, 0, 0, 2, 2369.912],
  [1, 0, 0, 4, 1.979],
  [1, 0, 0, 2, 191.953],
  [1, 0, 0, 0, 22639.5],
  [1, 0, 0, -2, -4586.465],
  [1, 0, 0, -4, -38.428],
  [1, 0, 0, -6, -0.393],
  [0, 1, 0, 4, -0.289],
  [0, 1, 0, 2, -24.42],
  [0, 1, 0, 0, -668.146],
  [0, 1, 0, -2, -165.145],
  [0, 1, 0, -4, -1.877],
  [0, 0, 0, 3, 0.403],
  [0, 0, 0, 1, -125.154],
  [2, 0, 0, 4, 0.213],
  [2, 0, 0, 2, 14.387],
  [2, 0, 0, 0, 769.016],
  [2, 0, 0, -2, -211.656],
  [2, 0, 0, -4, -30.773],
  [2, 0, 0, -6, -0.57],
  [1, 1, 0, 2, -2.921],
  [1, 1, 0, 0, -109.673],
  [1, 1, 0, -2, -205.962],
  [1, 1, 0, -4, -4.391],
  [1, -1, 0, 4, 0.283],
  [1, -1, 0, 2, 14.577],
  [1, -1, 0, 0, 147.687],
  [1, -1, 0, -2, 28.475],
  [1, -1, 0, -4, 0.636],
  [0, 2, 0, 2, -0.189],
  [0, 2, 0, 0, -7.486],
  [0, 2, 0, -2, -8.096],
  [0, 0, 2, 2, -5.741],
  [0, 0, 2, 0, -411.608],
  [0, 0, 2, -2, -55.173],
  [0, 0, 2, -4, 0.025],
  [1, 0, 0, 1, -8.466],
  [1, 0, 0, -1, 18.609],
  [1, 0, 0, -3, 3.215],
  [0, 1, 0, 1, 18.023],
  [0, 1, 0, -1, 0.56],
  [3, 0, 0, 2, 1.06],
  [3, 0, 0, 0, 36.124],
  [3, 0, 0, -2, -13.193],
  [3, 0, 0, -4, -1.187],
  [3, 0, 0, -6, -0.293],
  [2, 1, 0, 2, -0.29],
  [2, 1, 0, 0, -7.649],
  [2, 1, 0, -2, -8.627],
  [2, 1, 0, -4, -2.74],
  [2, -1, 0, 2, 1.181],
  [2, -1, 0, 0, 9.703],
  [2, -1, 0, -2, -2.494],
  [2, -1, 0, -4, 0.36],
  [1, 2, 0, 0, -1.167],
  [1, 2, 0, -2, -7.412],
  [1, 2, 0, -4, -0.311],
  [1, -2, 0, 2, 0.757],
  [1, -2, 0, 0, 2.58],
  [1, -2, 0, -2, 2.533],
  [0, 3, 0, -2, -0.344],
  [1, 0, 2, 2, -0.992],
  [1, 0, 2, 0, -45.099],
  [1, 0, 2, -2, -0.179],
  [1, 0, -2, 2, -6.382],
  [1, 0, -2, 0, 39.528],
  [1, 0, -2, -2, 9.366],
  [0, 1, 2, 0, 0.415],
  [0, 1, 2, -2, -2.152],
  [0, 1, -2, 2, -1.44],
  [0, 1, -2, -2, 0.384],
  [2, 0, 0, 1, -0.586],
  [2, 0, 0, -1, 1.75],
  [2, 0, 0, -3, 1.225],
  [1, 1, 0, 1, 1.267],
  [1, -1, 0, -1, -1.089],
  [0, 0, 2, -1, 0.584],
  [4, 0, 0, 0, 1.938],
  [4, 0, 0, -2, -0.952],
  [3, 1, 0, 0, -0.551],
  [3, 1, 0, -2, -0.482],
  [3, -1, 0, 0, 0.681],
  [2, 0, 2, 0, -3.996],
  [2, 0, 2, -2, 0.557],
  [2, 0, -2, 2, -0.459],
  [2, 0, -2, 0, -1.298],
  [2, 0, -2, -2, 0.538],
  [1, 1, -2, -2, 0.426],
  [1, -1, 2, 0, -0.304],
  [1, -1, -2, 2, -0.372],
  [0, 0, 4, 0, 0.418],
  [2, -1, 0, -1, -0.352],
];

/**
 * Correction data (additional terms) for the Moon’s position.
 * Each entry is an array of five numbers: [l, ml, ms, f, d].
 * @constant {Array.<[number, number, number, number, number]>}
 */
export const corrMoon2Data: [number, number, number, number, number][] = [
  [0.127, 0, 0, 0, 6],
  [-0.151, 0, 2, 0, -4],
  [-0.085, 0, 0, 2, 4],
  [0.15, 0, 1, 0, 3],
  [-0.091, 2, 1, 0, -6],
  [-0.103, 0, 3, 0, 0],
  [-0.301, 1, 0, 2, -4],
  [0.202, 1, 0, -2, -4],
  [0.137, 1, 1, 0, -1],
  [0.233, 1, 1, 0, -3],
  [-0.122, 1, -1, 0, 1],
  [-0.276, 1, -1, 0, -3],
  [0.255, 0, 0, 2, 1],
  [0.254, 0, 0, 2, -3],
  [-0.1, 3, 1, 0, -4],
  [-0.183, 3, -1, 0, -2],
  [-0.297, 2, 2, 0, -2],
  [-0.161, 2, 2, 0, -4],
  [0.197, 2, -2, 0, 0],
  [0.254, 2, -2, 0, -2],
  [-0.25, 1, 3, 0, -2],
  [-0.123, 2, 0, 2, 2],
  [0.173, 2, 0, -2, -4],
  [0.263, 1, 1, 2, 0],
  [0.13, 3, 0, 0, -1],
  [0.113, 5, 0, 0, 0],
  [0.092, 3, 0, 2, -2],
];
