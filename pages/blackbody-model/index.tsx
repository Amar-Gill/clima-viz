import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

const BlackBodyModel = () => {
  return (
    <div className="h-screen w-full">
      <Canvas>
        <OrbitControls />
        <gridHelper />
        <ambientLight />
        <pointLight intensity={4} position={[10, 8, 6]} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#24242e" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default BlackBodyModel;
