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
import Head from 'next/head';
import Link from 'next/link';
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
  const [sunriseTimeData, setSunriseTimeData] = useState([]);
  const [sunsetTimeData, setSunsetTimeData] = useState([]);
  const [maxSolarElevationData, setMaxSolarElevationData] = useState([]);

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
        setSunriseTimeData(data.sunriseTimeData);
        setSunsetTimeData(data.sunsetTimeData);
        setMaxSolarElevationData(data.solarElevationAngleData);
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
        pointRadius: 0,
        pointHitRadius: 3,
        borderWidth: 4,
        borderColor: 'rgba(0,0,0,0.3)',
      },
    ],
  };

  const sunriseTimeOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Time of Apparent Sunrise (hh:mm:ss) - ${startDate.getUTCFullYear()}`,
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

  const _sunriseTimeData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Time of Apparent Sunrise',
        data: sunriseTimeData,
        pointRadius: 0,
        pointHitRadius: 3,
        borderWidth: 4,
        borderColor: 'rgba(0,0,0,0.3)',
      },
    ],
  };

  const sunsetTimeOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Time of Apparent Sunset (hh:mm:ss) - ${startDate.getUTCFullYear()}`,
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

  const _sunsetTimeData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Time of Apparent Sunset',
        data: sunsetTimeData,
        pointRadius: 0,
        pointHitRadius: 3,
        borderWidth: 4,
        borderColor: 'rgba(0,0,0,0.3)',
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
        pointRadius: 0,
        pointHitRadius: 3,
        borderWidth: 4,
        borderColor: 'rgba(0,0,0,0.3)',
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
        pointRadius: 0,
        pointHitRadius: 3,
        borderWidth: 4,
        borderColor: 'rgba(0,0,0,0.3)',
      },
    ],
  };

  const solarElevationOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Max Solar Elevation Angle (degrees) - ${startDate.getUTCFullYear()}`,
      },
    },
  };

  const _solarElevationData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Max Solar Elevation Angle',
        data: maxSolarElevationData,
        pointRadius: 0,
        pointHitRadius: 3,
        borderWidth: 4,
        borderColor: 'rgba(0,0,0,0.3)',
      },
    ],
  };

  const calculator = position ? new SolarCalculator(position) : undefined;

  return (
    <>
      <Head>
        <title>Ifrit | Solar Calculations</title>
        <meta name="description" content="Solar charts based on position." />
      </Head>
      <div className="container py-4">
        <div className="rounded-lg border border-solid border-zinc-400 shadow shadow-zinc-400">
          {calculator ? (
            <>
              <section className="border-b border-solid border-zinc-400 p-2">
                <p>Position: {position?.toString()}</p>
                <p>UTC Offset: {calculator.calculateUTCOffset()} hours</p>
                <label htmlFor="select-year">Select Year: </label>
                <select
                  id="select-year"
                  defaultValue={startYear}
                  onChange={(e) =>
                    setStartDate(new Date(parseInt(e.target.value), 0, 1))
                  }>
                  {selectYearOptions.map((v) => (
                    <option value={v} key={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </section>
              <section className="p-2">
                <Line options={solarElevationOptions} data={_solarElevationData} />
                <br />
                <Line options={sunriseTimeOptions} data={_sunriseTimeData} />
                <br />
                <Line options={solarNoonOptions} data={_solarNoonData} />
                <br />
                <Line options={sunsetTimeOptions} data={_sunsetTimeData} />
                <br />
                <Line options={equationOfTimeOptions} data={_equationOfTimeData} />
                <br />
                <Line options={solarDeclinationOptions} data={_solarDeclinationData} />
              </section>
            </>
          ) : (
            <div className="p-2">
              <p>No position selected.</p>
              <p>
                Visit the{' '}
                <Link href="/site-location">
                  <a className="text-blue-600">site locator</a>
                </Link>{' '}
                to get solar calculation data.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SolarCalculations;
