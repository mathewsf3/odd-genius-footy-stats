"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, TrendingUp, Eye } from "lucide-react";
import { Match } from "@/types";
import { formatMatchTime, formatMatchDate, isMatchLive } from "@/lib/api";
import Link from "next/link";

interface MatchCardProps {
  match: Match;
  showDetails?: boolean;
}

export function MatchCard({ match, showDetails = true }: MatchCardProps) {
  const isLive = isMatchLive(match);
  const matchTime = formatMatchTime(match.date_unix);
  const matchDate = formatMatchDate(match.date_unix);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
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
          </div>
          <div className="text-sm text-muted-foreground">
            {matchDate}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams and Score */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Home Team</span>
              <span className="text-2xl font-bold">
                {match.homeGoalCount >= 0 ? match.homeGoalCount : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Away Team</span>
              <span className="text-2xl font-bold">
                {match.awayGoalCount >= 0 ? match.awayGoalCount : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Match Stats Preview */}
        {showDetails && match.status === 'complete' && (
          <div className="grid grid-cols-3 gap-4 pt-3 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Corners</div>
              <div className="font-semibold">
                {match.team_a_corners + match.team_b_corners}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Cards</div>
              <div className="font-semibold">
                {match.team_a_cards_num + match.team_b_cards_num}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Goals</div>
              <div className="font-semibold">
                {match.totalGoalCount}
              </div>
            </div>
          </div>
        )}

        {/* Betting Insights Preview */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-2 pt-3 border-t">
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>O2.5: {(match.o25_potential * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-3 w-3 text-blue-500" />
              <span>BTTS: {(match.btts_potential * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Stadium Info */}
        {match.stadium_name && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{match.stadium_name}</span>
            {match.stadium_location && (
              <span>, {match.stadium_location}</span>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/match/${match.id}`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Details & Analysis
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for lists
export function MatchCardCompact({ match }: { match: Match }) {
  const isLive = isMatchLive(match);
  const matchTime = formatMatchTime(match.date_unix);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLive && (
              <Badge variant="destructive" className="animate-pulse text-xs">
                LIVE
              </Badge>
            )}
            <div className="text-sm">
              <div className="font-medium">Home vs Away</div>
              <div className="text-muted-foreground">{matchTime}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold">
                {match.homeGoalCount >= 0 ? match.homeGoalCount : '-'} - {match.awayGoalCount >= 0 ? match.awayGoalCount : '-'}
              </div>
            </div>
            
            <Button asChild size="sm" variant="ghost">
              <Link href={`/match/${match.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
