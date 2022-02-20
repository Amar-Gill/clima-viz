import { ChartData, ChartOptions } from 'chart.js';
import { addDays, isLeapYear } from 'date-fns';
import SolarCalculator from 'lib/solar-calculator';
import { Line } from 'react-chartjs-2';

const nullArray = new Array(365).fill(null);

type EquationOfTimeChartProps = {
  calculator: SolarCalculator;
  startDate: Date;
};

const EquationOfTimeChart = ({ calculator, startDate }: EquationOfTimeChartProps) => {
  const arrayYear = nullArray.map((_, i) => i);
  if (isLeapYear(startDate)) arrayYear.push(365);

  const arrayDates = arrayYear.map((v) => addDays(startDate, v));

  const labels = arrayDates.map((date) => {
    const a = date.toDateString().split(' ');
    return `${a[1]}-${a[2]}`;
  });

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Equation of Time (minutes) - ${startDate.getUTCFullYear()}`,
      },
    },
  };

  const data: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Equation of Time',
        data: arrayDates.map((date) => calculator.calculateEquationOfTime(date)),
      },
    ],
  };
  return <Line options={options} data={data} />;
};

export default EquationOfTimeChart;
