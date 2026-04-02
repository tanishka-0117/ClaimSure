import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

export default function PublicNavbar({ simplified = false }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 10);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Standard premium transition classes
  const headerBase = `fixed left-0 right-0 top-0 z-50 transition-all duration-500 ease-out ${
    isScrolled ? 'py-2' : 'pt-1'
  }`;
  
  const containerBase = `mx-auto max-w-7xl px-4 md:px-6`;
  
  const capsuleBase = `grid grid-cols-[minmax(9rem,1fr)_auto_minmax(9rem,1fr)] items-center transition-all duration-500 ease-out ${
    isScrolled
      ? 'rounded-[28px] border border-transparent bg-transparent px-2 py-1 shadow-none'
      : 'rounded-[28px] border border-white/10 bg-black/92 px-6 py-4 shadow-[0_18px_48px_-30px_rgba(0,0,0,0.75)] backdrop-blur-sm'
  }`;

  const navBase = `hidden md:flex items-center transition-all duration-500 ease-out ${
    isScrolled
      ? 'gap-10 rounded-full border border-black/10 bg-white/95 px-8 py-3 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.55)] backdrop-blur-sm'
      : 'gap-8 rounded-full border border-transparent bg-transparent px-0 py-0'
  }`;

  const navLinkClass = (isScrolled) => 
    `transition-colors duration-300 ${
      isScrolled 
        ? 'text-[1.02rem] font-semibold text-slate-900 hover:text-black' 
        : 'text-sm font-semibold text-slate-100 hover:text-white'
    }`;

  const buttonClass = (isScrolled) => 
    `rounded-full px-6 py-2 text-sm font-medium transition-all duration-500 ease-out ${
      isScrolled
        ? 'border border-white/15 bg-black/85 text-white hover:bg-black'
        : 'bg-white text-black hover:bg-slate-100'
    }`;

  return (
    <header className={headerBase}>
      <div className={containerBase}>
        <div className={capsuleBase}>
          {/* Logo Section */}
          <div className="flex items-center gap-2.5 justify-self-start overflow-hidden">
            <Logo iconOnly={isScrolled} />
          </div>

          {/* Navigation Links (Hidden if simplified) */}
          <nav className={navBase}>
            {!simplified && (
              <>
                <Link to="/#features" className={navLinkClass(isScrolled)}>Features</Link>
                <Link to="/#how-it-works" className={navLinkClass(isScrolled)}>How It Works</Link>
                <Link to="/auth" className={navLinkClass(isScrolled)}>Contact</Link>
              </>
            )}
            {simplified && (
              <span className={navLinkClass(isScrolled)}>Welcome to ClaimSure</span>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="justify-self-end">
            <Link to={location.pathname === '/auth' ? '/' : '/auth'}>
              <Button className={buttonClass(isScrolled)}>
                {location.pathname === '/auth' ? 'Back Home' : 'Get Started'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
