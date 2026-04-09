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
import GestionarNodos from '../admin/GestionarNodos';
import NodeEditorPanel from '../admin/NodeEditorPanel';
import RoutePlanner from './RoutePlanner';

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

// ── MapClickInterceptor ────────────────────────────────────────────────
function MapClickInterceptor({ isAddingNodes, isConnecting, onMapClick, onCancelConnect }) {
  useMapEvents({
    click(e) {
      if (isAddingNodes) onMapClick(e.latlng);
      else if (isConnecting) onCancelConnect();
    }
  });
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
  onOpenGestionarLugares,
  initialZoom = 17,
  hideMarkers = false,
}, ref) {
  const campusCenter = [7.794, -72.198];
  const campusBounds = [[7.785, -72.210], [7.805, -72.185]];

  // ─── Graph state (directo de Supabase) ──────────────────────────────────────
  const [nodes,       setNodes]       = useState([]);
  const [edges,       setEdges]       = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  // Estado editor (nodo seleccionado muestra NodeEditorPanel)
  const [selectedId,  setSelectedId]  = useState(null);

  // ─── Ref para la instancia del mapa (zoom buttons + flyTo) ────────────────────
  const mapInstanceRef = useRef(null);

  // ─── Admin panel state ─────────────────────────────────────────────────────
  const [canAddNodes,    setCanAddNodes]    = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null); // nodeId desde el que se conecta
  const [selectedEdge,   setSelectedEdge]   = useState(null); // tramo seleccionado para eliminar

  // Ref directo para connectingFrom (evita dependencia de render cycle en handleNodeClick)
  const connectingFromRef = useRef(null);
  const updateConnectingFrom = useCallback((val) => {
    connectingFromRef.current = val;
    setConnectingFrom(val);
  }, []);

  // Navegación
  const [activeRoute,      setActiveRoute]      = useState([]);
  const [routeDestination, setRouteDestination] = useState(null);
  const [totalDistance,    setTotalDistance]    = useState(0);
  const [distRemaining,    setDistRemaining]    = useState(0);
  const [arrived,          setArrived]          = useState(false);
  const [showArrivalToast, setShowArrivalToast] = useState(false);

  // ─── Route Planner State ──────────────────────────────────────────────────
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);
  const [plannerDestination, setPlannerDestination] = useState(null);

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
  useEffect(() => {
    stateRef.current = { nodes, edges, selectedId, connectingFrom, ubicaciones };
  }, [nodes, edges, selectedId, connectingFrom, ubicaciones]);

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

  // ─── Trazar ruta (llamado desde BottomMenu o TarjetaUbicacion) ──────────────
  // Ahora abre el planificador en lugar de iniciar inmediatamente
  const startRoute = useCallback((ubiTarget) => {
    setPlannerDestination(ubiTarget);
    setIsRoutePlannerOpen(true);
  }, []);

  // Ejecución real de la ruta desde el planificador
  const executeRoute = useCallback((origin, destination) => {
    const ns = stateRef.current.nodes;
    const es = stateRef.current.edges;

    if (ns.length < 2) {
      alert('El administrador debe crear al menos 2 nodos conectados para trazar rutas.');
      return;
    }

    let startNodeId = null;
    let currentPos = userPositionRef.current;

    if (origin.type === 'gps') {
      if (!currentPos) {
        alert('No se detecta tu ubicación GPS.');
        return;
      }
      startNodeId = closestNode(ns, currentPos[0], currentPos[1]);
    } else {
      startNodeId = origin.nodeId;
    }

    const endNodeId = destination?.ID_Nodo || destination?.nodeId;
    if (!startNodeId || !endNodeId) {
      alert('No se pudo determinar el inicio o el fin de la ruta.');
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
        alert('No hay un camino conectado entre estos puntos.');
        return;
      }

      const routeNodes = [...pathNodes];
      // Si el origen fue GPS, añadimos el punto exacto del usuario al inicio
      if (origin.type === 'gps' && currentPos) {
        routeNodes.unshift({ id: 'user', lat: currentPos[0], lng: currentPos[1] });
      }

      let totalDist = 0;
      if (origin.type === 'gps' && currentPos) {
        totalDist += getDistance(currentPos[0], currentPos[1], routeNodes[1]?.lat || 0, routeNodes[1]?.lng || 0);
        for (let i = 2; i < routeNodes.length; i++) {
          totalDist += getDistance(routeNodes[i - 1].lat, routeNodes[i - 1].lng, routeNodes[i].lat, routeNodes[i].lng);
        }
      } else {
        for (let i = 1; i < routeNodes.length; i++) {
          totalDist += getDistance(routeNodes[i - 1].lat, routeNodes[i - 1].lng, routeNodes[i].lat, routeNodes[i].lng);
        }
      }

      const destNode = routeNodes[routeNodes.length - 1];
      const initialRemaining = (origin.type === 'gps' && currentPos)
        ? getDistance(currentPos[0], currentPos[1], destNode.lat, destNode.lng)
        : totalDist;

      setActiveRoute(routeNodes);
      setRouteDestination(destination);
      setTotalDistance(totalDist || distance);
      setDistRemaining(initialRemaining);
      setArrived(false);
      setShowArrivalToast(false);
      setIsRoutePlannerOpen(false); // Cerramos el planificador
    } catch (err) {
      console.error('Error en pathfinding:', err);
      alert('Error calculando la ruta.');
    }
  }, []);

  // Exponer métodos hacia el padre via forwardRef
  useImperativeHandle(ref, () => ({
    startRoute,
    cancelRoute,
    centerOnUbicacion: (id) => {
      // Usamos un pequeño delay para que cualquier cierre de panel o re-render
      // no interrumpa la animación de Leaflet
      setTimeout(() => {
        const ubi = stateRef.current.ubicaciones?.find(u => u.id == id);
        if (!ubi) return;
        const node = stateRef.current.nodes?.find(n => n.id == ubi.nodeId);
        if (!node) return;
        mapInstanceRef.current?.flyTo([node.lat, node.lng], 19, { duration: 0.8 });
      }, 50);
    }
  }), [startRoute]);

  const cancelRoute = useCallback(() => {
    setActiveRoute([]);
    setRouteDestination(null);
    setTotalDistance(0);
    setDistRemaining(0);
    setArrived(false);
    setShowArrivalToast(false);
    setIsRoutePlannerOpen(false); // También cerramos el planificador
  }, []);

  // ─── ESC: cancelar modo conexión o deseleccionar nodo ────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { updateConnectingFrom(null); setSelectedId(null); setSelectedEdge(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [updateConnectingFrom]);

  // ─── Admin: clic en mapa (añadir nodo) ──────────────────────────────────────────
  const lastNodeTimeRef = useRef(0);
  const MIN_NODE_DIST_M = 3; // metros mínimos entre nodos

  const handleMapClick = async (latlng) => {
    if (!canAddNodes) { setSelectedId(null); return; }

    // Cooldown: máx 1 nodo por segundo (evita doble-clic que crea duplicados)
    const now = Date.now();
    if (now - lastNodeTimeRef.current < 1000) return;

    // Evitar nodos demasiado próximos entre sí
    const tooClose = stateRef.current.nodes.some(
      n => getDistance(n.lat, n.lng, latlng.lat, latlng.lng) < MIN_NODE_DIST_M
    );
    if (tooClose) return;

    lastNodeTimeRef.current = now;

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

  // ─── Admin: clic en nodo (seleccionar / modo conectar) ───────────────────────────
  const handleNodeClick = async (node, e) => {
    if (!isRouteAdminMode) return;
    e.originalEvent?.stopPropagation();
    e.originalEvent?.preventDefault();

    const connFrom = connectingFromRef.current; // siempre actual, sin ciclo de render

    if (connFrom) {
      // Clic en el mismo nodo origen = cancelar
      if (connFrom === node.id) { updateConnectingFrom(null); return; }

      // Crear tramo desde connFrom → este nodo
      const { nodes: currNodes, edges: currEdges } = stateRef.current;
      const src = currNodes.find(n => n.id === connFrom);
      if (src) {
        const exists = currEdges.some(edge =>
          (edge.source === connFrom && edge.target === node.id) ||
          (edge.source === node.id && edge.target === connFrom)
        );
        if (!exists) {
          const dist = getDistance(src.lat, src.lng, node.lat, node.lng);
          try {
            const { data: newTramo, error } = await supabase
              .from('Tramo')
              .insert({ ID_Nodo_Origen: connFrom, ID_Nodo_Destino: node.id, Distancia_Metros: dist })
              .select('ID_Tramo')
              .single();
            if (error) throw error;
            setEdges(prev => [...prev, { id: `${connFrom}__${node.id}`, source: connFrom, target: node.id, distance: dist, supaId: newTramo.ID_Tramo }]);
          } catch (err) { console.error('Error creando tramo:', err); }
        }
      }
      updateConnectingFrom(null);
      return;
    }

    // Sin modo conexión: seleccionar/deseleccionar nodo (toggle)
    setSelectedEdge(null);
    setSelectedId(prev => prev === node.id ? null : node.id);
  };

  // ─── Admin: eliminar nodo (solo si sin ubicacion) ──────────────────────────────
  const handleDeleteNode = async (nodeId) => {
    try {
      await supabase.from('Tramo').delete().or(`ID_Nodo_Origen.eq.${nodeId},ID_Nodo_Destino.eq.${nodeId}`);
      await supabase.from('Nodo').delete().eq('ID_Nodo', nodeId);

      setNodes(prev => prev.filter(n => n.id !== nodeId));
      setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
      setUbicaciones(prev => prev.filter(u => u.nodeId !== nodeId));
      cancelRoute();
    } catch (err) {
      console.error('Error eliminando nodo:', err);
    }
  };


  // ─── Admin: eliminar tramo ───────────────────────────────────────────────────
  const handleDeleteEdge = async (edge) => {
    try {
      await supabase.from('Tramo').delete().eq('ID_Tramo', edge.supaId);
      setEdges(prev => prev.filter(e => e.id !== edge.id));
      setSelectedEdge(null);
    } catch (err) {
      console.error('Error eliminando tramo:', err);
    }
  };

  // ─── Utilidad: nodo a ubicacion ──────────────────────────────────────────────
  const getUbiByNodeId = (nodeId) => ubicaciones.find(u => u.nodeId === nodeId) || null;


  return (
    <div className="w-full h-full relative">

      {/* Overlays via Portals */}
      {createPortal(
        <>
          {/* Panel admin global (toggle modo nodos + stats) */}
          {isRouteAdminMode && (
            <GestionarNodos
              isOpen={isRouteAdminMode}
              onClose={onExitAdminMode}
              canAddNodes={canAddNodes}
              setCanAddNodes={setCanAddNodes}
              nodeCount={nodes.length}
              edgeCount={edges.length}
            />
          )}

          {/* Panel de edición del nodo seleccionado */}
          {isRouteAdminMode && selectedId && (
            <NodeEditorPanel
              node={nodes.find(n => n.id === selectedId) || null}
              ubicacion={getUbiByNodeId(selectedId)}
              isOpen={!!selectedId}
              onClose={() => setSelectedId(null)}
              onStartConnect={() => updateConnectingFrom(selectedId)}
              onDeleteNode={handleDeleteNode}
              onOpenGestionarLugares={(term) => {
                setSelectedId(null);
                onOpenGestionarLugares?.(term);
              }}
              onReloadMap={loadFromSupabase}
            />
          )}

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

          {/* Planificador de Ruta (Origen y Destino) */}
          {isRoutePlannerOpen && (
            <RoutePlanner
              onClose={() => setIsRoutePlannerOpen(false)}
              onExecute={executeRoute}
              initialDestination={plannerDestination}
              ubicaciones={ubicaciones}
              userPosition={userPosition}
            />
          )}

          {/* Banner: modo conexión activo */}
          {connectingFrom && (
            <div
              style={{ zIndex: 9997 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[12px] font-bold rounded-full px-5 py-2 shadow-lg flex items-center gap-2"
            >
              <span className="animate-pulse">●</span>
              Haz clic en otro nodo para conectar · ESC para cancelar
            </div>
          )}
        </>,
        document.body
      )}

      {/* ── Botones de Zoom ─────────────────────────────────────────────────── */}
      {createPortal(
        <div
          style={{ zIndex: 59 }}
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
        zoom={initialZoom}
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
          const isSel = selectedEdge?.id === edge.id;
          return (
            <Polyline
              key={edge.id}
              positions={[[src.lat, src.lng], [tgt.lat, tgt.lng]]}
              color={isSel ? '#ef4444' : (isRouteAdminMode ? '#6366f1' : '#94a3b8')}
              weight={isSel ? 5 : (isRouteAdminMode ? 3 : 2)}
              dashArray={isRouteAdminMode && !isSel ? '6 4' : ''}
              eventHandlers={isRouteAdminMode ? {
                click: (e) => {
                  e.originalEvent?.stopPropagation();
                  setSelectedEdge(prev => prev?.id === edge.id ? null : edge);
                  setSelectedId(null);
                }
              } : {}}
            />
          );
        })}

        {/* Botón eliminar tramo (al seleccionar un edge en admin) */}
        {isRouteAdminMode && selectedEdge && (() => {
          const src = nodes.find(n => n.id === selectedEdge.source);
          const tgt = nodes.find(n => n.id === selectedEdge.target);
          if (!src || !tgt) return null;
          const midLat = (src.lat + tgt.lat) / 2;
          const midLng = (src.lng + tgt.lng) / 2;
          const deleteTramoIcon = new L.DivIcon({
            html: `<div style="background:#ef4444;color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 10px rgba(239,68,68,0.5);border:2px solid white;font-size:18px;font-weight:bold;line-height:1">×</div>`,
            iconSize: [30, 30], iconAnchor: [15, 15], className: ''
          });
          return (
            <Marker
              key={`del-${selectedEdge.id}`}
              position={[midLat, midLng]}
              icon={deleteTramoIcon}
              eventHandlers={{
                click: (e) => { e.originalEvent?.stopPropagation(); handleDeleteEdge(selectedEdge); }
              }}
            />
          );
        })()}

        {/* Nodos (solo en modo admin) */}
        {isRouteAdminMode && nodes.map(node => {
          const isSel    = selectedId === node.id;
          const isConn   = connectingFrom === node.id;
          const hasPlace = !!getUbiByNodeId(node.id);
          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={isSel ? 10 : isConn ? 10 : (hasPlace ? 7 : 6)}
              pathOptions={{
                color:       isSel ? '#ef4444' : isConn ? '#f97316' : (hasPlace ? '#16a34a' : '#6366f1'),
                fillColor:   isSel ? '#ef4444' : isConn ? '#fdba74' : (hasPlace ? '#22c55e' : '#818cf8'),
                fillOpacity: 1, weight: isSel ? 3 : 2,
              }}
              eventHandlers={{ click: e => handleNodeClick(node, e) }}
            />
          );
        })}

        {/* Pins de Ubicaciones (solo en modo usuario, no en admin) */}
        {!isRouteAdminMode && !hideMarkers && ubicaciones.map(ubi => {
          const node = nodes.find(n => n.id === ubi.nodeId);
          if (!node) return null;
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
                  cancelRoute(); // Cerramos cualquier ruta o planificador previo
                  mapInstanceRef.current?.flyTo([node.lat, node.lng], 19, { duration: 0.8 });
                  onUbicacionSelect?.(ubi.id);
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

        <MapClickInterceptor
          isAddingNodes={isRouteAdminMode && canAddNodes}
          isConnecting={!!connectingFrom}
          onMapClick={handleMapClick}
          onCancelConnect={() => updateConnectingFrom(null)}
        />
      </MapContainer>
    </div>
  );
});

export default CampusMap;
