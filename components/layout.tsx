const Layout = ({ children }) => {
  return (
    <>
      <nav className="fixed h-screen w-40 bg-slate-200">
        <ul>
          <li>Home</li>
          <li>Map</li>
        </ul>
      </nav>
      <main className="pl-40">{children}</main>
    </>
  )
}

export default Layout
