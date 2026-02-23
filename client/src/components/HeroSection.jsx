import { Link } from 'react-router-dom';

export default function HeroSection({ settings }) {
  if (!settings) return null;

  return (
    <section className="text-center py-24 md:py-32">
      <h1 className="text-3xl md:text-5xl font-bold text-[#333] uppercase mb-4">
        {settings.site_title}
      </h1>
      <p className="text-lg md:text-xl text-[#666] mb-8">
        {settings.site_tagline}
      </p>
      <Link
        to="/contact-us"
        className="inline-block bg-[#1a3a5c] text-white px-8 py-3 text-sm uppercase tracking-[2px] hover:opacity-90 transition-opacity"
      >
        {settings.hero_cta_text}
      </Link>
    </section>
  );
}
