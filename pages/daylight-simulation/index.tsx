import SolarCalculator from 'lib/solar-calculator';
import useStore from 'lib/store';
import { convertDaysToTimeString } from 'lib/utils';
import Head from 'next/Head';
import Link from 'next/Link';
import { useState } from 'react';

const DaylightSimulation = () => {
  const [minutes, setMinutes] = useState(720);
  let d = new Date(2022, 0, 1, 0, minutes, 0, 0);
  d = new Date(d.toLocaleString('en-US', { timeZone: 'Greenwich' }));
  const [date, setDate] = useState(d);
  const { position } = useStore((state) => state);

  const calculator = position ? new SolarCalculator(position) : undefined;

  const handleMinutesChange = (e) => {
    const m = Number(e.target.value);
    setMinutes(m);
    setDate(new Date(date.setMinutes(m)));
  };

  return (
    <>
      <Head>
        <title>ClimaViz | Daylight Simulation</title>
      </Head>
      {calculator ? (
        <>
          <p>
            Position: {position?.lat}, {position?.lng}
          </p>
          <div>
            <input
              type="range"
              min="0"
              max="1440"
              step="10"
              name="hours"
              value={minutes}
              onChange={handleMinutesChange}
            />
            <label htmlFor="hours">time: {convertDaysToTimeString(minutes / 1440)}</label>
          </div>
          <div>
            <div>elevation: {calculator.elevationAngle(date)}</div>
            <div>azimuth: {calculator.azimuthAngle(date)}</div>
          </div>
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
    </>
  );
};

export default DaylightSimulation;
