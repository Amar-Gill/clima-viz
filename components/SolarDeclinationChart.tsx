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
  const labels = arrayYear.map((v, i) => i + 1)
  if (isLeapYear(startDate)) labels.push(366)

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
    labels,
    datasets: [
      {
        label: 'Solar Declination Angle',
        data: labels.map((v, i) =>
          calculator.calculateSolarDeclination(addDays(startDate, i - 1))
        ),
      },
    ],
  }
  return <Line options={options} data={data} />
}

export default SolarDeclinationChart
