import { differenceInDays } from 'date-fns';
import { LatLngLiteral } from 'leaflet';

class SolarCalculator {
  private baselineReferenceJD = 2415020;

  private baselineReferenceDate = new Date('January 1, 1900');

  private position: LatLngLiteral;

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
    return Math.ceil(position.lng / 15);
  }

  /**
   *
   * @param {number} numDays the number of days as a decimal value
   * @returns {string} string representing the time of day in the format 'hh:mm:ss'
   */
  static convertDaysToTimeString(numDays: number): string {
    // account for roll over time where dayFraction > 1
    const singleDayFraction = numDays % 1;

    const hours = singleDayFraction * 24;
    const truncatedHours = Math.trunc(hours);

    const minutes = (hours - truncatedHours) * 60;
    const truncatedMinutes = Math.trunc(minutes);

    const seconds = (minutes - truncatedMinutes) * 60;
    const truncatedSeconds = Math.trunc(seconds);

    const hh =
      truncatedHours.toString().length === 1 ? `0${truncatedHours}` : truncatedHours;
    const mm =
      truncatedMinutes.toString().length === 1
        ? `0${truncatedMinutes}`
        : truncatedMinutes;
    const ss =
      truncatedSeconds.toString().length === 1
        ? `0${truncatedSeconds}`
        : truncatedSeconds;

    return `${hh}:${mm}:${ss}`;
  }

  /**
   *
   * @param {Date} date
   * @returns {number} the Julian Day using DublinJD reference date epoch of December 31, 1899, 12:00.
   * The Julian Day is the total number of days since the beginning of Julian Epoch.
   * https://en.wikipedia.org/wiki/Julian_day
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
   */
  private julianCentury(julianDay: number): number {
    return (julianDay - 2451545) / 36525;
  }

  /**
   * @param {number} julianCentury
   * @returns {number} the mean longitude of the Sun in degrees.
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
   */
  private meanLongitudeOfSun(julianCentury: number): number {
    return (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) % 360;
  }

  /**
   * @param {number} julianCentury
   * @returns {number} the mean anomaly of the Sun in degrees.
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
   */
  private meanAnomalyOfSun(julianCentury: number): number {
    return 357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);
  }

  /**
   * @param {number} julianCentury
   * @returns {number} orbital eccentricity of Earth, a unitless value.
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
   */
  private orbitalEccentricityOfEarth(julianCentury: number): number {
    return 0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury);
  }

  /**
   * @param {number} julianCentury
   * @returns {number} mean ecliptic obliquity of Earth's orbit in degrees.
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
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
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
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
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
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
   * https://en.wikipedia.org/wiki/Equation_of_time
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
   * https://en.wikipedia.org/wiki/Equation_of_the_center
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
}

export default SolarCalculator;
