import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const VIEWPORT_PADDING = 96;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const [fitScale, setFitScale] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);

  // The actual CSS scale applied to the image element
  // At fit: fitScale. At zoomed: 1 (image renders at natural size via pixel dimensions).
  // We use a single <img> whose pixel size is always naturalSize, and we scale it.
  // Fit mode: scale = fitScale, translateY = 0, overflow hidden+centered
  // Zoom mode: scale = 1, image scrolls inside the container

  const updateFitScale = useCallback((width: number, height: number) => {
    const viewportWidth = window.innerWidth - VIEWPORT_PADDING;
    const viewportHeight = window.innerHeight - VIEWPORT_PADDING;
    const next = Math.min(viewportWidth / width, viewportHeight / height, 1);
    setFitScale(next);
  }, []);

  const resetToFit = useCallback(() => {
    setIsZoomed(false);
    setScrollY(0);
  }, []);

  // Reset when image changes
  useEffect(() => {
    setImageLoaded(false);
    resetToFit();
  }, [currentIndex, images, resetToFit]);

  // Reset when lightbox closes
  useEffect(() => {
    if (!isOpen) resetToFit();
  }, [isOpen, resetToFit]);

  // Recalculate fit scale on resize
  useEffect(() => {
    if (!isOpen || naturalSize.width === 0) return;
    const handleResize = () => updateFitScale(naturalSize.width, naturalSize.height);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, naturalSize, updateFitScale]);

  // Keyboard nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    updateFitScale(img.naturalWidth, img.naturalHeight);
    setImageLoaded(true);
  };

  // Click: toggle between fit and zoomed-from-top
  const handleImageClick = useCallback(() => {
    if (isZoomed) {
      resetToFit();
    } else {
      setIsZoomed(true);
      setScrollY(0);
    }
  }, [isZoomed, resetToFit]);

  // Scroll only works in zoomed mode to unravel the image top-to-bottom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!isZoomed || naturalSize.height === 0) return;
      e.preventDefault();

      const viewport = viewportRef.current;
      if (!viewport) return;

      const viewportHeight = viewport.getBoundingClientRect().height;
      const scaledHeight = naturalSize.height; // zoom mode: scale=1, natural pixels
      // Max scroll: how far the image bottom can travel above the viewport bottom
      const maxScroll = Math.max(0, scaledHeight - viewportHeight);

      setScrollY((prev) => clamp(prev + e.deltaY, 0, maxScroll));
    },
    [isZoomed, naturalSize],
  );

  if (!isOpen) return null;

  // In zoom mode the image is full natural size, positioned from the top,
  // offset by scrollY. The container clips it.
  const imageStyle: React.CSSProperties = isZoomed
    ? {
        width: naturalSize.width || undefined,
        height: naturalSize.height || undefined,
        transform: `translateY(${-scrollY}px)`,
        transition: 'none',
        cursor: 'zoom-out',
      }
    : {
        width: naturalSize.width || undefined,
        height: naturalSize.height || undefined,
        transform: `scale(${fitScale})`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-out',
        cursor: 'zoom-in',
      };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      {/* Prev */}
      <button
        onClick={onPrev}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      {/* Viewport */}
      <div
        ref={viewportRef}
        className={`flex-1 overflow-hidden touch-none ${
          isZoomed ? 'flex items-start justify-center' : 'flex items-center justify-center'
        } px-16 sm:px-24 py-12`}
        onWheel={handleWheel}
      >
        {!imageLoaded && (
          <p className="text-white/60 text-sm">Loading…</p>
        )}
        <img
          key={images[currentIndex]}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1} of ${images.length}`}
          onLoad={handleImageLoad}
          onClick={handleImageClick}
          draggable={false}
          className={`max-w-none max-h-none select-none ${imageLoaded ? 'block' : 'hidden'}`}
          style={imageStyle}
        />
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm sm:text-base text-center pointer-events-none">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}