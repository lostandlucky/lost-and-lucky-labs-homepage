import { Link } from 'react-router-dom';

export default function HeroSection({ settings }) {
  if (!settings) return null;

  return (
    <section
      className="relative text-white text-center pt-[66px] pb-0 min-h-screen bg-black bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/images/hero/hero-bg.png')" }}
      data-testid="hero-section"
    >
      <iframe
        className="absolute inset-0 w-full h-full pointer-events-none"
        src="https://www.youtube.com/embed/AHsceDsFEQs?autohide=1&autoplay=1&mute=1&loop=1&playlist=AHsceDsFEQs&controls=0&showinfo=0&rel=0&modestbranding=1"
        title="Background video"
        allow="autoplay; encrypted-media"
        frameBorder="0"
        style={{ transform: 'scale(1.5)', transformOrigin: 'center center' }}
        data-testid="hero-video"
      />
      <div className="absolute inset-0 bg-black/50 z-[1]" data-testid="hero-overlay" />
      <div className="relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white uppercase mb-4 tracking-[6px]">
          {settings.site_title}
        </h1>
        <h4 className="text-lg md:text-xl text-white mb-8">
          {settings.site_tagline}
        </h4>
        <Link
          to="/contact-us"
          className="inline-block border border-white text-white px-8 py-3 font-body text-sm tracking-[2px] hover:bg-white hover:text-black transition-colors"
        >
          {settings.hero_cta_text}
        </Link>
      </div>
    </section>
  );
}
