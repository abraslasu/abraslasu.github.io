import { useState, useEffect, useRef, useCallback } from 'react';
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
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated to avoid restarting effect when callback changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  useEffect(() => {
    setDisplayedText('');
    let localIndex = 0;
    
    const intervalId = setInterval(() => {
      localIndex++;
      // Use substring to ensure we display exactly the text up to localIndex
      // This prevents any character accumulation errors
      setDisplayedText(text.substring(0, localIndex));
      
      if (localIndex >= text.length) {
        clearInterval(intervalId);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, 80); // Slower typing speed (writing imitation)

    return () => clearInterval(intervalId);
  }, [text]); // Only restart if text changes

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

  const handleQuoteComplete = useCallback(() => {
    if (visibleQuotesCount < QUOTES.length) {
      setTimeout(() => {
        setVisibleQuotesCount((prev) => prev + 1);
      }, 1000); // 1s delay
    }
  }, [visibleQuotesCount]);

  return (
    <div className="flex flex-col gap-20 pb-20 pt-32">
      {/* Page Title & Navigation */}
      <div className="flex items-center justify-between w-full max-w-[33vw] mx-auto">
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
      <section className="relative w-full h-[65vh] overflow-hidden bg-palette-1">
        {QUOTES.slice(0, visibleQuotesCount).map((quote, index) => {
          // Generate stable random positions based on index
          const seed = index * 123.45; 
          
          // Calculate positions centered around 35% (moved up)
          // Range: 25% to 45% for vertical axis
          // First card (index 0) is exactly in the center
          let top = 35;
          let left = 50;
          let rotate = 0;

          if (index > 0) {
             // Random spread for subsequent cards
             // Use sin/cos to distribute around center
             // Spread X: -10% to +10% (Result: 40% to 60%)
             // Spread Y: -10% to +10% (Result: 25% to 45%)
             const spreadX = (Math.sin(seed * 3) * 10); 
             const spreadY = (Math.cos(seed * 4) * 10); 
             
             left = 50 + spreadX;
             top = 35 + spreadY;
             rotate = -15 + (Math.abs(Math.sin(seed * 2)) * 30); // -15 to 15 deg
          } else {
             // First card slightly rotated but centered
             rotate = -5 + (Math.abs(Math.sin(seed)) * 10);
          }
          
          return (
            <div 
              key={index}
              className="absolute bg-white p-8 shadow-md w-auto max-w-[33vw] transition-all duration-500"
              style={{ 
                top: `${top}%`, 
                left: `${left}%`, 
                transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                zIndex: index + 10
              }}
            >
              <p className="typo-quote text-black mb-4 min-h-[1.5em]">
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
          );
        })}
      </section>

      {/* Section 2: Filosoful practician */}
      <section className="flex flex-col gap-16 w-full">
        <div className="flex flex-col gap-4">
          <h2 className="typo-h2 text-palette-5">Filosoful practician</h2>
          <p className="typo-leading-p text-palette-5 max-w-[60vw]">
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
