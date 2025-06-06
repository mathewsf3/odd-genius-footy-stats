/**
 * 🔴 ENHANCED LIVE MATCH CARD - FULL UPDATE
 * Componente especializado para partidas ao vivo com dados reais
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types";
import { Play, Clock, MapPin, User, Wifi, Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface EnhancedLiveMatchCardProps {
  match: Match;
}

export function EnhancedLiveMatchCard({ match }: EnhancedLiveMatchCardProps) {
  const [homeLogoError, setHomeLogoError] = useState(false);
  const [awayLogoError, setAwayLogoError] = useState(false);

  // Função para determinar o status da partida
  const getMatchStatus = () => {
    if (match.status === 'live' || match.status === 'inprogress' || match.status === 'playing') {
      return {
        text: 'AO VIVO',
        color: 'bg-red-500 text-white animate-pulse',
        icon: <Play className="w-3 h-3" />
      };
    }
    
    if (match.minute && match.minute > 0) {
      return {
        text: `${match.minute}'`,
        color: 'bg-green-500 text-white',
        icon: <Clock className="w-3 h-3" />
      };
    }
    
    return {
      text: 'EM ANDAMENTO',
      color: 'bg-orange-500 text-white',
      icon: <Activity className="w-3 h-3" />
    };
  };

  const status = getMatchStatus();

  // Função para formatar posse de bola
  const formatPossession = (possession: number | undefined) => {
    if (!possession || possession <= 0) return '0%';
    return `${possession}%`;
  };

  // Fallback para logos
  const TeamLogo = ({ 
    src, 
    alt, 
    onError 
  }: { 
    src: string | undefined; 
    alt: string; 
    onError: () => void;
  }) => {
    if (!src) {
      return (
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-500 text-xs font-bold">
            {alt.substring(0, 2).toUpperCase()}
          </span>
        </div>
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={48}
        height={48}
        className="object-contain rounded-full"
        onError={onError}
      />
    );
  };

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500 bg-gradient-to-r from-white to-red-50">
        <CardContent className="p-6">
          {/* Header com status */}
          <div className="flex items-center justify-between mb-4">
            <Badge className={status.color}>
              {status.icon}
              <span className="ml-1">{status.text}</span>
            </Badge>
            
            <div className="text-right">
              <div className="text-xs text-gray-500">{match.competition_name}</div>
              <div className="text-xs text-gray-400">{match.country}</div>
            </div>
          </div>

          {/* Times e placar */}
          <div className="space-y-4">
            {/* Time da casa */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <TeamLogo
                  src={homeLogoError ? undefined : match.home_image}
                  alt={match.home_name}
                  onError={() => setHomeLogoError(true)}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {match.home_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Casa • Posse: {formatPossession(match.team_a_possession)}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 ml-2">
                {match.homeGoalCount || 0}
              </div>
            </div>

            {/* Separador com placar central */}
            <div className="flex items-center justify-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="px-4 text-lg font-bold text-gray-600">VS</div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Time visitante */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <TeamLogo
                  src={awayLogoError ? undefined : match.away_image}
                  alt={match.away_name}
                  onError={() => setAwayLogoError(true)}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {match.away_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Visitante • Posse: {formatPossession(match.team_b_possession)}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 ml-2">
                {match.awayGoalCount || 0}
              </div>
            </div>
          </div>

          {/* Footer com informações extras */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {match.stadium || 'Estádio não informado'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">
                  {match.referee || 'Árbitro não informado'}
                </span>
              </div>
            </div>
          </div>

          {/* Indicador de conexão ao vivo */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <Wifi className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">Dados em tempo real</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
