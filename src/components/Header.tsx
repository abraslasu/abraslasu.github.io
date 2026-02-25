import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SymbolFocus from '../assets/Symbol-FOCUS.svg';
import MenuIcon from '../assets/menu.svg';
import CloseIcon from '../assets/close.svg';

interface HeaderProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

export default function Header({ isMenuOpen, toggleMenu, closeMenu }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide header on scroll down, show on scroll up
      // Only trigger if scrolled more than 10px to avoid sensitivity at top
      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'De ce FOCUS?', path: '/why' },
    { name: 'Cum se practică?', path: '/how' },
    { name: 'Cum participi?', path: '/etiquette' },
    { name: 'Scrieri', path: '/articles' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 bg-palette-1/90 backdrop-blur-sm transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ padding: 'var(--fluid-20-45)' }}
      >
        <div className="w-full flex justify-between items-center">
          {/* Logo (Left) */}
          <Link to="/" className="text-black hover:opacity-70 transition-opacity" aria-label="Home">
            <img src={SymbolFocus} alt="FOCUS Symbol" className="h-8 w-auto text-current" />
          </Link>

          {/* Menu Icon (Right) */}
          <button
            onClick={toggleMenu}
            className="text-black hover:opacity-70 transition-opacity focus:outline-none"
            aria-label="Open menu"
          >
            <img src={MenuIcon} alt="Menu" className="h-6 w-6 text-current" />
          </button>
        </div>
      </header>

      {/* Full Screen Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black text-white flex flex-col transition-opacity duration-500 ease-in-out ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Close Button (Top Right) */}
        <div className="absolute top-8 right-8 z-50">
          <button
            onClick={closeMenu}
            className="text-white/50 hover:text-white transition-colors focus:outline-none"
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Menu Content (Centered) */}
        <div className="flex-grow flex flex-col items-center justify-center w-full">
          {/* Logo */}
          <div className="mb-12">
            <Link to="/" onClick={closeMenu} className="block hover:opacity-70 transition-opacity">
              <img src={SymbolFocus} alt="FOCUS Symbol" className="h-4 w-auto invert brightness-0" />
            </Link>
          </div>

          {/* Menu Links */}
          <div className="w-[33vw] flex flex-col">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className="border-t border-white/40 pt-6 pb-9 text-left"
              >
                <span className="typo-h2 text-white hover:text-white/70 transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
            {/* Bottom border for the last item */}
            <div className="border-t border-white/40 w-full"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-12 text-center">
          <p className="typo-caption text-[#666666] uppercase tracking-widest text-[10px]">
            FOCUS – SALOANELE SOCRATICE
          </p>
        </div>
      </div>
    </>
  );
}
