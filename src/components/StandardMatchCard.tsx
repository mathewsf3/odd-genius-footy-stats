'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StandardMatchCardProps {
  id: number;
  homeName: string;
  awayName: string;
  homeGoals?: number;
  awayGoals?: number;
  minute?: number | null;
  status: string;
  kickOff: string;
  homeImage?: string;
  awayImage?: string;
  competition?: string;
  stadium?: string;
  possession?: {
    home: number | null;
    away: number | null;
  };
  expectedGoals?: {
    total: number | null;
    btts: number | null;
    over25: number | null;
  };
}

export default function StandardMatchCard({
  id,
  homeName,
  awayName,
  homeGoals = 0,
  awayGoals = 0,
  minute,
  status,
  kickOff,
  homeImage,
  awayImage,
  competition,
  stadium,
  possession,
  expectedGoals
}: StandardMatchCardProps) {
  
  const isLive = status === 'live' || status === 'inprogress' || status === 'playing';
  const isUpcoming = status === 'incomplete' || status === 'scheduled';
  const isFinished = status === 'complete' || status === 'finished';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const getTeamInitials = (teamName: string) => {
    return teamName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <Badge variant="destructive" className="animate-pulse">
          <Activity className="w-3 h-3 mr-1" />
          AO VIVO {minute && `${minute}'`}
        </Badge>
      );
    }
    
    if (isUpcoming) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Clock className="w-3 h-3 mr-1" />
          {formatTime(kickOff)}
        </Badge>
      );
    }
    
    if (isFinished) {
      return (
        <Badge variant="secondary">
          Encerrado
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        {status}
      </Badge>
    );
  };

  return (
    <Link href={`/match/${id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 cursor-pointer">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm text-gray-600 truncate flex-1">
              {competition || 'Liga'}
            </div>
            {getStatusBadge()}
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between mb-3">
            {/* Home Team */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {homeImage ? (
                  <img 
                    src={homeImage} 
                    alt={homeName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-xs font-bold text-gray-600 ${homeImage ? 'hidden' : ''}`}>
                  {getTeamInitials(homeName)}
                </span>
              </div>
              <span className="font-medium text-sm truncate">{homeName}</span>
            </div>

            {/* Score */}
            <div className="px-4 py-2 bg-gray-50 rounded-lg mx-3">
              <span className="font-bold text-lg">
                {isUpcoming ? '-' : homeGoals} : {isUpcoming ? '-' : awayGoals}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center space-x-3 flex-1 justify-end">
              <span className="font-medium text-sm truncate">{awayName}</span>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {awayImage ? (
                  <img 
                    src={awayImage} 
                    alt={awayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-xs font-bold text-gray-600 ${awayImage ? 'hidden' : ''}`}>
                  {getTeamInitials(awayName)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats for Live Matches */}
          {isLive && possession && (possession.home || possession.away) && (
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Posse: {possession.home}%</span>
                <span>{possession.away}%</span>
              </div>
            </div>
          )}

          {/* Expected Goals for Upcoming Matches */}
          {isUpcoming && expectedGoals && expectedGoals.total && (
            <div className="border-t pt-3 mt-3">
              <div className="text-xs text-gray-600 text-center">
                Expected Goals: {expectedGoals.total.toFixed(1)}
              </div>
            </div>
          )}

          {/* Stadium */}
          {stadium && (
            <div className="flex items-center text-xs text-gray-500 mt-2">
              <MapPin className="w-3 h-3 mr-1" />
              {stadium}
            </div>
          )}

          {/* Date for upcoming matches */}
          {isUpcoming && (
            <div className="text-xs text-gray-500 mt-1 text-center">
              {formatDate(kickOff)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
