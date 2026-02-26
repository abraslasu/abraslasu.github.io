import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUI } from '../context/UIContext';

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
  const { isHeaderHidden, isFooterHidden } = useUI();

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

    updateFooterHeight();
    window.addEventListener('resize', updateFooterHeight);
    const timeout = setTimeout(updateFooterHeight, 100);

    return () => {
      window.removeEventListener('resize', updateFooterHeight);
      clearTimeout(timeout);
    };
  }, [location.pathname, isFooterHidden]); // Re-measure if footer visibility changes

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isMenuOpen={isMenuOpen} 
        toggleMenu={toggleMenu} 
        closeMenu={closeMenu} 
        isHidden={isHeaderHidden}
      />

      {/* Main Content Wrapper with Background to cover Footer */}
      <div 
        className="relative z-10 bg-palette-1 w-full"
        style={{ marginBottom: isFooterHidden ? 0 : `${footerHeight}px` }}
      >
        <main 
          className="w-full"
          style={{ 
            marginTop: isHeaderHidden ? 0 : 'calc(var(--fluid-20-45) * 2 + 32px)',
            paddingLeft: isHeaderHidden ? 0 : 'var(--fluid-20-45)',
            paddingRight: isHeaderHidden ? 0 : 'var(--fluid-20-45)',
            paddingBottom: isHeaderHidden ? 0 : 'var(--fluid-20-45)'
          }}
        >
          <Outlet context={{ toggleMenu, openMenu, closeMenu }} />
        </main>
      </div>

      {!isFooterHidden && <Footer />}
    </div>
  );
}
