import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'

const Map = dynamic(
  () => {
    return import('../../components/Map')
  },
  { ssr: false }
)

const SiteLocation: NextPage = () => {
  return (
    <>
      <Head>
        <title>Ifrit | Site Locator</title>
        <meta
          name="description"
          content="Site location using map coordinates"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
        />
      </Head>
      <Map />)
    </>
  )
}

export default SiteLocation
