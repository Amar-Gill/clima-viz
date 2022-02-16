import { Line } from 'react-chartjs-2'
import SolarCalculator from '../../utils/solar-calculator'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { addDays } from 'date-fns'
import useStore from '../../utils/store'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const now = new Date()

const currentYear = now.getUTCFullYear()

const startDate = new Date(`January 1, ${currentYear}`)

// to do handle leapyears
const arrayYear = new Array(365).fill(null)

const solarDeclinationOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: `Solar Declination Angle (degrees) - ${currentYear}`,
    },
  },
}

const equationOfTimeOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: `Equation of Time (minutes) - ${currentYear}`,
    },
  },
}

const SolarCalculations = () => {
  const { position } = useStore((state) => state)

  const calculator = new SolarCalculator(position)

  const solarDeclinationData = {
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

  const equationOfTimeData = {
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

  return (
    <div>
      <p>data: {position?.toString()}</p>
      <Line options={solarDeclinationOptions} data={solarDeclinationData} />
      <Line options={equationOfTimeOptions} data={equationOfTimeData} />
    </div>
  )
}

export default SolarCalculations
