"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Clock,
  Database,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataStatusProps {
  lastUpdate?: Date;
  source?: string;
  isLive?: boolean;
  systemStatus?: 'online' | 'offline' | 'degraded';
  onRefresh?: () => void;
  className?: string;
}

export function DataStatus({ 
  lastUpdate, 
  source = "FootyStats API", 
  isLive = false,
  systemStatus = 'online',
  onRefresh,
  className 
}: DataStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "agora mesmo";
    if (diffInMinutes === 1) return "há 1 minuto";
    if (diffInMinutes < 60) return `há ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "há 1 hora";
    if (diffInHours < 24) return `há ${diffInHours} horas`;
    
    return "há mais de 24 horas";
  };

  useEffect(() => {
    if (lastUpdate) {
      setTimeAgo(formatTimeAgo(lastUpdate));
      
      // Update time display every minute
      const interval = setInterval(() => {
        setTimeAgo(formatTimeAgo(lastUpdate));
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [lastUpdate]);

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Wifi className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (systemStatus) {
      case 'online':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Dados Reais ✓
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Sistema Offline
          </Badge>
        );
      case 'degraded':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Dados Limitados
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("border-t-4", {
      "border-t-green-500": systemStatus === 'online',
      "border-t-red-500": systemStatus === 'offline',
      "border-t-yellow-500": systemStatus === 'degraded'
    }, className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {getStatusBadge()}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-3 w-3" />
                <span>{source}</span>
              </div>
              
              {isLive && (
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-600">AO VIVO</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Atualizado {timeAgo}</span>
              </div>
            )}
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-7 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
