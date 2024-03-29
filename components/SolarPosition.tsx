import { Html, OrbitControls, Plane, Sphere } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { getDayOfYear } from 'date-fns';
import { LatLng } from 'leaflet';
import { useControls } from 'leva';
import SolarPositionCalculator from 'lib/solar-position-calculator';
import { calculateUTCOffsetForLng, convertDaysToTimeString } from 'lib/utils';
import { useMemo } from 'react';
import { radToDeg } from 'three/src/math/MathUtils';

type SolarPositionProps = {
  position: LatLng;
};

type UseFrameContainerProps = {
  cb: Function;
};

const SolarPosition: React.FC<SolarPositionProps> = ({ position }) => {
  const [{ minutes, dayOfYear, UTCOffset, animate, minutesIncrement }, set] = useControls(
    () => ({
      minutes: {
        value: 0,
        min: 0,
        max: 1440,
        step: 10,
        label: 'Mins Elapsed',
      },
      dayOfYear: {
        value: getDayOfYear(new Date()),
        min: 1,
        max: 365,
        step: 1,
        label: 'Day of Year',
      },
      UTCOffset: {
        value: calculateUTCOffsetForLng(position.lng),
        min: -14,
        max: 14,
        step: 1,
        label: 'UTC Offset',
      },
      animate: {
        value: false,
        label: 'Animate',
      },
      minutesIncrement: {
        value: 1,
        min: 1,
        max: 30,
        step: 1,
        label: 'Animate Speed',
      },
    }),
  );

  function incrementMinutes() {
    if (minutes >= 1440) {
      const dayNum = dayOfYear >= 365 ? 1 : dayOfYear + 1;
      set({ minutes: 0, dayOfYear: dayNum });
      return;
    }
    set({ minutes: minutes + minutesIncrement });
  }

  const calculator = useMemo(() => new SolarPositionCalculator(position), [position]);

  // https://mathinsight.org/spherical_coordinates
  const radius = 8;

  const { elevation, zenith, azimuth } = calculator.solarPosition(
    dayOfYear,
    minutes,
    UTCOffset,
  );

  /**
   * defualt ThreeJS coordinate system is different from typical cartesian coordinates
   * for ThreeJS x and z are on the flat horizontal plane while y axis points directly up
   * typical cartesion coordinates have x and y axes on flat horizontal plane and z pointing up
   */
  const x = radius * Math.sin(zenith) * Math.cos(azimuth);
  const y = radius * Math.cos(zenith);
  const z = radius * Math.sin(zenith) * Math.sin(azimuth);

  return (
    <>
      <div className="h-screen w-full">
        <Canvas camera={{ position: [9, 9, 9] }}>
          <Html calculatePosition={() => [8, 8, 0]}>
            <div className="grid w-44 grid-cols-2 rounded-lg border border-solid border-zinc-400 bg-zinc-50 p-2 shadow shadow-zinc-400">
              <p>Latitude:</p>
              <p className="text-right">{position.lat.toFixed(2)} °</p>
              <p>Longitude: </p>
              <p className="text-right">{position.lng.toFixed(2)} °</p>
              <p>Elevation:</p>
              <p className="text-right">{radToDeg(elevation).toFixed(2)} °</p>
              <p>Azimuth:</p>
              <p className="text-right">{radToDeg(azimuth).toFixed(2)} °</p>
              <p>Time:</p>
              <p className="text-right">
                {convertDaysToTimeString(minutes / 1440).slice(0, 5)}
              </p>
            </div>
          </Html>
          <OrbitControls />
          <Plane args={[64, 64]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshPhongMaterial color="#4b7842" />
          </Plane>
          <Sphere args={[0.1]} position={[x, y, z]}>
            <meshBasicMaterial color="#ac6c25" />
          </Sphere>
          <Sphere args={[0.1]}>
            <meshBasicMaterial color="black" />
          </Sphere>
          <axesHelper args={[5]} />
          <ambientLight args={['white', 0.1]} />
          <pointLight intensity={1.5} position={[x, y, z]} />
          {animate && <UseFrameContainer cb={incrementMinutes} />}
        </Canvas>
      </div>
    </>
  );
};

const UseFrameContainer: React.FC<UseFrameContainerProps> = ({ cb }) => {
  useFrame(() => cb());
  return null;
};

export default SolarPosition;
