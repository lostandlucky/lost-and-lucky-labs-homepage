import ProjectCard from './ProjectCard.jsx';

const EXTRA_ENTRIES = [
  {
    id: 'extra-laser-pet',
    slug: 'laser-engravings',
    title: 'Laser Engraved Pet Cutting Board',
    hero_image: { filename: 'pet-cutting-board.jpg', alt_text: 'Laser Engraved Pet Cutting Board' },
  },
];

export default function PortfolioGrid({ projects }) {
  if (!projects || projects.length === 0) return null;

  const allEntries = [...projects, ...EXTRA_ENTRIES];

  return (
    <section id="portfolio" className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-16">
      {allEntries.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  );
}
