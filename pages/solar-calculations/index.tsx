import type { LatLngTuple } from 'leaflet'
import SolarCalculator from '../../utils/solar-calculator'

const testData = [51.51, -0.06] as LatLngTuple

const calculator = new SolarCalculator(testData)

const now = new Date()

const equationOfTime = calculator.calculateEquationOfTime(now)

const solarDeclination = calculator.calculateSolarDeclination(now)

const SolarCalculations = () => {
  return (
    <div>
      <p>data: {testData}</p>
      <p>equationOfTime: {equationOfTime}</p>
      <p>solarDeclination: {solarDeclination}</p>
    </div>
  )
}

export default SolarCalculations
