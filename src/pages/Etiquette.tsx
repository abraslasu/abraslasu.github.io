import { Link, useOutletContext } from 'react-router-dom';
import ArrowLeft from '../assets/arrow-left.svg';
import ArrowRight from '../assets/arrow-right.svg';
import WhatsappPng from '../assets/whatsapp.png';

// Define the context type locally
type MainLayoutContextType = {
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

export default function Etiquette() {
  const { openMenu } = useOutletContext<MainLayoutContextType>();

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Page Title & Navigation */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between pb-6 w-full max-w-[50vw] mx-auto">
          <Link to="/how" className="p-2 hover:opacity-70 transition-opacity">
            <img src={ArrowLeft} alt="Previous" className="h-6 w-6" />
          </Link>
          
          <button 
            onClick={openMenu}
            className="typo-h2 text-center hover:opacity-70 transition-opacity"
          >
            Cum participi?
          </button>

          <Link to="/articles" className="p-2 hover:opacity-70 transition-opacity">
            <img src={ArrowRight} alt="Next" className="h-6 w-6" />
          </Link>
        </div>
        
        <p className="typo-leading-p text-palette-5 max-w-4xl">
          Saloanele socratice sunt menite să nutrească dialoguri cu sens. Acest scop ne aduce împreună – calea către dialog începe cu o participare.
        </p>
      </div>

      {/* Section 1: 3-Column Grid */}
      <section className="w-full bg-white border border-[#C9C9C9]">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Column 1: Angajament */}
          <div className="flex flex-col md:border-r border-[#C9C9C9]">
            {/* Row 1: Heading */}
            <div className="p-6 border-b border-[#C9C9C9] h-24 flex items-center justify-center">
              <h4 className="typo-h4 text-black uppercase">Angajament</h4>
            </div>
            {/* Row 2 */}
            <div className="p-6 border-b border-[#C9C9C9] h-40 flex items-center">
              <p className="typo-p text-black">De timp: Fii punctual și rămâi pe toată durata discuției.</p>
            </div>
            {/* Row 3 */}
            <div className="p-6 border-b border-[#C9C9C9] h-40 flex items-center">
              <p className="typo-p text-black">De prezență: ascultă activ și implică-te cu atenție, aici și acum.</p>
            </div>
            {/* Row 4 */}
            <div className="p-6 h-40 flex items-center">
              <p className="typo-p text-black">De asumare și implicare: nu rămâne pasiv. Fiecare perspectivă este binevenită și valoroasă.</p>
            </div>
          </div>

          {/* Column 2: Teren comun */}
          <div className="flex flex-col md:border-r border-[#C9C9C9]">
            {/* Row 1: Heading */}
            <div className="p-6 border-b border-[#C9C9C9] h-24 flex items-center justify-center">
              <h4 className="typo-h4 text-black uppercase">Teren comun</h4>
            </div>
            {/* Row 2 */}
            <div className="p-6 border-b border-[#C9C9C9] h-40 flex items-center">
              <p className="typo-p text-black">Un facilitator: inițiază și veghează dialogul în fiecare salon.</p>
            </div>
            {/* Row 3 */}
            <div className="p-6 border-b border-[#C9C9C9] h-40 flex items-center">
              <p className="typo-p text-black">Pluralitate: vorbim pe rând. Dacă vrei să intervii, intenția se anunță prin ridicarea mâinii.</p>
            </div>
            {/* Row 4 */}
            <div className="p-6 h-40 flex items-center">
              <p className="typo-p text-black">Pas cu pas: construim argumente plecând de la ideile celorlalți, fără salturi conceptuale.</p>
            </div>
          </div>

          {/* Column 3: Respect */}
          <div className="flex flex-col">
            {/* Row 1: Heading */}
            <div className="p-6 border-b border-[#C9C9C9] h-24 flex items-center justify-center">
              <h4 className="typo-h4 text-black uppercase">Respect</h4>
            </div>
            {/* Row 2 */}
            <div className="p-6 border-b border-[#C9C9C9] h-40 flex items-center">
              <p className="typo-p text-black">Față de facilitator și membrii grupului.</p>
            </div>
            {/* Row 3 */}
            <div className="p-6 border-b border-[#C9C9C9] h-40 flex items-center">
              <p className="typo-p text-black">Față de spațiul care găzduiește saloanele socratice.</p>
            </div>
            {/* Row 4 */}
            <div className="p-6 h-40 flex items-center">
              <p className="typo-p text-black">Față de curiozitate și efortul depus de fiecare în căutarea clarității.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Whatsapp Join (Reused) */}
      <section className="border-t border-[#C9C9C9] pt-12 flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="typo-h2 text-palette-5">Alătură-te conversației</h2>
          <p className="typo-leading-p text-palette-5">
            Intră pe grupul de Whatsapp dacă vrei să participi la următorul salon.
          </p>
        </div>

        <div className="w-full border-y border-black py-8 flex justify-center items-center hover:bg-black/5 transition-colors cursor-pointer">
          <a 
            href="https://chat.whatsapp.com/your-group-link" // Placeholder link
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
