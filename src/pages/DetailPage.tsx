import { useParams, Navigate } from 'react-router-dom';
import { getPageBySlug, getOtherPages } from '../config/portfolioConfig';
import ImageGallery from '../components/ImageGallery';
import SuggestedPages from '../components/SuggestedPages';

export default function DetailPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  const page = getPageBySlug(slug);

  if (!page) {
    return <Navigate to="/" replace />;
  }

  const otherPages = getOtherPages(slug);

  return (
    <div className="pb-12">
      <section className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          {page.title}
        </h1>
      </section>

      <ImageGallery images={page.gallery} />

      <SuggestedPages pages={otherPages} />
    </div>
  );
}
