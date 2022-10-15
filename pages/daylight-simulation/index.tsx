import SolarPosition from 'components/SolarPosition';
import useStore from 'lib/store';
import Head from 'next/Head';
import Link from 'next/Link';

const DaylightSimPage = () => {
  const { position } = useStore((state) => state);
  return (
    <>
      <Head>
        <title>ClimaViz | Daylight Simulation</title>
      </Head>
      {position ? (
        <SolarPosition position={position} />
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

export default DaylightSimPage;
