import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, Maintenance } from '@/types/financial';
import { useToastNotifications } from './useToastNotifications';
import { useMockUserId } from './useMockUserId';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();
  const userId = useMockUserId();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [vehiclesRes, maintenancesRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('user_id', userId).order('name'),
        supabase.from('maintenances').select('*').eq('user_id', userId).order('date_performed', { ascending: false }),
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (maintenancesRes.error) throw maintenancesRes.error;

      const convertedVehicles: Vehicle[] = (vehiclesRes.data || []).map(v => ({
        ...v,
        year: parseInt(v.year?.toString() || '0'),
        current_km: parseInt(v.current_km?.toString() || '0'),
        workspace: v.workspace as 'PF' | 'PJ',
      }));
      
      const convertedMaintenances: Maintenance[] = (maintenancesRes.data || []).map(m => ({
        ...m,
        cost: parseFloat(m.cost?.toString() || '0'),
        km_performed: parseInt(m.km_performed?.toString() || '0'),
        next_km: m.next_km ? parseInt(m.next_km.toString()) : undefined,
        type: m.type as Maintenance['type'],
      }));

      setVehicles(convertedVehicles);
      setMaintenances(convertedMaintenances);
    } catch (error) {
      console.error('Erro ao carregar dados de veículos:', error);
      showError('Erro ao carregar veículos e manutenções.');
    } finally {
      setLoading(false);
    }
  }, [showError, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Vehicle CRUD ---
  
  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at'>) => {
    setActionLoading(true);
    try {
      const insertData = { ...vehicle, user_id: userId };
      const { error } = await supabase.from('vehicles').insert([insertData]);
      if (error) throw error;
      showSuccess('Veículo cadastrado com sucesso!');
      await loadData();
    } catch (error) {
      showError('Erro ao adicionar veículo.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('vehicles').update(updates).eq('id', id).eq('user_id', userId);
      if (error) throw error;
      showSuccess('Veículo atualizado com sucesso!');
      await loadData();
    } catch (error) {
      showError('Erro ao atualizar veículo.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      showSuccess('Veículo excluído com sucesso!');
      await loadData();
    } catch (error) {
      showError('Erro ao excluir veículo.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // --- Maintenance CRUD ---

  const addMaintenance = async (maintenance: Omit<Maintenance, 'id' | 'user_id' | 'created_at'>) => {
    setActionLoading(true);
    try {
      const insertData = { ...maintenance, user_id: userId };
      const { error } = await supabase.from('maintenances').insert([insertData]);
      if (error) throw error;
      showSuccess('Manutenção registrada com sucesso!');
      await loadData();
    } catch (error) {
      showError('Erro ao registrar manutenção.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteMaintenance = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('maintenances').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      showSuccess('Manutenção excluída com sucesso!');
      await loadData();
    } catch (error) {
      showError('Erro ao excluir manutenção.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    vehicles,
    maintenances,
    loading,
    actionLoading,
    loadData,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addMaintenance,
    deleteMaintenance,
  };
};