import { addDays, isLeapYear } from 'date-fns'
import { Line } from 'react-chartjs-2'
import SolarCalculator from '../utils/solar-calculator'

const arrayYear = new Array(365).fill(null)

type EquationOfTimeChartProps = {
  calculator: SolarCalculator
  startDate: Date
}

const EquationOfTimeChart = ({
  calculator,
  startDate,
}: EquationOfTimeChartProps) => {
  if (isLeapYear(startDate)) arrayYear.push(null)

  const options = {
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
  }

  const data = {
    labels: arrayYear.map((v, i) => i),
    datasets: [
      {
        label: 'Equation of Time',
        data: arrayYear.map((v, i) =>
          calculator.calculateEquationOfTime(addDays(startDate, i))
        ),
      },
    ],
  }
  return <Line options={options} data={data} />
}

export default EquationOfTimeChart
