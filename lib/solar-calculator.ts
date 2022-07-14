import { differenceInDays, getDayOfYear } from 'date-fns';
import type { LatLngLiteral } from 'leaflet';
class SolarCalculator {
  private baselineReferenceJD = 2415020;

  private baselineReferenceDate = new Date('January 1, 1900');

  private position: LatLngLiteral;

  private deg2Rad = Math.PI / 180;

  private rad2Deg = 180 / Math.PI;

  constructor(position: LatLngLiteral) {
    this.position = position;
  }

  /**
   *
   * @param {LatLng} position The Leaflet js position associated with the calculator instance
   * @returns {number} number between -14 and 14
   * which is an approximate UTC offset based on position.
   */
  public calculateUTCOffset(position = this.position): number {
    return Math.round(position.lng / 15);
  }

  /**
   *
   * @param {Date} date
   * @returns {number} the Julian Day using DublinJD reference date epoch of December 31, 1899, 12:00.
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
   * @param {number} julianDay
   * @returns {number} the Julian Century based on the Julian Day.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   */
  private julianCentury(julianDay: number): number {
    return (julianDay - 2451545) / 36525;
  }

  /**
   * @param {number} julianCentury
   * @returns {number} the mean longitude of the Sun in degrees.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   * {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
   */
  private meanLongitudeOfSun(julianCentury: number): number {
    return (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) % 360;
  }

  /**
   * @param {number} julianCentury
   * @returns {number} the mean anomaly of the Sun in degrees.
   * {@link https://gml.noaa.gov/grad/solcalc/}
   * {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
   */
  private meanAnomalyOfSun(julianCentury: number): number {
    return 357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);
  }

  /**
   * @param {number} julianCentury
   * @returns {number} orbital eccentricity of Earth, a unitless value.
   * {@link https://en.wikipedia.org/wiki/Position_of_the_Sun}
   */
  private orbitalEccentricityOfEarth(julianCentury: number): number {
    return 0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury);
  }

  /**
   * @param {number} julianCentury
   * @returns {number} mean ecliptic obliquity of Earth's orbit in degrees.
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
   * @param {number} meanEclipticObliquity
   * @param {number} julianCentury
   * @returns {number} corrected ecliptic obliquity of Earth's orbit in degrees.
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
   * @param {number} correctedObliquity
   * @returns {number} returns a unitless variation value in obliquity.
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
   * @param {number} meanLongitudeOfSun
   * @param {number} meanAnomalyOfSun
   * @param {number} orbitalEccentricityOfEarth
   * @param {number} variationY
   * @returns {number} change in minutes of the time of solar noon.
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
   * @returns {number} the angular difference between the actual position Earth in its elliptical orbit
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
   * @param {number} meanLongitudeOfSun
   * @param {number} equationOfCenter
   * @returns {number} true longitude of the Sun in degrees.
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
   * @param {number} julianCentury
   * @param {number} trueLongitudeOfSun
   * @returns {number} apparent longitude of the Sun in degrees.
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
   * @param {number} apparentLongitudeOfSun
   * @param {number} correctedObliquity
   * @returns {number} the declination of the sun in degrees. The solar declination varies from -23.44° at the (northern hemisphere) winter solstice,
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
   * @param {number} latitude - number representing latitudinal position to assess.
   * @param {number} solarDeclination - solar declination angle in degrees.
   * @returns {number} returns the hour angle at sunrise in degrees.
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
   * @param {number} hourAngleSunrise hour angle at sunrise in degrees.
   * @param {number} solarNoon time of solar noon as a fraction of a day. 0 - 1.
   * @returns {number} time of sunrise as a fraction of a day. 0 -1.
   */
  private sunriseTime(hourAngleSunrise: number, solarNoon: number) {
    return (solarNoon * 1440 - hourAngleSunrise * 4) / 1440;
  }

  /**
   *
   * @param {number} hourAngleSunrise hour angle at sunrise in degrees.
   * @param {number} solarNoon time of solar noon as a fraction of a day. 0 - 1.
   * @returns {number} time of sunset as a fraction of a day. 0 - 1.
   */
  private sunsetTime(hourAngleSunrise: number, solarNoon: number) {
    return (solarNoon * 1440 + hourAngleSunrise * 4) / 1440;
  }

  /**
   *
   * @param {Date} date the Date to calculate times for.
   * @returns {Object} object containing sunrise and sunset times as day fractions. 0 - 1.
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
   * @param {Date} date date to calculate solar noon at
   * @returns {number} time of day where solar noon occurs, as floating point number representing fraction of a day
   */
  public calculateSolarNoon(date: Date) {
    const eqnOfTime = this.calculateEquationOfTime(date);

    return (
      (720 - 4 * this.position.lng - eqnOfTime + this.calculateUTCOffset() * 60) / 1440
    );
  }

  /**
   * @param {Date} date
   * @returns {number} the equation of time in minutes for the given date and position.
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
   * @param {Date} date
   * @returns {number} the solar declination of the Sun in degrees for the given date and position.
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
   * @param {Date} date
   * @returns {number} the maximum elevation of the sun for a given date and position.
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
   * @param {Date} date
   * @returns {number} converts given date into local solar time in number of hours, takes into account position
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   */
  public localSolarTime(date: Date): number {
    const localSolarTimeMeridian = 15 * this.calculateUTCOffset();

    const timeCorrection =
      4 * (this.position.lng - localSolarTimeMeridian) +
      this.calculateEquationOfTime(date);

    return date.getHours() + (timeCorrection + date.getMinutes()) / 60;
  }

  /**
   *
   * @param {Date} date
   * @returns {number} hour angle in degrees
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   */
  public hourAngle(date: Date): number {
    return 15 * (this.localSolarTime(date) - 12);
  }

  /**
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   */
  private alternativeSolarDeclination() {
    // TODO
  }

  /**
   * @param {Date} date
   * @returns {number} elevation angle in degrees
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   */
  public elevationAngle(date: Date): number {
    const deg2Rad = this.deg2Rad;
    const solarDeclination = this.calculateSolarDeclination(date);
    const HRA = this.hourAngle(date);

    return (
      this.rad2Deg *
      Math.asin(
        Math.sin(deg2Rad * solarDeclination) * Math.sin(deg2Rad * this.position.lat) +
          Math.cos(deg2Rad * solarDeclination) *
            Math.cos(deg2Rad * this.position.lat) *
            Math.cos(deg2Rad * HRA),
      )
    );
  }

  /**
   *
   * @param {Date} date
   * @returns {number} azimuthAngle (degrees)
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/azimuth-angle}
   */
  public azimuthAngle(date: Date): number {
    const solarDeclination = this.calculateSolarDeclination(date);

    // TODO
    return (
      1 /
      Math.cos(
        (Math.sin(solarDeclination) * Math.cos(this.position.lat) -
          solarDeclination * 1) /
          Math.cos(this.calculateMaxSolarElevationAngle(date)),
      )
    );
  }
}

export default SolarCalculator;
