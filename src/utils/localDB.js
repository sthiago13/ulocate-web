/**
 * localDB.js – Base de datos local usando localStorage como backend.
 * Simula Supabase de manera local para el prototipo.
 */

const KEYS = {
  NODES: 'unet_graph_nodes',
  EDGES: 'unet_graph_edges',
  UBICACIONES: 'unet_ubicaciones',
};

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Nodos ──────────────────────────────────────────────────────────────────
export function getNodes()            { return read(KEYS.NODES); }
export function saveNodes(nodes)      { write(KEYS.NODES, nodes); }

export function addNode(lat, lng) {
  const nodes = getNodes();
  const newNode = { id: `node_${Date.now()}`, lat, lng, label: null };
  nodes.push(newNode);
  saveNodes(nodes);
  return newNode;
}

export function deleteNode(id) {
  saveNodes(getNodes().filter(n => n.id !== id));
  // también borra edges relacionadas
  saveEdges(getEdges().filter(e => e.source !== id && e.target !== id));
}

// ── Edges ──────────────────────────────────────────────────────────────────
export function getEdges()            { return read(KEYS.EDGES); }
export function saveEdges(edges)      { write(KEYS.EDGES, edges); }

export function addEdge(sourceId, targetId, distance) {
  const edges = getEdges();
  const edgeId = `${sourceId}__${targetId}`;
  const exists = edges.some(e =>
    (e.source === sourceId && e.target === targetId) ||
    (e.source === targetId && e.target === sourceId)
  );
  if (exists) return null;
  const newEdge = { id: edgeId, source: sourceId, target: targetId, distance };
  edges.push(newEdge);
  saveEdges(edges);
  return newEdge;
}

export function deleteEdge(id) {
  saveEdges(getEdges().filter(e => e.id !== id));
}

// ── Ubicaciones ────────────────────────────────────────────────────────────
export function getUbicaciones()      { return read(KEYS.UBICACIONES); }
export function saveUbicaciones(u)    { write(KEYS.UBICACIONES, u); }

export function addUbicacion({ nodeId, nombre, descripcion, categoria, icono }) {
  const ubicaciones = getUbicaciones();
  const newUbi = {
    id: `ubi_${Date.now()}`,
    nodeId,          // ← enlazado directo al nodo del grafo
    nombre,
    descripcion,
    categoria,
    icono: icono || '📍',
  };
  ubicaciones.push(newUbi);
  saveUbicaciones(ubicaciones);
  // también etiqueta el nodo con el nombre
  const nodes = getNodes().map(n => n.id === nodeId ? { ...n, label: nombre } : n);
  saveNodes(nodes);
  return newUbi;
}

export function updateUbicacion(id, patch) {
  const ubicaciones = getUbicaciones().map(u => u.id === id ? { ...u, ...patch } : u);
  saveUbicaciones(ubicaciones);
  // si el patch tiene nombre, actualiza el label del nodo
  if (patch.nombre) {
    const ubi = getUbicaciones().find(u => u.id === id);
    if (ubi) saveNodes(getNodes().map(n => n.id === ubi.nodeId ? { ...n, label: patch.nombre } : n));
  }
}

export function deleteUbicacion(id) {
  const ubi = getUbicaciones().find(u => u.id === id);
  if (ubi) {
    // quita la etiqueta del nodo
    const nodes = getNodes().map(n => n.id === ubi.nodeId ? { ...n, label: null } : n);
    saveNodes(nodes);
  }
  saveUbicaciones(getUbicaciones().filter(u => u.id !== id));
}

export function getUbicacionByNodeId(nodeId) {
  return getUbicaciones().find(u => u.nodeId === nodeId) || null;
}
