"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Filter, 
  CheckCircle, 
  Shield, 
  Database, 
  AlertTriangle,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";

interface DataQualityFiltersProps {
  onFiltersChange?: (filters: QualityFilters) => void;
  className?: string;
}

export interface QualityFilters {
  onlyVerified: boolean;
  hideUnverified: boolean;
  dataSource: 'all' | 'footystats' | 'api' | 'manual';
  minQualityScore: number;
  showTestData: boolean;
}

export function DataQualityFilters({ onFiltersChange, className }: DataQualityFiltersProps) {
  const [filters, setFilters] = useState<QualityFilters>({
    onlyVerified: true,
    hideUnverified: false,
    dataSource: 'all',
    minQualityScore: 80,
    showTestData: false
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters: Partial<QualityFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const getDataSourceBadge = (source: string) => {
    switch (source) {
      case 'footystats':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Database className="h-3 w-3 mr-1" />
            FootyStats
          </Badge>
        );
      case 'api':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Shield className="h-3 w-3 mr-1" />
            API Verificada
          </Badge>
        );
      case 'manual':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Settings className="h-3 w-3 mr-1" />
            Manual
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Filter className="h-3 w-3 mr-1" />
            Todas as Fontes
          </Badge>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtros de Qualidade
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Verification Filters */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Verificação</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Apenas Dados Verificados</span>
              </div>
              <Switch
                checked={filters.onlyVerified}
                onCheckedChange={(checked) => updateFilters({ onlyVerified: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Ocultar Não Verificados</span>
              </div>
              <Switch
                checked={filters.hideUnverified}
                onCheckedChange={(checked) => updateFilters({ hideUnverified: checked })}
              />
            </div>
          </div>

          {/* Data Source Filter */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Fonte dos Dados</h4>
            
            <div className="flex flex-wrap gap-2">
              {(['all', 'footystats', 'api', 'manual'] as const).map((source) => (
                <Button
                  key={source}
                  variant={filters.dataSource === source ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ dataSource: source })}
                  className="text-xs"
                >
                  {getDataSourceBadge(source)}
                </Button>
              ))}
            </div>
          </div>

          {/* Quality Score Filter */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Qualidade Mínima</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pontuação: {filters.minQualityScore}%</span>
                <Badge 
                  variant={filters.minQualityScore >= 90 ? "default" : 
                          filters.minQualityScore >= 70 ? "secondary" : "destructive"}
                >
                  {filters.minQualityScore >= 90 ? "Excelente" :
                   filters.minQualityScore >= 70 ? "Boa" : "Baixa"}
                </Badge>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={filters.minQualityScore}
                onChange={(e) => updateFilters({ minQualityScore: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Developer Options */}
          <div className="space-y-3 border-t pt-3">
            <h4 className="text-sm font-medium text-muted-foreground">Desenvolvedor</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Mostrar Dados de Teste</span>
              </div>
              <Switch
                checked={filters.showTestData}
                onCheckedChange={(checked) => updateFilters({ showTestData: checked })}
              />
            </div>
          </div>

          {/* Applied Filters Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Filtros Aplicados:</p>
            <div className="flex flex-wrap gap-1">
              {filters.onlyVerified && (
                <Badge variant="secondary" className="text-xs">Apenas Verificados</Badge>
              )}
              {filters.hideUnverified && (
                <Badge variant="secondary" className="text-xs">Ocultar Não Verificados</Badge>
              )}
              {filters.dataSource !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {filters.dataSource === 'footystats' ? 'FootyStats' :
                   filters.dataSource === 'api' ? 'API' : 'Manual'}
                </Badge>
              )}
              {filters.minQualityScore > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Qualidade ≥{filters.minQualityScore}%
                </Badge>
              )}
              {filters.showTestData && (
                <Badge variant="outline" className="text-xs">Dados de Teste</Badge>
              )}
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({
                onlyVerified: true,
                hideUnverified: false,
                dataSource: 'all',
                minQualityScore: 80,
                showTestData: false
              })}
            >
              Resetar Filtros
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
