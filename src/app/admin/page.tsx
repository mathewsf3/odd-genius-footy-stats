'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, RefreshCw, Calendar, Users, Trophy } from 'lucide-react';

interface SyncStatus {
  leagues: number;
  teams: number;
  matches: number;
  lastUpdate?: string;
}

export default function AdminPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Carregar status inicial
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sync?action=status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      } else {
        setMessage('Erro ao carregar status: ' + data.message);
      }
    } catch (error) {
      setMessage('Erro ao carregar status: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const syncToday = async () => {
    try {
      setSyncLoading(true);
      setMessage('Sincronizando dados de hoje...');
      
      const response = await fetch('/api/sync?action=today');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        await loadStatus(); // Recarregar status
      } else {
        setMessage('❌ Erro: ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Erro: ' + (error as Error).message);
    } finally {
      setSyncLoading(false);
    }
  };

  const syncFull = async () => {
    try {
      setSyncLoading(true);
      setMessage('Iniciando sincronização completa... Isso pode demorar alguns minutos.');
      
      const response = await fetch('/api/sync?action=full');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Sincronização completa finalizada! Ligas: ${data.data.leagues}, Times: ${data.data.teams}, Partidas: ${data.data.matches}`);
        await loadStatus(); // Recarregar status
      } else {
        setMessage('❌ Erro: ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Erro: ' + (error as Error).message);
    } finally {
      setSyncLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Administração do Backend</h1>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ligas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : status?.leagues || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Temporadas sincronizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Times</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : status?.teams || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Times no banco de dados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partidas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : status?.matches || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Partidas sincronizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Sincronização</CardTitle>
          <CardDescription>
            Gerencie a sincronização dos dados com a API FootyStats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Última atualização</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(status?.lastUpdate)}
              </p>
            </div>
            <Badge variant={status?.lastUpdate ? 'default' : 'secondary'}>
              {status?.lastUpdate ? 'Sincronizado' : 'Não sincronizado'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={syncToday} 
              disabled={syncLoading}
              variant="outline"
            >
              {syncLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sincronizar Hoje
            </Button>

            <Button 
              onClick={syncFull} 
              disabled={syncLoading}
            >
              {syncLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              Sincronização Completa
            </Button>

            <Button 
              onClick={loadStatus} 
              disabled={loading}
              variant="ghost"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Atualizar Status
            </Button>
          </div>

          {message && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Sincronizar Hoje:</strong> Atualiza apenas as partidas do dia atual. Rápido e ideal para atualizações frequentes.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Sincronização Completa:</strong> Sincroniza todas as ligas, times e partidas. Pode demorar alguns minutos. Use apenas quando necessário.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Primeira vez:</strong> Execute a sincronização completa para popular o banco de dados inicial.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
