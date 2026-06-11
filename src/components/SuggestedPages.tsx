import { Link } from 'react-router-dom';
import { PortfolioPage } from '../config/portfolioConfig';

interface SuggestedPagesProps {
  pages: PortfolioPage[];
}

export default function SuggestedPages({ pages }: SuggestedPagesProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-20 border-t border-gray-100">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-8 sm:mb-10">
        More Work
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {pages.map((page) => (
          <Link
            key={page.id}
            to={`/${page.slug}`}
            className="relative aspect-[4/3] overflow-hidden rounded-lg group"
          >
            <img
              src={page.heroImage}
              alt={page.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <h3 className="text-white text-lg sm:text-xl font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-4">
                {page.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
