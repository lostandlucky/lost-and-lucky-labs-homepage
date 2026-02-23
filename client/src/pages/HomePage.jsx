import { useState, useEffect } from 'react';
import { fetchProjects, fetchSettings } from '../lib/api.js';
import { useScrollToHash } from '../hooks/useScrollToHash.js';
import Layout from '../components/Layout.jsx';
import HeroSection from '../components/HeroSection.jsx';
import PortfolioGrid from '../components/PortfolioGrid.jsx';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState(null);

  useScrollToHash();

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {});
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <Layout>
      <HeroSection settings={settings} />
      <PortfolioGrid projects={projects} />
    </Layout>
  );
}
