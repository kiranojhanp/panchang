/**
 * Panchang Calculator Code with Detailed Comments and Descriptive Variable Names
 *
 * This code calculates various elements of the Indian Panchang (calendar)
 * such as tithi, nakshatra, karana, yoga, and raasi based on both traditional
 * Vedic and modern astronomical methods.
 *
 * Note: This code expects certain constants (conversion factors and arrays)
 * to be defined and exported from the "./constants" module.
 */

import {
  DEG_TO_RAD, // Conversion factor: π/180 (radians per degree)
  RAD_TO_DEG, // Conversion factor: 180/π (degrees per radian)
  WEEKDAYS, // Array of weekday names (e.g., Sunday, Monday, …)
  ZODIAC_SIGNS, // Array of zodiac sign names (12 signs)
  NAKSHATRAS, // Array of 27 nakshatra names (lunar mansions)
  TITHIS, // Array of 30 tithi names (lunar days)
  KARANAS, // Array of 11 unique karana names (half-tithis)
  YOGAS, // Array of 27 yoga names
  CORR_MOON, // Array of correction objects for the Moon’s motion (first set)
  CORR_MOON2, // Array of secondary correction objects for the Moon’s motion
} from "./constants";
import type { CalculationContext, PanchangResult, TimeSegment } from "./types";

/**
 * Fixes an angle to be within the range [0, 360) degrees.
 * @param angle - Angle in degrees.
 * @returns The normalized angle.
 */
function normalizeAngle(angle: number): number {
  // Add or subtract full circles (360°) until the angle is in [0,360).
  while (angle < 0) angle += 360; // Add 360° until angle is positive.
  while (angle >= 360) angle -= 360; // Subtract 360° until angle is less than 360.
  return angle;
}

/**
 * Computes the day of the week for a given Julian date.
 * @param julianDate - Julian date.
 * @returns Weekday index (0 = Sunday, …, 6 = Saturday).
 */
function getWeekdayIndex(julianDate: number): number {
  // Convert the Julian date to a day starting at noon.
  const jdNoon = Math.floor(julianDate) + 0.5; // Julian days start at noon.
  const adjustedJD = julianDate < jdNoon ? jdNoon - 1 : jdNoon;
  const weekdayJD = adjustedJD + 1.5; // Adjustment to align with weekday indexing.
  const fullWeeks = Math.floor(weekdayJD / 7) * 7; // Remove complete weeks.
  return Math.floor(weekdayJD - fullWeeks);
}

/**
 * Converts a Gregorian date to a Julian date.
 * @param month - Month (1-indexed).
 * @param day - Day (can include a fractional part).
 * @param year - Year.
 * @returns Julian date.
 */
export function convertMdyToJulian(
  month: number,
  day: number,
  year: number
): number {
  // The formula converts a Gregorian date to a Julian Day.
  const intermediateValue = 12 * (year + 4800) + month - 3;
  let julianDay =
    (2 * (intermediateValue - Math.floor(intermediateValue / 12) * 12) +
      7 +
      365 * intermediateValue) /
    12;
  julianDay =
    Math.floor(julianDay) + day + Math.floor(intermediateValue / 48) - 32083;
  // Apply additional corrections for dates after the Gregorian reform.
  if (julianDay > 2299171) {
    julianDay +=
      Math.floor(intermediateValue / 4800) -
      Math.floor(intermediateValue / 1200) +
      38;
  }
  // Subtract 0.5 so that the day starts at midnight.
  return julianDay - 0.5;
}

/**
 * Computes delta-T (in hours) for a given Julian date.
 * Delta-T is the difference between Terrestrial Time (TT) and Universal Time (UT).
 * @param julianDate - Julian date.
 * @returns Delta-T in hours.
 */
export function computeDeltaT(julianDate: number): number {
  // Empirical delta-T values (in seconds) for decades between 1620 and 2010.
  const deltaTEmpiricalValues: number[] = [
    124, 85, 62, 48, 37, 26, 16, 10, 9, 10, 11, 11, 12, 13, 15, 16, 17, 17,
    13.7, 12.5, 12, 7.5, 5.7, 7.1, 7.9, 1.6, -5.4, -5.9, -2.7, 10.5, 21.2, 24,
    24.3, 29.2, 33.2, 40.2, 50.5, 56.9, 65.7, 75.5,
  ];
  // Convert the Julian date to a standard calendar Date.
  const calendarDate = convertJulianToDate(julianDate);
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth() + 1; // JavaScript months are 0-indexed.
  const day = calendarDate.getDate();
  // Compute a decimal (fractional) year.
  const decimalYear = year + (month - 1) / 12 + (day - 1) / 365.25;
  // Compute elapsed time in Julian centuries from the base epoch (JD 2378497).
  const julianCenturies = (julianDate - 2378497) / 36525;
  let deltaTSeconds: number;
  if (decimalYear >= 1620 && decimalYear < 2010) {
    // For dates between 1620 and 2010, interpolate from the empirical values.
    const decadeIndex = Math.floor((decimalYear - 1620) / 10);
    const decadeFraction = decimalYear - (1620 + decadeIndex * 10);
    deltaTSeconds =
      deltaTEmpiricalValues[decadeIndex] +
      ((deltaTEmpiricalValues[decadeIndex + 1] -
        deltaTEmpiricalValues[decadeIndex]) *
        decadeFraction) /
        10;
  } else {
    if (decimalYear >= 2010) {
      // For dates after 2010, use a quadratic regression:
      // deltaT = 25.5 * t^2 - 39, with t in Julian centuries.
      deltaTSeconds = 25.5 * julianCenturies * julianCenturies - 39;
    } else if (decimalYear >= 948 && decimalYear < 1620) {
      // For dates between 948 and 1620, use a simpler quadratic.
      deltaTSeconds = 25.5 * julianCenturies * julianCenturies;
    } else {
      // For dates earlier than 948, use a more complex quadratic formula.
      deltaTSeconds =
        1361.7 +
        320 * julianCenturies +
        44.3 * julianCenturies * julianCenturies;
    }
  }
  // Convert from seconds to hours (3600 seconds = 1 hour).
  return deltaTSeconds / 3600;
}

/**
 * Converts a Julian date to a JavaScript Date.
 * @param julianDate - Julian date.
 * @returns JavaScript Date object.
 */
export function convertJulianToDate(julianDate: number): Date {
  // Shift the Julian date by 0.5 to align with the astronomical day starting at noon.
  const adjustedJD = julianDate + 0.5;
  const integerJD = Math.floor(adjustedJD);
  const fractionalDay = adjustedJD - integerJD;
  let aValue: number;
  if (integerJD < 2299161) {
    // Use the Julian calendar before the Gregorian reform.
    aValue = integerJD;
  } else {
    // Apply Gregorian calendar correction.
    const alpha = Math.floor((integerJD - 1867216.25) / 36524.25);
    aValue = integerJD + 1 + alpha - Math.floor(alpha / 4);
  }
  const bValue = aValue + 1524;
  const cValue = Math.floor((bValue - 122.1) / 365.25);
  const dValue = Math.floor(365.25 * cValue);
  const eValue = Math.floor((bValue - dValue) / 30.6001);
  const totalDays =
    bValue - dValue - Math.floor(30.6001 * eValue) + fractionalDay;
  const dayOfMonth = Math.floor(totalDays);
  const month = eValue < 13.5 ? eValue - 1 : eValue - 13;
  const year = month > 2.5 ? cValue - 4716 : cValue - 4715;
  const hourDecimal = (totalDays - dayOfMonth) * 24;
  const hours = Math.floor(hourDecimal);
  const minuteDecimal = (hourDecimal - hours) * 60;
  const minutes = Math.floor(minuteDecimal);
  const seconds = Math.floor((minuteDecimal - minutes) * 60);
  return new Date(year, month - 1, dayOfMonth, hours, minutes, seconds, 0);
}

/**
 * Converts a longitude value (in degrees) to a formatted D M'S" string.
 * @param longitude - Longitude in degrees.
 * @returns A string in the format "D M'S"".
 */
function longitudeToDMS(longitude: number): string {
  const absLongitude = Math.abs(longitude);
  const degrees = Math.floor(absLongitude);
  // Convert the fractional degree to total seconds.
  const totalSeconds = Math.round((absLongitude - degrees) * 3600);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${degrees} ${minutes}'${seconds}"`;
}

/**
 * Solves Kepler's equation iteratively to obtain the eccentric anomaly.
 * @param meanAnomaly - Mean anomaly in radians.
 * @param eccentricity - Orbital eccentricity.
 * @param toleranceDegrees - Tolerance in degrees (converted to radians).
 * @returns Eccentric anomaly in radians.
 */
function solveKepler(
  meanAnomaly: number,
  eccentricity: number,
  toleranceDegrees: number
): number {
  meanAnomaly *= DEG_TO_RAD; // Convert mean anomaly to radians.
  let eccentricAnomaly = meanAnomaly; // Initial guess: eccentric anomaly ≈ mean anomaly.
  toleranceDegrees *= DEG_TO_RAD; // Convert tolerance to radians.
  let delta = 1;
  while (Math.abs(delta) >= toleranceDegrees) {
    // Newton-Raphson iteration:
    // delta = (M + e*sin(E) - E) / (1 - e*cos(E))
    delta =
      (meanAnomaly +
        eccentricity * Math.sin(eccentricAnomaly) -
        eccentricAnomaly) /
      (1 - eccentricity * Math.cos(eccentricAnomaly));
    eccentricAnomaly += delta;
  }
  return eccentricAnomaly;
}

/**
 * Computes the nutation in longitude (in degrees) for a given Julian date.
 * Nutation is the small oscillation in Earth's rotation axis.
 * @param julianDate - Julian date.
 * @returns Nutation (in degrees).
 */
function computeNutation(julianDate: number): number {
  // Time in Julian centuries from JD 2415020.
  const julianCenturies = (julianDate - 2415020) / 36525;
  const tSquared = julianCenturies * julianCenturies;
  // Mean solar longitude (ls) in degrees.
  let meanSolarLongitude =
    279.6967 + 36000.7689 * julianCenturies + 0.000303 * tSquared;
  // Mean lunar longitude (l) in degrees.
  let meanLunarLongitude =
    270.4341639 + 481267.8831417 * julianCenturies - 0.0011333333 * tSquared;
  // Solar mean anomaly (ms) in degrees.
  let solarAnomaly =
    358.4758333333334 + 35999.04975 * julianCenturies - 1.5e-4 * tSquared;
  // Lunar mean anomaly (ml) in degrees.
  let lunarAnomaly =
    296.1046083333757 +
    477198.8491083336 * julianCenturies +
    0.0091916667090522 * tSquared;
  // Mean elongation of the Moon (d) in degrees.
  const meanElongation =
    350.7374861110581 +
    445267.1142166667 * julianCenturies -
    1.436111132303874e-3 * tSquared;
  // Mean longitude of the ascending node (om) in degrees.
  let ascendingNodeLongitude =
    259.1832750002543 -
    1934.142008333206 * julianCenturies +
    0.0020777778 * tSquared;
  // Convert necessary angles to radians.
  meanSolarLongitude *= DEG_TO_RAD;
  meanLunarLongitude *= DEG_TO_RAD;
  solarAnomaly *= DEG_TO_RAD;
  lunarAnomaly *= DEG_TO_RAD;
  const elongationRad = meanElongation * DEG_TO_RAD;
  // Note: The following two variables are computed as the squares of the angles.
  // (They appear in the series expansion as provided by the original algorithm.)
  const lunarLongitudeSquared = meanLunarLongitude * meanLunarLongitude;
  const solarLongitudeSquared = meanSolarLongitude * meanSolarLongitude;

  // Series expansion for nutation (coefficients are in arcseconds).
  let nutationArcsec =
    (-17.2327 - 0.01737 * julianCenturies) *
    Math.sin(ascendingNodeLongitude * DEG_TO_RAD);
  nutationArcsec += 0.2088 * Math.sin(2 * ascendingNodeLongitude * DEG_TO_RAD);
  nutationArcsec += 0.0675 * Math.sin(lunarAnomaly * DEG_TO_RAD);
  nutationArcsec -=
    0.0149 * Math.sin((lunarAnomaly - elongationRad) * DEG_TO_RAD);
  nutationArcsec -=
    0.0342 *
    Math.sin((lunarLongitudeSquared - ascendingNodeLongitude) * DEG_TO_RAD);
  nutationArcsec +=
    0.0114 * Math.sin((lunarLongitudeSquared - lunarAnomaly) * DEG_TO_RAD);
  nutationArcsec -= 0.2037 * Math.sin(lunarLongitudeSquared * DEG_TO_RAD);
  nutationArcsec -=
    0.0261 * Math.sin((lunarLongitudeSquared + lunarAnomaly) * DEG_TO_RAD);
  nutationArcsec +=
    0.0124 *
    Math.sin((solarLongitudeSquared - ascendingNodeLongitude) * DEG_TO_RAD);
  nutationArcsec +=
    0.0214 * Math.sin((solarLongitudeSquared - solarAnomaly) * DEG_TO_RAD);
  nutationArcsec -= 1.2729 * Math.sin(solarLongitudeSquared * DEG_TO_RAD);
  nutationArcsec -=
    0.0497 * Math.sin((solarLongitudeSquared + solarAnomaly) * DEG_TO_RAD);
  nutationArcsec += 0.1261 * Math.sin(solarAnomaly * DEG_TO_RAD);
  // Convert from arcseconds to degrees (3600 arcseconds = 1°).
  return nutationArcsec / 3600;
}

/**
 * Calculates the ayanamsa (in degrees) for the given Julian date.
 * Ayanamsa is the difference between the tropical (seasonal) and sidereal (fixed-star) zodiacs.
 * @param julianDate - Julian date.
 * @returns Ayanamsa in degrees.
 */
export function calculateAyanamsa(julianDate: number): number {
  // Time in Julian centuries from JD 2415020.
  const julianCenturies = (julianDate - 2415020) / 36525;
  // Calculate the longitude of the Moon's ascending node (om) with polynomial corrections.
  const ascendingNode =
    259.183275 -
    1934.142008333206 * julianCenturies +
    0.0020777778 * julianCenturies * julianCenturies +
    0.0000022222222 * julianCenturies * julianCenturies * julianCenturies;
  // Mean solar longitude (ls) with a quadratic correction.
  const meanSolarLongitude =
    279.696678 +
    36000.76892 * julianCenturies +
    0.0003025 * julianCenturies * julianCenturies;
  // Ayanamsa formula with sine corrections and a secular term.
  const ayanamsaArcsec =
    17.23 * Math.sin(ascendingNode * DEG_TO_RAD) +
    1.27 * Math.sin(2 * meanSolarLongitude * DEG_TO_RAD) -
    (5025.64 + 1.11 * julianCenturies) * julianCenturies;
  // Adjust and convert from arcseconds to degrees.
  return (ayanamsaArcsec - 80861.27) / 3600;
}

/**
 * Computes the Julian date of the most recent new moon (novolun) near the given date.
 * @param julianDate - Current Julian date.
 * @param lunationCount - Lunation cycle count (number of synodic months since a base epoch).
 * @returns Julian date of the new moon.
 */
export function computeNewMoonJulian(
  julianDate: number,
  lunationCount: number
): number {
  const julianCenturies = (julianDate - 2415020) / 36525;
  const tSquared = julianCenturies * julianCenturies;
  const tCubed = julianCenturies * julianCenturies * julianCenturies;
  // Base new moon time in Julian days:
  // 2415020.75933: Base epoch for a known new moon.
  // 29.53058868: Mean length of a synodic month (days).
  let newMoonJD =
    2415020.75933 +
    29.53058868 * lunationCount +
    0.0001178 * tSquared -
    0.000000155 * tCubed;
  // Additional periodic correction (in days).
  newMoonJD +=
    0.00033 *
    Math.sin(
      (166.56 + 132.87 * julianCenturies - 0.009173 * tSquared) * DEG_TO_RAD
    );
  // Compute anomalies for correction terms.
  let meanAnomaly =
    359.2242 +
    29.10535608 * lunationCount -
    0.0000333 * tSquared -
    0.00000347 * tCubed;
  let meanLunarAnomaly =
    306.0253 +
    385.81691806 * lunationCount +
    0.0107306 * tSquared +
    0.00001236 * tCubed;
  let argumentOfLatitude =
    21.2964 +
    390.67050646 * lunationCount -
    0.0016528 * tSquared -
    0.00000239 * tCubed;
  // Convert angles from degrees to radians.
  meanAnomaly *= DEG_TO_RAD;
  meanLunarAnomaly *= DEG_TO_RAD;
  argumentOfLatitude *= DEG_TO_RAD;
  // Accumulate periodic corrections (in days).
  let deltaJD = (0.1734 - 0.000393 * julianCenturies) * Math.sin(meanAnomaly);
  deltaJD += 0.0021 * Math.sin(2 * meanAnomaly);
  deltaJD -= 0.4068 * Math.sin(meanLunarAnomaly);
  deltaJD += 0.0161 * Math.sin(2 * meanLunarAnomaly);
  deltaJD -= 0.0004 * Math.sin(3 * meanLunarAnomaly);
  deltaJD += 0.0104 * Math.sin(2 * argumentOfLatitude);
  deltaJD -= 0.0051 * Math.sin(meanAnomaly + meanLunarAnomaly);
  deltaJD -= 0.0074 * Math.sin(meanAnomaly - meanLunarAnomaly);
  deltaJD += 0.0004 * Math.sin(2 * argumentOfLatitude + meanAnomaly);
  deltaJD -= 0.0004 * Math.sin(2 * argumentOfLatitude - meanAnomaly);
  deltaJD -= 0.0006 * Math.sin(2 * argumentOfLatitude + meanLunarAnomaly);
  deltaJD += 0.001 * Math.sin(2 * argumentOfLatitude - meanLunarAnomaly);
  deltaJD += 0.0005 * Math.sin(meanAnomaly + 2 * meanLunarAnomaly);
  return newMoonJD + deltaJD;
}

/**
 * Computes the Moon's longitude (in degrees) for the given Julian date.
 * Also updates the provided calculation context with moonLongitudeForYoga and moonAngularVelocity.
 * @param julianDate - Julian date.
 * @param calcContext - Calculation context for storing intermediate values.
 * @returns Normalized Moon's longitude in degrees.
 */
export function computeMoonLongitude(
  julianDate: number,
  calcContext: CalculationContext
): number {
  // Compute days since the base epoch JD 2415020.
  const daysSinceEpoch = julianDate - 2415020;
  // Compute time in Julian centuries from the base epoch.
  const julianCenturies = daysSinceEpoch / 36525;
  const tSquared = julianCenturies * julianCenturies;
  const tCubed = julianCenturies * julianCenturies * julianCenturies;

  // Obliquity of the ecliptic (Earth’s axial tilt) with corrections (in degrees).
  const obliquity =
    23.452294 -
    0.0130125 * julianCenturies -
    0.00000164 * tSquared +
    0.000000503 * tCubed;
  // Moon's mean longitude (in degrees).
  // 270.4337361: Base longitude at epoch.
  // 13.176396544528099: Approximate daily motion of the Moon (° per day).
  let moonMeanLongitude =
    270.4337361 +
    13.176396544528099 * daysSinceEpoch -
    (5.86 * tSquared) / 3600 +
    (0.0068 * tCubed) / 3600;
  // Mean elongation of the Moon (in degrees).
  const meanElongation =
    350.7374861110581 +
    445267.1142166667 * julianCenturies -
    1.436111132303874e-3 * tSquared +
    0.0000018888889 * tCubed;
  // Correction for the lunar perigee (in degrees).
  const perigeeCorrection =
    334.329556 +
    (14648522.52 * julianCenturies) / 3600 -
    (37.17 * tSquared) / 3600 -
    (0.045 * tCubed) / 3600;
  // Moon's mean anomaly (in degrees).
  const moonMeanAnomaly =
    358.4758333333334 +
    35999.04975 * julianCenturies -
    1.500000059604645e-4 * tSquared -
    3.3333333623078e-6 * tCubed;
  // Lunar anomaly relative to perigee (in degrees).
  let lunarAnomalyRelative = normalizeAngle(
    moonMeanLongitude - perigeeCorrection
  );
  // Longitude of the Moon's ascending node (in degrees).
  const ascendingNode =
    259.183275 -
    (6962911.23 * julianCenturies) / 3600 +
    (7.48 * tSquared) / 3600 +
    (0.008 * tCubed) / 3600;
  // Argument of latitude of the Moon.
  let argumentLatitude = normalizeAngle(moonMeanLongitude - ascendingNode);

  // --- Periodic Corrections ---
  // The following applies empirical periodic corrections to refine the Moon's position.
  const fullCircleRadians = 360.0 * DEG_TO_RAD; // 360° in radians.
  const tinyFactor = daysSinceEpoch * 1e-12; // Very small correction factor.
  const tinyFactorSquared = daysSinceEpoch * daysSinceEpoch * 1e-16; // Even smaller factor.

  const angleTerm1 = Math.sin(
    fullCircleRadians *
      (0.53733431 - 10104982 * tinyFactor + 191 * tinyFactorSquared)
  );
  const angleTerm2 = Math.sin(
    fullCircleRadians *
      (0.71995354 - 147094228 * tinyFactor + 43 * tinyFactorSquared)
  );
  const cosTerm2 = Math.cos(
    fullCircleRadians *
      (0.71995354 - 147094228 * tinyFactor + 43 * tinyFactorSquared)
  );
  const angleTerm3 = Math.sin(
    fullCircleRadians * (0.14222222 + 1536238 * tinyFactor)
  );
  const angleTerm4 = Math.sin(
    fullCircleRadians *
      (0.48398132 - 147269147 * tinyFactor + 43 * tinyFactorSquared)
  );
  const cosTerm4 = Math.cos(
    fullCircleRadians *
      (0.48398132 - 147269147 * tinyFactor + 43 * tinyFactorSquared)
  );
  const angleTerm5 = Math.sin(
    fullCircleRadians *
      (0.52453688 - 147162675 * tinyFactor + 43 * tinyFactorSquared)
  );
  const angleTerm6 = Math.sin(
    fullCircleRadians * (0.84536324 - 11459387 * tinyFactor)
  );
  const angleTerm7 = Math.sin(
    fullCircleRadians *
      (0.23363774 + 1232723 * tinyFactor + 191 * tinyFactorSquared)
  );
  const angleTerm8 = Math.sin(
    fullCircleRadians * (0.5875 + 9050118 * tinyFactor)
  );
  const angleTerm9 = Math.sin(
    fullCircleRadians * (0.61043085 - 67718733 * tinyFactor)
  );

  // Corrections to the Moon’s longitude (in arcseconds unless noted):
  const deltaMoonLongitude =
    0.84 * angleTerm3 +
    0.31 * angleTerm7 +
    14.27 * angleTerm1 +
    7.261 * angleTerm2 +
    0.282 * angleTerm4 +
    0.237 * angleTerm6;
  const deltaPerigee =
    -2.1 * angleTerm3 -
    2.076 * angleTerm2 -
    0.84 * angleTerm4 -
    0.593 * angleTerm6;
  const deltaK =
    0.63 * angleTerm3 +
    95.96 * angleTerm2 +
    15.58 * angleTerm4 +
    1.86 * angleTerm5;
  const deltaSolar =
    -6.4 * angleTerm3 -
    0.27 * angleTerm8 -
    1.89 * angleTerm6 +
    0.2 * angleTerm9;
  let gravityCorrectionFactor =
    (-4.318 * cosTerm2 - 0.698 * cosTerm4) / (3600.0 * 360.0);
  gravityCorrectionFactor = 1.000002708 + 139.978 * gravityCorrectionFactor;

  // Update the lunar anomaly with periodic corrections (convert arcseconds to degrees by dividing by 3600).
  lunarAnomalyRelative =
    DEG_TO_RAD *
    (lunarAnomalyRelative + (deltaMoonLongitude - deltaPerigee) / 3600.0);
  const correctedMoonAnomaly =
    DEG_TO_RAD * (moonMeanAnomaly + deltaSolar / 3600.0);
  argumentLatitude =
    DEG_TO_RAD * (argumentLatitude + (deltaMoonLongitude - deltaK) / 3600.0);
  const correctedElongation =
    DEG_TO_RAD * (meanElongation + (deltaMoonLongitude - deltaSolar) / 3600.0);

  // Sum periodic corrections from the first set (CORR_MOON array).
  let cumulativeCorrection1 = 0;
  const correctionFactor1 = 1.0 - 6.832e-8 * daysSinceEpoch; // Nearly 1; a very small adjustment.
  const correctionFactor2 = gravityCorrectionFactor * gravityCorrectionFactor;
  for (let i = 0; i < CORR_MOON.length; i++) {
    const corr = CORR_MOON[i];
    const argument =
      corr.mlcor * lunarAnomalyRelative +
      corr.mscor * correctedMoonAnomaly +
      corr.fcor * argumentLatitude +
      corr.dcor * correctedElongation;
    let sinArgument = Math.sin(argument);
    if (corr.mscor !== 0) {
      sinArgument *= correctionFactor1;
      if (Math.abs(corr.mscor) === 2) sinArgument *= correctionFactor1;
    }
    if (corr.fcor !== 0) sinArgument *= correctionFactor2;
    cumulativeCorrection1 += corr.lcor * sinArgument;
  }
  let cumulativeCorrection2 = 0;
  for (let i = 0; i < CORR_MOON2.length; i++) {
    const corr2 = CORR_MOON2[i];
    const argument =
      corr2.ml * lunarAnomalyRelative +
      corr2.ms * correctedMoonAnomaly +
      corr2.f * argumentLatitude +
      corr2.d * correctedElongation;
    cumulativeCorrection2 += corr2.l * Math.sin(argument);
  }

  // Additional planetary perturbations (empirical corrections).
  let planetaryPerturbation =
    0.822 *
    Math.sin(fullCircleRadians * (0.3248 - 0.0017125594 * daysSinceEpoch));
  planetaryPerturbation +=
    0.307 *
    Math.sin(fullCircleRadians * (0.14905 - 0.0034251187 * daysSinceEpoch));
  planetaryPerturbation +=
    0.348 *
    Math.sin(fullCircleRadians * (0.68266 - 0.0006873156 * daysSinceEpoch));
  planetaryPerturbation +=
    0.662 *
    Math.sin(fullCircleRadians * (0.65162 + 0.0365724168 * daysSinceEpoch));
  planetaryPerturbation +=
    0.643 *
    Math.sin(fullCircleRadians * (0.88098 - 0.0025069941 * daysSinceEpoch));
  planetaryPerturbation +=
    1.137 *
    Math.sin(fullCircleRadians * (0.85823 + 0.036448727 * daysSinceEpoch));
  planetaryPerturbation +=
    0.436 *
    Math.sin(fullCircleRadians * (0.71892 + 0.036217918 * daysSinceEpoch));
  planetaryPerturbation +=
    0.327 *
    Math.sin(fullCircleRadians * (0.97639 + 0.000173491 * daysSinceEpoch));

  // Incorporate nutation and sum all corrections (converted from arcseconds to degrees).
  moonMeanLongitude =
    moonMeanLongitude +
    computeNutation(julianDate) +
    (deltaMoonLongitude +
      cumulativeCorrection1 +
      cumulativeCorrection2 +
      planetaryPerturbation) /
      3600.0;
  // Store the unnormalized Moon longitude in the calculation context for later yoga computation.
  calcContext.moonLongitudeForYoga = moonMeanLongitude;
  // Normalize the Moon's longitude to [0, 360).
  const normalizedMoonLongitude = normalizeAngle(moonMeanLongitude);

  // Compute the Moon's angular velocity using a series of cosine terms.
  let moonAngularVelocity = 13.176397; // Mean daily motion in degrees.
  moonAngularVelocity += 1.434006 * Math.cos(lunarAnomalyRelative);
  moonAngularVelocity += 0.280135 * Math.cos(2 * correctedElongation);
  moonAngularVelocity +=
    0.251632 * Math.cos(2 * correctedElongation - lunarAnomalyRelative);
  moonAngularVelocity += 0.09742 * Math.cos(2 * lunarAnomalyRelative);
  moonAngularVelocity -= 0.052799 * Math.cos(2 * argumentLatitude);
  moonAngularVelocity +=
    0.034848 * Math.cos(2 * correctedElongation + lunarAnomalyRelative);
  moonAngularVelocity +=
    0.018732 * Math.cos(2 * correctedElongation - correctedMoonAnomaly);
  moonAngularVelocity +=
    0.010316 *
    Math.cos(
      2 * correctedElongation - correctedMoonAnomaly - lunarAnomalyRelative
    );
  moonAngularVelocity +=
    0.008649 * Math.cos(correctedMoonAnomaly - lunarAnomalyRelative);
  moonAngularVelocity -=
    0.008642 * Math.cos(2 * argumentLatitude + lunarAnomalyRelative);
  moonAngularVelocity -=
    0.007471 * Math.cos(correctedMoonAnomaly + lunarAnomalyRelative);
  moonAngularVelocity -= 0.007387 * Math.cos(correctedElongation);
  moonAngularVelocity += 0.006864 * Math.cos(3 * lunarAnomalyRelative);
  moonAngularVelocity +=
    0.00665 * Math.cos(4 * correctedElongation - lunarAnomalyRelative);
  moonAngularVelocity +=
    0.003523 * Math.cos(2 * correctedElongation + 2 * lunarAnomalyRelative);
  moonAngularVelocity +=
    0.003377 * Math.cos(4 * correctedElongation - 2 * lunarAnomalyRelative);
  moonAngularVelocity += 0.003287 * Math.cos(4 * correctedElongation);
  moonAngularVelocity -= 0.003193 * Math.cos(correctedMoonAnomaly);
  moonAngularVelocity -=
    0.003003 * Math.cos(2 * correctedElongation + correctedMoonAnomaly);
  moonAngularVelocity +=
    0.002577 *
    Math.cos(
      lunarAnomalyRelative - correctedMoonAnomaly + 2 * correctedElongation
    );
  moonAngularVelocity -=
    0.002567 * Math.cos(2 * argumentLatitude - lunarAnomalyRelative);
  moonAngularVelocity -=
    0.001794 * Math.cos(2 * correctedElongation - 2 * lunarAnomalyRelative);
  moonAngularVelocity -=
    0.001716 *
    Math.cos(
      lunarAnomalyRelative - 2 * argumentLatitude - 2 * correctedElongation
    );
  moonAngularVelocity -=
    0.001698 *
    Math.cos(
      2 * correctedElongation + correctedMoonAnomaly - lunarAnomalyRelative
    );
  moonAngularVelocity -=
    0.001415 * Math.cos(2 * correctedElongation + 2 * argumentLatitude);
  moonAngularVelocity +=
    0.001183 * Math.cos(2 * lunarAnomalyRelative - correctedMoonAnomaly);
  moonAngularVelocity +=
    0.00115 * Math.cos(correctedElongation + correctedMoonAnomaly);
  moonAngularVelocity -=
    0.001035 * Math.cos(correctedElongation + lunarAnomalyRelative);
  moonAngularVelocity -=
    0.001019 * Math.cos(2 * argumentLatitude + 2 * lunarAnomalyRelative);
  moonAngularVelocity -=
    0.001006 * Math.cos(correctedMoonAnomaly + 2 * lunarAnomalyRelative);
  // Store the computed angular velocity in the calculation context.
  calcContext.moonAngularVelocity = moonAngularVelocity;

  return normalizedMoonLongitude;
}

/**
 * Computes the Sun's longitude (in degrees) for the given Julian date.
 * Also updates the calculation context with sunLongitudeForYoga.
 * @param julianDate - Julian date.
 * @param calcContext - Calculation context for storing intermediate values.
 * @returns Normalized Sun's longitude in degrees.
 */
export function computeSunLongitude(
  julianDate: number,
  calcContext: CalculationContext
): number {
  const daysSinceEpoch = julianDate - 2415020; // Days since base epoch.
  const julianCenturies = daysSinceEpoch / 36525; // Julian centuries since base epoch.
  const tSquared = julianCenturies * julianCenturies;
  const tCubed = julianCenturies * julianCenturies * julianCenturies;

  // Mean solar longitude (in degrees).
  let sunMeanLongitude =
    279.696678 + 0.9856473354 * daysSinceEpoch + (1.089 * tSquared) / 3600;
  // Correction for the Sun’s perihelion (in degrees).
  const perihelionCorrection =
    101.220833 +
    (6189.03 * julianCenturies) / 3600 +
    (1.63 * tSquared) / 3600 +
    (0.012 * tCubed) / 3600;
  // Sun's mean anomaly (in degrees), adjusted by adding 180°.
  const sunMeanAnomaly = normalizeAngle(
    sunMeanLongitude - perihelionCorrection + 180
  );
  // Corrected anomaly with additional sine corrections (in degrees).
  const correctedAnomaly =
    sunMeanAnomaly +
    (0.266 * Math.sin((31.8 + 119.0 * julianCenturies) * DEG_TO_RAD) +
      6.4 * Math.sin((231.19 + 20.2 * julianCenturies) * DEG_TO_RAD) +
      (1.882 - 0.016 * julianCenturies) *
        Math.sin((57.24 + 150.27 * julianCenturies) * DEG_TO_RAD)) /
      3600;
  // Longitude of the ascending node (used for corrections).
  const nodeLongitude = 259.18 - 1934.142 * julianCenturies;
  // Earth's orbital eccentricity.
  const eccentricity =
    0.01675104 - 0.0000418 * julianCenturies - 0.000000126 * tSquared;
  // Moon's mean longitude for correction purposes.
  const moonLongitudeForCorr =
    270.4337361 +
    13.176396544528099 * daysSinceEpoch -
    (5.86 * tSquared) / 3600 +
    (0.0068 * tCubed) / 3600;
  // Moon's mean anomaly for correction purposes.
  const moonAnomalyForCorr =
    296.1046083333757 +
    477198.8491083336 * julianCenturies +
    0.0091916667090522 * tSquared +
    0.0000143888893 * tCubed;
  // An alternate variant of the Sun's mean longitude.
  const alternateSunLongitude =
    99.696678 + 0.9856473354 * daysSinceEpoch + (1.089 * tSquared) / 3600;
  // Corrected node longitude.
  const correctedNodeLongitude =
    259.183275 -
    (6962911.23 * julianCenturies) / 3600 +
    (7.48 * tSquared) / 3600 +
    (0.008 * tCubed) / 3600;

  // Solve Kepler's equation for the eccentric anomaly.
  const eccentricAnomaly = solveKepler(
    correctedAnomaly,
    eccentricity,
    0.0000003
  );
  const bFactor = Math.sqrt((1 + eccentricity) / (1 - eccentricity));
  // Compute the true anomaly.
  const trueAnomaly =
    Math.abs(Math.PI - eccentricAnomaly) < 1.0e-10
      ? eccentricAnomaly
      : 2.0 * Math.atan(bFactor * Math.tan(eccentricAnomaly / 2));
  const trueAnomalyDegrees = normalizeAngle(trueAnomaly * RAD_TO_DEG);
  // Periodic correction angles (in radians).
  const correctionAngle1 = (153.23 + 22518.7541 * julianCenturies) * DEG_TO_RAD;
  const correctionAngle2 = (216.57 + 45037.5082 * julianCenturies) * DEG_TO_RAD;
  const correctionAngle3 = (312.69 + 32964.3577 * julianCenturies) * DEG_TO_RAD;
  const correctionAngle4 =
    (350.74 + 445267.1142 * julianCenturies - 0.00144 * tSquared) * DEG_TO_RAD;
  const correctionAngle6 = (353.4 + 65928.7155 * julianCenturies) * DEG_TO_RAD;
  const correctionAngle5 = (315.6 + 893.3 * julianCenturies) * DEG_TO_RAD;
  // Compute longitude corrections.
  let longitudeCorrection =
    0.00134 * Math.cos(correctionAngle1) +
    0.00154 * Math.cos(correctionAngle2) +
    0.002 * Math.cos(correctionAngle3) +
    0.00179 * Math.sin(correctionAngle4) +
    (0.202 * Math.sin(correctionAngle5)) / 3600;
  let distanceCorrection =
    0.00000543 * Math.sin(correctionAngle1) +
    0.00001575 * Math.sin(correctionAngle2) +
    0.00001627 * Math.sin(correctionAngle3) +
    0.00003076 * Math.cos(correctionAngle4) +
    9.27e-6 * Math.sin(correctionAngle6);
  // Intermediate corrected longitude.
  const intermediateLongitude =
    sunMeanLongitude +
    longitudeCorrection +
    trueAnomalyDegrees -
    sunMeanAnomaly;
  // Compute orbital radius.
  const orbitalRadius =
    (1.0000002 * (1 - eccentricity * eccentricity)) /
    (1 + eccentricity * Math.cos(trueAnomaly * DEG_TO_RAD));
  const correctedOrbitalRadius = orbitalRadius + distanceCorrection;
  // Aberration correction: 20.496 arcseconds is the typical aberration constant.
  const aberrationCorrection =
    (20.496 * (1 - eccentricity * eccentricity)) /
    (correctedOrbitalRadius * 3600);
  // Final corrected Sun longitude including nutation and aberration.
  sunMeanLongitude =
    intermediateLongitude + computeNutation(julianDate) - aberrationCorrection;
  // Store the Sun longitude for yoga computation.
  calcContext.sunLongitudeForYoga = sunMeanLongitude;
  return normalizeAngle(sunMeanLongitude);
}

/**
 * Calculates the start and end time of a tithi (or karana) period.
 * (A tithi is a lunar day defined by a 12° increment in the angular difference
 * between the Moon and Sun; a karana is half a tithi, i.e. 6°.)
 * @param julianDate - Current Julian date.
 * @param periodIndex - Tithi (or karana) index.
 * @param timezoneOffset - Timezone offset (in hours).
 * @param angularSegment - Angular length of a period (12° for tithi, 6° for karana).
 * @param calcContext - Calculation context.
 * @returns An object with start and end Date.
 */
export function computeTithiSegment(
  julianDate: number,
  periodIndex: number,
  timezoneOffset: number,
  angularSegment: number,
  calcContext: CalculationContext
): TimeSegment {
  let currentJulianDate = julianDate;
  // Approximate lunation count since the base epoch.
  const lunationCount = Math.floor(((julianDate - 2415020) / 365.25) * 12.3685);
  const timeSegment: TimeSegment = { start: new Date(), end: new Date() };

  // Calculate boundaries for two successive tithis or karanas.
  for (let index = periodIndex; index < periodIndex + 2; index++) {
    // Target aspect is the angular separation: angularSegment × period index.
    const targetAspect = angularSegment * index;
    let foundBoundary = false;
    if (targetAspect === 0) {
      // At 0° aspect, the new moon is used.
      currentJulianDate = computeNewMoonJulian(julianDate, lunationCount);
      foundBoundary = true;
    }
    if (targetAspect === 360) {
      // 360° corresponds to the next new moon.
      currentJulianDate = computeNewMoonJulian(julianDate, lunationCount + 1);
      foundBoundary = true;
    }
    while (!foundBoundary) {
      const sunLongitudeAtJD = computeSunLongitude(
        currentJulianDate,
        calcContext
      );
      const moonLongitudeAtJD = computeMoonLongitude(
        currentJulianDate,
        calcContext
      );
      // Calculate the target angle by adding the target aspect to the Sun’s longitude.
      const targetAngle = normalizeAngle(sunLongitudeAtJD + targetAspect);
      let angleDifference = targetAngle - moonLongitudeAtJD;
      // Adjust the angle difference to lie within (–180°, 180°).
      if (angleDifference > 180) angleDifference -= 360;
      if (angleDifference < -180) angleDifference += 360;
      foundBoundary = true;
      // If the difference is significant, adjust the Julian date using the Moon's angular velocity.
      if (Math.abs(angleDifference) > 0.001) {
        currentJulianDate +=
          angleDifference / ((calcContext.moonAngularVelocity ?? 1) - 1);
        foundBoundary = false;
      }
    }
    // Convert the computed Julian date to a Date, applying timezone and delta‑T corrections.
    if (index === periodIndex) {
      timeSegment.start = convertJulianToDate(
        currentJulianDate + (timezoneOffset - (calcContext.deltaT ?? 0)) / 24
      );
    }
    if (index === periodIndex + 1) {
      timeSegment.end = convertJulianToDate(
        currentJulianDate + (timezoneOffset - (calcContext.deltaT ?? 0)) / 24
      );
    }
  }
  return timeSegment;
}

/**
 * Calculates the entry and exit times for the Moon in a nakshatra.
 * (Nakshatras are 27 divisions of the ecliptic, each about 13°20′ wide.)
 * @param julianDate - Current Julian date.
 * @param nakshatraIndex - Nakshatra index.
 * @param timezoneOffset - Timezone offset (in hours).
 * @param calcContext - Calculation context.
 * @returns An object with start and end Date.
 */
function computeNakshatraSegment(
  julianDate: number,
  nakshatraIndex: number,
  timezoneOffset: number,
  calcContext: CalculationContext
): TimeSegment {
  let currentJulianDate = julianDate;
  const timeSegment: TimeSegment = { start: new Date(), end: new Date() };

  // Calculate boundaries for two successive nakshatra transitions.
  for (let index = nakshatraIndex; index < nakshatraIndex + 2; index++) {
    // Each nakshatra covers an angular segment; (80/6) approximates its width.
    const targetAngle = normalizeAngle((index * 80) / 6);
    let boundaryFound = false;
    while (!boundaryFound) {
      // Apply ayanamsa to the Moon's longitude.
      const siderealMoonLongitude = normalizeAngle(
        computeMoonLongitude(currentJulianDate, calcContext) +
          (calcContext.ayanamsa ?? 0)
      );
      let angleDifference = targetAngle - siderealMoonLongitude;
      if (angleDifference > 180) angleDifference -= 360;
      if (angleDifference < -180) angleDifference += 360;
      boundaryFound = true;
      if (Math.abs(angleDifference) > 0.001) {
        currentJulianDate +=
          angleDifference / (calcContext.moonAngularVelocity ?? 1);
        boundaryFound = false;
      }
    }
    if (index === nakshatraIndex) {
      timeSegment.start = convertJulianToDate(
        currentJulianDate + (timezoneOffset - (calcContext.deltaT ?? 0)) / 24
      );
    }
    if (index === nakshatraIndex + 1) {
      timeSegment.end = convertJulianToDate(
        currentJulianDate + (timezoneOffset - (calcContext.deltaT ?? 0)) / 24
      );
    }
  }
  return timeSegment;
}

/**
 * Calculates the start and end times of a yoga period.
 * Yoga is determined from the sum of the corrected longitudes of the Moon and Sun.
 * @param julianDate - Current Julian date.
 * @param rawYogaValue - The computed yoga value before segmentation.
 * @param timezoneOffset - Timezone offset (in hours).
 * @param calcContext - Calculation context.
 * @returns An object with start and end Date.
 */
function computeYogaSegment(
  julianDate: number,
  rawYogaValue: number,
  timezoneOffset: number,
  calcContext: CalculationContext
): TimeSegment {
  let currentJulianDate = julianDate;
  const timeSegment: TimeSegment = { start: new Date(), end: new Date() };
  // Determine the boundaries for the current yoga segment.
  // (80/6 is used because 360°/27 ≈ 13.333°, with scaling by 6.)
  const yogaBoundaryLower = Math.floor((rawYogaValue * 6) / 80) * (80 / 6);
  const yogaBoundaryUpper =
    (Math.floor((rawYogaValue * 6) / 80) + 1) * (80 / 6);
  const yogaBoundaries = [yogaBoundaryLower, yogaBoundaryUpper];

  for (let i = 0; i < 2; i++) {
    let boundaryFound = false;
    while (!boundaryFound) {
      const sunLongitudeAtJD = computeSunLongitude(
        currentJulianDate,
        calcContext
      );
      const moonLongitudeAtJD = computeMoonLongitude(
        currentJulianDate,
        calcContext
      );
      // Apply offsets: these large constants adjust the longitudes for the yoga calculation.
      const adjustedMoonLongitude =
        (calcContext.moonLongitudeForYoga ?? 0) +
        (calcContext.ayanamsa ?? 0) -
        491143.07698973856;
      const adjustedSunLongitude =
        (calcContext.sunLongitudeForYoga ?? 0) +
        (calcContext.ayanamsa ?? 0) -
        36976.91240579201;
      const currentYogaValue = adjustedMoonLongitude + adjustedSunLongitude;
      let angleDifference = yogaBoundaries[i] - currentYogaValue;
      boundaryFound = true;
      if (Math.abs(angleDifference) > 0.001) {
        currentJulianDate +=
          angleDifference /
          ((calcContext.moonAngularVelocity ?? 1) + 1.0145616633);
        boundaryFound = false;
      }
    }
    if (i === 0) {
      timeSegment.start = convertJulianToDate(
        currentJulianDate + (timezoneOffset - (calcContext.deltaT ?? 0)) / 24
      );
    } else if (i === 1) {
      timeSegment.end = convertJulianToDate(
        currentJulianDate + (timezoneOffset - (calcContext.deltaT ?? 0)) / 24
      );
    }
  }
  return timeSegment;
}

/**
 * Class that calculates Panchang (Indian calendar details) for a given date.
 */
export class PanchangCalculator {
  /** Version number of this implementation. */
  public readonly version: string = "0.2";

  /**
   * Calculates the Panchang details for the provided Date.
   * @param date - The date for which to compute the Panchang.
   * @returns The PanchangResult containing day, tithi, nakshatra, karana, yoga, ayanamsa, and raasi.
   */
  public calculate(date: Date): PanchangResult {
    const calcContext: CalculationContext = {};
    // Extract date components.
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed.
    const year = date.getFullYear();
    const hourDecimal = date.getHours() + date.getMinutes() / 60; // Fractional hours.
    const timezoneOffset = -date.getTimezoneOffset() / 60; // Timezone offset in hours.
    // Compute Julian date (with fractional day).
    const fractionalDay = dayOfMonth + hourDecimal / 24;
    const localJulianDate = convertMdyToJulian(month, fractionalDay, year);
    // Determine weekday index.
    const weekdayIndex = getWeekdayIndex(localJulianDate);
    // Compute Julian date for the start of the day.
    const startOfDayJulian = convertMdyToJulian(month, dayOfMonth, year);
    // Adjust for local time: Universal Time plus timezone offset.
    const julianDateUT = startOfDayJulian + (hourDecimal - timezoneOffset) / 24;
    // Compute delta-T (in hours) and store in calculation context.
    calcContext.deltaT = computeDeltaT(julianDateUT);
    // Compute final corrected Julian date including delta-T.
    const correctedJulianDate = julianDateUT + (calcContext.deltaT ?? 0) / 24;
    // Calculate ayanamsa (the offset between tropical and sidereal zodiacs).
    calcContext.ayanamsa = calculateAyanamsa(correctedJulianDate);
    // Compute Moon and Sun longitudes.
    const moonLongitude = computeMoonLongitude(
      correctedJulianDate,
      calcContext
    );
    const sunLongitude = computeSunLongitude(correctedJulianDate, calcContext);
    // --- Yoga Calculation ---
    // Combine corrected Moon and Sun longitudes with fixed offsets.
    const moonYogaAdjusted =
      (calcContext.moonLongitudeForYoga ?? 0) +
      (calcContext.ayanamsa ?? 0) -
      491143.07698973856;
    const sunYogaAdjusted =
      (calcContext.sunLongitudeForYoga ?? 0) +
      (calcContext.ayanamsa ?? 0) -
      36976.91240579201;
    const rawYogaValue = moonYogaAdjusted + sunYogaAdjusted;
    // Determine yoga index (0 to 26).
    let yogaIndex = Math.floor((rawYogaValue * 6) / 80);
    while (yogaIndex < 0) {
      yogaIndex += 27;
    }
    while (yogaIndex >= 27) {
      yogaIndex -= 27;
    }
    const yogaSegment = computeYogaSegment(
      correctedJulianDate,
      rawYogaValue,
      timezoneOffset,
      calcContext
    );
    // --- Nakshatra Calculation ---
    const moonLongitudeSidereal = normalizeAngle(
      moonLongitude + (calcContext.ayanamsa ?? 0)
    );
    const nakshatraIndex = Math.floor((moonLongitudeSidereal * 6) / 80);
    const nakshatraSegment = computeNakshatraSegment(
      correctedJulianDate,
      nakshatraIndex,
      timezoneOffset,
      calcContext
    );
    // --- Tithi Calculation ---
    let adjustedMoonLongitudeForTithi = moonLongitude;
    if (adjustedMoonLongitudeForTithi < sunLongitude) {
      adjustedMoonLongitudeForTithi += 360; // Ensure the difference is positive.
    }
    const tithiIndex = Math.floor(
      (adjustedMoonLongitudeForTithi - sunLongitude) / 12
    );
    const tithiSegment = computeTithiSegment(
      correctedJulianDate,
      tithiIndex,
      timezoneOffset,
      12,
      calcContext
    );
    // --- Karana Calculation ---
    let adjustedMoonLongitudeForKarana = moonLongitude;
    let adjustedSunLongitudeForKarana = sunLongitude;
    if (adjustedMoonLongitudeForKarana < adjustedSunLongitudeForKarana) {
      adjustedMoonLongitudeForKarana += 360;
    }
    // Each karana spans 6°.
    const karanaRawIndex = Math.floor(
      (adjustedMoonLongitudeForKarana - adjustedSunLongitudeForKarana) / 6
    );
    let karanaIndex: number;
    if (karanaRawIndex === 0) {
      karanaIndex = 10;
    } else if (karanaRawIndex >= 57) {
      karanaIndex = karanaRawIndex - 50;
    } else {
      // For indices between 1 and 56, adjust to the repeating cycle of 11 unique karanas.
      karanaIndex =
        karanaRawIndex - 1 - Math.floor((karanaRawIndex - 1) / 7) * 7;
    }
    const karanaSegment = computeTithiSegment(
      correctedJulianDate,
      karanaRawIndex,
      timezoneOffset,
      6,
      calcContext
    );
    // --- Raasi Calculation ---
    // Each zodiac sign covers 30°.
    const zodiacIndex = Math.floor(
      Math.abs(normalizeAngle(moonLongitude + (calcContext.ayanamsa ?? 0))) / 30
    );
    // Assemble and return the Panchang result.
    return {
      day: { name: WEEKDAYS[weekdayIndex] },
      ayanamsa: { name: longitudeToDMS(calcContext.ayanamsa ?? 0) },
      raasi: { name: ZODIAC_SIGNS[zodiacIndex] },
      nakshatra: {
        name: NAKSHATRAS[nakshatraIndex],
        start: nakshatraSegment.start,
        end: nakshatraSegment.end,
      },
      karana: {
        name: KARANAS[karanaIndex],
        start: karanaSegment.start,
        end: karanaSegment.end,
      },
      yoga: {
        name: YOGAS[yogaIndex],
        start: yogaSegment.start,
        end: yogaSegment.end,
      },
      tithi: {
        name: TITHIS[tithiIndex],
        start: tithiSegment.start,
        end: tithiSegment.end,
      },
      version: this.version,
    };
  }
}
