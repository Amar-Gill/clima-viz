import type { LatLngTuple } from 'leaflet'
import SolarCalculator from '../../utils/solar-calculator'

const testData = [51.51, -0.06] as LatLngTuple

const calculator = new SolarCalculator(testData)

const equationOfTime = calculator.calculateEquationOfTime(new Date())

const SolarCalculations = () => {
  return (
    <div>
      <p>data: {testData}</p>
      <p>equationOfTime: {equationOfTime}</p>
    </div>
  )
}

export default SolarCalculations
