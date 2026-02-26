import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import ArrowLeft from '@/src/assets/arrow-left.svg';
import ArrowRight from '@/src/assets/arrow-right.svg';
import ArrowLeftMuted from '@/src/assets/arrow-left-muted.svg';
import ArrowRightMuted from '@/src/assets/arrow-right-muted.svg';
import ArrowUpMuted from '@/src/assets/arrow-up-muted.svg';
import ArrowDownMuted from '@/src/assets/arrow-down-muted.svg';

// Import Illustrations
import IntrebareSvg from '@/src/assets/intrebare.svg';
import ClarificareSvg from '@/src/assets/clarificare.svg';
import PresupozitiiSvg from '@/src/assets/presupozitii.svg';
import AntinomiiSvg from '@/src/assets/antinomii.svg';
import AprofundareSvg from '@/src/assets/aprofundare.svg';

import { useSuppressUI } from '@/src/hooks/useSuppressUI';
import { useUI } from '@/src/context/UIContext';

// Define the context type locally
type MainLayoutContextType = {
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

type CardType = {
  id: number;
  name: string;
  image: string;
  description: string;
  arrow: string;
};

const CARDS_DATA = [
  { 
    name: 'Întrebarea', 
    image: IntrebareSvg, 
    description: 'Întrebarea este motorul dialogului socratic. Ea deschide perspective, provoacă gândirea și invită la explorare, nu la concluzii pripite.' 
  },
  { 
    name: 'Clarificarea', 
    image: ClarificareSvg, 
    description: 'Clarificarea ne ajută să definim termenii și să înțelegem exact ce spunem. Fără ea, dialogul riscă să devină o serie de monologuri paralele.' 
  },
  { 
    name: 'Presupoziții', 
    image: PresupozitiiSvg, 
    description: 'Identificarea presupozițiilor scoate la iveală credințele ascunis pe care ne bazăm argumentele. Este esențial să le examinăm critic.'
  },
  { 
    name: 'Antinomii', 
    image: AntinomiiSvg, 
    description: 'Antinomiile sunt contradicții aparente care ne forțează să gândim dincolo de logica binară și să acceptăm complexitatea realității.' 
  },
  { 
    name: 'Aprofundare', 
    image: AprofundareSvg, 
    description: 'Aprofundarea înseamnă să nu ne oprim la prima impresie, ci să săpăm după sensuri mai adânci și implicații subtile ale ideilor noastre.' 
  },
];

const ARROWS = [ArrowLeftMuted, ArrowRightMuted, ArrowUpMuted, ArrowDownMuted];

export default function How() {
  const { openMenu } = useOutletContext<MainLayoutContextType>();
  const { isHeaderHidden } = useUI();

  // Game State
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedNames, setMatchedNames] = useState<string[]>([]);
  const [overlayCard, setOverlayCard] = useState<CardType | null>(null);

  // Suppress UI when card overlay is open
  useSuppressUI('how-card-overlay', {
    header: !!overlayCard,
    footer: !!overlayCard
  });

  // Initialize Game
  useEffect(() => {
    const duplicatedCards = [...CARDS_DATA, ...CARDS_DATA].map((card, index) => ({
      ...card,
      id: index,
      arrow: ARROWS[index % ARROWS.length] // Assign arrows cyclically for variety
    }));
    
    // Shuffle cards
    const shuffledCards = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  }, []);

  // Handle Card Click
  const handleCardClick = (index: number) => {
    const card = cards[index];

    // If already matched, open overlay
    if (matchedNames.includes(card.name)) {
      setOverlayCard(card);
      return;
    }

    // If already flipped or 2 cards flipped, ignore
    if (flippedIndices.includes(index) || flippedIndices.length >= 2) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Check match
    if (newFlipped.length === 2) {
      const firstIndex = newFlipped[0];
      const secondIndex = newFlipped[1];
      
      if (cards[firstIndex].name === cards[secondIndex].name) {
        // Match found
        setMatchedNames(prev => [...prev, cards[firstIndex].name]);
        setFlippedIndices([]);
        setOverlayCard(cards[firstIndex]); // Open overlay on match
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-40 px-[var(--fluid-20-45)]">
      {/* Page Title & Navigation */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between pb-6 w-full md:max-w-[50vw] mx-auto">
          <Link to="/why" className="p-2 hover:opacity-70 transition-opacity hidden md:block">
            <img src={ArrowLeft} alt="Previous" className="h-6 w-6" />
          </Link>
          
          <button 
            onClick={openMenu}
            className="typo-h2 text-center hover:opacity-70 transition-opacity"
          >
            Cum se practică?
          </button>

          <Link to="/etiquette" className="p-2 hover:opacity-70 transition-opacity hidden md:block">
            <img src={ArrowRight} alt="Next" className="h-6 w-6" />
          </Link>
        </div>
        
        <p className="typo-leading-p text-palette-5 w-full md:max-w-[60vw] pt-8">
          Atelierele de filosofie practică oferă un spațiu structurat în care oamenii produc idei, interoghează presupoziții, argumentează poziții diferite și problematizează certitudini.
        </p>
      </div>

      {/* Section 1: Memory Game */}
      <section className="flex flex-col gap-8 w-full pt-8 pb-10">
        <h2 className="typo-h2 text-palette-5 pb-6">Instrumente de practică filosofică</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 border-t border-l border-[#C9C9C9]">
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index);
            const isMatched = matchedNames.includes(card.name);
            const showContent = isFlipped || isMatched;

            return (
              <div 
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`
                  aspect-square border-r border-b border-[#C9C9C9] p-4 flex flex-col justify-between items-center text-center cursor-pointer transition-colors duration-300 group
                  ${showContent ? 'bg-white' : 'bg-[#F5F3F1] hover:bg-white'}
                `}
              >
                {showContent ? (
                  <>
                    <div className="flex-grow flex items-center justify-center w-full">
                      <img src={card.image} alt={card.name} className="w-1/2 h-1/2 object-contain" />
                    </div>
                    <p className="typo-p text-black mt-2">
                      {isMatched ? card.name : "Găsește perechea para a afla detalii"}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex-grow flex items-center justify-center w-full">
                      <img 
                        src={card.arrow} 
                        alt="Reveal" 
                        className="w-6 h-6 text-[#A1A1A1] transition-transform duration-300 group-hover:rotate-90" 
                      />
                    </div>
                    <p className="typo-p text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Descoperă care este instrumentul filosofic
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Overlay */}
      {overlayCard && (
        <div className="fixed inset-0 z-[9999] bg-black text-white px-[var(--fluid-20-45)]">
          {/* Close button */}
          <button 
            onClick={() => setOverlayCard(null)}
            className={`absolute right-[var(--fluid-20-45)] z-50 text-white hover:opacity-70 transition-all ${
              isHeaderHidden ? 'top-[var(--fluid-20-45)]' : 'top-8'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 stroke-current"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="h-full w-full flex items-center">
            <div className="max-w-3xl w-full flex flex-col gap-6">
              <img
                src={overlayCard.image}
                alt={overlayCard.name}
                className="w-16 h-16 object-contain invert brightness-0"
              />
              <h2 className="typo-h2">{overlayCard.name}</h2>
              <p className="typo-leading-p w-full md:max-w-[60vw]">
                {overlayCard.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Cum decurge un salon */}
      <section className="flex flex-col lg:flex-row gap-12 w-full pt-12">
        <div className="flex flex-col gap-6 lg:w-1/2">
          <h2 className="typo-h2 text-palette-5">Cum decurge un salon</h2>
          <p className="typo-leading-p text-palette-5">
            Prin dialog socratic, învățăm să gândim clar și structurat, dar și să recunoaștem limitele propriei înțelegeri. Ne propunem să găsim plăcere în gândire, să descoperim estetica rațiunii și să dobândim capacitatea de a revela adevăruri.
          </p>
        </div>
        
        <div className="lg:w-1/2">
          <iframe
          data-testid="embed-iframe"
            style={{ borderRadius: '12px' }}
            src="https://open.spotify.com/embed/playlist/5CARCshGsSX3dfBlccFF7o?utm_source=generator&theme=0"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
