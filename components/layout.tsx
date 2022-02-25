import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const NavLink = ({ href, children }: React.PropsWithChildren<LinkProps>) => {
  const router = useRouter();

  const dynamicClass =
    router.pathname === href
      ? 'bg-zinc-200 font-bold border-y border-zinc-400'
      : 'hover:bg-zinc-200';
  return (
    <Link href={href} passHref>
      <a>
        <div className={`px-2 py-1 ${dynamicClass}`}>{children}</div>
      </a>
    </Link>
  );
};

const Layout: React.FC<{}> = ({ children }) => {
  return (
    <>
      <nav className="fixed h-screen w-40 border-r border-zinc-400 bg-zinc-50 shadow shadow-zinc-400">
        <ul>
          <li>
            <NavLink href="/">Home</NavLink>
          </li>
          <li>
            <NavLink href="/site-location">Site Location</NavLink>
          </li>
          <li>
            <NavLink href="/solar-calculations">Solar Calculations</NavLink>
          </li>
        </ul>
      </nav>
      <main className="container mx-auto bg-zinc-50 pl-40">{children}</main>
    </>
  );
};

export default Layout;
