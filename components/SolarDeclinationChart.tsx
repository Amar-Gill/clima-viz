import { addDays, isLeapYear } from 'date-fns'
import { Line } from 'react-chartjs-2'
import SolarCalculator from '../utils/solar-calculator'

const nullArray = new Array(365).fill(null)

type SolarDeclinationChartProps = {
  calculator: SolarCalculator
  startDate: Date
}

const SolarDeclinationChart = ({
  calculator,
  startDate,
}: SolarDeclinationChartProps) => {
  const arrayYear = nullArray.map((_, i) => i)
  if (isLeapYear(startDate)) arrayYear.push(365)

  const arrayDates = arrayYear.map((v) => addDays(startDate, v))

  const labels = arrayDates.map((date) => {
    const a = date.toDateString().split(' ')
    return `${a[1]}-${a[2]}`
  })

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
        data: arrayDates.map((date) =>
          calculator.calculateSolarDeclination(date)
        ),
      },
    ],
  }
  return <Line options={options} data={data} />
}

export default SolarDeclinationChart
