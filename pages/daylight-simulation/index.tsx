import { Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { getDayOfYear } from 'date-fns';
import SolarCalculator from 'lib/solar-calculator';
import useStore from 'lib/store';
import { convertDaysToTimeString } from 'lib/utils';
import Head from 'next/Head';
import Link from 'next/Link';
import { useState } from 'react';
import { radToDeg } from 'three/src/math/MathUtils';

const DaylightSimulation = () => {
  /** Initialize local state */
  const [minutes, setMinutes] = useState(0);
  const { position } = useStore((state) => state);

  const calculator = position ? new SolarCalculator(position) : undefined;

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = Number(e.target.value);
    setMinutes(m);
  };

  // hard code dayOfYear to be present day for now
  const dayOfYear = getDayOfYear(new Date());

  // https://mathinsight.org/spherical_coordinates
  const radius = 5;
  const zenith = calculator?.zenithAngle(dayOfYear, minutes) ?? 0;
  const azimuth = calculator?.azimuthAngle(dayOfYear, minutes) ?? 0;

  const x = radius * Math.sin(zenith) * Math.cos(azimuth);
  const y = radius * Math.sin(zenith) * Math.sin(azimuth);
  const z = radius * Math.cos(zenith);

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
              name="minutes"
              value={minutes}
              onChange={handleMinutesChange}
            />
            <label htmlFor="hours">time: {convertDaysToTimeString(minutes / 1440)}</label>
          </div>
          <div>
            <div>
              elevation: {radToDeg(calculator.elevationAngle(dayOfYear, minutes))}
            </div>
            <div>azimuth: {radToDeg(azimuth)}</div>
            <div>utc offset: {calculator.calculateUTCOffset()}</div>
            <div>x: {x}</div>
            <div>y: {y}</div>
            <div>z: {z}</div>
          </div>
          <div className="h-screen w-full">
            <Canvas camera={{ position: [3, 3, 3] }}>
              <OrbitControls />
              <gridHelper />
              <axesHelper args={[5]} />
              <ambientLight />
              <pointLight intensity={4} position={[10, 8, 6]} />
              <mesh>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="black" />
              </mesh>
              <Line
                points={[
                  [0, 0, 0],
                  [x, y, z],
                ]}
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
