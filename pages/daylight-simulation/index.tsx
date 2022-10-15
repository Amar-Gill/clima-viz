import { Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { getDayOfYear } from 'date-fns';
import { useControls } from 'leva';
import SolarCalculator from 'lib/solar-calculator';
import useStore from 'lib/store';
import { convertDaysToTimeString } from 'lib/utils';
import Head from 'next/Head';
import Link from 'next/Link';
import { radToDeg } from 'three/src/math/MathUtils';

const DaylightSimulation = () => {
  const { minutes, isDST } = useControls({
    minutes: {
      value: 0,
      min: 0,
      max: 1440,
      step: 10,
    },
    isDST: {
      value: false,
    },
  });
  const { position } = useStore((state) => state);

  const calculator = position ? new SolarCalculator(position) : undefined;

  // hard code dayOfYear to be present day for now
  const dayOfYear = getDayOfYear(new Date());

  // https://mathinsight.org/spherical_coordinates
  const radius = 5;
  const zenith = calculator?.zenithAngle(dayOfYear, isDST ? minutes - 60 : minutes) ?? 0;
  const azimuth =
    calculator?.azimuthAngle(dayOfYear, isDST ? minutes - 60 : minutes) ?? 0;

  /**
   * defualt ThreeJS coordinate system is different from typical cartesion coordinates
   * for ThreeJS x and z are on the flat horizontal plane while y axis points directly up
   * typical cartesion coordinates have x and y axes on flat horizontal plane and z pointing up
   */
  const x = radius * Math.sin(zenith) * Math.cos(azimuth);
  const y = radius * Math.cos(zenith);
  const z = radius * Math.sin(zenith) * Math.sin(azimuth);

  return (
    <>
      <Head>
        <title>ClimaViz | Daylight Simulation</title>
      </Head>
      {calculator ? (
        <>
          <div>
            <p>
              Position: {position?.lat}, {position?.lng}
            </p>
            <div>
              elevation:{' '}
              {radToDeg(
                calculator.elevationAngle(dayOfYear, isDST ? minutes - 60 : minutes),
              )}
            </div>
            <div>azimuth: {radToDeg(azimuth)}</div>
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
