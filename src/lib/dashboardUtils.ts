/**
 * Utility functions for dashboard match filtering and formatting
 */

import { Match } from "@/types";

/**
 * Check if a match is happening today
 */
export function isMatchToday(match: Match): boolean {
  const today = new Date();
  const matchDate = new Date(match.date_unix * 1000);
  
  return (
    today.getFullYear() === matchDate.getFullYear() &&
    today.getMonth() === matchDate.getMonth() &&
    today.getDate() === matchDate.getDate()
  );
}

/**
 * Check if a match is in the future (upcoming)
 */
export function isMatchUpcoming(match: Match): boolean {
  const now = Date.now();
  const matchTime = match.date_unix * 1000;

  return matchTime > now &&
         (match.status === 'incomplete' ||
          match.status === 'scheduled' ||
          match.status === 'upcoming');
}

/**
 * Check if a match is currently live
 */
export function isMatchLive(match: Match): boolean {
  return match.status === 'live' ||
         match.status === 'inprogress' ||
         match.status === 'playing';
}

/**
 * Filter matches that are upcoming today
 */
export function getTodayUpcomingMatches(matches: Match[]): Match[] {
  return matches.filter(match => 
    isMatchToday(match) && isMatchUpcoming(match)
  );
}

/**
 * Calculate time until match starts
 */
export function getTimeUntilMatch(match: Match): {
  isStarting: boolean;
  days: number;
  hours: number;
  minutes: number;
  totalMinutes: number;
} {
  const now = Date.now();
  const matchTime = match.date_unix * 1000;
  const diff = matchTime - now;

  if (diff <= 0) {
    return {
      isStarting: true,
      days: 0,
      hours: 0,
      minutes: 0,
      totalMinutes: 0
    };
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return {
    isStarting: false,
    days,
    hours,
    minutes,
    totalMinutes
  };
}

/**
 * Format countdown display
 */
export function formatCountdown(match: Match): string {
  const time = getTimeUntilMatch(match);
  
  if (time.isStarting) return "Iniciando";
  
  if (time.days > 0) {
    return `${time.days}d ${time.hours}h`;
  }
  
  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}min`;
  }
  
  if (time.minutes > 0) {
    return `${time.minutes}min`;
  }
  
  return "Iniciando em breve";
}

/**
 * Get priority for sorting matches (live first, then by time)
 */
export function getMatchPriority(match: Match): number {
  if (isMatchLive(match)) return 0; // Highest priority
  if (isMatchUpcoming(match)) return match.date_unix; // Sort by time
  return Number.MAX_SAFE_INTEGER; // Lowest priority
}

/**
 * Sort matches by priority (live first, then upcoming by time)
 */
export function sortMatchesByPriority(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const priorityA = getMatchPriority(a);
    const priorityB = getMatchPriority(b);
    return priorityA - priorityB;
  });
}
