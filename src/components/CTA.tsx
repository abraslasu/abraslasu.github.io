import { Link } from 'react-router-dom';

interface CTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function CTA({
  title = "Ready to start your journey?",
  description = "Discover the wisdom that awaits you.",
  buttonText = "Get Started",
  buttonLink = "/how"
}: CTAProps) {
  return (
    <section className="bg-palette-2 py-20 px-4">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="typo-h2 mb-6">{title}</h2>
        <p className="typo-leading-p mb-10 text-palette-5/80">
          {description}
        </p>
        <Link 
          to={buttonLink}
          className="inline-block bg-black text-white px-8 py-4 rounded-full typo-h4 uppercase tracking-widest hover:bg-palette-4 hover:text-black transition-all duration-300"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}
