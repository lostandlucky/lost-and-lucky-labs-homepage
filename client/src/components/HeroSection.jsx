import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function HeroSection({ settings }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    function createPlayer() {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: 'AHsceDsFEQs',
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: 'AHsceDsFEQs',
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            e.target.setPlaybackRate(0.5);
            e.target.playVideo();
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, []);

  if (!settings) return null;

  return (
    <section
      className="relative text-white text-center pt-[66px] pb-0 min-h-screen bg-black bg-cover bg-center overflow-hidden w-screen -ml-[calc((100vw-100%)/2)] -mt-[70px] md:-mt-[50px]"
      style={{ backgroundImage: "url('/images/hero/hero-bg.png')" }}
      data-testid="hero-section"
    >
      <div
        className="absolute inset-0 pointer-events-none [&_iframe]:absolute [&_iframe]:top-1/2 [&_iframe]:left-1/2 [&_iframe]:-translate-x-1/2 [&_iframe]:-translate-y-1/2 [&_iframe]:w-[177.78vh] [&_iframe]:h-[56.25vw] [&_iframe]:min-w-full [&_iframe]:min-h-full"
        data-testid="hero-video"
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>
      <div className="absolute inset-0 bg-black/50 z-[1]" data-testid="hero-overlay" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
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
