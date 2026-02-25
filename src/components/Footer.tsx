import { useLocation, Link } from 'react-router-dom';
import ArrowRight from '../assets/arrow-right.svg';

type FooterType = 'big' | 'small';

interface FooterConfig {
  type: FooterType;
  image?: string;
  linkText?: string;
  linkTo?: string;
  caption?: string;
}

const FOOTER_CONFIG: Record<string, FooterConfig> = {
  '/': {
    type: 'big',
    image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=2000&auto=format&fit=crop',
    linkText: 'De ce FOCUS?',
    linkTo: '/why',
    caption: 'FOCUS – Saloanele Socratice',
  },
  '/why': {
    type: 'big',
    image: 'https://images.unsplash.com/photo-1679175865437-fd4f1744ebd9?q=80&w=2000&auto=format&fit=crop',
    linkText: 'Cum se practică?',
    linkTo: '/how',
    caption: 'FOCUS – Saloanele Socratice',
  },
  '/how': {
    type: 'big',
    image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2000&auto=format&fit=crop',
    linkText: 'Cum participi?',
    linkTo: '/etiquette',
    caption: 'FOCUS – Saloanele Socratice',
  },
  '/etiquette': {
    type: 'big',
    image: 'https://images.unsplash.com/photo-1491441555545-d6b8e24ffa33?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    linkText: 'Scrieri filosofice',
    linkTo: '/articles',
    caption: 'FOCUS – Saloanele Socratice',
  },
  '/articles': { type: 'small', caption: 'FOCUS – Saloanele Socratice' },
};

const DEFAULT_CONFIG: FooterConfig = {
  type: 'small',
  caption: 'FOCUS – Saloanele Socratice',
};

export default function Footer() {
  const location = useLocation();
  const config = FOOTER_CONFIG[location.pathname] || DEFAULT_CONFIG;

  if (config.type === 'big') {
    return (
      <footer 
        id="app-footer"
        className="fixed bottom-0 left-0 w-full z-0 bg-black text-white"
        style={{ height: '90vh' }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={config.image} 
            alt="Footer Background" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20" /> {/* Overlay for contrast */}
        </div>

        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Centered Link */}
          <div className="flex-grow flex justify-center items-center">
            <div className="w-[33vw] flex flex-col items-center">
              <Link 
                to={config.linkTo || '/'} 
                className="group w-full pt-6 border-t border-[#E7E7E7] flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <span className="typo-h2 text-white">{config.linkText}</span>
                <img 
                  src={ArrowRight} 
                  alt="Arrow Right" 
                  className="h-6 w-6 text-white transform group-hover:translate-x-2 transition-transform invert brightness-0 filter" 
                />
              </Link>
            </div>
          </div>
          
          {/* Caption at bottom left with fluid margin */}
          <div 
            className="absolute bottom-8 w-full"
            style={{ paddingLeft: 'var(--fluid-20-45)', paddingRight: 'var(--fluid-20-45)' }}
          >
            <p className="typo-caption text-[#A1A1A1] uppercase">{config.caption}</p>
          </div>
        </div>
      </footer>
    );
  }

  // Small Footer (Type 2)
  return (
    <footer 
      id="app-footer" 
      className="fixed bottom-0 left-0 w-full z-0 bg-palette-1 py-8"
    >
      <div className="w-full flex justify-center">
        <div 
          className="w-[33vw] border-t border-[#C9C9C9] text-center"
          style={{ paddingTop: 'var(--fluid-16-16)' }}
        >
          <p className="typo-caption text-[#A1A1A1] uppercase">{config.caption}</p>
        </div>
      </div>
    </footer>
  );
}
