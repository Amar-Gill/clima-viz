import { addDays, isLeapYear } from 'date-fns'
import { Line } from 'react-chartjs-2'
import SolarCalculator from '../utils/solar-calculator'

const arrayYear = new Array(365).fill(null)

type SolarNoonChartProps = {
  calculator: SolarCalculator
  startDate: Date
}

const SolarNoonChart = ({ calculator, startDate }: SolarNoonChartProps) => {
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
        text: `Time of Solar Noon (day fraction) - ${startDate.getUTCFullYear()}`,
      },
    },
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Solar Noon',
        data: labels.map((v, i) =>
          calculator.calculateSolarNoon(addDays(startDate, i - 1))
        ),
      },
    ],
  }
  return <Line options={options} data={data} />
}

export default SolarNoonChart
