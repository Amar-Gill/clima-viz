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
