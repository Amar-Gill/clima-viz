import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const NavLink = ({ href, children }: React.PropsWithChildren<LinkProps>) => {
  const router = useRouter();

  const dynamicClass =
    router.pathname === href
      ? 'bg-zinc-200 font-semibold border-zinc-400'
      : 'hover:bg-zinc-200 border-zinc-50 hover:border-zinc-400';
  return (
    <Link href={href} passHref>
      <a>
        <div className={`border-l-4 p-1 ${dynamicClass}`}>{children}</div>
      </a>
    </Link>
  );
};

const Layout: React.FC<{}> = ({ children }) => {
  return (
    <div className="bg-zinc-50 text-zinc-900">
      <nav className="fixed h-screen w-40 border-r border-zinc-400 shadow shadow-zinc-400">
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
      <main className="container mx-auto h-screen pl-40">{children}</main>
    </div>
  );
};

export default Layout;
