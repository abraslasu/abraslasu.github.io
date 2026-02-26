import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LozPng from '@/src/assets/loz.png';
import WhatsappPng from '@/src/assets/whatsapp.png';

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [radius, setRadius] = useState(200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateRadius = () => {
      setRadius(window.innerWidth < 768 ? 100 : 200);
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div className="flex flex-col gap-10 md:gap-20 pb-40 pt-10 overflow-x-hidden">
      {/* Section 1: Intro */}
      <section className="flex flex-col gap-1 px-[var(--fluid-20-45)]">
        <h2 className="typo-h2 text-palette-5">Invitație la saloanele socratice</h2>
        
        {/* Blurry Text Container */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative w-full overflow-visible cursor-none select-none py-4"
        >
          {/* Base Layer: Blurred Text */}
          <h1 
            className="typo-h1 text-palette-5 leading-none -ml-1 blur-md whitespace-nowrap"
            style={{
              maskImage: `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, transparent 100%, black 100%)`,
              WebkitMaskImage: `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, transparent 100%, black 100%)`,
            }}
          >
            FOCUS
          </h1>

          {/* Top Layer: Clear Text with Mask */}
          <h1 
            className="typo-h1 text-palette-5 leading-none -ml-1 absolute top-4 left-0 pointer-events-none whitespace-nowrap"
            style={{
              maskImage: `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`,
            }}
          >
            FOCUS
          </h1>
        </div>

        <p className="typo-leading-p text-palette-5 w-full md:w-[60vw] mt-6">
          Un spațiu dedicat dialogului, unde ne întâlnim pentru a explora idei și curiozități, aplicând lentila filosofiei practice.
        </p>
      </section>

      {/* Section 2: Grid Links */}
      <section className="bg-white w-full py-6 md:py-12 border-y border-[#E7E7E7]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-12 px-[var(--fluid-20-45)]">
          {/* Row 1, Col 1 */}
          <Link to="/why" className="group border-t border-[#E7E7E7] pt-4 pb-8 md:pb-12 flex flex-col gap-2 transition-colors">
            <span className="typo-caption text-[#A1A1A1]">01</span>
            <h3 className="typo-h3 text-black group-hover:translate-x-2 transition-transform">De ce FOCUS?</h3>
          </Link>

          {/* Row 1, Col 2 */}
          <Link to="/how" className="group border-t border-[#E7E7E7] pt-4 pb-8 md:pb-12 flex flex-col gap-2 transition-colors">
            <span className="typo-caption text-[#A1A1A1]">02</span>
            <h3 className="typo-h3 text-black group-hover:translate-x-2 transition-transform">Cum se practică?</h3>
          </Link>

          {/* Row 2, Col 1 */}
          <Link to="/etiquette" className="group border-t border-[#E7E7E7] pt-4 pb-8 md:pb-12 flex flex-col gap-2 transition-colors">
            <span className="typo-caption text-[#A1A1A1]">03</span>
            <h3 className="typo-h3 text-black group-hover:translate-x-2 transition-transform">Cum participi?</h3>
          </Link>

          {/* Row 2, Col 2 */}
          <Link to="/articles" className="group border-t border-[#E7E7E7] pt-4 pb-8 md:pb-12 flex flex-col gap-2 transition-colors">
            <span className="typo-caption text-[#A1A1A1]">04</span>
            <h3 className="typo-h3 text-black group-hover:translate-x-2 transition-transform">Scrieri</h3>
          </Link>
        </div>
      </section>

      {/* Section 3: Lozul Filosofic */}
      <section className="flex flex-col gap-8 md:gap-12 mt-10 md:mt-20 px-[var(--fluid-20-45)]">
        <div className="flex flex-col gap-4">
          <h2 className="typo-h2 text-palette-5">Lozul Filosofic</h2>
          <p className="typo-leading-p text-palette-5">Încearcă-ți norocul la înțelepciune!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="w-full">
            <img 
              src={LozPng} 
              alt="Lozul Filosofic" 
              className="w-full h-auto object-contain max-h-[500px]" 
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="typo-leading-p text-palette-5 whitespace-pre-line">
              Dacă nu știi de unde să începi, folosește lozul – un instrument de practică filosofică.
              {'\n'}
              Îți pui o întrebare existențială, apoi răzuiești și interpretezi.
              {'\n\n'}
              Îl găsești la saloanele socratice sau în sesiuni de consiliere filosofică privată.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Whatsapp Join */}
      <section className="border-t border-[#C9C9C9] pt-8 md:pt-12 flex flex-col gap-8 md:gap-12 mt-10 md:mt-20 px-[var(--fluid-20-45)]">
        <div className="flex flex-col gap-4">
          <h2 className="typo-h2 text-palette-5">Alătură-te conversației</h2>
          <p className="typo-leading-p text-palette-5">
            Intră pe grupul de Whatsapp dacă vrei să participi la următorul salon.
          </p>
        </div>

        <div className="w-full md:w-fit min-w-[30vw] border border-black py-8 md:px-20 flex justify-center items-center hover:bg-black/5 transition-colors cursor-pointer">
          <a 
            href="https://chat.whatsapp.com/your-group-link"
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4"
          >
            <img src={WhatsappPng} alt="Whatsapp" className="w-8 h-8 object-contain" />
            <h4 className="typo-h4 text-black uppercase tracking-wider">ALĂTURĂ-TE GRUPULUI</h4>
          </a>
        </div>
      </section>
    </div>
  );
}
