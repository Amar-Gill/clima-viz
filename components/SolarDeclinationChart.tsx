import { addDays, isLeapYear } from 'date-fns'
import { Line } from 'react-chartjs-2'
import SolarCalculator from '../utils/solar-calculator'

const arrayYear = new Array(365).fill(null)

type SolarDeclinationChartProps = {
  calculator: SolarCalculator
  startDate: Date
}

const SolarDeclinationChart = ({
  calculator,
  startDate,
}: SolarDeclinationChartProps) => {
  if (isLeapYear(startDate)) arrayYear.push(null)

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Solar Declination Angle (degrees) - ${startDate.getUTCFullYear()}`,
      },
    },
  }

  const data = {
    labels: arrayYear.map((v, i) => i),
    datasets: [
      {
        label: 'Solar Declination Angle',
        data: arrayYear.map((v, i) =>
          calculator.calculateSolarDeclination(addDays(startDate, i))
        ),
      },
    ],
  }
  return <Line options={options} data={data} />
}

export default SolarDeclinationChart
