// src/utils/routeEngine.js

/**
 * Haversine: distancia en metros entre dos coordenadas.
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const dPhi = (lat2 - lat1) * Math.PI / 180;
  const dLam = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Encuentra el nodo más cercano a las coordenadas dadas.
 * @param {Array} nodes  – array de { id, lat, lng }
 * @param {number} lat
 * @param {number} lng
 * @returns {string|null} id del nodo más cercano
 */
export function closestNode(nodes, lat, lng) {
  if (!nodes || nodes.length === 0) return null;
  let best = null;
  let bestDist = Infinity;
  for (const n of nodes) {
    const d = getDistance(lat, lng, n.lat, n.lng);
    if (d < bestDist) { bestDist = d; best = n.id; }
  }
  return best;
}

/**
 * Dijkstra – camino más corto entre dos nodos.
 *
 * Protegido contra:
 *  - startNodeId o endNodeId inexistentes en el grafo → retorna [] sin colgarse
 *  - grafo desconectado → retorna [] sin colgarse
 *  - ciclos / nodos duplicados
 *
 * @returns {{ path: string[], distance: number }}
 */
export function findShortestPath(graph, startNodeId, endNodeId) {
  if (!graph?.nodes?.length || !graph?.edges) return { path: [], distance: 0 };

  // Verificar que ambos nodos existen
  const nodeIds = new Set(graph.nodes.map(n => n.id));
  if (!nodeIds.has(startNodeId) || !nodeIds.has(endNodeId)) {
    return { path: [], distance: 0 };
  }

  if (startNodeId === endNodeId) return { path: [startNodeId], distance: 0 };

  // Inicializar
  const dist = {};
  const prev = {};
  const q    = new Set();

  for (const n of graph.nodes) {
    dist[n.id] = Infinity;
    prev[n.id] = null;
    q.add(n.id);
  }
  dist[startNodeId] = 0;

  // Construir lista de adyacencia para velocidad O(E) en lugar de O(V·E)
  const adj = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const e of graph.edges) {
    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      adj[e.source].push({ id: e.target, w: e.distance || 1 });
      adj[e.target].push({ id: e.source, w: e.distance || 1 }); // bidireccional
    }
  }

  while (q.size > 0) {
    // Pick el nodo con dist mínima que aún esté en q
    let u = null;
    let minD = Infinity;
    for (const id of q) {
      if (dist[id] < minD) { minD = dist[id]; u = id; }
    }

    // Si no encontramos ninguno alcanzable, salimos (grafo desconectado)
    if (u === null || dist[u] === Infinity) break;
    // Si ya llegamos al destino, terminamos temprano
    if (u === endNodeId) break;

    q.delete(u);

    for (const { id: v, w } of adj[u]) {
      if (!q.has(v)) continue;
      const alt = dist[u] + w;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }

  // Reconstruir camino
  const path = [];
  let curr = endNodeId;

  // Si el destino no fue alcanzado
  if (prev[curr] === null && curr !== startNodeId) {
    return { path: [], distance: 0 };
  }

  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr];
    // Protección anti-ciclo
    if (path.length > graph.nodes.length + 1) break;
  }

  return {
    path,
    distance: dist[endNodeId] !== Infinity ? dist[endNodeId] : 0
  };
}
