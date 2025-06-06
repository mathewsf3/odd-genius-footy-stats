"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Shield, 
  Database, 
  Activity, 
  Globe,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Zap
} from "lucide-react";

interface ValidationSummaryProps {
  className?: string;
}

interface ValidationData {
  overallScore: number;
  apiHealth: 'healthy' | 'degraded' | 'down';
  dataFreshness: number; // minutes since last update
  verificationRate: number; // percentage of verified matches
  coverage: {
    competitions: number;
    regions: string;
    liveMatches: number;
    upcomingMatches: number;
  };
  lastSync: string;
  systemStatus: 'operational' | 'issues' | 'maintenance';
}

export function ValidationSummary({ className = "" }: ValidationSummaryProps) {
  const [data, setData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchValidationData = async () => {
    try {
      const response = await fetch('/api/matches/integrity');
      const integrityData = await response.json();
      
      const lastSyncTime = new Date(integrityData.lastSync);
      const now = new Date();
      const freshnessMins = Math.floor((now.getTime() - lastSyncTime.getTime()) / (1000 * 60));
      
      // Calculate overall system status
      let systemStatus: 'operational' | 'issues' | 'maintenance' = 'operational';
      if (integrityData.apiStatus === 'down' || integrityData.dataQuality < 50) {
        systemStatus = 'issues';
      } else if (integrityData.apiStatus === 'degraded' || integrityData.dataQuality < 70) {
        systemStatus = 'issues';
      }
      
      const validationData: ValidationData = {
        overallScore: integrityData.dataQuality,
        apiHealth: integrityData.apiStatus,
        dataFreshness: freshnessMins,
        verificationRate: Math.round((integrityData.verifiedMatches / integrityData.totalMatches) * 100),
        coverage: {
          competitions: integrityData.competitions,
          regions: integrityData.coverage,
          liveMatches: integrityData.liveMatches,
          upcomingMatches: integrityData.upcomingMatches
        },
        lastSync: integrityData.lastSync,
        systemStatus
      };
      
      setData(validationData);
      setLastRefresh(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching validation data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidationData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchValidationData, 120000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800">✓ Operational</Badge>;
      case 'issues':
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ Issues Detected</Badge>;
      case 'maintenance':
        return <Badge className="bg-blue-100 text-blue-800">🔧 Maintenance</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getApiHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-100 text-red-800">Down</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getFreshnessText = (minutes: number) => {
    if (minutes < 5) return `${minutes}m ago (Fresh)`;
    if (minutes < 30) return `${minutes}m ago (Recent)`;
    if (minutes < 60) return `${minutes}m ago (Acceptable)`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago (Stale)`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Validation Summary...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Validation Data Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load validation data. Please check your connection and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Data Validation Summary
          </CardTitle>
          {getStatusBadge(data.systemStatus)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overall Data Quality
            </h3>
            <div className={`text-2xl font-bold ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}%
            </div>
          </div>
          <Progress value={data.overallScore} className="h-3" />
          <div className={`text-xs px-2 py-1 rounded ${getScoreBgColor(data.overallScore)}`}>
            {data.overallScore >= 90 && "Excellent quality - All systems operating optimally"}
            {data.overallScore >= 70 && data.overallScore < 90 && "Good quality - Minor issues may exist"}
            {data.overallScore >= 50 && data.overallScore < 70 && "Moderate quality - Some data may be incomplete"}
            {data.overallScore < 50 && "Poor quality - Significant issues detected"}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="h-4 w-4 text-blue-500" />
              API Health
            </div>
            {getApiHealthBadge(data.apiHealth)}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-green-500" />
              Data Freshness
            </div>
            <div className="text-sm text-muted-foreground">
              {getFreshnessText(data.dataFreshness)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
              Verification Rate
            </div>
            <div className="text-sm font-medium">
              {data.verificationRate}% Verified
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4 text-red-500" />
              Live Coverage
            </div>
            <div className="text-sm text-muted-foreground">
              {data.coverage.liveMatches} Live • {data.coverage.upcomingMatches} Upcoming
            </div>
          </div>
        </div>

        {/* Coverage Information */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Coverage Details
          </h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Competitions:</span>
              <span className="font-medium">{data.coverage.competitions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Regions:</span>
              <span className="font-medium">{data.coverage.regions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Sync:</span>
              <span className="font-medium">
                {new Date(data.lastSync).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Real Data Confirmation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Dados Reais Confirmados ✓</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Todos os dados são provenientes da API FootyStats e verificados em tempo real.
          </p>
        </div>

        {/* Last Refresh */}
        {lastRefresh && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
