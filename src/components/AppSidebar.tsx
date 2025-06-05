"use client";

import { Calendar, Home, Trophy, Play, Clock, BarChart3, Settings, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

// Menu items
const menuItems = [
  {
    title: "Painel Principal",
    url: "/",
    icon: Home,
  },
  {
    title: "Partidas ao Vivo",
    url: "/live",
    icon: Play,
    badge: "AO VIVO",
  },
  {
    title: "Próximas Partidas",
    url: "/upcoming",
    icon: Clock,
  },
  {
    title: "Campeonatos",
    url: "/leagues",
    icon: Trophy,
  },
  {
    title: "Estatísticas",
    url: "/statistics",
    icon: BarChart3,
  },
  {
    title: "Insights de Apostas",
    url: "/insights",
    icon: Target,
  },
];

const secondaryItems = [
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Odd Genius</span>
            <span className="truncate text-xs text-muted-foreground">Footy Stats</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="w-full"
                  >
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto text-xs animate-pulse"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Estatísticas do Futebol Brasileiro
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by FootyStats API
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
