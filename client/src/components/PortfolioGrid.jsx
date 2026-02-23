import ProjectCard from './ProjectCard.jsx';

export default function PortfolioGrid({ projects }) {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="portfolio" className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-16">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  );
}
