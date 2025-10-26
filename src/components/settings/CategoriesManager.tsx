import { useState } from "react";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Category } from "@/types/financial";

interface CategoriesManagerProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Category>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoriesManager({ categories, onAdd, onUpdate, onDelete }: CategoriesManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    origem: "PF" as "PF" | "PJ",
    tipo: "entrada" as "entrada" | "saida",
    limite_mensal: ""
  });
  

  const resetForm = () => {
    setFormData({
      nome: "",
      origem: "PF",
      tipo: "entrada",
      limite_mensal: ""
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    await onAdd({
      nome: formData.nome.trim(),
      origem: formData.origem,
      tipo: formData.tipo,
      limite_mensal: formData.limite_mensal ? parseFloat(formData.limite_mensal) : undefined
    });
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !formData.nome.trim()) return;

    await onUpdate(editingCategory.id, {
      nome: formData.nome.trim(),
      origem: formData.origem,
      tipo: formData.tipo,
      limite_mensal: formData.limite_mensal ? parseFloat(formData.limite_mensal) : undefined
    });
    
    setIsEditDialogOpen(false);
    setEditingCategory(null);
    resetForm();
  };

  const handleDelete = async (categoryId: string) => {
    await onDelete(categoryId);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nome: category.nome,
      origem: category.origem,
      tipo: category.tipo,
      limite_mensal: category.limite_mensal?.toString() || ""
    });
    setIsEditDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Categorias</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as categorias para organizar suas transações
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
                <DialogDescription>
                  Adicione uma nova categoria para organizar suas transações
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome da Categoria</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Alimentação, Transporte..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="origem">Origem</Label>
                    <Select value={formData.origem} onValueChange={(value) => setFormData(prev => ({ ...prev, origem: value as "PF" | "PJ" }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PF">Pessoa Física</SelectItem>
                        <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as "entrada" | "saida" }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="limite">Limite Mensal (opcional)</Label>
                  <Input
                    id="limite"
                    type="number"
                    step="0.01"
                    value={formData.limite_mensal}
                    onChange={(e) => setFormData(prev => ({ ...prev, limite_mensal: e.target.value }))}
                    placeholder="0,00"
                  />
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
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
                <p className="text-sm text-muted-foreground">Adicione sua primeira categoria</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium">{category.nome}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={category.origem === 'PF' ? 'default' : 'secondary'}>
                        {category.origem}
                      </Badge>
                      <Badge variant={category.tipo === 'entrada' ? 'default' : 'destructive'}>
                        {category.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                      {category.limite_mensal && (
                        <Badge variant="outline">
                          Limite: {formatCurrency(category.limite_mensal)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(category)}
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
                          Tem certeza que deseja excluir a categoria "{category.nome}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(category.id)}>
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
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Modifique os dados da categoria
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-nome">Nome da Categoria</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-origem">Origem</Label>
                  <Select value={formData.origem} onValueChange={(value) => setFormData(prev => ({ ...prev, origem: value as "PF" | "PJ" }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PF">Pessoa Física</SelectItem>
                      <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as "entrada" | "saida" }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-limite">Limite Mensal (opcional)</Label>
                <Input
                  id="edit-limite"
                  type="number"
                  step="0.01"
                  value={formData.limite_mensal}
                  onChange={(e) => setFormData(prev => ({ ...prev, limite_mensal: e.target.value }))}
                  placeholder="0,00"
                />
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