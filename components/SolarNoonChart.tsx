import { addDays, isLeapYear } from 'date-fns';
import SolarCalculator from 'lib/solar-calculator';
import { Line } from 'react-chartjs-2';

const nullArray = new Array(365).fill(null);

type SolarNoonChartProps = {
  calculator: SolarCalculator;
  startDate: Date;
};

const SolarNoonChart = ({ calculator, startDate }: SolarNoonChartProps) => {
  const arrayYear = nullArray.map((_, i) => i);
  if (isLeapYear(startDate)) arrayYear.push(365);

  const arrayDates = arrayYear.map((v) => addDays(startDate, v));

  const labels = arrayDates.map((date) => {
    const a = date.toDateString().split(' ');
    return `${a[1]}-${a[2]}`;
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Time of Solar Noon (day fraction) - ${startDate.getUTCFullYear()}`,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Solar Noon',
        data: arrayDates.map((date) => calculator.calculateSolarNoon(date)),
      },
    ],
  };
  return <Line options={options} data={data} />;
};

export default SolarNoonChart;
