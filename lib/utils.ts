import { addDays, isLeapYear, startOfYear } from 'date-fns';

/**
 *
 * @param {number} year the year to evaluate in the form YYYY
 * @returns an array of Date objects for each day of the year starting from Jan 1.
 * This functions handles leap years.
 */
export function getDaysOfYear(year: number): Date[] {
  const startDate = startOfYear(new Date().setUTCFullYear(year));

  const numDays = isLeapYear(startDate) ? 366 : 365;

  const daysOfYear = new Array(numDays).fill(null).map((_, i) => addDays(startDate, i));

  return daysOfYear;
}

/**
 * @returns two arrays representing the chart labels of a normal year and leap in the form 'mmm-dd'
 */
export function getChartLabels() {
  const daysOfYear = getDaysOfYear(2021);
  const daysOfLeapYear = getDaysOfYear(2020);

  const labelsYear = daysOfYear.map((date) => {
    const a = date.toDateString().split(' ');
    return `${a[1]}-${a[2]}`;
  });

  const labelsLeapYear = daysOfLeapYear.map((date) => {
    const a = date.toDateString().split(' ');
    return `${a[1]}-${a[2]}`;
  });

  return {
    labelsYear,
    labelsLeapYear,
  };
}

/**
 *
 * @param {number} numDays the number of days as a decimal value
 * @returns {string} string representing the time of day in the format 'hh:mm:ss'
 */
export function convertDaysToTimeString(numDays: number): string {
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
    truncatedMinutes.toString().length === 1 ? `0${truncatedMinutes}` : truncatedMinutes;
  const ss =
    truncatedSeconds.toString().length === 1 ? `0${truncatedSeconds}` : truncatedSeconds;

  return `${hh}:${mm}:${ss}`;
}

/**
 *
 * @param date
 * @param tzString
 * @returns {Date}
 * {@link https://stackoverflow.com/questions/10087819/convert-date-to-another-timezone-in-javascript}
 */
export function convertTZ(date: Date, tzString: string) {
  return new Date(
    (typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', {
      timeZone: tzString,
    }),
  );
}
