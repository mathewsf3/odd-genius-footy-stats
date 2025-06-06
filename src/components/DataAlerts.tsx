"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Info,
  X,
  RefreshCw,
  TrendingDown,
  Shield
} from "lucide-react";

interface DataAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissed?: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface DataAlertsProps {
  className?: string;
  maxAlerts?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function DataAlerts({ 
  className = "", 
  maxAlerts = 5,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: DataAlertsProps) {
  const [alerts, setAlerts] = useState<DataAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkDataQuality = async () => {
    try {
      const response = await fetch('/api/matches/integrity');
      const data = await response.json();
      
      const newAlerts: DataAlert[] = [];
      const now = new Date();

      // Check API status
      if (data.apiStatus === 'degraded') {
        newAlerts.push({
          id: `api-degraded-${now.getTime()}`,
          type: 'warning',
          title: 'API Performance Degraded',
          message: 'The FootyStats API is responding slowly. Some data may be delayed.',
          timestamp: now,
          severity: 'medium'
        });
      } else if (data.apiStatus === 'down') {
        newAlerts.push({
          id: `api-down-${now.getTime()}`,
          type: 'error',
          title: 'API Connection Lost',
          message: 'Unable to connect to FootyStats API. Data may be outdated.',
          timestamp: now,
          severity: 'high'
        });
      }

      // Check data quality score
      if (data.dataQuality < 50) {
        newAlerts.push({
          id: `quality-low-${now.getTime()}`,
          type: 'error',
          title: 'Low Data Quality',
          message: `Data quality score is ${data.dataQuality}%. Consider refreshing or checking data sources.`,
          timestamp: now,
          severity: 'high'
        });
      } else if (data.dataQuality < 70) {
        newAlerts.push({
          id: `quality-medium-${now.getTime()}`,
          type: 'warning',
          title: 'Moderate Data Quality',
          message: `Data quality score is ${data.dataQuality}%. Some matches may have incomplete information.`,
          timestamp: now,
          severity: 'medium'
        });
      }

      // Check for stale data (older than 1 hour)
      const lastSync = new Date(data.lastSync);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      if (lastSync < oneHourAgo) {
        newAlerts.push({
          id: `stale-data-${now.getTime()}`,
          type: 'warning',
          title: 'Data May Be Stale',
          message: `Last synchronization was ${Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60))} minutes ago.`,
          timestamp: now,
          severity: 'medium'
        });
      }

      // Check if no live matches when expected
      const currentHour = now.getHours();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      const isPrimeTime = currentHour >= 14 && currentHour <= 22; // 2 PM to 10 PM
      
      if (isWeekend && isPrimeTime && data.liveMatches === 0) {
        newAlerts.push({
          id: `no-live-matches-${now.getTime()}`,
          type: 'info',
          title: 'No Live Matches',
          message: 'No live matches detected during typical match hours. This may be normal.',
          timestamp: now,
          severity: 'low'
        });
      }

      // Positive alerts for good data quality
      if (data.dataQuality >= 90 && data.apiStatus === 'healthy') {
        newAlerts.push({
          id: `excellent-quality-${now.getTime()}`,
          type: 'success',
          title: 'Excellent Data Quality',
          message: `Data quality is ${data.dataQuality}% with healthy API connection.`,
          timestamp: now,
          severity: 'low'
        });
      }

      // Update alerts (keep only recent non-dismissed ones)
      setAlerts(prev => {
        const existingAlerts = prev.filter(alert => 
          !alert.dismissed && 
          (now.getTime() - alert.timestamp.getTime()) < 5 * 60 * 1000 // Keep for 5 minutes
        );
        
        const combinedAlerts = [...existingAlerts, ...newAlerts]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, maxAlerts);
          
        return combinedAlerts;
      });

      setLastCheck(now);
      setLoading(false);
    } catch (error) {
      console.error('Error checking data quality:', error);
      
      setAlerts(prev => [...prev, {
        id: `check-error-${Date.now()}`,
        type: 'error',
        title: 'Alert System Error',
        message: 'Unable to check data quality. Manual verification recommended.',
        timestamp: new Date(),
        severity: 'medium'
      }]);
      
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDataQuality();
    
    if (autoRefresh) {
      const interval = setInterval(checkDataQuality, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const getAlertIcon = (type: string, severity: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'success':
        return 'border-l-green-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`text-xs ${colors[severity as keyof typeof colors]}`}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Checking Data Quality...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (activeAlerts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            Data Alerts
            <Badge className="bg-green-100 text-green-800 text-xs">All Clear</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            No data quality issues detected
          </div>
          {lastCheck && (
            <div className="text-xs text-muted-foreground mt-2">
              Last checked: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Data Alerts
          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
            {activeAlerts.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {activeAlerts.map((alert) => (
          <Alert 
            key={alert.id} 
            className={`border-l-4 ${getAlertBorderColor(alert.type)} relative pr-8`}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type, alert.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium">{alert.title}</h4>
                  {getSeverityBadge(alert.severity)}
                </div>
                <AlertDescription className="text-sm">
                  {alert.message}
                </AlertDescription>
                <div className="text-xs text-muted-foreground mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
              aria-label="Dismiss alert"
            >
              <X className="h-3 w-3" />
            </button>
          </Alert>
        ))}
        
        {lastCheck && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 pt-2 border-t">
            <RefreshCw className="h-3 w-3" />
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
