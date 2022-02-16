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
import useStore from '../../utils/store'
import SolarDeclinationChart from '../../components/SolarDeclinationChart'
import EquationOfTimeChart from '../../components/EquationOfTimeChart'
import { startOfYear } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const startDate = startOfYear(new Date())

const SolarCalculations = () => {
  const { position } = useStore((state) => state)

  const calculator = position ? new SolarCalculator(position) : null

  return (
    <div>
      <p>data: {position?.toString()}</p>
      {calculator && (
        <>
          <SolarDeclinationChart
            calculator={calculator}
            startDate={startDate}
          />
          <EquationOfTimeChart calculator={calculator} startDate={startDate} />
        </>
      )}
    </div>
  )
}

export default SolarCalculations
