import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Box,
  Image,
} from "lucide-react";
import logoSD from "@/assets/logo-sd.jpeg";

const menuItems: { icon: any; label: string; href: string; external?: boolean }[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FolderKanban, label: "Projetos", href: "/projects" },
  { icon: Box, label: "Promob Plus", href: "https://www.promob.com/promob-plus", external: true },
  { icon: Image, label: "Renderização", href: "/render" },
  { icon: Sparkles, label: "Assistente IA", href: "/ai-assistant" },
  { icon: Users, label: "Clientes", href: "/clients" },
  { icon: MessageSquare, label: "CRM WhatsApp", href: "/crm" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "gradient-dark flex flex-col h-screen transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-gold shrink-0">
          <img src={logoSD} alt="SD Móveis" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-display font-bold text-sidebar-foreground">
              SD Móveis
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Projetados</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = !item.external && location.pathname === item.href;
          const linkProps = item.external
            ? { as: "a" as const, href: item.href, target: "_blank", rel: "noopener noreferrer" }
            : {};

          const content = (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all",
                isActive &&
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground shadow-glow",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
            </Button>
          );

          return item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <Link key={item.href} to={item.href}>
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
