import { Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import SolarCalculator from 'lib/solar-calculator';
import useStore from 'lib/store';
import { convertDaysToTimeString } from 'lib/utils';
import Head from 'next/Head';
import Link from 'next/Link';
import { useState } from 'react';

const DaylightSimulation = () => {
  /** Initialize local state */
  const now = new Date();
  let m = 720;
  let d = new Date(now.getUTCFullYear(), 0, 1, 0, m, 0, 0);
  d = new Date(d.toLocaleString('en-US', { timeZone: 'Greenwich' }));

  const [minutes, setMinutes] = useState(m);
  const [date, setDate] = useState(d);
  const { position } = useStore((state) => state);

  const calculator = position ? new SolarCalculator(position) : undefined;

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = Number(e.target.value);
    setMinutes(m);
    const newDate = new Date(2022, 0, 1, 0, m, 0, 0);
    setDate(new Date(newDate.toLocaleString('en-US', { timeZone: 'Greenwich' })));
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
          <div className="h-screen w-full">
            <Canvas camera={{ position: [5, 5, 5] }}>
              <OrbitControls />
              <gridHelper />
              <ambientLight />
              <pointLight intensity={4} position={[10, 8, 6]} />
              <mesh>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="black" />
              </mesh>
              <Line
                points={[
                  [0, 0, 0],
                  [0, 0, 5],
                ]}
                rotation={[0, calculator.azimuthAngle(date) * (Math.PI / 180), 0]}
              />
              <Line
                points={[
                  [0, 0, 0],
                  [5, 0, 0],
                ]}
                rotation={[0, 0, calculator.elevationAngle(date) * (Math.PI / 180)]}
              />
            </Canvas>
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
