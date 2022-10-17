import SolarPosition from 'components/SolarPosition';
import useStore from 'lib/store';
import Head from 'next/head';
import Link from 'next/link';

const RedirectCard = () => {
  return (
    <div className="container py-4">
      <div className="rounded-lg border border-solid border-zinc-400 p-2 shadow shadow-zinc-400">
        <p>No position selected.</p>
        <p>
          Visit the{' '}
          <Link href="/site-location">
            <a className="text-blue-600">site locator</a>
          </Link>{' '}
          to get solar position data.
        </p>
      </div>
    </div>
  );
};

const SolarPositionPage = () => {
  const { position } = useStore((state) => state);
  return (
    <>
      <Head>
        <title>ClimaViz | Solar Position</title>
      </Head>
      {position ? <SolarPosition position={position} /> : <RedirectCard />}
    </>
  );
};

export default SolarPositionPage;
