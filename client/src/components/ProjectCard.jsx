import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const heroSrc = project.hero_image
    ? `/images/projects/${project.slug}/${project.hero_image.filename}`
    : null;

  return (
    <Link to={`/${project.slug}`} data-testid="project-card" className="group block">
      {heroSrc && (
        <div className="overflow-hidden">
          <img
            src={heroSrc}
            alt={project.hero_image?.alt_text || project.title}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <p data-testid="project-card-title" className="mt-3 font-body text-sm text-black">
        {project.title}
      </p>
    </Link>
  );
}
