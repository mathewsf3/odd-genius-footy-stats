"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchCard } from "@/components/MatchCard";
import { UpcomingMatchCard } from "@/components/UpcomingMatchCard";
import { EnhancedMatchCard } from "@/components/EnhancedMatchCard";
import { FootyStatsAPI } from "@/lib/api";
import { Match } from "@/types";
import { Clock, Calendar, Loader2, Filter } from "lucide-react";
import { formatMatchDate } from "@/lib/api";

export default function UpcomingMatchesPage() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(7);

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch today's matches
      const today = await FootyStatsAPI.getTodaysMatches();
      setTodayMatches(today);

      // Fetch upcoming matches
      const upcoming = await FootyStatsAPI.getUpcomingMatches(selectedDays);
      setUpcomingMatches(upcoming);

    } catch (err) {
      console.error('Error fetching upcoming matches:', err);
      setError('Failed to load upcoming matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingMatches();
  }, [selectedDays]);

  // Group matches by date
  const groupMatchesByDate = (matches: Match[]) => {
    const grouped: { [key: string]: Match[] } = {};
    
    matches.forEach(match => {
      const date = formatMatchDate(match.date_unix);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(match);
    });

    return grouped;
  };

  const groupedUpcoming = groupMatchesByDate(upcomingMatches);
  const groupedToday = groupMatchesByDate(todayMatches);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading upcoming matches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Upcoming Matches</h1>
          <p className="text-muted-foreground">
            Soccer matches scheduled for the coming days
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={selectedDays === 3 ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDays(3)}
          >
            3 Days
          </Button>
          <Button
            variant={selectedDays === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDays(7)}
          >
            7 Days
          </Button>
          <Button
            variant={selectedDays === 14 ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDays(14)}
          >
            14 Days
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <span>{error}</span>
              <Button onClick={fetchUpcomingMatches} size="sm" variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Matches</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMatches.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMatches.length}</div>
            <p className="text-xs text-muted-foreground">
              Next {selectedDays} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Filter className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMatches.length + upcomingMatches.length}</div>
            <p className="text-xs text-muted-foreground">
              All matches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Matches Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Matches</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {Object.keys(groupedToday).length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Matches Today</h3>
                  <p className="text-muted-foreground">
                    There are no matches scheduled for today.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedToday).map(([date, matches]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{date}</h2>
                  <Badge variant="outline">{matches.length} matches</Badge>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {matches.map((match) => (
                    <EnhancedMatchCard
                      key={match.id}
                      match={match}
                      variant="default"
                      showDetails={true}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {Object.keys(groupedUpcoming).length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Upcoming Matches</h3>
                  <p className="text-muted-foreground">
                    There are no matches scheduled for the next {selectedDays} days.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedUpcoming).map(([date, matches]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{date}</h2>
                  <Badge variant="outline">{matches.length} matches</Badge>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {matches.map((match) => (
                    <UpcomingMatchCard
                      key={match.id}
                      match={match}
                      showPredictions={true}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
