import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useControls } from 'leva';
import Head from 'next/head';

const BlackBodyModel = () => {
  const { width, height, depth } = useControls({
    width: {
      value: 1,
      min: 1,
      max: 10,
      step: 1,
    },
    height: {
      value: 1,
      min: 1,
      max: 6,
      step: 1,
    },
    depth: {
      value: 1,
      min: 1,
      max: 10,
      step: 1,
    },
  });

  return (
    <>
      <Head>
        <title>ClimaViz | Black Body Model</title>
        <meta name="description" content="Visualize black body model of system." />
      </Head>
      <div className="h-screen w-full">
        <Canvas camera={{ position: [5, 5, 5] }}>
          <OrbitControls />
          <gridHelper />
          <ambientLight />
          <pointLight intensity={4} position={[10, 8, 6]} />
          <mesh position={[0.5, height / 2, 0.5]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#24242e" />
          </mesh>
        </Canvas>
      </div>
    </>
  );
};

export default BlackBodyModel;
