import { differenceInDays } from 'date-fns'
import type { LatLngTuple } from 'leaflet'

class SolarCalculator {
  private baselineReferenceJD = 2415020

  private baselineReferenceDate = new Date('January 1, 1900')

  private position: LatLngTuple

  constructor(position: LatLngTuple) {
    this.position = position
  }

  /**
   * calculateUTCOffset
   * is an approximation
   */
  private calculateUTCOffset(position: LatLngTuple): number {
    return Math.ceil(position[1] / 15)
  }

  /**
   * julianDay
   * returns the Dublin Julian Day with baseline reference date of December 31, 1899, 12:00
   * https://en.wikipedia.org/wiki/Julian_day
   */
  private julianDay(date: Date): number {
    const UTCOffset = this.calculateUTCOffset(this.position)

    const deltaDays = differenceInDays(date, this.baselineReferenceDate)

    return (
      this.baselineReferenceJD +
      deltaDays +
      0.5 +
      (date.getHours() + UTCOffset) / 24
    )
  }

  /**
   * julianCentury
   */
  private julianCentury(julianDay: number): number {
    return (julianDay - 2451545) / 36525
  }

  /**
   * meanLongtitudeOfSun
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
   */
  private meanLongitudeOfSun(julianCentury: number): number {
    return (
      (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) %
      360
    )
  }

  /**
   * meanAnomalyOfSun
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
   */
  private meanAnomalyOfSun(julianCentury: number): number {
    return 357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury)
  }

  /**
   * orbitalEccentricityOfEarth
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
   */
  private orbitalEccentricityOfEarth(julianCentury: number): number {
    return (
      0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury)
    )
  }

  /**
   * meanEclipticObliquity
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
    )
  }

  /**
   * obliquityCorrection
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
   */
  private obliquityCorrection(
    meanEclipticObliquity: number,
    julianCentury: number
  ): number {
    return (
      meanEclipticObliquity +
      0.00256 * Math.cos((Math.PI / 180) * (125.04 - 1934.136 * julianCentury))
    )
  }

  /**
   * variationY
   * https://en.wikipedia.org/wiki/Position_of_the_Sun
   */
  private variationY(obliquityCorrection: number): number {
    return (
      Math.tan((Math.PI / 180) * (obliquityCorrection / 2)) *
      Math.tan((Math.PI / 180) * (obliquityCorrection / 2))
    )
  }

  /**
   * equationOfTime
   * https://en.wikipedia.org/wiki/Equation_of_time
   */
  private equationOfTime(
    meanLongitudeOfSun: number,
    meanAnomalyOfSun: number,
    orbitalEccentricityOfEarth: number,
    variationY: number
  ): number {
    return (
      4 *
      (180 / Math.PI) *
      (variationY * Math.sin(2 * (Math.PI / 180) * meanLongitudeOfSun) -
        2 *
          orbitalEccentricityOfEarth *
          Math.sin((Math.PI / 180) * meanAnomalyOfSun) +
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
    )
  }

  /**
   *
   * @param julianCentury
   * @param meanAnomalyOfSun
   * @returns equation of center between sun and earth
   * https://en.wikipedia.org/wiki/Equation_of_the_center
   */
  private equationOfCenter(
    julianCentury: number,
    meanAnomalyOfSun: number
  ): number {
    return (
      Math.sin((Math.PI / 180) * meanAnomalyOfSun) *
        (1.914602 - julianCentury * (0.004817 + 0.000014 * julianCentury)) +
      Math.sin((Math.PI / 180) * (2 * meanAnomalyOfSun)) *
        (0.019993 - 0.000101 * julianCentury) +
      Math.sin((Math.PI / 180) * (3 * meanAnomalyOfSun)) * 0.000289
    )
  }

  /**
   * calculateEquationOfTime
   * Returns the equation of time in minutes for the given date at a specific position
   * https://en.wikipedia.org/wiki/Equation_of_time
   */
  public calculateEquationOfTime(date: Date) {
    const JD = this.julianDay(date)

    const JC = this.julianCentury(JD)

    const meanLong = this.meanLongitudeOfSun(JC)

    const meanAnom = this.meanAnomalyOfSun(JC)

    const orbitalEccentricity = this.orbitalEccentricityOfEarth(JC)

    const obliquity = this.meanEclipticObliquity(JC)

    const correctedObliquity = this.obliquityCorrection(obliquity, JC)

    const varY = this.variationY(correctedObliquity)

    return this.equationOfTime(meanLong, meanAnom, orbitalEccentricity, varY)
  }
}

export default SolarCalculator
