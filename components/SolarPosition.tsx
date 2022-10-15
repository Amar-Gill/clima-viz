import { Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { getDayOfYear } from 'date-fns';
import { LatLng } from 'leaflet';
import { useControls } from 'leva';
import SolarCalculator from 'lib/solar-calculator';
import { convertDaysToTimeString } from 'lib/utils';
import { radToDeg } from 'three/src/math/MathUtils';

const SolarPosition = (props: { position: LatLng }) => {
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

  const calculator = new SolarCalculator(props.position ?? { lat: 0, lng: 0 });

  // hard code dayOfYear to be present day for now
  const dayOfYear = getDayOfYear(new Date());

  // https://mathinsight.org/spherical_coordinates
  const radius = 5;
  const zenith = calculator.zenithAngle(dayOfYear, isDST ? minutes - 60 : minutes);
  const azimuth = calculator.azimuthAngle(dayOfYear, isDST ? minutes - 60 : minutes);

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
      <div>
        <p>
          Position: {props.position?.lat}, {props.position?.lng}
        </p>
        <p>
          elevation:{' '}
          {radToDeg(calculator.elevationAngle(dayOfYear, isDST ? minutes - 60 : minutes))}
        </p>
        <p>azimuth: {radToDeg(azimuth)}</p>
        <p>Time: {convertDaysToTimeString(minutes / 1440)}</p>
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
  );
};

export default SolarPosition;
