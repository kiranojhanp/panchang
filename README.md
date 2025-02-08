# Panchang Calculator

The Panchang Calculator is a TypeScript-based implementation designed to compute the traditional Indian almanac (Panchang). It calculates various astronomical and calendrical elements such as:

- **Tithi:** The lunar day or phase.
- **Nakshatra:** The lunar mansion.
- **Karana:** A half of a tithi.
- **Yoga:** A specific combination derived from the sum of the Moon’s and Sun’s longitudes.
- **Ayanamsa:** The correction applied to account for the precession of the equinoxes.
- **Raasi:** The zodiac sign determined from the Moon’s position.

This README explains how each of these values is calculated and details the purpose of the key functions and constants used in the project.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Constants and Their Roles](#constants-and-their-roles)
4. [Key Calculations and Functions](#key-calculations-and-functions)
   - [Date and Time Conversions](#date-and-time-conversions)
   - [ΔT Calculation](#-t-calculation)
   - [Iterative Solvers and Kepler’s Equation](#iterative-solvers-and-keplers-equation)
   - [Nutation and Ayanamsa](#nutation-and-ayanamsa)
   - [Celestial Positions – Moon and Sun](#celestial-positions--moon-and-sun)
   - [Interval Calculations: Tithi, Nakshatra, Yoga, and Karana](#interval-calculations-tithi-nakshatra-yoga-and-karana)
   - [New Moon (Novolun) Estimation](#new-moon-novolun-estimation)
   - [Longitude to DMS String Conversion](#longitude-to-dms-string-conversion)
5. [The Panchang Class](#the-panchang-class)
6. [Usage](#usage)
7. [References and Further Reading](#references-and-further-reading)

---

## Overview

The Panchang Calculator computes astronomical data by first converting a given local date into the Julian day format. It then applies a series of well-known astronomical formulas to determine the positions of the Moon and Sun relative to the Earth. From these positions, derived values such as tithi, nakshatra, karana, and yoga are calculated using both direct formulae and iterative methods.

The calculations incorporate various corrections:

- **ΔT (Delta T):** The difference between universal time (UT) and dynamical time, affecting the precise timing of celestial events.
- **Nutation:** Small periodic oscillations in Earth’s rotation.
- **Ayanamsa:** The correction required due to the precession of the equinoxes.

In addition, specialized correction arrays (`corrMoon` and `corrMoon2`) are applied to fine-tune the Moon’s calculated longitude.

---

## Project Structure

- **Constants:**  
  All “magic numbers” used throughout the calculations have been extracted to the top of the file. These constants include angles (e.g., full circle, half circle), coefficients for series expansions, and numerical offsets used in the Julian day conversion and ΔT estimation. This organization helps in understanding what each value represents and makes it easier to tweak parameters if needed.

- **PanchangUtils Namespace:**  
  Contains helper functions that perform low‑level calculations:

  - Date conversions between Gregorian dates and Julian day numbers.
  - Solving Kepler’s equation using an iterative method.
  - Computing nutation, ayanamsa, and the celestial positions of the Moon and Sun.
  - Determining time intervals (using iterative corrections) for tithi, nakshatra, and yoga.

- **Panchang Class:**  
  This class serves as the primary interface. It calls the utility functions to compute all required Panchang data for a given date and sets the values for day, tithi, nakshatra, karana, yoga, ayanamsa, and raasi.

---

## Constants and Their Roles

The extracted constants are grouped by purpose:

- **Angle and Time Constants:**

  - `FULL_CIRCLE` (360°) and `HALF_CIRCLE` (180°) are used to normalize angles.
  - `HALF` (0.5) is used when converting between calendar days and Julian days.
  - `MONTHS_PER_YEAR` and `DAYS_PER_YEAR` provide base values for date calculations.

- **Julian Day Conversion Constants:**

  - Constants such as `OFFSET_YEAR`, `MONTH_ADJUSTMENT`, and `JULIAN_DAY_OFFSET` are used to convert Gregorian dates into Julian day numbers, including corrections for the Gregorian calendar reform.

- **ΔT Coefficients:**

  - `DT_COEFFICIENTS` and associated constants (like `DT_PERIOD_START`, `DT_PERIOD_END`) are used to calculate ΔT, which is essential for high-precision time calculations in astronomical events.

- **Astronomical Series Coefficients:**

  - Numerous constants (e.g., `MOON_MEAN_LONG_COEFF`, `SUN_MEAN_ANOMALY_COEFF`, etc.) appear in the series expansions that calculate the mean positions of the Moon and Sun.
  - The correction arrays (`corrMoon` and `corrMoon2`) contain coefficients used to adjust the Moon’s calculated position for perturbations.

- **Nutation and Ayanamsa Constants:**
  - Coefficients such as `NUT_LS_BASE`, `NUT_MS_BASE`, and others define the base values and rate coefficients for computing the nutation in longitude.
  - Similarly, constants in the `calcayan()` function are used to compute the ayanamsa (the precession correction).

Each constant has been given a meaningful name (and documented with JSDoc comments) so that anyone reviewing the code or the README can understand what each parameter represents.

---

## Key Calculations and Functions

### Date and Time Conversions

- **`mdy2julian(m, d, y)`**  
  Converts a Gregorian date (month, day, year) to a Julian day number. The algorithm uses adjustments for the Gregorian calendar reform and extracts a fractional day component.

- **`calData(jd)`**  
  Converts a Julian day number back to a standard JavaScript `Date` object. During this conversion, it also extracts calendar components (`kyear`, `kmon`, `kday`).

- **`weekDay(jd)`**  
  Computes the day of the week from the Julian day. (0 represents Sunday and 6 represents Saturday.)

### ΔT Calculation

- **`dTime(jd)`**  
  Computes ΔT (the difference between Universal Time and dynamical time) based on the input Julian day. This function interpolates between known ΔT values for the period 1620–2010 and applies different quadratic approximations for dates outside that range.

### Iterative Solvers and Kepler’s Equation

- **`kepler(m, ex, err)`**  
  Solves Kepler’s equation iteratively to find the eccentric anomaly in radians. The function converts the mean anomaly from degrees to radians and iterates until the change is less than the specified tolerance (also converted to radians).

### Nutation and Ayanamsa

- **`nutation(jd)`**  
  Calculates the nutation in longitude using a series expansion. Nutation accounts for the slight oscillations in Earth’s rotation and affects the apparent positions of the Sun and Moon.

- **`calcayan(jd)`**  
  Computes the ayanamsa, which is the correction applied due to the precession of the equinoxes. This value is essential when converting between the tropical (Western) and sidereal (Vedic) zodiac systems.

### Celestial Positions – Moon and Sun

- **`moon(jd)`**  
  Determines the geocentric Moon longitude.

  - It starts with a calculation of the mean lunar longitude.
  - It computes the mean elongation (the angular difference between the Moon and Sun) and the Moon’s perigee.
  - Corrections (using the `corrMoon` and `corrMoon2` arrays) are applied iteratively to account for various perturbations.
  - The function returns the normalized lunar longitude and saves its value (for use in yoga calculations) in a global variable.

- **`sun(jd)`**  
  Computes the geocentric apparent Sun longitude.
  - It calculates the Sun’s mean longitude and corrects for perturbations.
  - An iterative solution (using Kepler’s equation) is applied to adjust the Sun’s position for orbital eccentricity.
  - Corrections including nutation and aberration adjustments are applied before the final normalized value is returned.

### Interval Calculations: Tithi, Nakshatra, Yoga, and Karana

- **`tithi(jd, n1, tzone, len)`**  
  Calculates the start and end times for a tithi (or, when used with a length of 6, a karana).

  - The function uses an iterative approach to “zero in” on the precise moment when the angular difference between the Moon and Sun equals multiples of 12° (for tithi) or 6° (for karana).

- **`nakshatra(jd, n_naksh, tzone)`**  
  Determines the interval for a given nakshatra based on the Moon’s corrected longitude (with ayanamsa applied).

  - Like tithi, it iteratively adjusts the time until the Moon’s position aligns with the expected nakshatra boundary.

- **`yoga(jd, zyoga, tzone)`**  
  Computes the yoga interval by considering the combined corrections of both the Moon and Sun.
  - It uses an iterative loop to locate the moment when the sum of the corrected lunar and solar positions reaches the boundaries defining the yoga segments.

### New Moon (Novolun) Estimation

- **`novolun(jd, knv)`**  
  Estimates the time of the new moon (novolun) near the given Julian day.
  - The function uses a base epoch and adds a multiple of the lunar cycle (approximately 29.53 days) along with series corrections based on the Moon’s and Sun’s anomalies.

### Longitude to DMS String Conversion

- **`lon2dms(x)`**  
  Converts a longitude given in decimal degrees into a more human-readable format of degrees, minutes, and seconds.

---

## The Panchang Class

The `Panchang` class is the high-level interface for calculating almanac data. When you call its `calculate()` method with a local `Date` object, the class:

1. **Extracts Local Date and Time Components:**  
   Gets the day, month, year, and local time (including timezone offset).

2. **Converts to Julian Day:**  
   Uses `mdy2julian()` to get the Julian day number and adjusts for universal time by applying ΔT (from `dTime()`).

3. **Computes Astronomical Corrections:**  
   Calls `calcayan()` to compute the ayanamsa, then calculates the Moon’s and Sun’s positions via `moon()` and `sun()`, respectively.

4. **Determines Panchang Elements:**

   - **Tithi:** Computed by comparing the Moon’s and Sun’s longitudes.
   - **Nakshatra:** Determined from the Moon’s position after applying ayanamsa.
   - **Karana:** Derived similarly to tithi by halving the angular span.
   - **Yoga:** Calculated by summing the corrected positions of the Moon and Sun.
   - **Raasi:** Derived from the Moon’s position (dividing the circle into 12 zodiac signs).

5. **Assigns the Calculated Values:**  
   The class then populates its properties with the calculated values (along with their start and end times, where applicable) so that they can be used in a UI or further processing.

---

## Usage

To use the Panchang Calculator in your project:

1. **Import the Panchang Class:**

   ```ts
   import { Panchang } from "./Panchang";
   ```

2. **Create an Instance and Calculate:**

   ```ts
   const panchang = new Panchang();
   const localDate = new Date(); // or any other Date object
   panchang.calculate(localDate, () => {
     console.log("Day:", panchang.day.name);
     console.log("Tithi:", panchang.tithi.name);
     console.log("Nakshatra:", panchang.nakshatra.name);
     console.log("Karana:", panchang.karana.name);
     console.log("Yoga:", panchang.yoga.name);
     console.log("Ayanamsa:", panchang.ayanamsa.name);
     console.log("Raasi:", panchang.raasi.name);
   });
   ```

3. **Customization:**  
   Since all constants (such as cycle lengths, series coefficients, and offsets) are defined at the top of the source file, you can adjust these values if you need to tweak the precision or adapt the calculations to different astronomical models.

---

## References and Further Reading

- **Astronomical Algorithms** by Jean Meeus – A key resource for many of the astronomical calculations implemented here.
- **Vedic Astrology Texts** – For understanding the traditional significance of tithi, nakshatra, yoga, and karana.
- **Nutation and Precession** – Various scholarly articles and texts on celestial mechanics explain the mathematical derivations behind nutation and ayanamsa.

---

This README should provide a clear and detailed overview of the Panchang Calculator’s inner workings. Whether you are trying to understand the role of each constant or the iterative methods used in calculating celestial events, this guide serves as a roadmap for the logic behind the code.

Happy coding and clear skies!
