import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import ArrowLeft from '../assets/arrow-left.svg';
import ArrowRight from '../assets/arrow-right.svg';
import FilosofPng from '../assets/filosof.png';

// Define the context type locally since we can't import it easily without circular deps or moving types
type MainLayoutContextType = {
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

const QUOTES = [
  { name: 'Radu', text: 'Pare un hibrid intre filosofia teoretica, foarte abstracta si practica ce implica doar atentia.' },
  { name: 'Marcel', text: 'Pentru ca ma pune sa ma gandesc mai altfel.' },
  { name: 'Cristina', text: 'Mi se pare un concept interesant pentru ca, din punctul meu de vedere, antreneaza gandirea, logica si rationalizarea.' },
  { name: 'Luiza', text: 'Pentru a-mi structura gandirea si a purta dialoguri cu sens.' },
  { name: 'Luci', text: 'Pentru a fi capabil sa despic firul in 4 cu precizie si acuratete.' },
  { name: 'Anca', text: 'Sa ma inteleg mai bine pe mine si sa-i inteleg mai bine pe ceilalti si lumea in care traiesc. Filosofia practica ne invata sa dialogam.' },
  { name: 'Andie', text: 'Pentru a incerca sa simplific exprimarea gandurilor si ideilor proprii.' }
];

const LEFT_COLUMN_TEXTS = [
  "Conceptualizează orice fenomen și identifică rapid ce e esențial.",
  "Poate opri un discurs lung și incoerent pentru a aduce claritate.",
  "Ascultă obiectiv și separă ce spune celălalt de ce gândește el însuși.",
  "Nu se lasă copleșit de emoții — ale sale sau ale altora.",
  "Înțelege comportamentele umane și oferă mai multe interpretări posibile.",
  "Cultivă claritatea în gândire și în limbaj.",
  "Poate pune orice idee sub semnul întrebării."
];

const RIGHT_COLUMN_TEXTS = [
  "Pune întrebări cu sens care îl fac pe celălalt să gândească și să se cunoască.",
  "Își cunoaște propriile predispoziții și știe să-și suspende judecățile.",
  "Numește lucrurile direct, fără să ocolească realitatea.",
  "Își apără ideile cu argumente și recunoaște când greșește.",
  "Explorează și conectează idei neobișnuite, dincolo de ce știe deja.",
  "Se provoacă pe sine și pe ceilalți, fără să-i fie teamă de reacții.",
  "" // Empty row
];

function TypingText({ text, onComplete }: { text: string, onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        if (index >= text.length) {
          clearInterval(intervalId);
          if (onComplete) onComplete();
          return prev;
        }
        const nextChar = text.charAt(index);
        index++;
        return prev + nextChar;
      });
    }, 30); // Typing speed

    return () => clearInterval(intervalId);
  }, [text, onComplete]);

  return <span>{displayedText}</span>;
}

export default function Why() {
  const { openMenu } = useOutletContext<MainLayoutContextType>();
  const [visibleQuotesCount, setVisibleQuotesCount] = useState(0);

  useEffect(() => {
    // Start the first card immediately
    if (visibleQuotesCount === 0) {
      setVisibleQuotesCount(1);
    }
  }, []);

  const handleQuoteComplete = () => {
    if (visibleQuotesCount < QUOTES.length) {
      setTimeout(() => {
        setVisibleQuotesCount((prev) => prev + 1);
      }, 1500); // 1.5s delay
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Page Title & Navigation */}
      <div className="flex items-center justify-between border-b border-[#E7E7E7] pb-6">
        <Link to="/" className="p-2 hover:opacity-70 transition-opacity">
          <img src={ArrowLeft} alt="Previous" className="h-6 w-6" />
        </Link>
        
        <button 
          onClick={openMenu}
          className="typo-h2 text-center hover:opacity-70 transition-opacity"
        >
          De ce filozofie practică?
        </button>

        <Link to="/how" className="p-2 hover:opacity-70 transition-opacity">
          <img src={ArrowRight} alt="Next" className="h-6 w-6" />
        </Link>
      </div>

      {/* Section 1: Quotes */}
      <section className="flex flex-col gap-6 w-full">
        {QUOTES.slice(0, visibleQuotesCount).map((quote, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm w-full"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <p className="typo-p text-black mb-4 min-h-[1.5em]">
              {index === visibleQuotesCount - 1 ? (
                <TypingText 
                  text={quote.text} 
                  onComplete={handleQuoteComplete} 
                />
              ) : (
                quote.text
              )}
            </p>
            <p className="typo-caption text-[#A1A1A1] uppercase">{quote.name}</p>
          </div>
        ))}
      </section>

      {/* Section 2: Filosoful practician */}
      <section className="flex flex-col gap-8 w-full">
        <div className="flex flex-col gap-4">
          <h2 className="typo-h2 text-palette-5">Filosoful practician</h2>
          <p className="typo-leading-p text-palette-5">
            Practică arta conversației cu sens. O activitate de exersare intensă a minții, un antrenament constant pentru a se menține în formă mentală bună.
          </p>
        </div>

        {/* The Box */}
        <div className="w-full border border-[#C9C9C9]">
          {/* Header Row */}
          <div className="w-full py-6 text-center">
            <h4 className="typo-h4 text-black uppercase">Abilitățile filosofului practician</h4>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Column 1 (Left) */}
            <div className="flex flex-col">
              {LEFT_COLUMN_TEXTS.map((text, idx) => (
                <div key={idx} className="border-t border-[#C9C9C9] p-6 h-full flex items-center">
                  <p className="typo-p text-black">{text}</p>
                </div>
              ))}
            </div>

            {/* Column 2 (Image) */}
            <div className="border-t border-[#C9C9C9] lg:border-t-0 lg:border-x flex items-center justify-center bg-[#F5F3F1] p-6">
              <img 
                src={FilosofPng} 
                alt="Filosoful" 
                className="w-full h-auto object-contain max-h-[600px]" 
              />
            </div>

            {/* Column 3 (Right) */}
            <div className="flex flex-col">
              {RIGHT_COLUMN_TEXTS.map((text, idx) => (
                <div key={idx} className="border-t border-[#C9C9C9] p-6 h-full flex items-center">
                  <p className="typo-p text-black">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
