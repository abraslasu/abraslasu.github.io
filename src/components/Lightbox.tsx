import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const ZOOM_STEP = 0.25;
const VIEWPORT_PADDING = 96;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const DRAG_THRESHOLD = 5;

export default function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const pointerMoved = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scale = fitScale * zoom;
  const maxZoom = fitScale > 0 ? clamp(1 / fitScale, 1, 6) : 4;
  const minZoom = 1;
  const isZoomed = zoom > 1.01;
  const zoomPercent = Math.round(zoom * 100);

  const resetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const updateFitScale = useCallback((width: number, height: number) => {
    const viewportWidth = window.innerWidth - VIEWPORT_PADDING;
    const viewportHeight = window.innerHeight - VIEWPORT_PADDING;
    const nextFitScale = Math.min(viewportWidth / width, viewportHeight / height, 1);
    setFitScale(nextFitScale);
  }, []);

  const clampPosition = useCallback(
    (pos: { x: number; y: number }, currentScale: number) => {
      const viewport = viewportRef.current;
      if (!viewport || naturalSize.width === 0) return pos;

      const { width: viewportWidth, height: viewportHeight } = viewport.getBoundingClientRect();
      const scaledWidth = naturalSize.width * currentScale;
      const scaledHeight = naturalSize.height * currentScale;
      const maxX = Math.max(0, (scaledWidth - viewportWidth) / 2);
      const maxY = Math.max(0, (scaledHeight - viewportHeight) / 2);

      return {
        x: clamp(pos.x, -maxX, maxX),
        y: clamp(pos.y, -maxY, maxY),
      };
    },
    [naturalSize],
  );

  const setZoomLevel = useCallback(
    (nextZoom: number) => {
      const clamped = clamp(nextZoom, minZoom, maxZoom);
      setZoom(clamped);
      if (clamped <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    },
    [maxZoom],
  );

  const handleZoomIn = useCallback(() => {
    setZoomLevel(zoom + ZOOM_STEP);
  }, [setZoomLevel, zoom]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(zoom - ZOOM_STEP);
  }, [setZoomLevel, zoom]);

  const handleFitToScreen = useCallback(() => {
    resetView();
  }, [resetView]);

  const handleActualSize = useCallback(() => {
    setZoomLevel(maxZoom);
  }, [maxZoom, setZoomLevel]);

  useEffect(() => {
    setImageLoaded(false);
    resetView();
  }, [currentIndex, images, resetView]);

  useEffect(() => {
    if (!isOpen) {
      resetView();
    }
  }, [isOpen, resetView]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (naturalSize.width > 0 && naturalSize.height > 0) {
        updateFitScale(naturalSize.width, naturalSize.height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, naturalSize, updateFitScale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') resetView();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev, handleZoomIn, handleZoomOut, resetView]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    updateFitScale(img.naturalWidth, img.naturalHeight);
    setImageLoaded(true);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    if (!isZoomed) return;

    setPosition((prev) =>
      clampPosition(
        {
          x: prev.x - event.deltaX,
          y: prev.y - event.deltaY,
        },
        scale,
      ),
    );
  };

  const handleImageClick = () => {
    if (pointerMoved.current) {
      pointerMoved.current = false;
      return;
    }

    if (isZoomed) {
      resetView();
      return;
    }

    handleActualSize();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!isZoomed) return;

    pointerMoved.current = false;
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!isZoomed) return;

    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;

    if (!isDragging) {
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

      setIsDragging(true);
      pointerMoved.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    setPosition(
      clampPosition(
        {
          x: dragStart.current.posX + deltaX,
          y: dragStart.current.posY + deltaY,
        },
        scale,
      ),
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!isDragging) return;

    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      <button
        onClick={onPrev}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
        <button
          onClick={isZoomed ? handleFitToScreen : handleActualSize}
          className="h-10 sm:h-11 px-3 sm:px-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-2 transition-colors text-white text-xs sm:text-sm"
          aria-label={isZoomed ? 'Fit to screen' : 'View actual size'}
        >
          <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          {isZoomed ? 'Fit' : '100%'}
        </button>
      </div>

      <div
        ref={viewportRef}
        className="flex-1 flex items-center justify-center overflow-hidden touch-none px-16 sm:px-24 py-20"
        onWheel={handleWheel}
      >
        {!imageLoaded && (
          <p className="text-white/60 text-sm">Loading image...</p>
        )}
        <img
          key={images[currentIndex]}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1} of ${images.length}`}
          onLoad={handleImageLoad}
          onClick={handleImageClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          draggable={false}
          className={`max-w-none max-h-none select-none ${imageLoaded ? 'block' : 'hidden'} ${
            isZoomed ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
          style={{
            width: naturalSize.width || undefined,
            height: naturalSize.height || undefined,
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        />
      </div>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm sm:text-base text-center">
        <div>
          {currentIndex + 1} / {images.length}
        </div>
        <div className="text-xs sm:text-sm text-white/50 mt-1">
          {zoomPercent}% · Click image for 100% · Scroll to pan when zoomed
        </div>
      </div>
    </div>
  );
}
