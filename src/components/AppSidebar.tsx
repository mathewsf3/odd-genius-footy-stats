"use client";

import { Calendar, Home, Trophy, Play, Clock, BarChart3, Settings, Target, Zap, Wifi } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
    <Sidebar variant="inset" className="bg-gray-50 border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center px-4 py-8">
          <Image
            src="/logo.png"
            alt="Odd Genius Logo"
            width={180}
            height={180}
            className="object-contain max-w-full"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6 bg-gray-50 overflow-hidden">
        <SidebarGroup>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="group relative overflow-hidden rounded-xl p-3 transition-all duration-200 hover:border-l-4 hover:border-l-green-500 hover:bg-white hover:shadow-md data-[active=true]:bg-white data-[active=true]:shadow-lg data-[active=true]:border-l-4 data-[active=true]:border-l-green-600"
                  >
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="h-5 w-5 text-gray-600 group-hover:text-green-600 group-data-[active=true]:text-green-700 transition-colors duration-200" />
                      <span className="font-medium text-gray-900 group-hover:text-green-700 group-data-[active=true]:text-green-800 transition-colors duration-200 flex-1">
                        {item.title}
                      </span>

                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            📊 Status do Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-200 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium text-green-700">APIs Online</span>
                  <span className="text-xs text-green-600">FootyStats + AllSports</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
                <Zap className="w-4 h-4 text-blue-600" />
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium text-blue-700">Dados Atualizados</span>
                  <span className="text-xs text-blue-600">Há poucos segundos</span>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            ⚙️ Configurações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="group relative overflow-hidden rounded-xl p-3 transition-all duration-200 hover:border-l-4 hover:border-l-gray-400 hover:bg-white hover:shadow-md data-[active=true]:bg-white data-[active=true]:shadow-lg data-[active=true]:border-l-4 data-[active=true]:border-l-gray-600"
                  >
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="h-5 w-5 text-gray-600 group-hover:text-gray-700 group-data-[active=true]:text-gray-800 transition-colors duration-200" />
                      <span className="font-medium text-gray-900 group-hover:text-gray-800 group-data-[active=true]:text-gray-900 transition-colors duration-200">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 bg-gray-50">
        <div className="p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-medium text-green-600">
              Sistema Online
            </p>
          </div>
          <p className="text-xs text-gray-500">
            🇧🇷 Estatísticas do Futebol Brasileiro
          </p>
          <p className="text-xs text-gray-400">
            Powered by FootyStats API
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
