/**
 * Utilitários para manipulação de datas e timezone
 */

/**
 * Obtém a data atual no formato YYYY-MM-DD (UTC)
 */
export function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Obtém a data atual no formato YYYY-MM-DD (timezone local)
 */
export function getTodayDateLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte data YYYY-MM-DD para timestamp Unix (início do dia UTC)
 */
export function dateToUnixStart(date: string): number {
  return Math.floor(new Date(`${date}T00:00:00.000Z`).getTime() / 1000);
}

/**
 * Converte data YYYY-MM-DD para timestamp Unix (fim do dia UTC)
 */
export function dateToUnixEnd(date: string): number {
  return Math.floor(new Date(`${date}T23:59:59.999Z`).getTime() / 1000);
}

/**
 * Obtém timestamp Unix atual
 */
export function getCurrentUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Verifica se uma partida está ao vivo baseado no status e horário
 */
export function isMatchLive(status: string, dateUnix: number): boolean {
  const liveStatuses = ['live', 'inprogress', 'playing', 'in_play'];
  const now = getCurrentUnixTimestamp();
  
  // Se o status indica ao vivo, é ao vivo
  if (liveStatuses.includes(status.toLowerCase())) {
    return true;
  }
  
  // Se o status é incomplete mas já passou do horário de início (até 3 horas)
  if (status === 'incomplete') {
    const timeDiff = now - dateUnix;
    const hoursFromStart = timeDiff / 3600; // segundos para horas
    
    // Considera ao vivo se passou do horário mas não mais que 3 horas
    return hoursFromStart > 0 && hoursFromStart <= 3;
  }
  
  return false;
}

/**
 * Verifica se uma partida é upcoming (futura)
 */
export function isMatchUpcoming(status: string, dateUnix: number): boolean {
  const now = getCurrentUnixTimestamp();
  
  // Deve ser incomplete e no futuro
  return status === 'incomplete' && dateUnix > now;
}

/**
 * Formata timestamp Unix para string legível em português
 */
export function formatUnixToPortuguese(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtém range de timestamps para buscar partidas de hoje
 */
export function getTodayRange(): { start: number; end: number } {
  const today = getTodayDate();
  return {
    start: dateToUnixStart(today),
    end: dateToUnixEnd(today)
  };
}

/**
 * Obtém range de timestamps para buscar partidas dos próximos dias
 */
export function getUpcomingRange(days: number = 7): { start: number; end: number } {
  const now = getCurrentUnixTimestamp();
  const endTime = now + (days * 24 * 60 * 60); // dias em segundos
  
  return {
    start: now,
    end: endTime
  };
}
