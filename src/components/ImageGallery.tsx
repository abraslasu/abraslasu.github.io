import { useState, useEffect } from 'react';
import Lightbox from './Lightbox';

interface ImageGalleryProps {
  images: Promise<string>[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [resolvedImages, setResolvedImages] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    Promise.all(images).then(setResolvedImages);
  }, [images]);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % resolvedImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + resolvedImages.length) % resolvedImages.length);
  };

  if (resolvedImages.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto py-12">
        <p className="text-center text-gray-500">Loading gallery...</p>
      </div>
    );
  }

  return (
    <>
      <section className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {resolvedImages.map((src, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className="relative aspect-[4/3] overflow-hidden group cursor-pointer"
            >
              <img
                src={src}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </button>
          ))}
        </div>
      </section>

      <Lightbox
        images={resolvedImages}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </>
  );
}
