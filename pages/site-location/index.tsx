import useStore from 'lib/store';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const Map = dynamic(
  () => {
    return import('../../components/Map');
  },
  { ssr: false },
);

const SiteLocation: NextPage = () => {
  const { position } = useStore((state) => state);
  return (
    <>
      <Head>
        <title>Ifrit | Site Locator</title>
        <meta name="description" content="Site location using map coordinates" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
        />
      </Head>
      <div className="container h-screen py-4">
        <div className="flex h-full flex-col rounded-lg border border-solid border-zinc-400 shadow shadow-zinc-400">
          <section className="flex-1 border-b border-solid border-zinc-400 p-2">
            <p>Project Coordinates:</p>
            <p>{position?.toString() ?? 'None selected'}</p>
          </section>
          <Map />
        </div>
      </div>
    </>
  );
};

export default SiteLocation;
