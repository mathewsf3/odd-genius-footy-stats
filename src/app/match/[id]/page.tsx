"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FootyStatsAPI, formatMatchTime, formatMatchDate, isMatchLive } from "@/lib/api";
import { Match, H2HStats } from "@/types";
import { 
  Play, 
  Clock, 
  MapPin, 
  Users, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Loader2,
  ArrowLeft,
  Trophy,
  Flag,
  Timer
} from "lucide-react";
import Link from "next/link";

interface MatchDetailsData extends Match {
  h2h?: H2HStats;
}

export default function MatchDetailsPage() {
  const params = useParams();
  const matchId = params.id as string;
  
  const [match, setMatch] = useState<MatchDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const matchData = await FootyStatsAPI.getMatchDetails(parseInt(matchId));
        setMatch(matchData);

      } catch (err) {
        console.error('Error fetching match details:', err);
        setError('Failed to load match details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading match details...</span>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || 'Match not found'}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLive = isMatchLive(match);
  const matchTime = formatMatchTime(match.date_unix);
  const matchDate = formatMatchDate(match.date_unix);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button asChild variant="outline" size="sm">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Match Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
              )}
              <Badge variant="outline">
                {match.status === 'complete' ? 'FT' : matchTime}
              </Badge>
              <span className="text-muted-foreground">{matchDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Target className="h-4 w-4 mr-2" />
                Betting Tips
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Teams and Score */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Home Team</div>
                <div className="text-4xl font-bold">
                  {match.homeGoalCount >= 0 ? match.homeGoalCount : '-'}
                </div>
              </div>
              
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Away Team</div>
                <div className="text-4xl font-bold">
                  {match.awayGoalCount >= 0 ? match.awayGoalCount : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Stadium Info */}
          {match.stadium_name && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{match.stadium_name}</span>
              {match.stadium_location && (
                <span>, {match.stadium_location}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="h2h">Head to Head</TabsTrigger>
          <TabsTrigger value="insights">Betting Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{match.totalGoalCount}</div>
                <p className="text-xs text-muted-foreground">
                  Goals scored
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Corners</CardTitle>
                <Flag className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{match.totalCornerCount}</div>
                <p className="text-xs text-muted-foreground">
                  Total corners
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cards</CardTitle>
                <Timer className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {match.team_a_cards_num + match.team_b_cards_num}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total cards
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">BTTS</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {match.btts ? 'Yes' : 'No'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Both teams scored
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Match Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>Pre-Match Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Over 2.5 Goals</div>
                  <div className="text-2xl font-bold">
                    {(match.o25_potential * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">BTTS Potential</div>
                  <div className="text-2xl font-bold">
                    {(match.btts_potential * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Avg Goals</div>
                  <div className="text-2xl font-bold">
                    {match.avg_potential.toFixed(1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Corners</div>
                  <div className="text-2xl font-bold">
                    {match.corners_potential.toFixed(1)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Home Team Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Goals</span>
                  <span className="font-bold">{match.homeGoalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shots</span>
                  <span className="font-bold">{match.team_a_shots}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shots on Target</span>
                  <span className="font-bold">{match.team_a_shotsOnTarget}</span>
                </div>
                <div className="flex justify-between">
                  <span>Possession</span>
                  <span className="font-bold">{match.team_a_possession}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Corners</span>
                  <span className="font-bold">{match.team_a_corners}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fouls</span>
                  <span className="font-bold">{match.team_a_fouls}</span>
                </div>
                <div className="flex justify-between">
                  <span>Yellow Cards</span>
                  <span className="font-bold">{match.team_a_yellow_cards}</span>
                </div>
                <div className="flex justify-between">
                  <span>Red Cards</span>
                  <span className="font-bold">{match.team_a_red_cards}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Away Team Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Goals</span>
                  <span className="font-bold">{match.awayGoalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shots</span>
                  <span className="font-bold">{match.team_b_shots}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shots on Target</span>
                  <span className="font-bold">{match.team_b_shotsOnTarget}</span>
                </div>
                <div className="flex justify-between">
                  <span>Possession</span>
                  <span className="font-bold">{match.team_b_possession}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Corners</span>
                  <span className="font-bold">{match.team_b_corners}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fouls</span>
                  <span className="font-bold">{match.team_b_fouls}</span>
                </div>
                <div className="flex justify-between">
                  <span>Yellow Cards</span>
                  <span className="font-bold">{match.team_b_yellow_cards}</span>
                </div>
                <div className="flex justify-between">
                  <span>Red Cards</span>
                  <span className="font-bold">{match.team_b_red_cards}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="h2h" className="space-y-4">
          {match.h2h ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Head to Head Record</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Matches</span>
                    <span className="font-bold">{match.h2h.total_matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Home Wins</span>
                    <span className="font-bold">{match.h2h.team_a_wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Away Wins</span>
                    <span className="font-bold">{match.h2h.team_b_wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draws</span>
                    <span className="font-bold">{match.h2h.draws}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Goals/Match</span>
                    <span className="font-bold">{match.h2h.avg_goals_per_match.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>H2H Trends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Over 1.5 Goals</span>
                    <span className="font-bold">{match.h2h.over15_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Over 2.5 Goals</span>
                    <span className="font-bold">{match.h2h.over25_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Over 3.5 Goals</span>
                    <span className="font-bold">{match.h2h.over35_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BTTS</span>
                    <span className="font-bold">{match.h2h.btts_count}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No H2H Data Available</h3>
                  <p className="text-muted-foreground">
                    Head-to-head statistics are not available for this match.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Betting Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Match Outcome</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Home Win</span>
                      <span className="font-bold">{match.odds_ft_1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Draw</span>
                      <span className="font-bold">{match.odds_ft_X}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Away Win</span>
                      <span className="font-bold">{match.odds_ft_2}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Market Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Over 2.5 Goals</span>
                      <Badge variant={match.over25 ? "default" : "secondary"}>
                        {match.over25 ? "Hit" : "Miss"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>BTTS</span>
                      <Badge variant={match.btts ? "default" : "secondary"}>
                        {match.btts ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Over 1.5 Goals</span>
                      <Badge variant={match.over15 ? "default" : "secondary"}>
                        {match.over15 ? "Hit" : "Miss"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
