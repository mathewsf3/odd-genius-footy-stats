"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FootyStatsAPI } from "@/lib/api";
import { League } from "@/types";
import { Trophy, Loader2, Globe, Calendar } from "lucide-react";
import Link from "next/link";

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        setError(null);

        const leaguesData = await FootyStatsAPI.getLeagues();
        setLeagues(leaguesData);

      } catch (err) {
        console.error('Error fetching leagues:', err);
        setError('Failed to load leagues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading leagues...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group leagues by country
  const groupedLeagues = leagues.reduce((acc, league) => {
    const country = league.country || 'International';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(league);
    return acc;
  }, {} as Record<string, League[]>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Leagues</h1>
        <p className="text-muted-foreground">
          Explore soccer leagues from around the world
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leagues.length}</div>
            <p className="text-xs text-muted-foreground">
              Available leagues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(groupedLeagues).length}</div>
            <p className="text-xs text-muted-foreground">
              Different countries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/7</div>
            <p className="text-xs text-muted-foreground">
              Live updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leagues by Country */}
      <div className="space-y-8">
        {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
          <div key={country} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">{country}</h2>
              <Badge variant="outline">{countryLeagues.length} leagues</Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {countryLeagues.map((league) => (
                <Card key={league.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{league.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>{league.country}</span>
                        </div>
                      </div>
                      {league.logo && (
                        <img 
                          src={league.logo} 
                          alt={`${league.name} logo`}
                          className="h-8 w-8 object-contain"
                        />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {league.season && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>Season: {league.season}</span>
                      </div>
                    )}
                    
                    {league.seasonStart && league.seasonEnd && (
                      <div className="text-sm text-muted-foreground">
                        {league.seasonStart} - {league.seasonEnd}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/leagues/${league.id}/matches`}>
                          View Matches
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/leagues/${league.id}/table`}>
                          League Table
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {leagues.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Leagues Available</h3>
              <p className="text-muted-foreground">
                There are no leagues available at the moment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
