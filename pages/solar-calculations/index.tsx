import { differenceInDays } from 'date-fns'
import type { LatLngTuple } from 'leaflet'

const testData = [51.51, -0.06] as LatLngTuple

// approximation
function calculateUTCOffset(position: LatLngTuple): number {
  return Math.ceil(position[1] / 15)
}

// Dublin JD
// https://en.wikipedia.org/wiki/Julian_day
function julianDay(
  date: Date,
  baselineReferenceDate = new Date('January 1, 1900'),
  UTCOffset = 0
): number {
  const baselineReferenceJD = 2415020

  const deltaDays = differenceInDays(date, baselineReferenceDate)

  return (
    baselineReferenceJD + deltaDays + 0.5 + (date.getHours() + UTCOffset) / 24
  )
}

function julianCentury(julianDay: number): number {
  return (julianDay - 2451545) / 36525
}
// https://en.wikipedia.org/wiki/Position_of_the_Sun
function meanLongitudeOfSun(julianCentury: number): number {
  return (
    (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) %
    360
  )
}

function meanAnomalyOfSun(julianCentury: number): number {
  return 357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury)
}

function orbitalEccentricityOfEarth(julianCentury: number): number {
  return (
    0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury)
  )
}

function meanEclipticObliquity(julianCentury: number): number {
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

function obliquityCorrection(
  meanEclipticObliquity: number,
  julianCentury: number
): number {
  return (
    meanEclipticObliquity +
    0.00256 * Math.cos((Math.PI / 180) * (125.04 - 1934.136 * julianCentury))
  )
}

function variationY(obliquityCorrection: number): number {
  return (
    Math.tan((Math.PI / 180) * (obliquityCorrection / 2)) *
    Math.tan((Math.PI / 180) * (obliquityCorrection / 2))
  )
}

function equationOfTime(
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

const utcOffset = calculateUTCOffset(testData)

const referenceDate = new Date('January 1, 2020')

const baselineReferenceDate = new Date('January 1, 1900')

const JD = julianDay(referenceDate, baselineReferenceDate, utcOffset)

const JC = julianCentury(JD)

const meanLong = meanLongitudeOfSun(JC)

const meanAnom = meanAnomalyOfSun(JC)

const orbitalEccentricity = orbitalEccentricityOfEarth(JC)

const eclipticObliquity = meanEclipticObliquity(JC)

const correction = obliquityCorrection(eclipticObliquity, JC)

const _variationY = variationY(correction)

const _equationOfTime = equationOfTime(
  meanLong,
  meanAnom,
  orbitalEccentricity,
  _variationY
)

const SolarCalculations = () => {
  return (
    <div>
      <p>data: {testData}</p>
      <p>UTC Offset: {utcOffset}</p>
      <p>Julian Day: {JD}</p>
      <p>Mean Longitude of Sun: {meanLong}</p>
      <p>Mean Anomaly of Sun: {meanAnom}</p>
      <p>Orbital Eccentricity: {orbitalEccentricity}</p>
      <p>Mean Ecliptic Obliquity: {eclipticObliquity}</p>
      <p>Obliquity Correction: {correction}</p>
      <p>Variation Y: {_variationY}</p>
      <p>Equation of Time (minutes): {_equationOfTime}</p>
    </div>
  )
}

export default SolarCalculations
