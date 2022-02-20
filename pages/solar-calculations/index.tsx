import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import EquationOfTimeChart from 'components/EquationOfTimeChart';
import SolarDeclinationChart from 'components/SolarDeclinationChart';
import SolarNoonChart from 'components/SolarNoonChart';
import { startOfYear } from 'date-fns';
import SolarCalculator from 'lib/solar-calculator';
import useStore from 'lib/store';
import { useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const now = new Date();
const startYear = now.getUTCFullYear();
const selectYearOptions = new Array(11).fill(null).map((_, i) => -5 + i + startYear);

const SolarCalculations = () => {
  const { position } = useStore((state) => state);
  const [startDate, setStartDate] = useState(startOfYear(now));

  if (position) {
    const calculator = new SolarCalculator(position);
    const UTCOffset = calculator.calculateUTCOffset();

    return (
      <div>
        <p>Position: {position.toString()}</p>
        <p>UTC Offset: {UTCOffset} hours</p>
        <label htmlFor="select-year">Select Year: </label>
        <select
          id="select-year"
          defaultValue={startYear}
          onChange={(e) => setStartDate(new Date(parseInt(e.target.value), 0, 1))}>
          {selectYearOptions.map((v) => (
            <option value={v} key={v}>
              {v}
            </option>
          ))}
        </select>
        <br />
        <SolarNoonChart calculator={calculator} startDate={startDate} />
        <br />
        <EquationOfTimeChart calculator={calculator} startDate={startDate} />
        <br />
        <SolarDeclinationChart calculator={calculator} startDate={startDate} />
      </div>
    );
  }

  return <p>No position selected.</p>;
};

export default SolarCalculations;
