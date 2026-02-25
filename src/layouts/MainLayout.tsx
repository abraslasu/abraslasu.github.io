import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

type MainLayoutContextType = {
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

export function useMainLayoutContext() {
  return useOutletContext<MainLayoutContextType>();
}

export default function MainLayout() {
  const [footerHeight, setFooterHeight] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    // Always scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const updateFooterHeight = () => {
      const footer = document.getElementById('app-footer');
      if (footer) {
        setFooterHeight(footer.offsetHeight);
      }
    };

    // Initial measure
    updateFooterHeight();

    // Measure on resize
    window.addEventListener('resize', updateFooterHeight);
    
    // Measure on route change (in case footer content changes)
    const timeout = setTimeout(updateFooterHeight, 100);

    return () => {
      window.removeEventListener('resize', updateFooterHeight);
      clearTimeout(timeout);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isMenuOpen={isMenuOpen} 
        toggleMenu={toggleMenu} 
        closeMenu={closeMenu} 
      />

      {/* Main Content Wrapper with Background to cover Footer */}
      <div 
        className="relative z-10 bg-palette-1 w-full"
        style={{ marginBottom: `${footerHeight}px` }}
      >
        <main 
          className="w-full"
          style={{ 
            marginTop: 'calc(var(--fluid-20-45) * 2 + 32px)', // Account for fixed header height + padding
            paddingLeft: 'var(--fluid-20-45)',
            paddingRight: 'var(--fluid-20-45)',
            paddingBottom: 'var(--fluid-20-45)'
          }}
        >
          <Outlet context={{ toggleMenu, openMenu, closeMenu }} />
        </main>
      </div>

      <Footer />
    </div>
  );
}
