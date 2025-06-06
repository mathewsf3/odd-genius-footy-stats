# Backend com Banco de Dados Local - Odd Genius Footy Stats

## 📋 Visão Geral

Este projeto agora inclui um backend completo com banco de dados SQLite local que armazena todos os dados de futebol da API FootyStats. Isso resolve os problemas identificados no overview e melhora significativamente a performance e confiabilidade.

## 🔧 Problemas Corrigidos

### ✅ Erros da API FootyStats Corrigidos:
1. **Chave da API não incluída em getLeagues()** - Agora todas as requisições incluem a key
2. **Uso incorreto de league_id vs season_id** - Corrigido para usar season_id conforme documentação
3. **Busca de detalhes de time sem include=stats** - Adicionado include=stats em todas as chamadas relevantes
4. **Exposição da API key no front-end** - Agora todas as chamadas passam pelo backend
5. **Limite de dias para partidas futuras** - Removido limite artificial de 3 dias

### 🗄️ Backend Implementado:
- **Banco SQLite** com schema completo (ligas, times, partidas, estatísticas)
- **Sincronização automática** com FootyStats API
- **Endpoints locais** para servir dados rapidamente
- **Sistema de cache** para reduzir chamadas à API externa
- **Interface de administração** para gerenciar sincronização

## 🚀 Como Usar

### 1. Configuração Inicial

```bash
# Instalar dependências (já feito)
npm install

# Gerar cliente Prisma
npm run db:generate

# Criar banco de dados
npm run db:push
```

### 2. Sincronização Inicial

```bash
# Executar sincronização completa (primeira vez)
npm run sync:initial
```

Este comando irá:
- Buscar todas as ligas disponíveis na FootyStats
- Para cada liga, sincronizar times e partidas
- Popular o banco local com todos os dados

⚠️ **Importante**: A sincronização inicial pode demorar alguns minutos dependendo do número de ligas configuradas na sua conta FootyStats.

### 3. Executar o Projeto

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

### 4. Gerenciar Sincronização

Acesse `http://localhost:3000/admin` para:
- Ver status do banco de dados
- Executar sincronização manual
- Monitorar última atualização

## 📊 Estrutura do Banco de Dados

### Tabelas Principais:

1. **leagues** - Ligas/temporadas
   - season_id (ID único da FootyStats)
   - league_name, country, is_current

2. **teams** - Times
   - team_id (ID único da FootyStats)
   - name, short_name, country, logo_url, etc.

3. **team_seasons** - Relacionamento time-temporada
   - Estatísticas por temporada
   - Pontos, posição, gols, etc.

4. **matches** - Partidas
   - match_id (ID único da FootyStats)
   - Times, placar, estatísticas, odds, etc.

## 🔄 Sincronização

### Tipos de Sincronização:

1. **Completa** (`npm run sync:initial`)
   - Sincroniza tudo: ligas, times, partidas
   - Use apenas na primeira vez ou quando necessário

2. **Diária** (`npm run sync:today`)
   - Atualiza apenas partidas do dia atual
   - Ideal para atualizações frequentes

3. **Via Interface** (`/admin`)
   - Controle manual através da interface web
   - Monitoramento em tempo real

### Automatização:

Para automatizar a sincronização, você pode:

```bash
# Adicionar ao crontab (Linux/Mac) para sincronizar a cada hora
0 * * * * cd /path/to/project && npm run sync:today

# Ou usar GitHub Actions, Vercel Cron, etc.
```

## 🌐 Endpoints da API

### Novos Endpoints (Banco Local):

- `GET /api/db/leagues` - Lista de ligas
- `GET /api/db/matches?date=YYYY-MM-DD` - Partidas por data
- `GET /api/db/teams/{id}` - Detalhes do time
- `GET /api/sync?action=status` - Status da sincronização

### Endpoints Existentes (Mantidos):

- `GET /api/matches?date=YYYY-MM-DD` - Agora usa banco local
- `GET /api/fs/team/{id}` - Mantido para compatibilidade
- `GET /api/fs/match/{id}` - Mantido para compatibilidade

## 🔧 Comandos Úteis

```bash
# Banco de dados
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Aplicar schema ao banco
npm run db:studio      # Abrir interface visual do banco

# Sincronização
npm run sync:initial   # Sincronização completa
npm run sync:today     # Sincronização do dia

# Desenvolvimento
npm run dev           # Servidor de desenvolvimento
npm run build         # Build para produção
```

## 📈 Benefícios do Backend

### Performance:
- **Consultas locais** são 10x mais rápidas
- **Sem limites de API** para navegação do usuário
- **Cache automático** de dados históricos

### Confiabilidade:
- **Funciona offline** após sincronização
- **Sem falhas de API** durante uso normal
- **Dados consistentes** e sempre disponíveis

### Escalabilidade:
- **Consultas complexas** possíveis (joins, agregações)
- **Análises avançadas** com dados históricos
- **Customizações** específicas do projeto

## 🔍 Monitoramento

### Logs:
- Todas as operações são logadas no console
- Erros de sincronização são capturados e reportados
- Status de cada etapa é exibido

### Interface Admin:
- Dashboard com estatísticas do banco
- Controles de sincronização
- Histórico de atualizações

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Erro de API Key**:
   ```
   Verifique se FOOTYSTATS_API_KEY está configurada em .env.local
   ```

2. **Banco não criado**:
   ```bash
   npx prisma db push
   ```

3. **Sincronização falha**:
   ```
   Verifique conexão com internet e limites da API FootyStats
   ```

4. **Dados desatualizados**:
   ```bash
   npm run sync:today
   ```

### Logs de Debug:

Para debug detalhado, verifique:
- Console do navegador (F12)
- Terminal onde o Next.js está rodando
- Interface admin (`/admin`)

## 📝 Próximos Passos

Com o backend implementado, você pode:

1. **Adicionar mais ligas** na configuração FootyStats
2. **Implementar análises avançadas** com dados históricos
3. **Criar dashboards personalizados** com estatísticas
4. **Adicionar notificações** para partidas importantes
5. **Implementar sistema de favoritos** para times/ligas

## 🤝 Colaboração

Para outros desenvolvedores:

1. Clone o repositório
2. Configure `.env.local` com suas credenciais
3. Execute `npm run sync:initial`
4. Inicie desenvolvimento com `npm run dev`

O banco local garante que todos tenham os mesmos dados para desenvolvimento!
