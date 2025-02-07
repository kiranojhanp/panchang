import { Panchang } from "./panchang";

const panchang = new Panchang();
panchang.calculate(new Date(), () => {
  console.log("Day:", panchang.day.name);
  console.log(
    "Tithi:",
    panchang.tithi.name,
    panchang.tithi.start,
    panchang.tithi.end
  );
  console.log(
    "Nakshatra:",
    panchang.nakshatra.name,
    panchang.nakshatra.start,
    panchang.nakshatra.end
  );
  console.log(
    "Karana:",
    panchang.karana.name,
    panchang.karana.start,
    panchang.karana.end
  );
  console.log(
    "Yoga:",
    panchang.yoga.name,
    panchang.yoga.start,
    panchang.yoga.end
  );
  console.log("Ayanamsa:", panchang.ayanamsa.name);
  console.log("Raasi:", panchang.raasi.name);
});
