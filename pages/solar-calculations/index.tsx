import {
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { isLeapYear, startOfYear } from 'date-fns';
import SolarCalculator from 'lib/solar-calculator';
import useStore from 'lib/store';
import { getChartLabels } from 'lib/utils';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type StaticProps = {
  labelsYear: string[];
  labelsLeapYear: string[];
};

export function getStaticProps() {
  const { labelsYear, labelsLeapYear } = getChartLabels();
  return {
    props: {
      labelsYear,
      labelsLeapYear,
    },
  };
}

const now = new Date();
const startYear = now.getUTCFullYear();
const selectYearOptions = new Array(11).fill(null).map((_, i) => -5 + i + startYear);

const SolarCalculations = ({ labelsYear, labelsLeapYear }: StaticProps) => {
  const { position } = useStore((state) => state);

  const [startDate, setStartDate] = useState(startOfYear(now));

  const [solarNoonData, setSolarNoonData] = useState([]);
  const [equationOfTimeData, setEquationOfTimeData] = useState([]);
  const [solarDeclinationData, setSolarDeclinationData] = useState([]);

  const labels = isLeapYear(startDate) ? labelsLeapYear : labelsYear;

  useEffect(() => {
    if (!position) return;

    fetch(
      '/api/solar-chart-data' +
        `?year=${startDate.getUTCFullYear()}&lat=${position.lat}&lng=${position.lng}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setSolarNoonData(data.solarNoonData);
        setEquationOfTimeData(data.equationOfTimeData);
        setSolarDeclinationData(data.solarDeclinationData);
      });
  }, [startDate, position]);

  const solarNoonOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Time of Solar Noon (hh:mm:ss) - ${startDate.getUTCFullYear()}`,
      },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            return SolarCalculator.convertDaysToTimeString(ctx.parsed.y);
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (v) {
            if (typeof v === 'string') v = parseInt(v);
            return SolarCalculator.convertDaysToTimeString(v);
          },
        },
      },
    },
  };

  const _solarNoonData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Time of Solar Noon',
        data: solarNoonData,
      },
    ],
  };

  const equationOfTimeOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Equation of Time (minutes) - ${startDate.getUTCFullYear()}`,
      },
    },
  };

  const _equationOfTimeData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Equation of Time',
        data: equationOfTimeData,
      },
    ],
  };

  const solarDeclinationOptions: ChartOptions<'line'> = {
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
  };

  const _solarDeclinationData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Solar Declination Angle',
        data: solarDeclinationData,
      },
    ],
  };

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
        <Line options={solarNoonOptions} data={_solarNoonData} />
        <Line options={equationOfTimeOptions} data={_equationOfTimeData} />
        <Line options={solarDeclinationOptions} data={_solarDeclinationData} />
      </div>
    );
  }

  return <p>No position selected.</p>;
};

export default SolarCalculations;
