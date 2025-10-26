import { useState } from "react";
import { ArrowLeft, Settings as SettingsIcon, Users, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesManager } from "@/components/settings/CategoriesManager";
import { ResponsaveisManager } from "@/components/settings/ResponsaveisManager";
import { useSettings } from "@/hooks/useSettings";
import LoadingSpinner from "@/components/LoadingSpinner";

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              <h1 className="text-xl font-semibold">Configurações</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Dados</CardTitle>
            <CardDescription>
              Configure categorias e responsáveis para organizar suas transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
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
      </main>
    </div>
  );
}