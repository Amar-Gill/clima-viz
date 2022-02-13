import Link from 'next/link'

const Layout: React.FC<{}> = ({ children }) => {
  return (
    <>
      <nav className="fixed h-screen w-40 bg-slate-200">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/site-location">Site Location</Link>
          </li>
          <li>
            <Link href="/solar-calculations">Solar Calculations</Link>
          </li>
        </ul>
      </nav>
      <main className="pl-40">{children}</main>
    </>
  )
}

export default Layout
