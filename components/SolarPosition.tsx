import { OrbitControls, Plane, Sphere } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { getDayOfYear } from 'date-fns';
import { LatLng } from 'leaflet';
import { useControls } from 'leva';
import SolarCalculator from 'lib/solar-calculator';
import { convertDaysToTimeString } from 'lib/utils';
import { radToDeg } from 'three/src/math/MathUtils';

type SolarPositionProps = {
  position: LatLng;
};

const SolarPosition: React.FC<SolarPositionProps> = ({ position }) => {
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

  const calculator = new SolarCalculator(position);

  // hard code dayOfYear to be present day for now
  const dayOfYear = getDayOfYear(new Date());

  // https://mathinsight.org/spherical_coordinates
  const radius = 8;
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
          Position: {position.lat}, {position.lng}
        </p>
        <p>
          elevation:{' '}
          {radToDeg(calculator.elevationAngle(dayOfYear, isDST ? minutes - 60 : minutes))}
        </p>
        <p>azimuth: {radToDeg(azimuth)}</p>
        <p>Time: {convertDaysToTimeString(minutes / 1440)}</p>
      </div>
      <div className="h-screen w-full">
        <Canvas camera={{ position: [9, 9, 9] }}>
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
        </Canvas>
      </div>
    </>
  );
};

export default SolarPosition;
