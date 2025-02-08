/** Interface for storing intermediate calculation values. */
export interface CalculationContext {
  moonLongitudeForYoga?: number; // Moon's longitude used in yoga calculation (before normalization)
  sunLongitudeForYoga?: number; // Sun's longitude used in yoga calculation (before normalization)
  moonAngularVelocity?: number; // Moon's computed angular velocity (degrees/day) with corrections
  deltaT?: number; // Delta-T (in hours): difference between Terrestrial and Universal Time
  ayanamsa?: number; // Ayanamsa value (in degrees), the offset between tropical and sidereal zodiacs
}

/** Interface representing a Panchang result segment with start and end times. */
export interface TimeSegment {
  start: Date;
  end: Date;
}

/** Interface representing the complete Panchang result. */
export interface PanchangResult {
  day: { name: string };
  tithi: { name: string; start: Date; end: Date };
  nakshatra: { name: string; start: Date; end: Date };
  karana: { name: string; start: Date; end: Date };
  yoga: { name: string; start: Date; end: Date };
  ayanamsa: { name: string };
  raasi: { name: string };
  version: string;
}
