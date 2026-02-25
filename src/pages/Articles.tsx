import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import ArrowLeft from '../assets/arrow-left.svg';
import ArrowRight from '../assets/arrow-right.svg';
import WhatsappPng from '../assets/whatsapp.png'; // Reusing for the "Load More" button style

// Define the context type locally
type MainLayoutContextType = {
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

type Article = {
  id: string;
  title: string;
  author: string;
};

// Mock Data
const INITIAL_ARTICLES: Article[] = [
  { id: 'vita-sicura', title: 'Vita sicura', author: 'Alex Boca' },
  { id: 'to-listen', title: 'To Listen or Not to Listen', author: 'Alex Boca' },
];

export default function Articles() {
  const { openMenu } = useOutletContext<MainLayoutContextType>();
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [hasMore, setHasMore] = useState(false); // Set to true if > 10 articles

  // Logic to load more would go here
  const handleLoadMore = () => {
    // Fetch more articles...
    console.log("Load more clicked");
  };

  return (
    <div className="flex justify-center pb-20">
      <div className="w-full md:w-[50vw] flex flex-col gap-12">
        
        {/* Page Title & Navigation */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between max-w-[50vw] pb-6">
            <Link to="/etiquette" className="p-2 hover:opacity-70 transition-opacity">
              <img src={ArrowLeft} alt="Previous" className="h-6 w-6" />
            </Link>
            
            <button 
              onClick={openMenu}
              className="typo-h2 text-center hover:opacity-70 transition-opacity"
            >
              Scrieri filosofice
            </button>

            <Link to="/how" className="p-2 hover:opacity-70 transition-opacity">
              <img src={ArrowRight} alt="Next" className="h-6 w-6" />
            </Link>
          </div>
          
          <p className="typo-leading-p text-palette-5 text-center">
            Note și amprente ale saloanelor socratice
          </p>
        </div>

        {/* Articles List */}
        <div className="flex flex-col">
          {articles.map((article) => (
            <div key={article.id} className="border-t border-[#C9C9C9] py-8 flex flex-col gap-2 group">
              <Link to={`/articles/${article.id}`} className="block">
                <h3 className="typo-h3 text-black group-hover:opacity-70 transition-opacity">
                  {article.title}
                </h3>
              </Link>
              <p className="typo-caption text-[#A1A1A1] uppercase">{article.author}</p>
            </div>
          ))}
        </div>

        {/* Load More Button (Conditional) */}
        {hasMore && (
          <div className="w-full border-y border-black py-4 flex justify-center items-center hover:bg-black/5 transition-colors cursor-pointer">
            <button 
              onClick={handleLoadMore}
              className="flex items-center gap-4 w-full justify-center"
            >
              {/* Reusing the style, maybe without the icon if not specified, 
                  but user said "same style as the button used for whatsapp".
                  The whatsapp button has an icon. I'll omit the icon for "Load More" unless requested, 
                  or use a generic plus icon? 
                  User said "same style", implying the visual look (borders, spacing, font). 
                  I will keep it simple text for now as no icon was provided for "Load More".
              */}
              <h4 className="typo-h4 text-black uppercase tracking-wider">ARATĂ MAI MULTE</h4>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
