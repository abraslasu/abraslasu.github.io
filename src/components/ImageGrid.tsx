import { Link } from 'react-router-dom';
import { portfolioPages } from '../config/portfolioConfig';

export default function ImageGrid() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {portfolioPages.map((page) => (
          <Link
            key={page.id}
            to={`/${page.slug}`}
            className="relative aspect-[4/3] overflow-hidden  group"
          >
            <img
              src={page.heroImage}
              alt={page.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <h3 className="text-white text-xl sm:text-2xl font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-4">
                {page.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
