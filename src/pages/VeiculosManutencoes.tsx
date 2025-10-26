import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Plus, Wrench, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVehicles } from '@/hooks/useVehicles';
import { Vehicle, Maintenance } from '@/types/financial';
import LoadingSpinner from '@/components/LoadingSpinner';
import VehicleForm from '@/components/veiculos/VehicleForm';
import MaintenanceForm from '@/components/veiculos/MaintenanceForm';
import VehicleCard from '@/components/veiculos/VehicleCard';
import MaintenanceHistory from '@/components/veiculos/MaintenanceHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const VeiculosManutencoes = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>('PF');
  const [activeTab, setActiveTab] = useState('vehicles');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | undefined>();
  const [initialVehicleId, setInitialVehicleId] = useState<string | undefined>();
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  
  const { 
    vehicles, 
    maintenances, 
    loading, 
    actionLoading, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle,
    addMaintenance,
    deleteMaintenance
  } = useVehicles();

  const workspaceVehicles = useMemo(() => {
    return vehicles.filter(v => v.workspace === currentWorkspace);
  }, [vehicles, currentWorkspace]);
  
  const workspaceMaintenances = useMemo(() => {
    const vehicleIds = workspaceVehicles.map(v => v.id);
    return maintenances.filter(m => vehicleIds.includes(m.vehicle_id));
  }, [maintenances, workspaceVehicles]);

  const handleVehicleSubmit = async (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'created_at'>) => {
    if (editingVehicle) {
      await updateVehicle(editingVehicle.id, vehicleData);
    } else {
      await addVehicle(vehicleData);
    }
    setShowVehicleForm(false);
    setEditingVehicle(undefined);
  };
  
  const handleMaintenanceSubmit = async (maintenanceData: Omit<Maintenance, 'id' | 'user_id' | 'created_at'>) => {
    // Nota: A lógica de updateMaintenance não está implementada no hook, apenas add/delete.
    // Se for uma edição, o usuário deve recriar a manutenção ou usar o formulário de veículo para atualizar o KM.
    if (editingMaintenance) {
      // Se for edição, apenas atualizamos o estado local para fechar o form
      setShowMaintenanceForm(false);
    } else {
      await addMaintenance(maintenanceData);
    }
    setShowMaintenanceForm(false);
    setEditingMaintenance(undefined);
  };

  const handleAddMaintenance = (vehicleId?: string) => {
    setEditingMaintenance(undefined);
    setInitialVehicleId(vehicleId);
    setShowMaintenanceForm(true);
  };
  
  const handleOpenEditForm = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
    setShowVehicleDetails(false); // Fechar detalhes ao abrir o form
  };
  
  const handleShowDetails = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleDetails(true);
  };

  if (loading) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => {}}
      >
        <LoadingSpinner text="Carregando dados de veículos..." />
      </Layout>
    );
  }

  if (showVehicleForm) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => setShowVehicleForm(true)}
      >
        <div className="p-4">
          <VehicleForm
            vehicle={editingVehicle}
            workspace={currentWorkspace}
            onSubmit={handleVehicleSubmit}
            onCancel={() => setShowVehicleForm(false)}
            loading={actionLoading}
          />
        </div>
      </Layout>
    );
  }
  
  if (showMaintenanceForm) {
    return (
      <Layout
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onNewTransaction={() => setShowMaintenanceForm(true)}
      >
        <div className="p-4">
          <MaintenanceForm
            maintenance={editingMaintenance}
            vehicles={workspaceVehicles}
            onSubmit={handleMaintenanceSubmit}
            onCancel={() => setShowMaintenanceForm(false)}
            loading={actionLoading}
            initialVehicleId={initialVehicleId}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={setCurrentWorkspace}
      onNewTransaction={() => setShowVehicleForm(true)}
    >
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Car className="h-7 w-7 text-primary" />
            <span>Veículos e Manutenções ({currentWorkspace})</span>
          </h1>
          <Button onClick={() => { setEditingVehicle(undefined); setShowVehicleForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Veículo
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vehicles">Veículos ({workspaceVehicles.length})</TabsTrigger>
            <TabsTrigger value="maintenances">Manutenções ({workspaceMaintenances.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vehicles" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {workspaceVehicles.length === 0 ? (
                <Card className="lg:col-span-3">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhum veículo cadastrado para {currentWorkspace}.
                  </CardContent>
                </Card>
              ) : (
                workspaceVehicles.map(vehicle => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    maintenances={maintenances}
                    onEdit={handleShowDetails} // Abrir detalhes
                    onDelete={deleteVehicle}
                    onAddMaintenance={handleAddMaintenance}
                    loading={actionLoading}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="maintenances" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg">Histórico de Manutenções</CardTitle>
                <Button size="sm" onClick={() => handleAddMaintenance()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Manutenção
                </Button>
              </CardHeader>
              <CardContent>
                {workspaceMaintenances.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhuma manutenção registrada para os veículos de {currentWorkspace}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workspaceMaintenances.map(m => (
                      <div key={m.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{m.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {m.type} - {m.km_performed.toLocaleString('pt-BR')} km
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-red-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.cost)}
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => deleteMaintenance(m.id)} disabled={actionLoading}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal de Detalhes do Veículo */}
      <Dialog open={showVehicleDetails} onOpenChange={setShowVehicleDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Detalhes do Veículo: {editingVehicle?.name}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleOpenEditForm(editingVehicle!)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTitle>
          </DialogHeader>
          {editingVehicle && (
            <div className="space-y-6">
              <MaintenanceHistory 
                vehicle={editingVehicle} 
                maintenances={maintenances} 
                onDeleteMaintenance={deleteMaintenance}
                loading={actionLoading}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default VeiculosManutencoes;