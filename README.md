# Panchang Calculator

The **Panchang Calculator** is a JavaScript library for calculating various elements of the Hindu Panchang (calendar), such as **Tithi**, **Nakshatra**, **Karana**, **Yoga**, and **Raasi**. It uses both traditional Vedic and modern astronomical methods to provide accurate results. Additionally, it includes support for converting Gregorian dates to the **Bikram Sambat (Vikram Sambat)** calendar, the traditional Nepali calendar.

---

## Features

1. **Panchang Calculations**:

   - **Tithi**: Lunar day based on the angular distance between the Moon and Sun.
   - **Nakshatra**: Lunar mansion based on the Moon's position.
   - **Karana**: Half of a Tithi.
   - **Yoga**: Combination of the Sun and Moon's positions.
   - **Raasi**: Zodiac sign based on the Moon's position.

2. **Bikram Sambat Conversion**:

   - Converts Gregorian dates to the Bikram Sambat calendar.
   - Supports all timezones automatically using the JavaScript `Date` object.
   - Uses sunrise-based day boundaries for accurate results.

3. **Astronomical Precision**:

   - Calculates the Sun and Moon's positions using modern astronomical algorithms.
   - Accounts for precession (ayanamsa) and nutation.

4. **Timezone Support**:
   - Automatically adjusts for the local timezone using the JavaScript `Date` object.

---

## Installation

You can install the library via npm:

```bash
npm install panchang-calculator
```

Or include it directly in your project:

```html
<script src="path/to/panchang.js"></script>
```

---

## Usage

### 1. Panchang Calculation

```javascript
import { PanchangCalculator } from "panchang-calculator";

const date = new Date(); // Current date
const panchang = new PanchangCalculator().calculate(date);

console.log(panchang);
```

#### Example Output:

```json
{
  "day": { "name": "Sunday" },
  "tithi": {
    "name": "Shukla Paksha Pratipada",
    "start": "2023-10-15T06:00:00.000Z",
    "end": "2023-10-16T06:30:00.000Z"
  },
  "nakshatra": {
    "name": "Ashwini",
    "start": "2023-10-15T06:00:00.000Z",
    "end": "2023-10-16T06:30:00.000Z"
  },
  "karana": {
    "name": "Bava",
    "start": "2023-10-15T06:00:00.000Z",
    "end": "2023-10-15T18:00:00.000Z"
  },
  "yoga": {
    "name": "Vishkambha",
    "start": "2023-10-15T06:00:00.000Z",
    "end": "2023-10-16T06:30:00.000Z"
  },
  "raasi": { "name": "Aries" },
  "ayanamsa": { "name": "23° 51' 12\"" }
}
```

---

### 2. Bikram Sambat Conversion

```javascript
import { gregorianToBS, formatBSDate } from "panchang-calculator";

const date = new Date(2023, 11, 26); // December 26, 2023
const bsDate = gregorianToBS(date);

console.log(formatBSDate(bsDate)); // "11 Poush 2080"
```

#### Example Output:

```
11 Poush 2080
```

---

### 3. Custom Location (Sunrise Calculation)

If you want to use a specific location for sunrise calculations (e.g., Kathmandu), you can override the default sunrise function:

```javascript
import { gregorianToBS, formatBSDate } from "panchang-calculator";

function getKathmanduSunrise(date) {
  // Custom sunrise calculation for Kathmandu
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const approxSunrise = 6.5; // Average sunrise time in Nepal
  const variation = 0.5 * Math.sin((2 * Math.PI * (dayOfYear - 80)) / 365); // Seasonal adjustment
  return (approxSunrise + variation + 5.75) / 24; // UTC+5:45
}

const date = new Date(2023, 11, 26); // December 26, 2023
const bsDate = gregorianToBS(date, getKathmanduSunrise);

console.log(formatBSDate(bsDate)); // "11 Poush 2080"
```

---

## API Reference

### `PanchangCalculator`

#### Methods

- **`calculate(date: Date): PanchangResult`**  
  Calculates the Panchang for the given date.

  **Parameters**:

  - `date`: A JavaScript `Date` object.

  **Returns**:

  - An object containing:
    - `day`: Weekday name.
    - `tithi`: Lunar day details.
    - `nakshatra`: Lunar mansion details.
    - `karana`: Half-Tithi details.
    - `yoga`: Yoga details.
    - `raasi`: Zodiac sign.
    - `ayanamsa`: Precession offset.

---

### `gregorianToBS`

#### Methods

- **`gregorianToBS(date: Date, sunriseFn?: (date: Date) => number): { year: number, month: number, day: number }`**  
  Converts a Gregorian date to the Bikram Sambat calendar.

  **Parameters**:

  - `date`: A JavaScript `Date` object.
  - `sunriseFn` (optional): A custom function to calculate sunrise as a fraction of the day.

  **Returns**:

  - An object containing:
    - `year`: Bikram Sambat year.
    - `month`: Bikram Sambat month (1-12).
    - `day`: Bikram Sambat day.

- **`formatBSDate(bsDate: { year: number, month: number, day: number }): string`**  
  Formats a Bikram Sambat date as a string (e.g., "11 Poush 2080").

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- The astronomical calculations are based on algorithms from **Jean Meeus' _Astronomical Algorithms_**.
- The Bikram Sambat conversion logic is inspired by traditional Nepali calendar systems.

---

## Support

For questions or issues, please open an issue on the [GitHub repository](https://github.com/kiranojhanp/panchang).

---

Enjoy using the Panchang Calculator! 🌞🌙
