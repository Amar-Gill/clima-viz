import type { LatLngLiteral } from 'leaflet';

import { calculateUTCOffsetForLng } from './utils';

class SolarPositionCalculator {
  private position: LatLngLiteral;

  private deg2Rad = Math.PI / 180;

  private rad2Deg = 180 / Math.PI;

  private radPerDay = (2 * Math.PI) / 365;

  private UTCOffset: number;

  constructor(position: LatLngLiteral) {
    this.position = position;
    this.UTCOffset = calculateUTCOffsetForLng(position.lng);
  }

  /**
   * Context of a single day equations
   */

  /**
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @returns number representing equation of time in minutes
   * @description simplified equation for EOT
   */
  public alternateEquationOfTime(dayOfYear: number): number {
    const B = this.radPerDay * (dayOfYear - 81); // first term is radians / day the earth orbits around sun
    return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  }

  /**
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @param elapsedMinutes - the number of minutes elapsed on the day to calcualate value for
   * @param UTCOffset - number between -14 - 14 representing the timezone of the location
   * @returns converts given date into local solar time in number of hours, takes into account position
   * decimal fraction represents the fraction of an hour
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   */
  public localSolarTime(
    dayOfYear: number,
    elapsedMinutes: number,
    UTCOffset = this.UTCOffset,
  ): number {
    const localSolarTimeMeridian = 15 * UTCOffset;

    const timeCorrection =
      4 * (this.position.lng - localSolarTimeMeridian) +
      this.alternateEquationOfTime(dayOfYear);

    return (elapsedMinutes + timeCorrection) / 60;
  }

  /**
   *
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @param elapsedMinutes - the number of minutes elapsed on the day to calcualate value for
   * @param UTCOffset - number between -14 - 14 representing the timezone of the location
   * @returns hour angle in degrees
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   */
  public hourAngle(
    dayOfYear: number,
    elapsedMinutes: number,
    UTCOffset = this.UTCOffset,
  ): number {
    return 15 * (this.localSolarTime(dayOfYear, elapsedMinutes, UTCOffset) - 12);
  }

  /**
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @returns solar declination in degrees
   * {@link https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position}
   */
  public alternateSolarDeclination(dayOfYear: number): number {
    return 23.45 * Math.sin(this.radPerDay * (dayOfYear - 81));
  }

  /**
   * @param dayOfYear - the number between 1-366 representing which day of the year to calculate value for
   * @param elapsedMinutes - the number of minutes elapsed on the day to calcualate value for
   * @returns elevation angle in radians
   * @see https://www.pveducation.org/pvcdrom/properties-of-sunlight/elevation-angle
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

  /**
   * @param dayOfYear - number between 1-366 representing what day of the year to calculate value for
   * @param elapsedMinutes - number between 0 - 1440 representing exact time of day to calculate value for
   * @param UTCOffset - number between -14 - 14 representing the timezone or timezone offset from UTC greenwich time
   * @returns object containing solar position angles (elevation, zenith, azimuth)
   */
  public solarPosition(
    dayOfYear: number,
    elapsedMinutes: number,
    UTCOffset = this.UTCOffset,
  ) {
    const deg2Rad = this.deg2Rad;
    const solarDeclination = this.alternateSolarDeclination(dayOfYear);
    const HRA = this.hourAngle(dayOfYear, elapsedMinutes, UTCOffset);

    const elevation = Math.asin(
      Math.sin(deg2Rad * solarDeclination) * Math.sin(deg2Rad * this.position.lat) +
        Math.cos(deg2Rad * solarDeclination) *
          Math.cos(deg2Rad * this.position.lat) *
          Math.cos(deg2Rad * HRA),
    );

    const zenith = Math.PI / 2 - elevation;

    const az = Math.acos(
      (Math.sin(deg2Rad * solarDeclination) * Math.cos(deg2Rad * this.position.lat) -
        Math.cos(deg2Rad * solarDeclination) *
          Math.sin(deg2Rad * this.position.lat) *
          Math.cos(deg2Rad * HRA)) /
        Math.cos(elevation),
    );

    return {
      elevation,
      zenith,
      azimuth: HRA > 0 ? 2 * Math.PI - az : az,
    };
  }
}

export default SolarPositionCalculator;
