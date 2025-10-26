import { useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Responsavel } from "@/types/financial";

interface ResponsaveisManagerProps {
  responsaveis: Responsavel[];
  onAdd: (responsavel: Omit<Responsavel, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Responsavel>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ResponsaveisManager({ responsaveis, onAdd, onUpdate, onDelete }: ResponsaveisManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResponsavel, setEditingResponsavel] = useState<Responsavel | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "recorrente" as "recorrente" | "avulso",
    ativo: true
  });
  

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "recorrente",
      ativo: true
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    await onAdd({
      nome: formData.nome.trim(),
      tipo: formData.tipo,
      ativo: formData.ativo
    });
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResponsavel || !formData.nome.trim()) return;

    await onUpdate(editingResponsavel.id, {
      nome: formData.nome.trim(),
      tipo: formData.tipo,
      ativo: formData.ativo
    });
    
    setIsEditDialogOpen(false);
    setEditingResponsavel(null);
    resetForm();
  };

  const handleDelete = async (responsavelId: string) => {
    await onDelete(responsavelId);
  };

  const openEditDialog = (responsavel: Responsavel) => {
    setEditingResponsavel(responsavel);
    setFormData({
      nome: responsavel.nome,
      tipo: responsavel.tipo,
      ativo: responsavel.ativo
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Responsáveis</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os responsáveis/colaboradores das transações
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Responsável
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>Novo Responsável</DialogTitle>
                <DialogDescription>
                  Adicione um novo responsável/colaborador
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome do Responsável</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: João Silva, Maria Santos..."
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as "recorrente" | "avulso" }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recorrente">Recorrente</SelectItem>
                      <SelectItem value="avulso">Avulso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2">
        {responsaveis.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum responsável encontrado</p>
                <p className="text-sm text-muted-foreground">Adicione seu primeiro responsável</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          responsaveis.map((responsavel) => (
            <Card key={responsavel.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium">{responsavel.nome}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={responsavel.tipo === 'recorrente' ? 'default' : 'secondary'}>
                        {responsavel.tipo === 'recorrente' ? 'Recorrente' : 'Avulso'}
                      </Badge>
                      <Badge variant={responsavel.ativo ? 'default' : 'destructive'}>
                        {responsavel.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(responsavel)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o responsável "{responsavel.nome}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(responsavel.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar Responsável</DialogTitle>
              <DialogDescription>
                Modifique os dados do responsável
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-nome">Nome do Responsável</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as "recorrente" | "avulso" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recorrente">Recorrente</SelectItem>
                    <SelectItem value="avulso">Avulso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                  className="rounded border-border"
                />
                <Label htmlFor="edit-ativo">Ativo</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}