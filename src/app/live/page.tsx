"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/MatchCard";
import { LiveMatchCard } from "@/components/LiveMatchCard";
import { FootyStatsAPI } from "@/lib/api";
import { Match } from "@/types";
import { Play, RefreshCw, Loader2, Clock } from "lucide-react";

export default function LiveMatchesPage() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLiveMatches = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const matches = await FootyStatsAPI.getLiveMatches();
      setLiveMatches(matches);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error fetching live matches:', err);
      setError('Failed to load live matches. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();

    // Auto-refresh every 30 seconds for live matches
    const interval = setInterval(() => {
      fetchLiveMatches(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchLiveMatches(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading live matches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Live Matches</h1>
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Real-time soccer matches currently being played
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString('pt-BR')}
            </span>
          )}
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <span>{error}</span>
              <Button onClick={() => fetchLiveMatches()} size="sm" variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Matches Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-red-500" />
            Currently Live
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {liveMatches.length} {liveMatches.length === 1 ? 'match' : 'matches'} in progress
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Updates automatically every 30 seconds
          </p>
        </CardContent>
      </Card>

      {/* Live Matches Grid */}
      {liveMatches.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Live Matches</h3>
              <p className="text-muted-foreground mb-4">
                There are no matches currently being played.
              </p>
              <p className="text-sm text-muted-foreground">
                Check back later or view upcoming matches to see what's coming next.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {liveMatches.map((match) => (
            <LiveMatchCard key={match.id} match={match} autoRefresh={true} />
          ))}
        </div>
      )}

      {/* Auto-refresh Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>
              This page automatically refreshes every 30 seconds to show the latest live match data.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
