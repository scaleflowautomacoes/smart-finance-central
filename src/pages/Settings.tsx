import { useState } from "react";
import { Users, FolderOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesManager } from "@/components/settings/CategoriesManager";
import { ResponsaveisManager } from "@/components/settings/ResponsaveisManager";
import { useSettings } from "@/hooks/useSettings";
import LoadingSpinner from "@/components/LoadingSpinner";
import Layout from "@/components/Layout";

export default function Settings() {
  const { 
    categories, 
    responsaveis, 
    loading, 
    addCategory,
    updateCategory,
    deleteCategory,
    addResponsavel,
    updateResponsavel,
    deleteResponsavel
  } = useSettings();
  const [activeTab, setActiveTab] = useState("categories");

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout currentWorkspace="PF" onWorkspaceChange={() => {}} onNewTransaction={() => {}}>
      <div className="space-y-6 p-4 lg:p-6">
        <Card variant="glass" className="overflow-hidden">
          <CardContent className="p-5 lg:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Sistema e governança
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  Configurações
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Organização de categorias e responsáveis para manter consistência na operação financeira.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.history.back()} className="rounded-xl">
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="soft">
          <CardHeader>
            <CardTitle>Gerenciar Dados</CardTitle>
            <CardDescription>
              Configure categorias e responsáveis para organizar suas transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-surface/80 p-1">
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="responsaveis" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Responsáveis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="categories" className="mt-6">
                <CategoriesManager 
                  categories={categories}
                  onAdd={addCategory}
                  onUpdate={updateCategory}
                  onDelete={deleteCategory}
                />
              </TabsContent>
              
              <TabsContent value="responsaveis" className="mt-6">
                <ResponsaveisManager 
                  responsaveis={responsaveis}
                  onAdd={addResponsavel}
                  onUpdate={updateResponsavel}
                  onDelete={deleteResponsavel}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
