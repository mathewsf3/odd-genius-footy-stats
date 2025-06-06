/**
 * Sistema de Validação de Dados Reais da FootyStats
 */

export interface ValidationResult {
  isValid: boolean;
  isTestData: boolean;
  errors: string[];
  warnings: string[];
  confidence: number; // 0-100
}

export interface MatchValidationData {
  match_id?: number;
  home_team?: { name?: string; team_id?: number };
  away_team?: { name?: string; team_id?: number };
  league?: { league_name?: string; season_id?: number };
  status?: string;
  date_unix?: number;
  source?: string;
  [key: string]: any;
}

/**
 * Padrões que identificam dados de teste
 */
const TEST_PATTERNS = {
  // Padrões de nomes de teste
  teamNames: [
    /test/i,
    /sample/i,
    /mock/i,
    /exemplo/i,
    /teste/i,
    /team\s*[a-z]$/i,
    /time\s*[a-z]$/i,
    /equipe\s*[a-z]$/i,
    /^team\s*\d+$/i,
    /^time\s*\d+$/i,
    /dummy/i,
    /fake/i,
    /placeholder/i
  ],
  
  // Padrões de ligas de teste
  leagueNames: [
    /test/i,
    /sample/i,
    /mock/i,
    /exemplo/i,
    /teste/i,
    /liga\s*test/i,
    /campeonato\s*test/i,
    /dummy/i,
    /fake/i
  ],
  
  // IDs de teste (geralmente números altos ou padrões específicos)
  testIds: [
    /^999\d+$/, // IDs começando com 999
    /^888\d+$/, // IDs começando com 888
    /^777\d+$/, // IDs começando com 777
  ]
};

/**
 * Valida se um match é dados reais da FootyStats
 */
export function validateRealMatch(matchData: MatchValidationData): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    isTestData: false,
    errors: [],
    warnings: [],
    confidence: 100
  };

  // 1. Verificar campos obrigatórios
  const requiredFields = ['match_id', 'home_team', 'away_team'];
  for (const field of requiredFields) {
    if (!matchData[field]) {
      result.errors.push(`Campo obrigatório ausente: ${field}`);
      result.isValid = false;
      result.confidence -= 20;
    }
  }

  // 2. Verificar se match_id é válido da FootyStats
  if (matchData.match_id) {
    // IDs da FootyStats são geralmente números de 6-8 dígitos
    if (matchData.match_id < 100000 || matchData.match_id > 99999999) {
      result.warnings.push(`Match ID fora do padrão FootyStats: ${matchData.match_id}`);
      result.confidence -= 10;
    }
    
    // Verificar padrões de teste
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(matchData.match_id.toString())) {
        result.isTestData = true;
        result.errors.push(`Match ID identificado como teste: ${matchData.match_id}`);
        result.confidence -= 50;
      }
    }
  }

  // 3. Verificar nomes dos times
  const homeTeamName = matchData.home_team?.name || '';
  const awayTeamName = matchData.away_team?.name || '';
  
  for (const pattern of TEST_PATTERNS.teamNames) {
    if (pattern.test(homeTeamName)) {
      result.isTestData = true;
      result.errors.push(`Nome do time casa identificado como teste: ${homeTeamName}`);
      result.confidence -= 30;
    }
    
    if (pattern.test(awayTeamName)) {
      result.isTestData = true;
      result.errors.push(`Nome do time visitante identificado como teste: ${awayTeamName}`);
      result.confidence -= 30;
    }
  }

  // 4. Verificar IDs dos times
  if (matchData.home_team?.team_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(matchData.home_team.team_id.toString())) {
        result.isTestData = true;
        result.errors.push(`ID do time casa identificado como teste: ${matchData.home_team.team_id}`);
        result.confidence -= 25;
      }
    }
  }

  if (matchData.away_team?.team_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(matchData.away_team.team_id.toString())) {
        result.isTestData = true;
        result.errors.push(`ID do time visitante identificado como teste: ${matchData.away_team.team_id}`);
        result.confidence -= 25;
      }
    }
  }

  // 5. Verificar nome da liga
  if (matchData.league?.league_name) {
    for (const pattern of TEST_PATTERNS.leagueNames) {
      if (pattern.test(matchData.league.league_name)) {
        result.isTestData = true;
        result.errors.push(`Nome da liga identificado como teste: ${matchData.league.league_name}`);
        result.confidence -= 20;
      }
    }
  }

  // 6. Verificar ID da liga/temporada
  if (matchData.league?.season_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(matchData.league.season_id.toString())) {
        result.isTestData = true;
        result.errors.push(`ID da liga identificado como teste: ${matchData.league.season_id}`);
        result.confidence -= 20;
      }
    }
  }

  // 7. Verificar data (não pode ser muito no futuro ou muito no passado)
  if (matchData.date_unix) {
    const now = Math.floor(Date.now() / 1000);
    const oneYearAgo = now - (365 * 24 * 60 * 60);
    const oneYearFromNow = now + (365 * 24 * 60 * 60);
    
    if (matchData.date_unix < oneYearAgo || matchData.date_unix > oneYearFromNow) {
      result.warnings.push(`Data da partida fora do intervalo esperado: ${new Date(matchData.date_unix * 1000).toISOString()}`);
      result.confidence -= 10;
    }
  }

  // 8. Verificar se tem source definido
  if (matchData.source && matchData.source !== 'footystats') {
    result.warnings.push(`Source não é FootyStats: ${matchData.source}`);
    result.confidence -= 5;
  }

  // Determinar se é válido baseado na confiança
  if (result.confidence < 50) {
    result.isValid = false;
  }

  if (result.isTestData) {
    result.isValid = false;
  }

  return result;
}

/**
 * Valida se um time é real da FootyStats
 */
export function validateRealTeam(teamData: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    isTestData: false,
    errors: [],
    warnings: [],
    confidence: 100
  };

  // Verificar nome do time
  if (teamData.name) {
    for (const pattern of TEST_PATTERNS.teamNames) {
      if (pattern.test(teamData.name)) {
        result.isTestData = true;
        result.errors.push(`Nome do time identificado como teste: ${teamData.name}`);
        result.confidence -= 40;
      }
    }
  }

  // Verificar ID do time
  if (teamData.team_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(teamData.team_id.toString())) {
        result.isTestData = true;
        result.errors.push(`ID do time identificado como teste: ${teamData.team_id}`);
        result.confidence -= 40;
      }
    }
  }

  if (result.isTestData || result.confidence < 60) {
    result.isValid = false;
  }

  return result;
}

/**
 * Valida se uma liga é real da FootyStats
 */
export function validateRealLeague(leagueData: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    isTestData: false,
    errors: [],
    warnings: [],
    confidence: 100
  };

  // Verificar nome da liga
  if (leagueData.league_name) {
    for (const pattern of TEST_PATTERNS.leagueNames) {
      if (pattern.test(leagueData.league_name)) {
        result.isTestData = true;
        result.errors.push(`Nome da liga identificado como teste: ${leagueData.league_name}`);
        result.confidence -= 40;
      }
    }
  }

  // Verificar ID da liga
  if (leagueData.season_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(leagueData.season_id.toString())) {
        result.isTestData = true;
        result.errors.push(`ID da liga identificado como teste: ${leagueData.season_id}`);
        result.confidence -= 40;
      }
    }
  }

  if (result.isTestData || result.confidence < 60) {
    result.isValid = false;
  }

  return result;
}
