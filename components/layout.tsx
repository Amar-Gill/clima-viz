import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

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

const NavLinkMobile = ({ href, children }: React.PropsWithChildren<LinkProps>) => {
  const router = useRouter();

  const dynamicClass = router.pathname === href ? 'bg-zinc-300' : '';
  return (
    <Link href={href} passHref>
      <a>
        <span className={'rounded-lg p-2 text-3xl font-bold' + ' ' + dynamicClass}>
          {children}
        </span>
      </a>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  return (
    <div className="bg-zinc-50 text-zinc-900">
      <nav className="fixed hidden h-screen w-40 border-r border-zinc-400 shadow shadow-zinc-400 sm:block">
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
          <li>
            <NavLink href="/blackbody-model">Black Body Model</NavLink>
          </li>
        </ul>
      </nav>
      <nav className="min-h-6 flex w-screen justify-between sm:hidden">
        <span>Ifrit</span>
        <span onClick={() => setShowMobileMenu(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </span>
      </nav>
      {showMobileMenu && (
        <div className="fixed top-0 h-screen w-screen bg-zinc-50">
          <div className="flex justify-end" onClick={() => setShowMobileMenu(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-x-square">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
          <ul className="pl-4" onClick={() => setShowMobileMenu(false)}>
            <li className="my-2">
              <NavLinkMobile href="/">Home</NavLinkMobile>
            </li>
            <li className="my-2">
              <NavLinkMobile href="/site-location">Site Location</NavLinkMobile>
            </li>
            <li className="my-2">
              <NavLinkMobile href="/solar-calculations">Solar Calculations</NavLinkMobile>
            </li>
            <li className="my-2">
              <NavLinkMobile href="/blackbody-model">Black Body Model</NavLinkMobile>
            </li>
          </ul>
        </div>
      )}
      <main className="min-h-screen sm:pl-40">{children}</main>
    </div>
  );
};

export default Layout;
