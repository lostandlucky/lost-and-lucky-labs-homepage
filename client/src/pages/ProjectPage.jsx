import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProject } from '../lib/api.js';
import Layout from '../components/Layout.jsx';
import ImageGallery from '../components/ImageGallery.jsx';
import Lightbox from '../components/Lightbox.jsx';

export default function ProjectPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    fetchProject(slug).then(setProject).catch(() => {});
  }, [slug]);

  if (!project) return <Layout><div className="py-16 text-center">Loading...</div></Layout>;

  const heroImage = project.images?.find(img => img.is_hero === 1);
  const galleryImages = project.images?.filter(img => img.is_hero !== 1) || [];

  return (
    <Layout>
      <div className="py-8">
        <div data-testid="project-hero-section" className="flex flex-col md:flex-row gap-8 mb-8">
          {heroImage && (
            <div data-testid="project-hero-image" className="md:w-1/2">
              <img
                src={heroImage.url}
                alt={heroImage.alt_text || project.title}
                className="w-full object-cover"
              />
            </div>
          )}

          <div data-testid="project-hero-text" className="md:w-1/2 flex flex-col justify-center">
            <h1 className="text-2xl md:text-4xl font-semibold text-black tracking-[7.6px] bg-white/0 mb-4">
              {project.title}
            </h1>

            <p className="text-[#666] leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        {galleryImages.length > 0 && (
          <ImageGallery
            images={galleryImages}
            onImageClick={(index) => setLightboxIndex(index)}
          />
        )}

        {lightboxIndex !== null && (
          <Lightbox
            images={galleryImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={() => setLightboxIndex((lightboxIndex + 1) % galleryImages.length)}
            onPrev={() => setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length)}
          />
        )}
      </div>
    </Layout>
  );
}
