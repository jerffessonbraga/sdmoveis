import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProjectCard, Project } from "@/components/projects/ProjectCard";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import kitchenRender from "@/assets/kitchen-render.jpg";
import bedroomRender from "@/assets/bedroom-render.jpg";
import officeRender from "@/assets/office-render.jpg";

const recentProjects: Project[] = [
  {
    id: "1",
    name: "Cozinha Completa",
    client: "Maria Silva",
    status: "in_progress",
    value: 18500,
    createdAt: new Date(Date.now() - 86400000 * 2),
    thumbnail: kitchenRender,
  },
  {
    id: "2",
    name: "Quarto Casal",
    client: "João Santos",
    status: "review",
    value: 12800,
    createdAt: new Date(Date.now() - 86400000 * 5),
    thumbnail: bedroomRender,
  },
  {
    id: "3",
    name: "Home Office",
    client: "Ana Costa",
    status: "completed",
    value: 8500,
    createdAt: new Date(Date.now() - 86400000 * 10),
    thumbnail: officeRender,
  },
  {
    id: "4",
    name: "Closet Planejado",
    client: "Pedro Oliveira",
    status: "draft",
    value: 15200,
    createdAt: new Date(Date.now() - 86400000),
    thumbnail: bedroomRender,
  },
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo de volta! Aqui está um resumo dos seus projetos.
            </p>
          </div>
          <Link to="/editor">
            <Button variant="gradient" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Projetos"
            value={47}
            change="+12% este mês"
            changeType="positive"
            icon={FolderKanban}
          />
          <StatsCard
            title="Clientes Ativos"
            value={23}
            change="+5 novos"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Faturamento Mensal"
            value="R$ 89.500"
            change="+18% vs anterior"
            changeType="positive"
            icon={DollarSign}
          />
          <StatsCard
            title="Taxa de Conversão"
            value="68%"
            change="+3% este mês"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Projetos Recentes</h2>
              <Link to="/projects">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>

          {/* AI Assistant */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Assistente IA</h2>
            <AIAssistant />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
