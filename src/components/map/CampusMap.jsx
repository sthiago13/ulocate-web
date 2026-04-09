import React, { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import {
  MapContainer, TileLayer, GeoJSON, Marker, Popup,
  useMap, useMapEvents, CircleMarker, Polyline, Polygon
} from 'react-leaflet';
import L from 'leaflet';
import geoDataRaw from '../../utils/perimetroUnet.geojson?raw';
import { getDistance, findShortestPath, closestNode } from '../../utils/routeEngine';
import ReactDOMServer from 'react-dom/server';
import * as MdIcons from 'react-icons/md';
import { supabase } from '../../lib/supabaseClient';
import NavigationPanel from './NavigationPanel';
import ArrivalToast from './ArrivalToast';
import EditorLugar from '../admin/EditorLugar';
import GestionarNodos from '../admin/GestionarNodos';
import ModalConfirmacion from '../common/ModalConfirmacion';

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

// ── MapClickInterceptor ───────────────────────────────────────────────────────
function MapClickInterceptor({ isAdminMode, onMapClick }) {
  useMapEvents({ click(e) { if (isAdminMode) onMapClick(e.latlng); } });
  return null;
}

// ── MapRefCapture – captura la instancia del mapa para usarla fuera del MapContainer
function MapRefCapture({ mapRef }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

// ── CampusMap (principal) ─────────────────────────────────────────────────────
const CampusMap = forwardRef(function CampusMap({
  isRouteAdminMode,
  onExitAdminMode,
  onUbicacionSelect,
}, ref) {
  const campusCenter = [7.794, -72.198];
  const campusBounds = [[7.785, -72.210], [7.805, -72.185]];

  // ─── Graph state (directo de Supabase) ──────────────────────────────────────
  const [nodes,       setNodes]       = useState([]);
  const [edges,       setEdges]       = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [selectedId,  setSelectedId]  = useState(null);

  // Estado para el editor de lugar (doble clic en nodo)
  const [editorNodoId,  setEditorNodoId]  = useState(null);  // ID_Nodo de Supabase
  const [editorLocData, setEditorLocData] = useState(null);  // objeto existente o null
  const [isEditorOpen,  setIsEditorOpen]  = useState(false);

  // Estado para modal de confirmación (eliminar nodo)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, nodeId: null });

  // ─── Ref para la instancia del mapa (zoom buttons + flyTo) ────────────────────
  const mapInstanceRef = useRef(null);

  // ─── Admin panel state ──────────────────────────────────────────────────────
  const [canAddNodes, setCanAddNodes] = useState(false);

  // Navegación
  const [activeRoute,      setActiveRoute]      = useState([]);
  const [routeDestination, setRouteDestination] = useState(null);
  const [totalDistance,    setTotalDistance]    = useState(0);
  const [distRemaining,    setDistRemaining]    = useState(0);
  const [arrived,          setArrived]          = useState(false);
  const [showArrivalToast, setShowArrivalToast] = useState(false);

  // GPS
  const [userPosition, setUserPosition] = useState(null);
  const userPositionRef = useRef(null);
  useEffect(() => { userPositionRef.current = userPosition; }, [userPosition]);

  // Refs para el watcher y para el estado admin (sin re-render en closures)
  const routeRef = useRef({ activeRoute: [], destination: null, totalDistance: 0 });
  useEffect(() => {
    routeRef.current = { activeRoute, destination: routeDestination, totalDistance };
  }, [activeRoute, routeDestination, totalDistance]);

  const stateRef = useRef({});
  useEffect(() => { stateRef.current = { nodes, edges, selectedId }; }, [nodes, edges, selectedId]);

  // ─── Carga inicial desde Supabase ────────────────────────────────────────────
  const loadFromSupabase = useCallback(async () => {
    try {
      const [{ data: nodesDB }, { data: tramosDB }, { data: ubisDB }] = await Promise.all([
        supabase.from('Nodo').select('*'),
        supabase.from('Tramo').select('*'),
        supabase.from('Ubicacion').select('*, Categoria(*)'),
      ]);

      // ── Nodos ────────────────────────────────────────────────────────────────
      const mappedNodes = (nodesDB || []).map(n => ({
        id:    n.ID_Nodo,          // usamos directamente el ID de Supabase
        lat:   parseFloat(n.Latitud),
        lng:   parseFloat(n.Longitud),
        label: null,               // se completa más abajo al cruzar con Ubicaciones
      }));

      // ── Tramos ───────────────────────────────────────────────────────────────
      const mappedEdges = (tramosDB || []).map(t => ({
        id:       `${t.ID_Nodo_Origen}__${t.ID_Nodo_Destino}`,
        source:   t.ID_Nodo_Origen,
        target:   t.ID_Nodo_Destino,
        distance: parseFloat(t.Distancia_Metros),
        supaId:   t.ID_Tramo,
      }));

      // ── Ubicaciones ──────────────────────────────────────────────────────────
      const mappedUbis = (ubisDB || []).map(u => ({
        id:         u.ID_Ubicacion,
        nodeId:     u.ID_Nodo,
        nombre:     u.Nombre,
        descripcion: u.Descripcion || '',
        categoria:  u.Categoria?.Nombre_Categoria || '',
        icono:      u.Categoria?.Icono || 'MdPlace',
        supaObj:    u,             // guardamos el objeto completo por si EditorLugar necesita más campos
      }));

      // Etiquetar nodos con nombre de su ubicación
      const ubisMap = Object.fromEntries(mappedUbis.map(u => [u.nodeId, u.nombre]));
      const labeledNodes = mappedNodes.map(n => ({
        ...n, label: ubisMap[n.id] || null,
      }));

      setNodes(labeledNodes);
      setEdges(mappedEdges);
      setUbicaciones(mappedUbis);
    } catch (err) {
      console.warn('Error cargando datos del mapa desde Supabase:', err);
    }
  }, []);

  useEffect(() => { loadFromSupabase(); }, [loadFromSupabase]);

  // ─── GPS watch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let watchId;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        pos => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setUserPosition(newPos);
          const { activeRoute: ar, destination: dest, totalDistance: td } = routeRef.current;
          if (ar.length > 0 && dest) {
            const destNode = ar[ar.length - 1];
            const remaining = getDistance(newPos[0], newPos[1], destNode.lat, destNode.lng);
            setDistRemaining(remaining);
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

  // ─── Trazar ruta (llamado desde BottomMenu via prop) ─────────────────────────
  // Este método se expone como ref para que BottomMenu lo llame
  const startRoute = useCallback((ubiTarget) => {
    const ns = stateRef.current.nodes;
    const es = stateRef.current.edges;

    if (ns.length < 2) {
      alert('El administrador debe crear al menos 2 nodos conectados para trazar rutas.');
      return;
    }

    // Nodo destino = ID_Nodo de la ubicación
    const endNodeId = ubiTarget?.ID_Nodo || ubiTarget?.nodeId || null;
    if (!endNodeId) {
      alert('No se puede trazar ruta: esta ubicación no tiene nodo asignado.');
      return;
    }

    // Nodo origen: más cercano al usuario o el primero
    const currentPos = userPositionRef.current;
    let startNodeId = ns.length > 0 ? ns[0].id : null;
    if (currentPos) {
      startNodeId = closestNode(ns, currentPos[0], currentPos[1]);
    }

    if (!startNodeId) {
      alert('No se pudo determinar el punto de inicio.');
      return;
    }

    try {
      const { path, distance } = findShortestPath({ nodes: ns, edges: es }, startNodeId, endNodeId);

      let pathNodes = [];
      if (path.length > 0) {
        pathNodes = path.map(id => ns.find(n => n.id === id)).filter(Boolean);
      } else if (startNodeId === endNodeId) {
        pathNodes = [ns.find(n => n.id === endNodeId)].filter(Boolean);
      } else {
        alert('No hay un camino conectado. El administrador debe unir los nodos para crear una ruta.');
        return;
      }

      const routeNodes = [...pathNodes];
      if (currentPos) {
        routeNodes.unshift({ id: 'user', lat: currentPos[0], lng: currentPos[1] });
      }

      let totalDist = 0;
      if (currentPos) {
        totalDist += getDistance(currentPos[0], currentPos[1], routeNodes[1]?.lat || 0, routeNodes[1]?.lng || 0);
      }
      for (let i = currentPos ? 2 : 1; i < routeNodes.length; i++) {
        totalDist += getDistance(routeNodes[i - 1].lat, routeNodes[i - 1].lng, routeNodes[i].lat, routeNodes[i].lng);
      }

      const destNode = routeNodes[routeNodes.length - 1];
      const initialRemaining = currentPos
        ? getDistance(currentPos[0], currentPos[1], destNode.lat, destNode.lng)
        : totalDist;

      setActiveRoute(routeNodes);
      setRouteDestination(ubiTarget);
      setTotalDistance(totalDist || distance);
      setDistRemaining(initialRemaining);
      setArrived(false);
      setShowArrivalToast(false);
    } catch (err) {
      console.error('Error en pathfinding:', err);
      alert('Error calculando la ruta. Intenta de nuevo.');
    }
  }, []);

  // Exponer startRoute hacia el padre (BottomMenu) via forwardRef
  useImperativeHandle(ref, () => ({ startRoute }), [startRoute]);

  const cancelRoute = () => {
    setActiveRoute([]);
    setRouteDestination(null);
    setTotalDistance(0);
    setDistRemaining(0);
    setArrived(false);
    setShowArrivalToast(false);
  };

  // ─── Admin: clic en mapa (añadir nodo) ───────────────────────────────────────
  const handleMapClick = async (latlng) => {
    if (!canAddNodes) {
      setSelectedId(null);
      return;
    }
    try {
      const { data: newNode, error } = await supabase
        .from('Nodo')
        .insert({ Latitud: latlng.lat, Longitud: latlng.lng })
        .select('*')
        .single();
      if (error) throw error;
      setNodes(prev => [...prev, {
        id:    newNode.ID_Nodo,
        lat:   parseFloat(newNode.Latitud),
        lng:   parseFloat(newNode.Longitud),
        label: null,
      }]);
    } catch (err) {
      console.error('Error creando nodo:', err);
    }
    setSelectedId(null);
  };

  // ─── Admin: clic en nodo (seleccionar / conectar) ────────────────────────────
  const handleNodeClick = async (node, e) => {
    if (!isRouteAdminMode) return;
    if (e.originalEvent) {
      e.originalEvent.stopPropagation();
      e.originalEvent.preventDefault();
    }

    const { selectedId: curr, nodes: currNodes, edges: currEdges } = stateRef.current;

    if (!curr) {
      setSelectedId(node.id);
      return;
    }

    if (curr === node.id) {
      setSelectedId(null);
      return;
    }

    // Conectar dos nodos
    const src = currNodes.find(n => n.id === curr);
    if (src) {
      // Verificar si ya existe el tramo
      const exists = currEdges.some(edge =>
        (edge.source === curr && edge.target === node.id) ||
        (edge.source === node.id && edge.target === curr)
      );
      if (!exists) {
        const dist = getDistance(src.lat, src.lng, node.lat, node.lng);
        try {
          const { data: newTramo, error } = await supabase
            .from('Tramo')
            .insert({
              ID_Nodo_Origen:   curr,
              ID_Nodo_Destino:  node.id,
              Distancia_Metros: dist,
            })
            .select('ID_Tramo')
            .single();
          if (error) throw error;
          setEdges(prev => [...prev, {
            id:       `${curr}__${node.id}`,
            source:   curr,
            target:   node.id,
            distance: dist,
            supaId:   newTramo.ID_Tramo,
          }]);
        } catch (err) {
          console.error('Error creando tramo:', err);
        }
      }
    }
    setSelectedId(null);
  };

  // ─── Admin: doble clic en nodo (abrir EditorLugar) ───────────────────────────
  const handleNodeDoubleClick = (node, e) => {
    if (!isRouteAdminMode) return;
    if (e.originalEvent) {
      e.originalEvent.stopPropagation();
      e.originalEvent.preventDefault();
    }
    setSelectedId(null);

    // Buscar si el nodo ya tiene una Ubicacion asociada
    const existingUbi = ubicaciones.find(u => u.nodeId === node.id);

    // Preparar el objeto que EditorLugar espera en su prop `lugarToEdit`
    if (existingUbi) {
      // Editar: pasamos el objeto completo de Supabase con ID_Nodo prefilled
      setEditorLocData({ ...existingUbi.supaObj, ID_Nodo: node.id });
    } else {
      // Crear: pasamos un objeto mínimo con ID_Nodo para que lo prellene
      setEditorLocData({ ID_Nodo: node.id });
    }

    setEditorNodoId(node.id);
    setIsEditorOpen(true);
  };

  // ─── Admin: eliminar nodo ────────────────────────────────────────────────────
  const handleDeleteNode = async (nodeId) => {
    try {
      const ubi = ubicaciones.find(u => u.nodeId === nodeId);
      if (ubi) {
        await supabase.from('Ubicacion_Guardada').delete().eq('ID_Ubicacion', ubi.id);
        await supabase.from('Referencias_Visuales').delete().eq('ID_Ubicacion', ubi.id);
        await supabase.from('Ubicacion').delete().eq('ID_Ubicacion', ubi.id);
      }
      await supabase.from('Tramo')
        .delete()
        .or(`ID_Nodo_Origen.eq.${nodeId},ID_Nodo_Destino.eq.${nodeId}`);
      await supabase.from('Nodo').delete().eq('ID_Nodo', nodeId);

      setNodes(prev => prev.filter(n => n.id !== nodeId));
      setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
      setUbicaciones(prev => prev.filter(u => u.nodeId !== nodeId));
      cancelRoute();
    } catch (err) {
      console.error('Error eliminando nodo:', err);
    }
  };

  // ─── Admin: limpiar todo ─────────────────────────────────────────────────────
  const handleClearAll = async () => {
    try {
      // Eliminar cascada: Ubicaciones → Tramos → Nodos
      for (const u of ubicaciones) {
        await supabase.from('Ubicacion_Guardada').delete().eq('ID_Ubicacion', u.id);
        await supabase.from('Referencias_Visuales').delete().eq('ID_Ubicacion', u.id);
        await supabase.from('Ubicacion').delete().eq('ID_Ubicacion', u.id);
      }
      // Tramos
      await supabase.from('Tramo').delete().neq('ID_Tramo', 0);
      // Nodos
      await supabase.from('Nodo').delete().neq('ID_Nodo', 0);

      setNodes([]);
      setEdges([]);
      setUbicaciones([]);
      setSelectedId(null);
      cancelRoute();
    } catch (err) {
      console.error('Error limpiando mapa:', err);
    }
  };

  // ─── Utilidad: nodo a ubicacion ──────────────────────────────────────────────
  const getUbiByNodeId = (nodeId) => ubicaciones.find(u => u.nodeId === nodeId) || null;

  return (
    <div className="w-full h-full relative">

      {/* Overlays via Portals */}
      {createPortal(
        <>
          {/* Panel admin de nodos */}
          {isRouteAdminMode && (
            <GestionarNodos
              isOpen={isRouteAdminMode}
              onClose={onExitAdminMode}
              canAddNodes={canAddNodes}
              setCanAddNodes={setCanAddNodes}
              nodeCount={nodes.length}
              edgeCount={edges.length}
              onClearAll={handleClearAll}
            />
          )}

          {/* Editor de lugar (al hacer doble clic en nodo) */}
          <EditorLugar
            isOpen={isEditorOpen}
            onClose={() => { setIsEditorOpen(false); setEditorLocData(null); }}
            lugarToEdit={editorLocData}
            onSuccess={() => {
              setIsEditorOpen(false);
              setEditorLocData(null);
              loadFromSupabase(); // Recargar datos del mapa
            }}
          />

          {/* Panel de navegación activa */}
          {activeRoute.length > 0 && !isRouteAdminMode && !arrived && (
            <NavigationPanel
              destination={routeDestination}
              distanceRemaining={distRemaining}
              totalDistance={totalDistance}
              onCancel={cancelRoute}
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

      {/* ── Botones de Zoom ─────────────────────────────────────────────────── */}
      {createPortal(
        <div
          style={{ zIndex: 9998 }}
          className="fixed
            top-24 right-3
            md:top-auto md:bottom-28 md:right-4
            flex flex-col gap-2"
        >
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-10 h-10 bg-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center text-[#155dfc] hover:bg-blue-50 transition-colors active:scale-95"
            aria-label="Acercar"
          >
            <MdIcons.MdAdd className="text-[22px]" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 bg-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center text-[#155dfc] hover:bg-blue-50 transition-colors active:scale-95"
            aria-label="Alejar"
          >
            <MdIcons.MdRemove className="text-[22px]" />
          </button>
        </div>,
        document.body
      )}

      <MapContainer
        center={campusCenter}
        zoom={17}
        minZoom={14}
        maxZoom={20}
        maxBounds={campusBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={20}
          maxNativeZoom={19}
        />

        {/* Captura la instancia del mapa para zoom buttons y flyTo */}
        <MapRefCapture mapRef={mapInstanceRef} />

        {/* Máscara fuera del campus */}
        {geoData && (
          <Polygon
            positions={[
              [[-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]],
              geoData.features[0].geometry.coordinates[0].map(c => [c[1], c[0]])
            ]}
            pathOptions={{
              color: 'transparent',
              fillColor: '#f1f5f9',
              fillOpacity: 0.85,
              interactive: false
            }}
          />
        )}

        {/* GeoJSON campus */}
        {geoData && (
          <GeoJSON
            data={geoData}
            style={{ color: '#155dfc', weight: 4, opacity: 0.8, fillColor: '#155dfc', fillOpacity: 0.05, interactive: false }}
          />
        )}

        {/* Ruta activa */}
        {activeRoute.length > 0 && !isRouteAdminMode && (
          <>
            <Polyline
              positions={activeRoute.map(n => [n.lat, n.lng])}
              color="#22c55e" weight={6} lineCap="round" lineJoin="round"
            />
            <CircleMarker
              center={[activeRoute[activeRoute.length - 1].lat, activeRoute[activeRoute.length - 1].lng]}
              radius={10}
              pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 1, weight: 3 }}
            >
              <Popup><b>🏁 {routeDestination?.Nombre || routeDestination?.nombre || 'Destino'}</b></Popup>
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
          const hasPlace = !!getUbiByNodeId(node.id);
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
              eventHandlers={{
                click:    e => handleNodeClick(node, e),
                dblclick: e => handleNodeDoubleClick(node, e),
              }}
            >
              <Popup>
                <b>{node.label || 'Nodo sin nombre'}</b><br />
                <small>ID: {node.id} · Lat: {node.lat.toFixed(5)} · Lng: {node.lng.toFixed(5)}</small>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Pins de Ubicaciones */}
        {ubicaciones.map(ubi => {
          const node = nodes.find(n => n.id === ubi.nodeId);
          if (!node) return null;

          // Renderizar el icono Md de la categoría como SVG inline para el DivIcon
          const IconComp = MdIcons[ubi.icono] || MdIcons.MdPlace;
          const svgMarkup = ReactDOMServer.renderToStaticMarkup(
            <IconComp style={{ color: 'white', fontSize: '18px', display: 'block' }} />
          );

          const icon = new L.DivIcon({
            html: `<div style="background:#155dfc;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(21,93,252,0.45);border:2.5px solid white">${svgMarkup}</div>`,
            iconSize: [36, 36], iconAnchor: [18, 18], className: ''
          });

          return (
            <Marker
              key={ubi.id}
              position={[node.lat, node.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (!isRouteAdminMode && onUbicacionSelect) {
                    // Centrar y acercar el mapa al pin con animación suave
                    mapInstanceRef.current?.flyTo([node.lat, node.lng], 19, { duration: 0.8 });
                    onUbicacionSelect(ubi.id);
                  }
                }
              }}
            />
          );
        })}

        {/* Posición del usuario */}
        {userPosition && (
          <Marker position={userPosition} icon={locationIcon}>
            <Popup>📍 Tu ubicación actual</Popup>
          </Marker>
        )}

        <MapClickInterceptor isAdminMode={isRouteAdminMode && canAddNodes} onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
});

export default CampusMap;
