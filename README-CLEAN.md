# ⚽ Odd Genius Footy Stats

Sistema de estatísticas de futebol em tempo real com integração direta à API FootyStats.

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Shadcn/ui
- **Backend**: Next.js API Routes (server-side fetch)
- **API**: FootyStats API (integração direta)
- **Deployment**: Vercel

## 📋 Funcionalidades

### ✅ Implementadas
- Dashboard limpo com partidas ao vivo e próximas (3-14 dias)
- Integração direta com FootyStats API
- Match cards padronizados e reutilizáveis
- Expected Goals para partidas futuras
- Posse de bola em tempo real para partidas ao vivo
- Sistema de auto-refresh inteligente
- Testes mínimos automatizados

### 🔄 Próximas Features
- Página de detalhes da partida
- Estatísticas avançadas dos times
- Sistema de notificações
- Filtros por liga/competição

## 🛠️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
FOOTYSTATS_API_KEY=sua_chave_da_api_aqui
FOOTYSTATS_BASE_URL=https://api.football-data-api.com
```

### 2. Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### 3. Testes

```bash
# Testar endpoint de partidas ao vivo
npm run test:live

# Testar endpoint de partidas upcoming
npm run test:upcoming
```

## 📡 API Endpoints

### GET `/api/live-matches`
Retorna partidas que estão acontecendo agora.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123456,
      "homeName": "Time A",
      "awayName": "Time B",
      "homeGoals": 1,
      "awayGoals": 0,
      "minute": 45,
      "status": "live",
      "kickOff": "2024-01-15T20:00:00.000Z",
      "homeImage": "https://...",
      "awayImage": "https://...",
      "competition": "Premier League",
      "possession": {
        "home": 65,
        "away": 35
      }
    }
  ],
  "count": 6,
  "timestamp": "2024-01-15T20:45:00.000Z"
}
```

### GET `/api/upcoming-matches`
Retorna partidas programadas para os próximos 3-14 dias.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 789012,
      "homeName": "Time C",
      "awayName": "Time D",
      "homeGoals": 0,
      "awayGoals": 0,
      "minute": null,
      "status": "incomplete",
      "kickOff": "2024-01-20T15:30:00.000Z",
      "homeImage": "https://...",
      "awayImage": "https://...",
      "competition": "La Liga",
      "expectedGoals": {
        "total": 2.8,
        "btts": 65,
        "over25": 72
      }
    }
  ],
  "count": 12,
  "timestamp": "2024-01-15T20:45:00.000Z"
}
```

### GET `/api/match/[id]`
Retorna detalhes completos de uma partida específica.

## 🧩 Componentes

### StandardMatchCard
Componente reutilizável para exibir informações de partidas.

**Props:**
```typescript
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
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção
npm run lint         # Executar ESLint

# Testes
npm run test:live    # Testar endpoint de partidas ao vivo
npm run test:upcoming # Testar endpoint de partidas upcoming

# Colaboração (sistema de agentes)
npm run collab:augment    # Iniciar Augment Agent
npm run collab:vscode     # Iniciar VSCode Agent
npm run collab:monitor    # Monitor de colaboração
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── live-matches/route.ts      # Endpoint de partidas ao vivo
│   │   ├── upcoming-matches/route.ts  # Endpoint de partidas upcoming
│   │   └── match/[id]/route.ts        # Endpoint de detalhes da partida
│   ├── page.tsx                       # Dashboard principal
│   └── layout.tsx                     # Layout global
├── components/
│   ├── StandardMatchCard.tsx          # Componente de match card
│   ├── LiveMatches.tsx               # Seção de partidas ao vivo
│   ├── UpcomingMatches.tsx           # Seção de partidas upcoming
│   └── ui/                           # Componentes Shadcn/ui
└── types/
    └── index.ts                      # Definições de tipos TypeScript
```

## 🌐 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `FOOTYSTATS_API_KEY`
   - `FOOTYSTATS_BASE_URL`
3. Deploy automático a cada push

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 📝 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.
