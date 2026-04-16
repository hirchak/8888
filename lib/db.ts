// Re-export from in-memory store for Vercel MVP
export { db, generateId } from './store';
export { getLinks, getLinkedIds, addLink, removeLink, removeLinksByEntity } from './store';
