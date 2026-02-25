import { Link } from 'react-router-dom';
import LozPng from '../assets/loz.png';
import WhatsappPng from '../assets/whatsapp.png';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Section 1: Intro */}
      <section className="flex flex-col gap-6">
        <h2 className="typo-h2 text-palette-5">Invitație la saloanele socratice</h2>
        <h1 className="typo-h1 text-palette-5 leading-none -ml-1">FOCUS</h1>
        <p className="typo-leading-p text-palette-5 max-w-2xl">
          Un spațiu dedicat dialogului, unde ne întâlnim pentru a explora idei și curiozități, aplicând lentila filosofiei practice.
        </p>
      </section>

      {/* Section 2: Grid Links */}
      <section className="bg-white w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Row 1, Col 1 */}
          <Link to="/why" className="group border-t border-[#E7E7E7] p-6 min-h-[200px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
            <span className="typo-caption text-[#A1A1A1]">01</span>
            <h3 className="typo-h3 text-black group-hover:translate-x-2 transition-transform">De ce FOCUS?</h3>
          </Link>

          {/* Row 1, Col 2 */}
          <Link to="/how" className="group border-t border-[#E7E7E7] p-6 min-h-[200px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
            <span className="typo-caption text-[#A1A1A1]">02</span>
            <h3 className="typo-h3 text-black group-hover:translate-x-2 transition-transform">Cum se practică?</h3>
          </Link>

          {/* Row 2, Col 1 */}
          <Link to="/etiquette" className="group border-t border-[#E7E7E7] p-6 min-h-[200px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
            <span className="typo-caption text-[#A1A1A1]">03</span>
            <h3 className="typo-h3 text-black group-hover:translate-x-2 transition-transform">Cum participi?</h3>
          </Link>

          {/* Row 2, Col 2 */}
          <Link to="/articles" className="group border-t border-[#E7E7E7] p-6 min-h-[200px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
            <span className="typo-caption text-[#A1A1A1]">04</span>
            <h3 className="typo-h3 text-black group-hover:translate-x-2 transition-transform">Scrieri</h3>
          </Link>
        </div>
      </section>

      {/* Section 3: Lozul Filozofic */}
      <section className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="typo-h2 text-palette-5">Lozul Filozofic</h2>
          <p className="typo-leading-p text-palette-5">Încearcă-ți norocul la înțelepciune!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="w-full">
            <img 
              src={LozPng} 
              alt="Lozul Filozofic" 
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
