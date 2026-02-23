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
        {heroImage && (
          <img
            src={heroImage.url}
            alt={heroImage.alt_text || project.title}
            className="w-full object-cover"
          />
        )}

        <h1 className="text-2xl md:text-4xl font-semibold text-[#333] mt-8 mb-4">
          {project.title}
        </h1>

        <p className="text-[#666] leading-relaxed mb-8">
          {project.description}
        </p>

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
