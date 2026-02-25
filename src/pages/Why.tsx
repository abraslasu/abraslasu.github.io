import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import ArrowLeft from '../assets/arrow-left.svg';
import ArrowRight from '../assets/arrow-right.svg';
import LozPng from '../assets/loz.png';

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

type CardTransform = {
  top: number;
  left: number;
  rotate: number;
};

function createInitialTransform(index: number): CardTransform {
  const seed = index * 123.45;

  // Left: 10%–90% of section width
  const left = 10 + ((Math.sin(seed * 2) + 1) / 2) * 70;

  // Top: 20%–80% of section height
  const top = 15 + ((Math.cos(seed * 3) + 1) / 2) * 40;

  // Keep a subtle random rotation
  const rotate = -15 + Math.sin(seed * 5) * 15;

  return { top, left, rotate };
}

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
  const [cardTransforms, setCardTransforms] = useState<CardTransform[]>(() =>
    QUOTES.map((_, index) => createInitialTransform(index))
  );
  const quotesContainerRef = useRef<HTMLElement | null>(null);
  const [dragState, setDragState] = useState<{
    index: number | null;
    offsetX: number;
    offsetY: number;
  }>({
    index: null,
    offsetX: 0,
    offsetY: 0,
  });

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

  useEffect(() => {
    if (dragState.index === null) return;

    const handlePointerMove = (event: PointerEvent) => {
      const container = quotesContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;

      const centerX = pointerX - dragState.offsetX;
      const centerY = pointerY - dragState.offsetY;

      let leftPercent = (centerX / rect.width) * 100;
      let topPercent = (centerY / rect.height) * 100;

      // Clamp positions so cards stay within the area
      leftPercent = Math.max(5, Math.min(95, leftPercent));
      topPercent = Math.max(10, Math.min(90, topPercent));

      setCardTransforms((prev) => {
        if (dragState.index === null || !prev[dragState.index]) return prev;
        const next = [...prev];
        next[dragState.index] = {
          ...next[dragState.index],
          left: leftPercent,
          top: topPercent,
        };
        return next;
      });
    };

    const handlePointerUp = () => {
      setDragState({
        index: null,
        offsetX: 0,
        offsetY: 0,
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, quotesContainerRef]);

  const handleCardPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    index: number
  ) => {
    const container = quotesContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    const transform = cardTransforms[index] ?? createInitialTransform(index);
    const centerX = (transform.left / 100) * rect.width;
    const centerY = (transform.top / 100) * rect.height;

    setDragState({
      index,
      offsetX: pointerX - centerX,
      offsetY: pointerY - centerY,
    });
  };

  return (
    <div className="flex flex-col gap-20 pb-40 pt-10">
      {/* Page Title & Navigation */}
      <div className="flex items-center justify-between w-full max-w-[50vw] mx-auto">
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
      <section
        ref={quotesContainerRef as React.RefObject<HTMLDivElement>}
        className="relative w-full h-[65vh] overflow-hidden bg-palette-1"
      >
        {QUOTES.slice(0, visibleQuotesCount).map((quote, index) => {
          const transform = cardTransforms[index] ?? createInitialTransform(index);
          const { top, left, rotate } = transform;
          
          return (
            <div 
              key={index}
              className="absolute bg-white p-8 shadow-md w-auto max-w-[30vw] transition-all duration-500 cursor-grab"
              onPointerDown={(event) => handleCardPointerDown(event, index)}
              style={{ 
                top: `${top}%`, 
                left: `${left}%`, 
                transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                zIndex: dragState.index === index ? 100 : index + 10
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
          <div className="w-full py-10 text-center">
            <h4 className="typo-h4 text-black uppercase">Abilitățile filosofului practician</h4>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Column 1 (Left) */}
            <div className="flex flex-col">
              {LEFT_COLUMN_TEXTS.map((text, idx) => (
                <div key={idx} className="border-t border-[#C9C9C9] py-8 px-8 h-full flex items-center">
                  <p className="typo-p text-black">{text}</p>
                </div>
              ))}
            </div>

            {/* Column 2 (Image) */}
            <div className="border-t border-[#C9C9C9] lg:border-t-0 flex items-center justify-center bg-[#F5F3F1] p-6">
              <img 
                src={LozPng}
                alt="Filosoful" 
                className="w-full h-auto object-contain max-h-[800px]" 
              />
            </div>

            {/* Column 3 (Right) */}
            <div className="flex flex-col">
              {RIGHT_COLUMN_TEXTS.map((text, idx) => (
                <div key={idx} className="border-t border-[#C9C9C9] py-8 px-8 h-full flex items-center">
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
