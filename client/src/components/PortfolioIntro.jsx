export default function PortfolioIntro() {
  return (
    <section className="text-center py-12 px-5" data-testid="portfolio-intro">
      <h3 className="text-xl md:text-2xl font-bold text-black mb-4">
        Here are a few things we've worked on
      </h3>
      <hr className="border-t border-[#e0e0e0] max-w-[100px] mx-auto mb-4" />
      <p className="text-sm text-black">
        Click on any image for more detail regarding the project
      </p>
    </section>
  );
}
