import { NextRequest, NextResponse } from 'next/server';

// Tipos para a resposta da API FootyStats
interface FootyStatsTeamInfoResponse {
  success: boolean;
  data: FootyStatsTeamInfo[];
}

interface FootyStatsTeamInfo {
  id: number;
  name: string;
  full_name: string;
  english_name: string;
  image: string;
  country: string;
  founded: string;
  url: string;
}

// Cache para evitar muitas chamadas à API
const teamInfoCache = new Map<string, { data: FootyStatsTeamInfo; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora (logos não mudam frequentemente)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando info completa do team ID: ${teamId}`);

    // Verifica cache primeiro
    const cacheKey = `teamInfo_${teamId}`;
    const cached = teamInfoCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📋 Cache hit para team info ${teamId}`);
      return NextResponse.json({
        success: true,
        data: cached.data
      });
    }

    // Busca dados completos do time na API FootyStats
    const url = `https://api.football-data-api.com/team?key=${process.env.FOOTYSTATS_API_KEY}&team_id=${teamId}&include=stats`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ Erro HTTP ${response.status} ao buscar info do team ${teamId}`);
      return NextResponse.json(
        { error: `Erro HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const data: FootyStatsTeamInfoResponse = await response.json();

    if (!data.success || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log(`❌ Dados inválidos da API para team ${teamId}:`, data);
      return NextResponse.json(
        { error: 'Time não encontrado' },
        { status: 404 }
      );
    }

    // Pega o primeiro resultado (deveria ser único por ID)
    const teamInfo = data.data[0];

    // Valida se temos os dados essenciais
    if (!teamInfo.id || !teamInfo.name) {
      console.log(`❌ Dados incompletos para team ${teamId}:`, teamInfo);
      return NextResponse.json(
        { error: 'Dados incompletos do time' },
        { status: 500 }
      );
    }

    // Salva no cache
    teamInfoCache.set(cacheKey, { data: teamInfo, timestamp: Date.now() });
    
    console.log(`✅ Info REAL obtida para team ${teamId}:`, {
      name: teamInfo.name,
      fullName: teamInfo.full_name,
      logo: teamInfo.image,
      country: teamInfo.country
    });

    return NextResponse.json({
      success: true,
      data: {
        id: teamInfo.id,
        name: teamInfo.name,
        fullName: teamInfo.full_name,
        englishName: teamInfo.english_name,
        logo: teamInfo.image,
        image: teamInfo.image, // Campo image da FootyStats API
        country: teamInfo.country,
        founded: teamInfo.founded,
        url: teamInfo.url,
        source: 'FootyStats'
      }
    });

  } catch (error) {
    console.error('❌ Erro na API team-info:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
