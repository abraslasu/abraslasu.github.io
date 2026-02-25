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
        <div 
          className="absolute top-0 right-0"
          style={{ padding: 'var(--fluid-20-45)' }}
        >
          <button
            onClick={closeMenu}
            className="text-[#444444] hover:opacity-70 transition-opacity focus:outline-none"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current">
              <path d="M18 6L6 18M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Menu Content (Centered) */}
        <div className="flex-grow flex flex-col items-center justify-center space-y-8 p-4 text-center">
          {/* 1. Logo (White) */}
          <Link to="/" onClick={closeMenu} className="mb-8 hover:opacity-70 transition-opacity">
             <img src={SymbolFocus} alt="FOCUS Symbol" className="h-12 w-auto invert brightness-0" />
          </Link>

          {/* Menu Links */}
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className="typo-h2 text-white hover:text-palette-4 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Small Footer in Menu */}
        <div className="w-full flex justify-center pb-8">
          <div 
            className="w-[33vw] border-t border-[#C9C9C9] text-center"
            style={{ paddingTop: 'var(--fluid-16-16)' }}
          >
            <p className="typo-caption text-[#A1A1A1] uppercase">FOCUS – Saloanele Socratice</p>
          </div>
        </div>
      </div>
    </>
  );
}
