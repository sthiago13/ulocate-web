import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  MapContainer, TileLayer, GeoJSON, Marker, Popup,
  useMapEvents, CircleMarker, Polyline
} from 'react-leaflet';
import L from 'leaflet';
import geoDataRaw from '../../une.geojson?raw';
import { getDistance, findShortestPath, closestNode } from '../utils/routeEngine';
import {
  getNodes, addNode, saveNodes,
  getEdges, addEdge, saveEdges,
  getUbicaciones, addUbicacion, updateUbicacion, deleteUbicacion,
  saveUbicaciones, getUbicacionByNodeId
} from '../utils/localDB';

const geoData = JSON.parse(geoDataRaw);

// ── Leaflet icon fix ──────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const locationIcon = new L.Icon({
  iconUrl:    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl:  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// ── Utils ─────────────────────────────────────────────────────────────────────
function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
function formatTime(meters) {
  // Velocidad caminando ~4.5 km/h = 75 m/min
  const mins = Math.ceil(meters / 75);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

// ── MapClickInterceptor ───────────────────────────────────────────────────────
function MapClickInterceptor({ isAdminMode, onMapClick }) {
  useMapEvents({ click(e) { if (isAdminMode) onMapClick(e.latlng); } });
  return null;
}

// ── Formulario inline: asignar Lugar a Nodo ──────────────────────────────────
function NodeLugarForm({ node, existingUbi, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState({
    nombre:      existingUbi?.nombre      || '',
    descripcion: existingUbi?.descripcion || '',
    categoria:   existingUbi?.categoria   || 'Académico',
    icono:       existingUbi?.icono       || '📍',
  });
  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const CATS = ['Académico', 'Alimentación', 'Servicios', 'Administrativo', 'Recreación'];

  return (
    <div
      style={{ zIndex: 1500 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[340px] max-w-[92vw] bg-white rounded-2xl shadow-2xl p-5 border border-blue-100"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[16px] text-gray-800">
          {existingUbi ? '✏️ Editar Lugar' : '📍 Asignar Lugar al Nodo'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
      </div>
      <form onSubmit={e => { e.preventDefault(); if (!form.nombre.trim()) return; onSave(form); }} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input name="icono" value={form.icono} onChange={change} className="w-[52px] text-center border border-gray-200 rounded-lg p-2 text-xl" />
          <input name="nombre" value={form.nombre} onChange={change} placeholder="Nombre *" required className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select name="categoria" value={form.categoria} onChange={change} className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500">
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <textarea name="descripcion" value={form.descripcion} onChange={change} placeholder="Descripción..." rows={2} className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 text-[14px] font-semibold">Guardar</button>
          {existingUbi && (
            <button type="button" onClick={onDelete} className="px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-2 text-[14px] font-semibold">Eliminar</button>
          )}
        </div>
      </form>
      <p className="text-[11px] text-gray-400 mt-2 text-center">Lat: {node.lat.toFixed(5)} · Lng: {node.lng.toFixed(5)}</p>
    </div>
  );
}

// ── Panel lateral admin ───────────────────────────────────────────────────────
function AdminSidePanel({ nodeCount, edgeCount, onClear, onClose }) {
  return (
    <div style={{ zIndex: 1400 }} className="fixed top-20 right-4 w-[220px] bg-white rounded-2xl shadow-xl p-4 border border-blue-100">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-[15px] text-blue-700">🛣️ Modo Editor</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg">✕</button>
      </div>
      <div className="text-[13px] text-gray-600 space-y-1 mb-4">
        <p>📌 <b className="text-gray-800">{nodeCount}</b> nodos</p>
        <p>🔗 <b className="text-gray-800">{edgeCount}</b> conexiones</p>
      </div>
      <div className="text-[12px] text-gray-500 bg-blue-50 rounded-xl p-3 space-y-1 mb-3">
        <p>• <b>Clic en mapa</b> → crear nodo</p>
        <p>• <b>Clic nodo</b> → seleccionar (🔴)</p>
        <p>• <b>2° clic nodo distinto</b> → conectar</p>
        <p>• <b>Clic nodo seleccionado</b> → asignar lugar</p>
      </div>
      <button onClick={onClear} className="w-full bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-2 text-[13px] font-medium">🗑️ Limpiar todo</button>
    </div>
  );
}

// ── Panel de Navegación activa ──────────────────────────────────────────────
function NavigationPanel({ destination, distanceRemaining, totalDistance, onCancel, arrived }) {
  const progress = totalDistance > 0
    ? Math.max(0, Math.min(100, ((totalDistance - distanceRemaining) / totalDistance) * 100))
    : 0;

  if (arrived) return null;

  return (
    <div
      style={{ zIndex: 1400 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[340px] max-w-[92vw] bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100"
    >
      {/* Barra de progreso superior */}
      <div className="h-1.5 bg-gray-100 w-full">
        <div
          className="h-full bg-green-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Destino */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl shrink-0">
              🧭
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Navegando a</p>
              <p className="font-bold text-[15px] text-gray-900 truncate">{destination?.nombre || 'Destino'}</p>
              <p className="text-[12px] text-gray-500">{destination?.categoria}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-700 text-xl shrink-0 leading-none mt-1"
          >✕</button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-[22px] font-black text-green-700 leading-none">{formatDistance(distanceRemaining)}</p>
            <p className="text-[11px] text-green-600 mt-1">Distancia restante</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-[22px] font-black text-blue-700 leading-none">{formatTime(distanceRemaining)}</p>
            <p className="text-[11px] text-blue-600 mt-1">Tiempo estimado</p>
          </div>
        </div>

        {/* Progreso textual */}
        <p className="text-[12px] text-gray-500 text-center">
          {Math.round(progress)}% completado · {formatDistance(totalDistance - distanceRemaining)} recorrido
        </p>
      </div>
    </div>
  );
}

// ── Toast de llegada ──────────────────────────────────────────────────────────
function ArrivalToast({ destination, onDismiss }) {
  useEffect(() => {
    // Vibrar si está disponible
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{ zIndex: 1600 }} className="fixed top-20 left-1/2 -translate-x-1/2 w-[320px] max-w-[92vw] bg-green-600 text-white rounded-2xl shadow-2xl p-5 text-center animate-bounce">
      <p className="text-3xl mb-2">🎉</p>
      <p className="font-bold text-[18px]">¡Has llegado!</p>
      <p className="text-green-100 text-[14px] mt-1">{destination?.nombre}</p>
      <button
        onClick={onDismiss}
        className="mt-3 bg-white/20 hover:bg-white/30 rounded-xl px-5 py-2 text-[13px] font-semibold"
      >
        Cerrar
      </button>
    </div>
  );
}

// ── CampusMap (principal) ──────────────────────────────────────────────────────
export default function CampusMap({ isRouteAdminMode, onExitAdminMode }) {
  const campusCenter = [7.794, -72.198];
  const campusBounds = [[7.785, -72.210], [7.805, -72.185]];

  // ─── State ──────────────────────────────────────────────────────────────
  const [nodes,       setNodes]       = useState(() => getNodes());
  const [edges,       setEdges]       = useState(() => getEdges());
  const [ubicaciones, setUbicaciones] = useState(() => getUbicaciones());
  const [selectedId,  setSelectedId]  = useState(null);
  const [formNode,    setFormNode]    = useState(null);

  // Navegación
  const [activeRoute,       setActiveRoute]       = useState([]);   // array de nodos
  const [routeDestination,  setRouteDestination]  = useState(null); // {nombre, categoria, nodeId}
  const [totalDistance,     setTotalDistance]     = useState(0);    // metros total
  const [distRemaining,     setDistRemaining]     = useState(0);    // metros restantes
  const [arrived,           setArrived]           = useState(false);
  const [showArrivalToast,  setShowArrivalToast]  = useState(false);

  // GPS
  const [userPosition, setUserPosition] = useState(null);
  const userPositionRef = useRef(null);
  useEffect(() => { userPositionRef.current = userPosition; }, [userPosition]);

  // Ref de ruta para el watcher
  const routeRef = useRef({ activeRoute: [], destination: null, totalDistance: 0 });
  useEffect(() => {
    routeRef.current = { activeRoute, destination: routeDestination, totalDistance };
  }, [activeRoute, routeDestination, totalDistance]);

  // Ref estado admin
  const stateRef = useRef({});
  useEffect(() => { stateRef.current = { nodes, edges, selectedId }; }, [nodes, edges, selectedId]);

  // ─── GPS watch ────────────────────────────────────────────────────────────
  useEffect(() => {
    let watchId;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        pos => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setUserPosition(newPos);
          // Actualizar distancia restante si hay ruta activa
          const { activeRoute: ar, destination: dest, totalDistance: td } = routeRef.current;
          if (ar.length > 0 && dest) {
            const destNode = ar[ar.length - 1];
            const remaining = getDistance(newPos[0], newPos[1], destNode.lat, destNode.lng);
            setDistRemaining(remaining);
            // Llegada: dentro de 15 metros del destino
            if (remaining < 15) {
              setArrived(true);
              setShowArrivalToast(true);
              setActiveRoute([]);
            }
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }
    return () => watchId && navigator.geolocation.clearWatch(watchId);
  }, []);

  // ─── Reload ───────────────────────────────────────────────────────────────
  const reload = () => {
    setNodes(getNodes());
    setEdges(getEdges());
    setUbicaciones(getUbicaciones());
  };

  // ─── Evento de ruta desde TarjetaUbicacion ────────────────────────────────
  useEffect(() => {
    const handleRoute = () => {
      const ns = getNodes();
      const es = getEdges();
      const targetStr = localStorage.getItem('active_route_target');

      if (ns.length < 2) {
        alert('El administrador debe crear al menos 2 nodos conectados para trazar rutas.');
        return;
      }

      // Nodo destino
      let endNodeId = ns[ns.length - 1].id;
      let destination = null;
      if (targetStr) {
        const ubiTarget = JSON.parse(targetStr);
        destination = ubiTarget;
        if (ubiTarget.nodeId && ns.find(n => n.id === ubiTarget.nodeId)) {
          endNodeId = ubiTarget.nodeId;
        } else {
          const match = getUbicaciones().find(u =>
            u.nombre === ubiTarget.Nombre || u.nombre === ubiTarget.nombre
          );
          if (match?.nodeId) { endNodeId = match.nodeId; destination = match; }
        }
      }

      // Nodo origen: el más cercano al usuario
      const currentPos = userPositionRef.current;
      let startNodeId = ns[0].id;
      if (currentPos) {
        startNodeId = closestNode(ns, currentPos[0], currentPos[1]);
      }

      if (startNodeId === endNodeId) {
        alert('Ya estás en el destino o muy cerca.');
        return;
      }

      try {
        const { path, distance } = findShortestPath({ nodes: ns, edges: es }, startNodeId, endNodeId);
        if (path.length === 0) {
          alert('No hay un camino válido. Asegúrate de que los nodos están conectados con tramos.');
          return;
        }

        const routeNodes = path.map(id => ns.find(n => n.id === id)).filter(Boolean);
        // Prefixar con posición real si hay GPS
        if (currentPos) {
          routeNodes.unshift({ id: 'user', lat: currentPos[0], lng: currentPos[1] });
        }

        // Calcular distancia total de la ruta (suma de tramos)
        let totalDist = 0;
        if (currentPos) {
          totalDist += getDistance(currentPos[0], currentPos[1], routeNodes[1]?.lat || 0, routeNodes[1]?.lng || 0);
        }
        for (let i = (currentPos ? 2 : 1); i < routeNodes.length; i++) {
          totalDist += getDistance(routeNodes[i - 1].lat, routeNodes[i - 1].lng, routeNodes[i].lat, routeNodes[i].lng);
        }

        const destNode = routeNodes[routeNodes.length - 1];
        const initialRemaining = currentPos
          ? getDistance(currentPos[0], currentPos[1], destNode.lat, destNode.lng)
          : totalDist;

        setActiveRoute(routeNodes);
        setRouteDestination(destination);
        setTotalDistance(totalDist || distance);
        setDistRemaining(initialRemaining);
        setArrived(false);
        setShowArrivalToast(false);
      } catch (err) {
        console.error('Error en pathfinding:', err);
        alert('Error calculando la ruta. Intenta de nuevo.');
      }
    };
    window.addEventListener('route_triggered', handleRoute);
    return () => window.removeEventListener('route_triggered', handleRoute);
  }, []);

  const cancelRoute = () => {
    setActiveRoute([]);
    setRouteDestination(null);
    setTotalDistance(0);
    setDistRemaining(0);
    setArrived(false);
    setShowArrivalToast(false);
  };

  // ─── Admin: clic en mapa ──────────────────────────────────────────────────
  const handleMapClick = (latlng) => {
    addNode(latlng.lat, latlng.lng);
    reload();
    setSelectedId(null);
    setFormNode(null);
  };

  // ─── Admin: clic en nodo ──────────────────────────────────────────────────
  const handleNodeClick = (node, e) => {
    if (!isRouteAdminMode) return;
    if (e.originalEvent) { e.originalEvent.stopPropagation(); e.originalEvent.preventDefault(); }

    const { selectedId: curr, edges: currEdges, nodes: currNodes } = stateRef.current;
    setFormNode(null);

    if (!curr) {
      setSelectedId(node.id);
    } else if (curr === node.id) {
      setSelectedId(null);
      setFormNode(node);
    } else {
      const src = currNodes.find(n => n.id === curr);
      if (src) {
        addEdge(curr, node.id, getDistance(src.lat, src.lng, node.lat, node.lng));
        setEdges(getEdges());
      }
      setSelectedId(null);
    }
  };

  const handleSaveUbicacion = (formData) => {
    const existing = getUbicacionByNodeId(formNode.id);
    if (existing) {
      updateUbicacion(existing.id, formData);
      saveNodes(getNodes().map(n => n.id === formNode.id ? { ...n, label: formData.nombre } : n));
    } else {
      addUbicacion({ nodeId: formNode.id, ...formData });
    }
    reload();
    setFormNode(null);
  };

  const handleDeleteUbicacion = () => {
    const existing = getUbicacionByNodeId(formNode.id);
    if (existing) deleteUbicacion(existing.id);
    reload();
    setFormNode(null);
  };

  const handleClearAll = () => {
    if (!confirm('¿Borrar todos los nodos, tramos y lugares?')) return;
    saveNodes([]); saveEdges([]); saveUbicaciones([]);
    reload();
    setSelectedId(null); setFormNode(null); cancelRoute();
  };

  return (
    <div className="w-full h-full relative">

      {/* Interface Overlays using Portals to stay on top of the Map */}
      {createPortal(
        <>
          {/* Panel admin */}
          {isRouteAdminMode && (
            <AdminSidePanel
              nodeCount={nodes.length}
              edgeCount={edges.length}
              onClear={handleClearAll}
              onClose={onExitAdminMode}
            />
          )}

          {/* Formulario asignar lugar a nodo */}
          {formNode && isRouteAdminMode && (
            <NodeLugarForm
              node={formNode}
              existingUbi={getUbicacionByNodeId(formNode.id)}
              onSave={handleSaveUbicacion}
              onDelete={handleDeleteUbicacion}
              onCancel={() => setFormNode(null)}
            />
          )}

          {/* Panel navegación activa */}
          {activeRoute.length > 0 && !isRouteAdminMode && !arrived && (
            <NavigationPanel
              destination={routeDestination}
              distanceRemaining={distRemaining}
              totalDistance={totalDistance}
              onCancel={cancelRoute}
              arrived={arrived}
            />
          )}

          {/* Toast de llegada */}
          {showArrivalToast && (
            <ArrivalToast
              destination={routeDestination}
              onDismiss={() => { setShowArrivalToast(false); cancelRoute(); }}
            />
          )}
        </>,
        document.body
      )}

      <MapContainer
        center={campusCenter}
        zoom={17}
        minZoom={15}
        maxBounds={campusBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* GeoJSON campus */}
        {geoData && (
          <GeoJSON
            data={geoData}
            style={{ color: '#155dfc', weight: 3, opacity: 0.6, fillColor: '#155dfc', fillOpacity: 0.05 }}
          />
        )}

        {/* Ruta activa */}
        {activeRoute.length > 0 && !isRouteAdminMode && (
          <>
            <Polyline
              positions={activeRoute.map(n => [n.lat, n.lng])}
              color="#22c55e" weight={6} lineCap="round" lineJoin="round"
            />
            {/* Destino */}
            <CircleMarker
              center={[activeRoute[activeRoute.length - 1].lat, activeRoute[activeRoute.length - 1].lng]}
              radius={10}
              pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 1, weight: 3 }}
            >
              <Popup><b>🏁 {routeDestination?.nombre || 'Destino'}</b></Popup>
            </CircleMarker>
          </>
        )}

        {/* Edges / Tramos */}
        {edges.map(edge => {
          const src = nodes.find(n => n.id === edge.source);
          const tgt = nodes.find(n => n.id === edge.target);
          if (!src || !tgt) return null;
          return (
            <Polyline
              key={edge.id}
              positions={[[src.lat, src.lng], [tgt.lat, tgt.lng]]}
              color={isRouteAdminMode ? '#6366f1' : '#94a3b8'}
              weight={isRouteAdminMode ? 3 : 2}
              dashArray={isRouteAdminMode ? '6 4' : ''}
            />
          );
        })}

        {/* Nodos (solo en modo admin) */}
        {isRouteAdminMode && nodes.map(node => {
          const isSel    = selectedId === node.id;
          const hasPlace = !!getUbicacionByNodeId(node.id);
          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={isSel ? 9 : (hasPlace ? 7 : 6)}
              pathOptions={{
                color:       isSel ? '#ef4444' : (hasPlace ? '#16a34a' : '#6366f1'),
                fillColor:   isSel ? '#ef4444' : (hasPlace ? '#22c55e' : '#818cf8'),
                fillOpacity: 1, weight: 2,
              }}
              eventHandlers={{ click: e => handleNodeClick(node, e) }}
            >
              <Popup>
                <b>{node.label || 'Nodo sin nombre'}</b><br />
                <small>Lat: {node.lat.toFixed(5)} · Lng: {node.lng.toFixed(5)}</small>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Pins de Ubicaciones */}
        {ubicaciones.map(ubi => {
          const node = nodes.find(n => n.id === ubi.nodeId);
          if (!node) return null;
          const icon = new L.DivIcon({
            html: `<div style="background:#155dfc;color:white;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 3px 10px rgba(21,93,252,0.45);border:2px solid white">${ubi.icono || '📍'}</div>`,
            iconSize: [34, 34], iconAnchor: [17, 17], className: ''
          });
          return (
            <Marker key={ubi.id} position={[node.lat, node.lng]} icon={icon}>
              <Popup>
                <strong style={{ fontSize: 14 }}>{ubi.icono} {ubi.nombre}</strong><br />
                <em style={{ color: '#6b7280', fontSize: 12 }}>{ubi.categoria}</em><br />
                {ubi.descripcion && <span style={{ fontSize: 13 }}>{ubi.descripcion}</span>}
              </Popup>
            </Marker>
          );
        })}

        {/* Posición del usuario */}
        {userPosition && (
          <Marker position={userPosition} icon={locationIcon}>
            <Popup>📍 Tu ubicación actual</Popup>
          </Marker>
        )}

        <MapClickInterceptor isAdminMode={isRouteAdminMode} onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
}
