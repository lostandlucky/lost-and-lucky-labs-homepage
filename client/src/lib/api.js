export async function fetchProjects() {
  const res = await fetch('/api/projects');
  const data = await res.json();
  return data.projects;
}

export async function fetchProject(slug) {
  const res = await fetch(`/api/projects/${slug}`);
  const data = await res.json();
  return data.project;
}

export async function fetchSettings() {
  const res = await fetch('/api/settings');
  const data = await res.json();
  return data.settings;
}

export async function submitContact(formData) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  return data;
}
