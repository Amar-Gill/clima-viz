import { differenceInDays, getDayOfYear } from 'date-fns';
import type { LatLngLiteral } from 'leaflet';
class SolarCalculator {
  private baselineReferenceJD = 2415020;

  private baselineReferenceDate = new Date('January 1, 1900');

  private position: LatLngLiteral;

  private deg2Rad = Math.PI / 180;

  private rad2Deg = 180 / Math.PI;

  private radPerDay = (2 * Math.PI) / 365;

  constructor(position: LatLngLiteral) {
    this.position = position;
  }

  /**
   *
   * @param position The Leaflet js position associated with the calculator instance
   * @returns number between -14 and 14
   * which is an approximate UTC offset based on position.
   */
  public calculateUTCOffset(position = this.position): number {
    return Math.round(position.lng / 15);
  }

  /**
   *
   * @param date
   * @returns the Julian Day using DublinJD reference date epoch of December 31, 1899, 12:00.
   * The Julian Day is the total number of days since the beginning of Julian Epoch.
   * {@link https://en.wikipedia.org/wiki/Julian_day}
   */
  private julianDay(date: Date): number {
    const UTCOffset = this.calculateUTCOffset(this.position);

    const deltaDays = differenceInDays(date, this.baselineReferenceDate);

    return (
      this.baselineReferenceJD + deltaDays + 0.5 + (date.getHours() + UTCOffset) / 24
    );
  }

  /**
   * @param julianDay
   * @returns the Julian Century based on the Julian Day.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   */
  private julianCentury(julianDay: number): number {
    return (julianDay - 2451545) / 36525;
  }

  /**
   * @param julianCentury
   * @returns the mean longitude of the Sun in degrees.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   * {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
   */
  private meanLongitudeOfSun(julianCentury: number): number {
    return (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) % 360;
  }

  /**
   * @param julianCentury
   * @returns the mean anomaly of the Sun in degrees.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   * {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
   */
  private meanAnomalyOfSun(julianCentury: number): number {
    return 357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);
  }

  /**
   * @param julianCentury
   * @returns orbital eccentricity of Earth, a unitless value.
   * {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
   */
  private orbitalEccentricityOfEarth(julianCentury: number): number {
    return 0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury);
  }

  /**
   * @param julianCentury
   * @returns mean ecliptic obliquity of Earth's orbit in degrees.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   * {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
   */
  private meanEclipticObliquity(julianCentury: number): number {
    return (
      23 +
      (26 +
        (21.448 -
          julianCentury *
            (46.815 + julianCentury * (0.00059 - julianCentury * 0.001813))) /
          60) /
        60
    );
  }

  /**
   * @param meanEclipticObliquity
   * @param julianCentury
   * @returns corrected ecliptic obliquity of Earth's orbit in degrees.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   * {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
   */
  private correctedEclipticObliquity(
    meanEclipticObliquity: number,
    julianCentury: number,
  ): number {
    return (
      meanEclipticObliquity +
      0.00256 * Math.cos((Math.PI / 180) * (125.04 - 1934.136 * julianCentury))
    );
  }

  /**
   * @param correctedObliquity
   * @returns returns a unitless variation value in obliquity.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   * {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
   */
  private variationY(correctedObliquity: number): number {
    return (
      Math.tan((Math.PI / 180) * (correctedObliquity / 2)) *
      Math.tan((Math.PI / 180) * (correctedObliquity / 2))
    );
  }

  /**
   * @param meanLongitudeOfSun
   * @param meanAnomalyOfSun
   * @param orbitalEccentricityOfEarth
   * @param variationY
   * @returns change in minutes of the time of solar noon.
   * It is the difference between apparent solar time and mean solar time in minutes.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   * {@link https://en.wikipedia.org/wiki/Equation_of_time}
   */
  private equationOfTime(
    meanLongitudeOfSun: number,
    meanAnomalyOfSun: number,
    orbitalEccentricityOfEarth: number,
    variationY: number,
  ): number {
    return (
      4 *
      (180 / Math.PI) *
      (variationY * Math.sin(2 * (Math.PI / 180) * meanLongitudeOfSun) -
        2 * orbitalEccentricityOfEarth * Math.sin((Math.PI / 180) * meanAnomalyOfSun) +
        4 *
          orbitalEccentricityOfEarth *
          variationY *
          Math.sin((Math.PI / 180) * meanAnomalyOfSun) *
          Math.cos(2 * (Math.PI / 180) * meanLongitudeOfSun) -
        0.5 *
          variationY *
          variationY *
          Math.sin(4 * (Math.PI / 180) * meanLongitudeOfSun) -
        1.25 *
          orbitalEccentricityOfEarth *
          orbitalEccentricityOfEarth *
          Math.sin(2 * (Math.PI / 180) * meanAnomalyOfSun))
    );
  }

  /**
   *
   * @param julianCentury
   * @param meanAnomalyOfSun
   * @returns the angular difference between the actual position Earth in its elliptical orbit
   * and the position it would occupy if its motion were uniform, in a circular orbit of the same period.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   * {@link https://en.wikipedia.org/wiki/Equation_of_the_center}
   */
  private equationOfCenter(julianCentury: number, meanAnomalyOfSun: number): number {
    return (
      Math.sin((Math.PI / 180) * meanAnomalyOfSun) *
        (1.914602 - julianCentury * (0.004817 + 0.000014 * julianCentury)) +
      Math.sin((Math.PI / 180) * (2 * meanAnomalyOfSun)) *
        (0.019993 - 0.000101 * julianCentury) +
      Math.sin((Math.PI / 180) * (3 * meanAnomalyOfSun)) * 0.000289
    );
  }

  /**
   *
   * @param meanLongitudeOfSun
   * @param equationOfCenter
   * @returns true longitude of the Sun in degrees.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   */
  private trueLongitudeOfSun(
    meanLongitudeOfSun: number,
    equationOfCenter: number,
  ): number {
    return meanLongitudeOfSun + equationOfCenter;
  }

  /**
   *
   * @param julianCentury
   * @param trueLongitudeOfSun
   * @returns apparent longitude of the Sun in degrees.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   */
  private apparentLongitudeOfSun(
    julianCentury: number,
    trueLongitudeOfSun: number,
  ): number {
    return (
      trueLongitudeOfSun -
      0.00569 -
      0.00478 * Math.sin((Math.PI / 180) * (125.04 - 1934.136 * julianCentury))
    );
  }

  /**
   *
   * @param apparentLongitudeOfSun
   * @param correctedObliquity
   * @returns the declination of the sun in degrees. The solar declination varies from -23.44° at the (northern hemisphere) winter solstice,
   * through 0° at the vernal equinox, to +23.44° at the summer solstice.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   */
  private solarDeclination(
    apparentLongitudeOfSun: number,
    correctedObliquity: number,
  ): number {
    return (
      (180 / Math.PI) *
      Math.asin(
        Math.sin((Math.PI / 180) * correctedObliquity) *
          Math.sin((Math.PI / 180) * apparentLongitudeOfSun),
      )
    );
  }

  /**
   *
   * @param latitude - number representing latitudinal position to assess.
   * @param solarDeclination - solar declination angle in degrees.
   * @returns returns the hour angle at sunrise in degrees.
   * @see https://en.wikipedia.org/wiki/Hour_angle
   */
  private hourAngleSunrise(latitude: number, solarDeclination: number) {
    return (
      (180 / Math.PI) *
      Math.acos(
        Math.cos((Math.PI / 180) * 90.833) /
          (Math.cos((Math.PI / 180) * latitude) *
            Math.cos((Math.PI / 180) * solarDeclination)) -
          Math.tan((Math.PI / 180) * latitude) *
            Math.tan((Math.PI / 180) * solarDeclination),
      )
    );
  }

  /**
   *
   * @param hourAngleSunrise hour angle at sunrise in degrees.
   * @param solarNoon time of solar noon as a fraction of a day. 0 - 1.
   * @returns time of sunrise as a fraction of a day. 0 -1.
   */
  private sunriseTime(hourAngleSunrise: number, solarNoon: number) {
    return (solarNoon * 1440 - hourAngleSunrise * 4) / 1440;
  }

  /**
   *
   * @param hourAngleSunrise hour angle at sunrise in degrees.
   * @param solarNoon time of solar noon as a fraction of a day. 0 - 1.
   * @returns time of sunset as a fraction of a day. 0 - 1.
   */
  private sunsetTime(hourAngleSunrise: number, solarNoon: number) {
    return (solarNoon * 1440 + hourAngleSunrise * 4) / 1440;
  }

  /**
   *
   * @param the Date to calculate times for.
   * @returns object containing sunrise and sunset times as day fractions. 0 - 1.
   */
  public calculateSunriseAndSunset(date: Date) {
    const JD = this.julianDay(date);

    const JC = this.julianCentury(JD);

    const meanLong = this.meanLongitudeOfSun(JC);

    const meanAnom = this.meanAnomalyOfSun(JC);

    const obliquity = this.meanEclipticObliquity(JC);

    const correctedObliquity = this.correctedEclipticObliquity(obliquity, JC);

    const equationOfCenter = this.equationOfCenter(JC, meanAnom);

    const trueLongitude = this.trueLongitudeOfSun(meanLong, equationOfCenter);

    const apparentLongitudeOfSun = this.apparentLongitudeOfSun(JC, trueLongitude);

    const solarDeclination = this.solarDeclination(
      apparentLongitudeOfSun,
      correctedObliquity,
    );

    const hourAngleSunrise = this.hourAngleSunrise(this.position.lat, solarDeclination);

    const orbitalEccentricity = this.orbitalEccentricityOfEarth(JC);

    const varY = this.variationY(correctedObliquity);

    const eqnOfTime = this.equationOfTime(meanLong, meanAnom, orbitalEccentricity, varY);

    const solarNoon =
      (720 - 4 * this.position.lng - eqnOfTime + this.calculateUTCOffset() * 60) / 1440;

    const sunriseTime = this.sunriseTime(hourAngleSunrise, solarNoon);

    const sunsetTime = this.sunsetTime(hourAngleSunrise, solarNoon);

    return {
      sunriseTime,
      sunsetTime,
    };
  }

  /**
   *
   * @param date to calculate solar noon at
   * @returns  time of day where solar noon occurs, as floating point number representing fraction of a day
   */
  public calculateSolarNoon(date: Date) {
    const eqnOfTime = this.calculateEquationOfTime(date);

    return (
      (720 - 4 * this.position.lng - eqnOfTime + this.calculateUTCOffset() * 60) / 1440
    );
  }

  /**
   * @param date
   * @returns  the equation of time in minutes for the given date and position.
   * It is the difference between apparent solar time and mean solar time in minutes.
   * Or the change in minutes of the time of solar noon.
   * https://en.wikipedia.org/wiki/Equation_of_time
   */
  public calculateEquationOfTime(date: Date): number {
    const JD = this.julianDay(date);

    const JC = this.julianCentury(JD);

    const meanLong = this.meanLongitudeOfSun(JC);

    const meanAnom = this.meanAnomalyOfSun(JC);

    const orbitalEccentricity = this.orbitalEccentricityOfEarth(JC);

    const obliquity = this.meanEclipticObliquity(JC);

    const correctedObliquity = this.correctedEclipticObliquity(obliquity, JC);

    const varY = this.variationY(correctedObliquity);

    return this.equationOfTime(meanLong, meanAnom, orbitalEccentricity, varY);
  }

  /**
   * @param date
   * @returns  the solar declination of the Sun in degrees for the given date and position.
   * The solar declination varies from -23.44° at the (northern hemisphere) winter solstice,
   * through 0° at the vernal equinox, to +23.44° at the summer solstice.
   */
  public calculateSolarDeclination(date: Date): number {
    const JD = this.julianDay(date);

    const JC = this.julianCentury(JD);

    const meanLong = this.meanLongitudeOfSun(JC);

    const meanAnom = this.meanAnomalyOfSun(JC);

    const obliquity = this.meanEclipticObliquity(JC);

    const correctedObliquity = this.correctedEclipticObliquity(obliquity, JC);

    const equationOfCenter = this.equationOfCenter(JC, meanAnom);

    const trueLongitude = this.trueLongitudeOfSun(meanLong, equationOfCenter);

    const apparentLongitudeOfSun = this.apparentLongitudeOfSun(JC, trueLongitude);

    return this.solarDeclination(apparentLongitudeOfSun, correctedObliquity);
  }

  /**
   *
   * @param date
   * @returns  the maximum elevation of the sun for a given date and position.
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/elevation-angle}
   */
  public calculateMaxSolarElevationAngle(date: Date): number {
    const solarDeclinationAngle = this.calculateSolarDeclination(date);

    return this.position.lat > 0
      ? 90 - this.position.lat + solarDeclinationAngle
      : 90 + this.position.lat - solarDeclinationAngle;
  }

  /**
   * Context of a single day equations
   */

  /**
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @returns number representing equation of time in minutes
   * @description simplified equation for EOT
   * tested = true
   */
  public alternateEquationOfTime(dayOfYear: number): number {
    const B = this.radPerDay * (dayOfYear - 81); // first term is radians / day the earth orbits around sun
    return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  }

  /**
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @param elapsedMinutes - the number of minutes elapsed on the day to calcualate value for
   * @returns converts given date into local solar time in number of hours, takes into account position
   * decimal fraction represents the fraction of an hour
   * tested = true
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   */
  public localSolarTime(dayOfYear: number, elapsedMinutes: number): number {
    // TODO this can be saved as a constant outside the method
    const localSolarTimeMeridian = 15 * this.calculateUTCOffset();

    const timeCorrection =
      4 * (this.position.lng - localSolarTimeMeridian) +
      this.alternateEquationOfTime(dayOfYear);

    return (elapsedMinutes + timeCorrection) / 60;
  }

  /**
   *
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @param elapsedMinutes - the number of minutes elapsed on the day to calcualate value for
   * @returns hour angle in degrees
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   */
  // new api: day number, elapsed minutes
  public hourAngle(dayOfYear: number, elapsedMinutes: number): number {
    return 15 * (this.localSolarTime(dayOfYear, elapsedMinutes) - 12);
  }

  /**
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   * tested = true
   */
  // new api: day number
  public alternateSolarDeclination(dayOfYear: number): number {
    const x = this.deg2Rad * 23.45;
    return x * this.rad2Deg * Math.sin(this.radPerDay * (dayOfYear - 81));
  }

  /**
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @param elapsedMinutes - the number of minutes elapsed on the day to calcualate value for
   * @returns elevation angle in radians
   * @see https://www.pveducation.org/pvcdrom/properties-of-sunlight/elevation-angle
   * tested = true
   */
  public elevationAngle(dayOfYear: number, elapsedMinutes: number): number {
    const deg2Rad = this.deg2Rad;
    const solarDeclination = this.alternateSolarDeclination(dayOfYear);
    const HRA = this.hourAngle(dayOfYear, elapsedMinutes);

    return Math.asin(
      Math.sin(deg2Rad * solarDeclination) * Math.sin(deg2Rad * this.position.lat) +
        Math.cos(deg2Rad * solarDeclination) *
          Math.cos(deg2Rad * this.position.lat) *
          Math.cos(deg2Rad * HRA),
    );
  }

  /**
   *
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @param elapsedMinutes - the number of minutes elapsed on the day to calcualate value for
   * @returns zenith angle in radians
   * @see https://www.pveducation.org/pvcdrom/properties-of-sunlight/elevation-angle
   */
  public zenithAngle(dayOfYear: number, elapsedMinutes: number): number {
    return Math.PI / 2 - this.elevationAngle(dayOfYear, elapsedMinutes);
  }

  /**
   *
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @param elapsedMinutes - the number of minutes elapsed on the day to calcualate value for
   * @returns  azimuthAngle in radians
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/azimuth-angle}
   * tested = true
   */
  public azimuthAngle(dayOfYear: number, elapsedMinutes: number): number {
    const deg2Rad = this.deg2Rad;
    const solarDeclination = this.alternateSolarDeclination(dayOfYear);
    const HRA = this.hourAngle(dayOfYear, elapsedMinutes);

    const az = Math.acos(
      (Math.sin(deg2Rad * solarDeclination) * Math.cos(deg2Rad * this.position.lat) -
        Math.cos(deg2Rad * solarDeclination) *
          Math.sin(deg2Rad * this.position.lat) *
          Math.cos(deg2Rad * HRA)) /
        Math.cos(this.elevationAngle(dayOfYear, elapsedMinutes)),
    );

    return HRA > 0 ? 2 * Math.PI - az : az;
  }
}

export default SolarCalculator;
