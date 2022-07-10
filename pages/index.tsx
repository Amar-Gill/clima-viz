import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Ifrit | Home</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container py-4">
        <div className="rounded-lg border border-solid border-zinc-400 p-2 shadow shadow-zinc-400">
          <h1 className="text-3xl font-bold underline">Ifrit 0.1.0</h1>
          <h3 className="mt-2 text-xl">Present Feature Set:</h3>
          <ul className="list-disc pl-4">
            <li>project site selection</li>
            <li>solar charts based on geographic position</li>
            <li>black body model visualizer</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Home;
