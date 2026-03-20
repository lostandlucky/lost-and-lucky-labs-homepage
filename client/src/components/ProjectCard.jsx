import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const heroSrc = project.hero_image
    ? `/images/projects/${project.slug}/${project.hero_image.filename}`
    : null;

  return (
    <Link to={`/${project.slug}`} data-testid="project-card" className="group block relative overflow-hidden">
      {heroSrc && (
        <img
          src={heroSrc}
          alt={project.hero_image?.alt_text || project.title}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <p
        data-testid="project-card-title"
        className="absolute bottom-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-black text-lg px-4 py-2"
        style={{ backgroundColor: 'rgba(245, 245, 245, 0.9)', fontFamily: 'Esteban, serif' }}
      >
        {project.title}
      </p>
    </Link>
  );
}
