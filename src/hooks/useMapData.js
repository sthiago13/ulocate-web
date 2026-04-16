import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * Hook para obtener las ubicaciones
 * @param {Object} options - Opciones del hook
 * @param {boolean} options.isAdmin - Si el usuario es administrador
 */
export const useUbicaciones = ({ isAdmin = false } = {}) => {
  return useQuery({
    queryKey: ['ubicaciones'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Ubicacion').select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
    // Si es admin, los datos son stale inmediatamente (staleTime: 0)
    // Si no es admin, cachea por 10 minutos
    staleTime: isAdmin ? 0 : 10 * 60 * 1000,
    // Siempre mantén algo en caché mientras se hace refetch en background (opcional)
    refetchOnWindowFocus: isAdmin, 
  });
};

/**
 * Hook para obtener las categorías
 * @param {Object} options - Opciones del hook
 * @param {boolean} options.isAdmin - Si el usuario es administrador
 */
export const useCategorias = ({ isAdmin = false } = {}) => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Categoria').select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
    staleTime: isAdmin ? 0 : 10 * 60 * 1000,
    refetchOnWindowFocus: isAdmin, // Para que los usuarios normales no gasten requests
  });
};

/**
 * Hook para obtener las zonas
 */
export const useZonas = ({ isAdmin = false } = {}) => {
  return useQuery({
    queryKey: ['zonas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Zona').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: isAdmin ? 0 : 10 * 60 * 1000,
    refetchOnWindowFocus: isAdmin,
  });
};

/**
 * Hook para obtener las imágenes de una ubicación específica
 */
export const useImagenesUbicacion = (ubicacionId) => {
  return useQuery({
    queryKey: ['imagenes', ubicacionId],
    queryFn: async () => {
      if (!ubicacionId) return [];
      const { data, error } = await supabase
        .from('Referencias_Visuales')
        .select('URL_Imagen')
        .eq('ID_Ubicacion', ubicacionId);
      
      if (error) throw new Error(error.message);
      return data ? data.map(i => i.URL_Imagen).filter(url => url) : [];
    },
    enabled: !!ubicacionId,
    staleTime: 5 * 60 * 1000, // cache regular
  });
};
