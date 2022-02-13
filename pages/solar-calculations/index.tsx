import type { LatLngTuple } from 'leaflet'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const testData = [51.51, -0.06] as LatLngTuple

const calculator = new SolarCalculator(testData)

const now = new Date()

const currentYear = now.getUTCFullYear()

const startDate = new Date(`January 1, ${currentYear}`)

// to do handle leapyears
const arrayYear = new Array(365).fill(null)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: `Solar Declination Angle - ${currentYear}`,
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

const SolarCalculations = () => {
  return (
    <div>
      <p>data: {testData}</p>
      <Line options={options} data={data} />
    </div>
  )
}

export default SolarCalculations
