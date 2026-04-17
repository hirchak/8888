const API_BASE = '';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Stats
  getStats: () => request('/api/stats'),

  // People
  listPeople: (search?: string) =>
    request(search ? `/api/people?search=${encodeURIComponent(search)}` : '/api/people'),
  getPerson: (id: number) => request(`/api/people/${id}`),
  createPerson: (data: any) =>
    request('/api/people', { method: 'POST', body: JSON.stringify(data) }),
  updatePerson: (id: number, data: any) =>
    request(`/api/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePerson: (id: number) =>
    request(`/api/people/${id}`, { method: 'DELETE' }),

  // Projects
  listProjects: (search?: string) =>
    request(search ? `/api/projects?search=${encodeURIComponent(search)}` : '/api/projects'),
  getProject: (id: number) => request(`/api/projects/${id}`),
  createProject: (data: any) =>
    request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: number, data: any) =>
    request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: number) =>
    request(`/api/projects/${id}`, { method: 'DELETE' }),

  // Ideas
  listIdeas: (search?: string) =>
    request(search ? `/api/ideas?search=${encodeURIComponent(search)}` : '/api/ideas'),
  getIdea: (id: number) => request(`/api/ideas/${id}`),
  createIdea: (data: any) =>
    request('/api/ideas', { method: 'POST', body: JSON.stringify(data) }),
  updateIdea: (id: number, data: any) =>
    request(`/api/ideas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIdea: (id: number) =>
    request(`/api/ideas/${id}`, { method: 'DELETE' }),

  // Opportunities
  listOpportunities: (search?: string) =>
    request(search ? `/api/opportunities?search=${encodeURIComponent(search)}` : '/api/opportunities'),
  getOpportunity: (id: number) => request(`/api/opportunities/${id}`),
  createOpportunity: (data: any) =>
    request('/api/opportunities', { method: 'POST', body: JSON.stringify(data) }),
  updateOpportunity: (id: number, data: any) =>
    request(`/api/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOpportunity: (id: number) =>
    request(`/api/opportunities/${id}`, { method: 'DELETE' }),

  // Links
  createLink: (sourceType: string, sourceId: number, targetType: string, targetId: number) =>
    request('/api/links', {
      method: 'POST',
      body: JSON.stringify({ source_type: sourceType, source_id: sourceId, target_type: targetType, target_id: targetId }),
    }),
  deleteLink: (sourceType: string, sourceId: number, targetType: string, targetId: number) =>
    request('/api/links', {
      method: 'DELETE',
      body: JSON.stringify({ source_type: sourceType, source_id: sourceId, target_type: targetType, target_id: targetId }),
    }),

  // Recommendations
  getRecommendations: (entityType: string, entityId: number, limit = 5) =>
    request(`/api/recommendations?entityType=${entityType}&entityId=${entityId}&limit=${limit}`),

  // Tasks
  listTasks: () => request('/api/tasks'),
  createTask: (data: any) =>
    request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: number, data: any) =>
    request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: number) =>
    request(`/api/tasks/${id}`, { method: 'DELETE' }),
};