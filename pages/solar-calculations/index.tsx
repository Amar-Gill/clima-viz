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
import { useState } from 'react'

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
const startYear = now.getUTCFullYear()
const options = new Array(11).fill(null).map((_, i) => -5 + i + startYear)

const SolarCalculations = () => {
  const { position } = useStore((state) => state)
  const [startDate, setStartDate] = useState(startOfYear(now))

  const calculator = position ? new SolarCalculator(position) : null

  return (
    <div>
      <p>Position: {position?.toString()}</p>
      <label htmlFor="select-year">Select Year: </label>
      <select
        id="select-year"
        defaultValue={startYear}
        onChange={(e) => setStartDate(new Date(`${e.target.value}-01-01`))}
      >
        {options.map((v) => (
          <option value={v} key={v}>
            {v}
          </option>
        ))}
      </select>
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
