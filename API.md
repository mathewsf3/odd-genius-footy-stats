A seguir está um guia completo da FootyStats API para que o seu agente de IA saiba exatamente quais endpoints existem, quais variáveis aceitar e quais campos retornar. Incluí exemplos de chamadas usando a sua chave e destaquei onde encontrar gols, escanteios, cartões, estatísticas de jogador, árbitro, liga, over/under, além de URLs de logos.

API KEY - 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756

Nesta resposta, faremos um breakdown completo da API FootyStats, cobrindo todos os endpoints disponíveis e explicando como extrair cada tipo de dado – incluindo ligas, times, partidas (com estatísticas de gols, escanteios, cartões etc.), jogadores, árbitros, tabelas e estatísticas especiais. Também abordaremos questões práticas como autenticação e obtenção de logos/imagens.
🔑 Autenticação e Acesso à API
Para usar a API, você precisa de uma chave de acesso (API key). Após assinar o serviço FootyStats, você recebe uma chave semelhante a YOURKEY (por exemplo, 4fd202fbc338fbd450e91761c7b83641...). Essa chave deve ser incluída em todas as requisições como parâmetro key.
Exemplo de uso da chave: https://api.football-data-api.com/league-list?key=YOURKEY
footystats.org
footystats.org
.
Além disso, ao assinar, você seleciona as ligas que terá acesso. Muitos endpoints retornarão dados apenas dessas ligas escolhidas. Certifique-se de que as ligas desejadas estejam habilitadas no seu plano; caso contrário, certos endpoints (como partidas do dia) podem retornar vazio
footystats.org
footystats.org
.
🌍 Listagem de Ligas e Países

1. Listar Ligas Disponíveis (League List):
   Este endpoint retorna todas as ligas e temporadas disponíveis na base de dados. Cada liga/temporada possui um ID único de temporada (season_id). Exemplo: Premier League 2019/20 é uma entrada separada da temporada 2018/19, cada qual com seu ID próprio
   footystats.org
   footystats.org
   .
   URL: GET https://api.football-data-api.com/league-list?key=YOURKEY
   footystats.org
   Parâmetros opcionais:
   chosen_leagues_only=true – Filtra para mostrar apenas as ligas incluídas na sua assinatura
   footystats.org
   .
   country=ISO – Filtra ligas por país, usando o código ISO numérico do país (sem zeros à esquerda)
   footystats.org
   . Por exemplo, country=76 poderia filtrar ligas do Brasil (caso suportado).
   Campos principais do retorno: Cada item inclui o name (nome completo da liga, incluindo país), league_name (nome da liga sem o país), country (nome do país), e o objeto season com campos id (ID da temporada) e year (ano de início da temporada)
   footystats.org
   footystats.org
   .
2. Listar Países Suportados (Country List):
   Se você precisar dos códigos ISO de países suportados, use este endpoint. Ele retorna todos os países com seus respectivos IDs ISO usados pela API
   footystats.org
   .
   URL: GET https://api.football-data-api.com/country-list?key=YOURKEY
   footystats.org
   Retorno: Array de países com campos id (código ISO numérico) e name (nome do país)
   footystats.org
   . Por exemplo, Brasil pode aparecer com id: 76, name: "Brazil".
   Esses endpoints de listagem são úteis para popular sua base de dados inicial com ligas e países, e para obter os season_id necessários para outras chamadas.
   📅 Partidas por Data (Agenda Diária)
3. Partidas do Dia / Por Data (Today's Matches):
   Para obter jogos em uma data específica (incluindo hoje), use este endpoint. Ele retorna até 200 partidas por página (com possibilidade de paginação) contendo dados básicos e estatísticas de cada jogo
   footystats.org
   .
   URL: GET https://api.football-data-api.com/todays-matches?key=YOURKEY
   Parâmetro date=YYYY-MM-DD – Data desejada. Se omitido, assume a data atual (UTC)
   footystats.org
   .
   Parâmetro timezone=Area/Location – Opcional; define o fuso horário para horários das partidas (padrão UTC)
   footystats.org
   .
   Paginação: use page=2, page=3, etc., para obter mais partidas se houver >200 jogos no dia
   footystats.org
   .
   Retorno: Array de partidas do dia com campos como:
   id (ID do jogo), homeID e awayID (IDs dos times mandante/visitante)
   footystats.org
   ,
   status (status da partida: completa, suspensa, etc.)
   footystats.org
   footystats.org
   ,
   homeGoals e awayGoals (arrays com minutos dos gols de cada time)
   footystats.org
   ,
   Contagens de gols: homeGoalCount, awayGoalCount, totalGoalCount
   footystats.org
   ,
   Estatísticas do jogo: escanteios (team_a_corners, team_b_corners, totalCornerCount)
   footystats.org
   , impedimentos (team_a_offsides, etc.)
   footystats.org
   , cartões amarelos/vermelhos (team_a_yellow_cards, team_a_red_cards, etc.)
   footystats.org
   footystats.org
   , finalizações (shotsOnTarget, shotsOffTarget, total de chutes) para cada lado
   footystats.org
   footystats.org
   , faltas (team_a_fouls, team_b_fouls)
   footystats.org
   , posse de bola (team_a_possession, team_b_possession)
   footystats.org
   , etc.
   Identificadores diversos: refereeID (árbitro), coach_a_ID / coach_b_ID (técnicos), estádio (stadium_name, stadium_location)
   footystats.org
   footystats.org
   .
   Odds pré-jogo para resultados e gols: odds_ft_1, odds_ft_X, odds_ft_2 (probabilidades de vitória casa, empate, fora)
   footystats.org
   , odds de over/under gols (0.5 até 4.5)
   footystats.org
   , odds BTTS (odds_btts_yes, odds_btts_no)
   footystats.org
   , odds de clean sheet para cada time
   footystats.org
   .
   Esses campos permitem já obter estatísticas de gols, escanteios, cartões etc. em cada partida. Note que partidas futuras (não iniciadas) terão muitas estatísticas como nulas ou -1 (valor padrão indicando “não disponível”)
   footystats.org
   footystats.org
   .
   Dica: Use este endpoint para alimentar a programação diária do seu SaaS. Lembre-se de filtrar pelas ligas da sua assinatura (por padrão, apenas as ligas escolhidas aparecem
   footystats.org
   ).
   🏆 Dados de Temporada da Liga (Estatísticas Gerais da Liga)
4. Estatísticas da Liga e Times (League Stats / Season Stats):
   Este endpoint retorna dados agregados de uma temporada (liga) inteira, incluindo estatísticas gerais da liga e uma lista de todos os times participantes com suas estatísticas completas
   footystats.org
   footystats.org
   . É essencial para obter números como total de gols na temporada, médias de escanteios, etc., bem como as estatísticas acumuladas de cada equipe.
   URL: GET https://api.football-data-api.com/league-season?key=YOURKEY&season_id=X
   footystats.org
   (substitua X pelo ID da temporada obtido no League List).
   Parâmetros:
   season*id (obrigatório): o ID único da temporada (ex: 2012 para EPL 2018/19)
   footystats.org
   .
   max_time (opcional): timestamp UNIX para cortar as estatísticas até certa data/horário
   footystats.org
   . Útil caso queira stats até metade da temporada, por exemplo.
   Retorno: Contém dois blocos principais: estatísticas da temporada e lista de times. Vamos detalhar: a) Estatísticas gerais da temporada (liga):
   Inclui informações da liga (nome, país, divisão) e uma vasta lista de estatísticas agregadas. Alguns destaques:
   Identificação: id (ID da temporada), name (nome completo da liga) e country
   footystats.org
   footystats.org
   . Também indica o nível/doméstico vs internacional (domestic_scale, international_scale) para relevância da liga
   footystats.org
   .
   Detalhes da temporada: ano de início e fim (starting_year, ending_year), formato (pontos corridos, grupos, etc.), se é feminino (women)
   footystats.org
   footystats.org
   .
   Imagem da liga: URL do logo/imagem da liga em image (pode ser usada para mostrar o logo do campeonato)
   footystats.org
   . Exemplo: image: "https://footystats.org/img/leagueLogos/..."
   footystats.org
   .
   Progresso da temporada: número de clubes (clubNum), total de partidas (totalMatches), jogos concluídos (matchesCompleted), rodadas (game_week atual e total_game_week), percentual concluído (progress)
   footystats.org
   footystats.org
   .
   Gols: total de gols (total_goals), gols casa e fora (marcados e sofridos)
   footystats.org
   footystats.org
   , médias de gols por partida geral/casa/fora (seasonAVG_overall, etc.)
   footystats.org
   . Inclui contagem e % de jogos com Ambos Marcam (BTTS)
   footystats.org
   , clean sheets totais e falhas em marcar (casa e fora)
   footystats.org
   footystats.org
   .
   Escanteios: total e média de escanteios por jogo (geral, casa, fora) (cornersTotal*_ e cornersAVG\__)
   footystats.org
   footystats.org
   , quantidade total de escanteios na temporada
   footystats.org
   . Também % de jogos acima de X escanteios (6.5, 8.5, etc.)
   footystats.org
   footystats.org
   .
   Cartões: total e média de cartões por jogo (cardsTotal*\*, cardsAVG*_)
   footystats.org
   footystats.org
   , com detalhes de cartões casa/fora. % de jogos acima de X cartões (0.5 até 7.5)
   footystats.org
   .
   Outras stats gerais: faltas (total e média)
   footystats.org
   footystats.org
   , finalizações e chutes a gol (total e média)
   footystats.org
   footystats.org
   , impedimentos (total/média)
   footystats.org
   footystats.org
   .
   Distribuição de resultados: número e % de vitórias mandantes, empates, vitórias visitantes (homeWins, draws, awayWins + porcentagens)
   footystats.org
   footystats.org
   .
   Distribuição de gols por intervalo: gols por faixa de minutos (0-10, 11-20, ..., 76-90) tanto marcados quanto sofridos, separados por casa/fora
   footystats.org
   footystats.org
   . Também dados de gols no 1º tempo vs 2º tempo (ex: partidas com mais gols em 1º ou 2º tempo)
   footystats.org
   footystats.org
   .
   Métricas de over/under gerais: % de jogos over 0.5 até over 5.5 gols
   footystats.org
   e under 0.5–5.5
   footystats.org
   , % de jogos com over X escanteios e cartões (diversos thresholds)
   footystats.org
   footystats.org
   .
   (Há muitos campos – a documentação completa lista todos os atributos disponíveis
   footystats.org
   footystats.org
   , garantindo acesso a praticamente qualquer estatística agregada que você imaginar.)
   b) Lista de Times com estatísticas da temporada:
   Em seguida, a resposta inclui um array teams com cada equipe participante e suas estatísticas na temporada. Cada item de time contém:
   Identificação: id do time, name/full*name (nome), country (país) e competition_id (ID da competição/temporada)
   footystats.org
   footystats.org
   .
   Posição na tabela (table_position) e ranking de performance (performance_rank, baseado em pontos por jogo)
   footystats.org
   .
   Website oficial (official_sites se disponível)
   footystats.org
   .
   Estatísticas do time: Dentro de cada objeto do time, o campo stats contém diversos atributos acumulados na temporada para aquele time, semelhantes aos listados para a liga, mas específicos daquela equipe. Isso inclui:
   Gols marcados/sofridos totais e separados (casa/fora)
   footystats.org
   footystats.org
   , saldo de gols (seasonGoalDifference*_)
   footystats.org
   , números de vitórias, empates, derrotas (seasonWinsNum*\*, etc.)
   footystats.org
   footystats.org
   , jogos jogados (seasonMatchesPlayed*_)
   footystats.org
   , etc.
   Clean sheets e “failed to score” do time (números e % em casa/fora)
   footystats.org
   footystats.org
   . Ambos marcam (BTTS): quantos jogos do time tiveram BTTS e porcentagens
   footystats.org
   .
   Médias: gols marcados e sofridos por jogo (seasonScoredAVG\__, seasonConcededAVG*\*)
   footystats.org
   , pontos por jogo (seasonPPG*_)
   footystats.org
   , % vitória/empate/derrota
   footystats.org
   footystats.org
   . Também métricas de desempenho em HT (intervalo): ganhando, empatando ou perdendo no HT e suas porcentagens
   footystats.org
   footystats.org
   , pontos no HT (HTPoints\__ e HTPPG*\*)
   footystats.org
   .
   Over/Under para o time: quantidade e % de jogos do time acima de 0.5, 1.5, ... 5.5 gols (geral e HT)
   footystats.org
   footystats.org
   .
   Escanteios do time: total e média de escanteios a favor e contra, separados casa/fora
   footystats.org
   footystats.org
   . Exemplos: cornersTotal_overall, cornersAgainst_home, etc. Além disso, contagem e % de jogos do time com mais de X escanteios a favor/contra (ex: over 5.5 corners a favor)
   footystats.org
   footystats.org
   .
   Cartões do time: total e média de cartões a favor e contra (cards_for*_, cards*against*_) e estatísticas de thresholds (over 0.5, 1.5... até 8.5 cartões em jogos do time)
   footystats.org
   footystats.org
   .
   Outras: posse de bola média, faltas, impedimentos do time (total e médias)
   footystats.org
   footystats.org
   , distribuições de gols marcados/sofridos por minuto (semelhante à liga) aplicadas aos jogos do time
   footystats.org
   footystats.org
   , etc.
   (Novamente, há dezenas de campos – praticamente tudo que foi listado para a liga também se aplica em versão "por time". A documentação detalha todos os atributos disponíveis para cada time
   footystats.org
   footystats.org
   .)
   Este endpoint league-season é poderoso, pois com uma única chamada você obtém todos os times e estatísticas completas da temporada, além dos agregados gerais da liga. Ideal para preencher sua base com dados de classificação (parcial) e desempenho.
   Observação: A API também fornece endpoints separados para "League Teams" e "League Table". A diferença é que league-season já traz times + stats de uma vez. Já veremos os outros para casos de uso específicos (como paginação ou tabela de classificação).
   📑 Lista de Partidas de uma Liga (Calendário e Resultados)
5. Jogos da Temporada (League Matches):
   Para obter todas as partidas de uma liga/temporada específica (tanto resultados passados quanto futuros agendados), use este endpoint. Ele retorna o calendário completo com estatísticas de cada jogo (similar aos campos de "Today's Matches").
   URL: GET https://api.football-data-api.com/league-matches?key=YOURKEY&season_id=X
   footystats.org
   Parâmetros:
   season_id (obrigatório): ID da temporada (mesmo ID usado no league-season).
   page e max_per_page (opcionais): paginação. Por padrão traz até 300 partidas por página; você pode aumentar até max_per_page=1000
   footystats.org
   footystats.org
   . Utilize page=2,3,... se a temporada tiver mais jogos.
   max_time (opcional): similar ao anterior, permite delimitar até uma data (timestamp) específica
   footystats.org
   .
   Retorno: Um array de partidas. Cada objeto de partida contém todos os mesmos campos do endpoint de "Today's Matches" discutido antes (gols, escanteios, cartões, odds, etc.), além de alguns campos pré-jogo:
   Exemplo de campos: id, homeID, awayID, homeGoalCount, awayGoalCount, team_a_corners, team_a_yellow_cards, ...
   footystats.org
   footystats.org
   , etc., até date_unix (timestamp do kickoff)
   footystats.org
   e winningTeam (ID do vencedor, ou -1 se empate)
   footystats.org
   .
   Inclui também os campos de potenciais pré-jogo para confronto: btts_potential (probabilidade média de BTTS entre os dois times), o15_potential ... o45_potential (chance média de over 1.5, 2.5, etc.), assim como avg_potential (média de gols prevista) e potenciais de escanteios, impedimentos, cartões antes do jogo
   footystats.org
   footystats.org
   . Esses "potenciais" são calculados com base nas estatísticas prévias das equipes e são fornecidos para dar contexto preditivo.
   Em resumo, cada partida aqui tem os mesmos detalhes de uma partida do endpoint diário, só que restrito à temporada solicitada e incluindo partidas futuras (com stats vazios). Tudo desde gols até odds e stats de desempenho pré-jogo está presente
   footystats.org
   footystats.org
   .
   Use league-matches para popular resultados históricos ou o cronograma completo de uma liga no seu banco. Por exemplo, para armazenar todos os jogos do Brasileirão 2023, você chamaria esse endpoint com o season_id correspondente e percorreria as páginas se necessário.
   🥇 Tabelas de Classificação (League Table)
   Embora possamos derivar a classificação a partir dos dados dos times ou partidas, a API oferece um endpoint dedicado para tabelas: 6. Tabela da Liga (League Table):
   Retorna as tabelas de classificação da temporada, incluindo cenários de múltiplas fases.
   URL: GET https://api.football-data-api.com/league-tables?key=YOURKEY&season_id=X
   footystats.org
   Parâmetros: season_id obrigatório; max_time opcional para tabela até certa data
   footystats.org
   .
   Retorno:
   Campo league_table: tabela principal da liga (se for pontos corridos simples). É um array dos times com posições e pontuações
   footystats.org
   . Por exemplo, Premier League teria aqui a classificação final (ou atual, se usar max_time). Para copas ou formatos sem pontos corridos, pode ser NULL
   footystats.org
   .
   Campo all_matches_table_overall: uma tabela combinando todas as fases (geral). Útil para copas onde não há "liga", mas dá para montar uma classificação agregada de desempenho geral
   footystats.org
   . Também há variantes all_matches_table_home e ...\_away para tabelas somente dos jogos em casa ou fora
   footystats.org
   .
   Campo specific_tables: array de tabelas para cada fase/round específico da temporada
   footystats.org
   . Por exemplo: em ligas sul-americanas com Apertura/Clausura, ou Champions League com fase de grupos (várias tabelas) e playoffs (sem tabela). Cada entrada indica o nome da fase e a tabela correspondente ou NULL se não aplicável
   footystats.org
   . (A documentação dá exemplos: no Uruguai, tabela do Apertura, tabela da Intermedio, etc; Champions League: tabelas dos grupos, e fases eliminatórias como NULL)
   footystats.org
   .
   Campos da tabela: Cada tabela em geral traz por time: posição, nome, jogos, vitórias, empates, derrotas, gols pró, gols contra, saldo, pontos, etc., conforme o campeonato. Esses campos específicos não estão listados explicitamente na documentação, mas são intuitivos. A estrutura das tabelas reflete a classificação oficial.
   Em resumo, league-tables fornece de forma direta as posições e pontuação dos times, sem precisar calcular manualmente. Use-o para exibir a tabela atualizada do campeonato no seu SaaS. (Observação: Os mesmos dados de performance (pontos, vitórias etc.) também estão disponíveis no endpoint de Teams/Stats da liga, mas este endpoint facilita obter as tabelas prontas.)
   🏟️ Dados de Times Individualmente
   Além do dado combinado de times via league-season, a API oferece endpoints para consultar um time específico ou estatísticas de forma segmentada: 7. Times de uma Liga (League Teams):
   Esse endpoint é parecido com o league-season porém focado nos times, com opção de paginação. Pode ser útil se quiser puxar times separadamente.
   URL: GET https://api.football-data-api.com/league-teams?key=YOURKEY&season_id=X
   footystats.org
   Parâmetros:
   season_id (obrigatório): ID da temporada.
   include=stats – importante: incluir este parâmetro para trazer as estatísticas de cada time
   footystats.org
   footystats.org
   . Sem ele, possivelmente retorna apenas dados básicos dos times.
   Paginação: page (50 times por página)
   footystats.org
   . Normalmente campeonatos têm <50 equipes, então página 1 basta, mas ligas muito grandes ou agregadas poderiam precisar (ex: se temporada englobasse divisões B, etc., incomum).
   max_time: similar aos anteriores, pode limitar stats até certa data
   footystats.org
   .
   Retorno: Array de times com formato praticamente idêntico ao descrito no item 4b (stats por time). Cada time terá campos de identificação (id, name, etc.) e, se include=stats, um objeto stats com todos aqueles campos de desempenho da temporada
   footystats.org
   footystats.org
   . A diferença aqui é apenas o formato paginado.
6. Dados de um Time Específico (Team):
   Se você quiser informações de um único clube, use o endpoint de Team. Ele retorna dados do time e suas estatísticas na temporada atual ou mais recente.
   URL: GET https://api.football-data-api.com/team?key=YOURKEY&team_id=TEAMID&include=stats
   footystats.org
   Parâmetros:
   team_id (obrigatório): ID do time (obtenha via League Teams ou League Matches).
   include=stats: recomenda-se usar para trazer estatísticas do time
   footystats.org
   .
   Retorno: Um array JSON (geralmente com um único objeto do time requisitado). Os campos desse objeto de time são os mesmos já detalhados (nome, país, etc.)
   footystats.org
   footystats.org
   . Com include=stats, espera-se um campo stats similar aos já explicados (gols, vitórias, médias, etc., daquela equipe)
   footystats.org
   footystats.org
   . Esse endpoint é útil caso você queira atualizar periodicamente um único time (por exemplo, após cada rodada, pegar o time X atualizado). Contudo, muitas vezes usar league-teams para todos os times pode ser mais eficiente do que chamar um por um.
7. Estatísticas Recentes (Forma) – Últimos 5/6/10 Jogos:
   Para analisar a forma recente de um time, existe um endpoint dedicado que retorna estatísticas calculadas apenas nos últimos 5, 6 e 10 jogos do time na liga.
   URL: GET https://api.football-data-api.com/lastx?key=YOURKEY&team_id=TEAMID
   footystats.org
   Descrição: Com uma única chamada, a resposta traz três conjuntos de stats: dos últimos 5 jogos, últimos 6 e últimos 10 jogos
   footystats.org
   footystats.org
   . (No futuro podem adicionar últimos 15, 20, etc.)
   Retorno: A estrutura é análoga à de team – ou seja, incluirá o time (id, nome, etc.) e um campo stats que conterá sub-seções para 5, 6 e 10 jogos. Os atributos dentro de cada seção são idênticos aos do endpoint de time completo
   footystats.org
   footystats.org
   – por exemplo, seasonGoals_overall passaria a representar gols nos últimos X jogos, winPercentage_overall o aproveitamento nesses jogos, e assim por diante. Em suma, permite ver como o desempenho recente difere dos números gerais da temporada.
   Use lastx para exibir estatísticas de curto prazo, como sequência de vitórias, média de gols nos últimos jogos, etc., o que é útil para análises de tendência.
   🔎 Detalhes de Partida (Estatísticas, H2H, Escalações)
   Os endpoints anteriores trazem muitas informações dos jogos, mas para detalhamento completo de uma partida específica, incluindo dados adicionais como escalações e histórico do confronto, devemos usar: 10. Detalhes de uma Partida (Match Details):
   Fornece estatísticas detalhadas, lineup, banco, tendências e odds completas de um único jogo, além de histórico de confrontos (H2H).
   URL: GET https://api.football-data-api.com/match?key=YOURKEY&match_id=ID
   footystats.org
   Parâmetros: match_id obrigatório (ID do jogo, obtido via League Matches ou Today's Matches)
   footystats.org
   .
   Retorno: Este endpoint inclui todos os campos já discutidos em partidas (gols, chutes, cartões, odds etc.) e adiciona campos extras:
   Lineups (lineups): lista dos jogadores titulares de ambos os times, com seus IDs, e eventos como gols/cartões atribuídos a eles
   footystats.org
   . Assim, você pode extrair a escalação inicial e saber quem marcou ou recebeu cartão e em qual minuto.
   Banco de reservas (bench): jogadores que começaram no banco, incluindo informações de substituição (quem entrou em que minuto)
   footystats.org
   .
   Detalhes de cartões por time: team_a_card_details e team_b_card_details trazem a lista de cartões com jogador, tipo (amarelo/vermelho) e minuto
   footystats.org
   .
   Tendências (trends): um texto ou conjunto de dados resumindo tendências estatísticas do confronto, como desempenhos recentes de cada time até aquele jogo (ex.: "Time A venceu X jogos seguidos em casa")
   footystats.org
   . Isso ajuda em comentários ou análises descritivas.
   H2H (h2h): estatísticas de confrontos diretos dos dois times. Inclui número de vitórias de cada lado, confrontos anteriores e seus placares e IDs de partidas passadas
   footystats.org
   . Assim, você sabe o retrospecto recente entre as equipes.
   Comparativo de Odds (odds_comparison): uma linha completa de odds possivelmente de múltiplas casas de apostas ou abertura vs fechamento
   footystats.org
   . (A documentação menciona "Full line of odds", indicando dados de odds de forma mais abrangente aqui).
   Em suma, match é o endpoint mais rico para uma partida individual. Use-o quando o usuário do seu SaaS clicar em um jogo para ver detalhes: você pode mostrar a escalação, eventos do jogo, comparação de odds e histórico de confronto além das estatísticas básicas.
   Diferença para League Matches: league-matches já traz estatísticas e odds básicas, mas não traz escalações nem o H2H. match supre isso, portanto pode-se usar uma combinação: league-matches para listar jogos e resultados, e match para aprofundar em um jogo específico quando necessário
   footystats.org
   footystats.org
   .
   👥 Dados de Jogadores
8. Lista de Jogadores da Liga (League Players):
   Você pode obter todos os jogadores que atuaram em uma determinada temporada, junto com suas estatísticas naquela liga.
   URL: GET https://api.football-data-api.com/league-players?key=YOURKEY&season_id=X&include=stats
   footystats.org
   Parâmetros:
   season*id obrigatório.
   include=stats: embora não esteja 100% claro na documentação se é necessário, o exemplo de chamada o utiliza
   footystats.org
   . Provavelmente, include=stats garante que os campos de desempenho do jogador sejam incluídos.
   Paginação: page (até 200 jogadores por página)
   footystats.org
   . Grandes ligas podem ter mais de 200 jogadores (ex.: Premier League ~500 jogadores em uma temporada), então use page=2 para os próximos 200, etc.
   Retorno: Array de jogadores com campos:
   Identificação: id do jogador, nome completo (full_name dividido também em first_name e last_name), apelido/conhecido como (known_as), e um shorthand (nome amigável para URL)
   footystats.org
   footystats.org
   .
   Informação demográfica: idade (age), nacionalidade (nationality), continente de origem (continent), data de nascimento (birthday em timestamp UNIX)
   footystats.org
   footystats.org
   .
   Detalhes de clube: club_team_id (ID do time na liga), club_team_2_id (se emprestado a outro clube; -1 se não for o caso)
   footystats.org
   , national_team_id (ID da seleção nacional se aplicável, ou -1)
   footystats.org
   , posição em campo (position)
   footystats.org
   .
   Estatísticas na temporada: número de partidas jogadas (appearances_overall e separadas casa/fora)
   footystats.org
   footystats.org
   , minutos jogados (total, casa, fora)
   footystats.org
   , gols marcados (goals_overall etc.)
   footystats.org
   , assistências, cartões amarelos/vermelhos, e outros. A documentação do jogador individual (próximo tópico) descreve esses campos. Basicamente, tudo que faz sentido para stats de jogador: por exemplo, assistências, clean sheets, gols sofridos (para goleiros), etc., por jogo também.
   Os campos exibidos na documentação parcial incluem até goals_overall
   footystats.org
   , mas sabemos que há mais: prosseguindo a lógica, existem assists_overall, yellow_cards_overall, red_cards_overall, etc., similares ao endpoint individual (veja abaixo).
   Este endpoint é ideal para popular seu banco de dados de jogadores da liga. Por exemplo, você pode listar os artilheiros e estatísticas de cada jogador no campeonato. Lembre-se de paginar para cobrir todos os jogadores. 12. Dados de um Jogador (Player - Individual):
   Recupera as estatísticas completas de um jogador em cada temporada/competição que ele disputou. Ou seja, é possível ver o histórico do jogador em múltiplas ligas ou anos.
   URL: GET https://api.football-data-api.com/player-stats?key=YOURKEY&player_id=PID
   footystats.org
   Parâmetro: player_id (obrigatório): ID do jogador (obtenha via league-players).
   Retorno: Um array de objetos, onde cada objeto representa as stats do jogador em uma certa temporada e liga. Por exemplo, para um jogador que atuou 2019 na Serie A e 2020 na Premier League, serão duas entradas, cada uma com os números correspondentes. Campos principais (por entrada):
   Identificação: id (do jogador), competition_id (temporada específica daquela entrada)
   footystats.org
   footystats.org
   , nome (full_name, etc.), idade na época, etc.
   Liga e temporada: league (nome), league_type (escala/nível)
   footystats.org
   , season (ano da temporada), starting_year e ending_year
   footystats.org
   .
   Time: club_team_id (ID do clube naquela temporada) e club_team_2_id se transferiu durante a temporada
   footystats.org
   .
   Estatísticas de performance:
   Minutos jogados (minutes_played_overall, casa, fora)
   footystats.org
   footystats.org
   Partidas jogadas (appearances_overall/home/away)
   footystats.org
   Gols: goals_overall/home/away (marcados)
   footystats.org
   ; se for goleiro/zaga, clean_sheets_overall (jogos sem sofrer gols enquanto em campo)
   footystats.org
   ; conceded_overall (gols sofridos com ele em campo, relevante para goleiros/defesas)
   footystats.org
   .
   Assistências: assists_overall/home/away
   footystats.org
   .
   Penaltis: penalty_goals (gols de pênalti marcados)
   footystats.org
   .
   Índices por 90 minutos: goals_per_90_overall (gols por 90 min)
   footystats.org
   , assists_per_90_overall
   footystats.org
   , goals_involved_per_90_overall (gols+assists por 90)
   footystats.org
   , conceded_per_90 (gols sofridos por 90)
   footystats.org
   , etc.
   Cartões: cards_overall (total de cartões), yellow_cards_overall, red_cards_overall
   footystats.org
   .
   Minutos por evento: min_per_goal, min_per_assist, min_per_card – quantos minutos em média para cada gol, assistência ou cartão
   footystats.org
   footystats.org
   .
   Outros: cards_per_90_overall (cartões por 90)
   footystats.org
   , min_per_match (minutos médios por jogo)
   footystats.org
   , e até rating médio se disponível (average_rating_overall)
   footystats.org
   .
   Além disso, há uma seção "detailed" com estatísticas avançadas (se disponíveis): por exemplo, passes por jogo, percentual de acerto de passe, passes decisivos (key passes), etc., com percentis em comparação a outros jogadores
   footystats.org
   footystats.org
   footystats.org
   . Esses campos avançados podem aparecer caso a FootyStats tenha dados de desempenho detalhado (xG, passes) para aquela competição. Por exemplo, passes_per_game_overall, key_passes_per_game_overall, e percentis como assists_per90_percentile_overall
   footystats.org
   footystats.org
   . (A documentação sinaliza esses campos com prefixo detailed / ...
   footystats.org
   ).
   Em resumo, o endpoint individual do jogador permite ver toda a carreira do jogador em termos estatísticos, temporada por temporada. Use-o para mostrar o currículo do atleta ou para analisar evolução de performance.
   🚩 Dados de Árbitros
   De forma similar aos jogadores, também temos endpoints para árbitros: 13. Lista de Árbitros da Liga (League Referees):
   Lista todos os árbitros que apitaram jogos na temporada especificada, com suas estatísticas naquela liga.
   URL: GET https://api.football-data-api.com/league-referees?key=YOURKEY&season_id=X
   footystats.org
   Parâmetros: season_id obrigatório, max_time opcional (para stats até certa data)
   footystats.org
   . Não há paginação explícita mencionada (número de árbitros geralmente é limitado, então provavelmente cabe em uma resposta).
   Retorno: Array de árbitros com campos:
   Identificação: id (do árbitro), nome completo e variações (full_name, first_name, etc.)
   footystats.org
   , known_as (nome curto)
   footystats.org
   , shorthand (similarmente, nome simplificado)
   footystats.org
   .
   Info pessoal: idade, nacionalidade, data de nascimento (birthday UNIX), continente
   footystats.org
   footystats.org
   .
   Liga: league (nome da liga), league_type (tipo da liga), temporada (season ano), competition_id (ID da temporada)
   footystats.org
   footystats.org
   .
   Estatísticas de arbitragem:
   appearances_overall: número de jogos apitados
   footystats.org
   .
   Resultado dos jogos que apitou: wins_home, wins_away, draws_overall – quantidade de partidas que terminaram com vitória do mandante, do visitante ou empate sob sua arbitragem
   footystats.org
   . Também há os percentuais correspondentes wins_per_home, etc. (porcentagem de jogos que terminaram em cada resultado)
   footystats.org
   . Esses valores dão ideia de tendência do árbitro (ex: % de vitórias de mandantes nos jogos dele).
   BTTS: btts_overall (quantos jogos apitados tiveram Ambos Marcam) e btts_percentage
   footystats.org
   .
   Gols: goals_overall (total de gols em jogos que ele apitou), separados em goals_home e goals_away
   footystats.org
   . E médias: goals_per_match_overall/home/away
   footystats.org
   .
   Pênaltis: penalties_given_overall (pênaltis marcados no total sob sua arbitragem), e home/away
   footystats.org
   , além de média por jogo e percentuais de partidas com pênalti
   footystats.org
   .
   Cartões: cards_overall (total de cartões distribuídos), cards_home e cards_away
   footystats.org
   , e cartões por jogo (cards_per_match*\*)
   footystats.org
   . Percentuais de jogos com over X cartões distribuídos (over05_cards_overall até over65_cards_overall e seus percentuais)
   footystats.org
   footystats.org
   .
   Amarelos e vermelhos: yellow_cards_overall, red_cards_overall (totais na temporada)
   footystats.org
   .
   Tempo médio entre eventos: min_per_goal_overall – quantos minutos em média sai um gol nos jogos dele
   footystats.org
   ; min_per_card_overall – minutos para sair um cartão, em média
   footystats.org
   .
   Esses dados são valiosos para ver o perfil do árbitro – se é “caseiro” (muitas vitórias de mandantes), se deixa o jogo correr (poucos cartões), etc.
9. Dados de um Árbitro (Referee - Individual):
   Retorna as estatísticas de arbitragem do indivíduo em todas as competições que apitou.
   URL: GET https://api.football-data-api.com/referee?key=YOURKEY&referee_id=RID
   footystats.org
   Parâmetro: referee_id (obrigatório): ID do árbitro.
   Retorno: semelhante ao do jogador individual – um array com entradas para cada temporada/competição que ele arbitrou. Inclui campos de identificação, liga, temporada, etc., e as estatísticas daquela temporada (jogos, gols, cartões, pênaltis, etc. como visto acima).
   A documentação nota que esta parte ainda estava em desenvolvimento, mas pela lógica deve trazer os mesmos campos descritos em League Referees. Ou seja, você pode acompanhar se um árbitro apitou outras ligas e comparar seu estilo.
   📊 Endpoints Especiais de Estatística (Rankings BTTS e Over/Under)
   A FootyStats oferece endpoints prontos que consolidam os melhores times, ligas e jogos em certas estatísticas específicas globalmente ou dentro das ligas escolhidas: 15. Ranking de Ambos Marcam – BTTS Stats:
   Retorna listas pré-montadas de destaque em “Ambos Times Marcam” (Both Teams To Score).
   URL: GET https://api.football-data-api.com/stats-data-btts?key=YOURKEY
   footystats.org
   Retorno: Um objeto com três listas:
   top_teams: os times com maiores porcentagens de jogos com BTTS
   footystats.org
   . Por exemplo, lista times que mais frequentemente tiveram placares onde ambos marcaram, provavelmente com percentual e número de jogos.
   top_fixtures: os próximos jogos (futuros) mais promissores para BTTS
   footystats.org
   . Isso pode listar partidas agendadas envolvendo times com tendência alta de BTTS.
   top_leagues: as ligas com maior incidência de BTTS
   footystats.org
   (percentual de jogos BTTS).
   Cada item geralmente inclui um title (nome do time/liga ou confronto) e possivelmente estatísticas associadas e tipo (list_type indicando se é team, league ou fixture)
   footystats.org
   . O campo data conterá os valores (por ex, "75% BTTS em 24 jogos").
   Esse endpoint é útil para rapidamente destacar em seu app, por exemplo: "Top 5 times ambas marcam da temporada" ou "Ligas com mais jogos com gols dos dois lados"
   footystats.org
   footystats.org
   . 16. Ranking de Over 2.5 – Over 2.5 Stats:
   Similar ao anterior, mas focado em jogos com mais de 2.5 gols.
   URL: GET https://api.football-data-api.com/stats-data-over25?key=YOURKEY
   footystats.org
   Retorno: Espera-se campos análogos: top_teams, top_fixtures, top_leagues só que para frequência de Over 2.5 gols. Por exemplo, os times que mais têm placares com 3 ou mais gols, as ligas mais over, e próximas partidas propensas a muitos gols. (A documentação não detalha o JSON, mas por analogia com BTTS, segue o mesmo formato.)
   Esses endpoints não requerem parâmetros, pois presumivelmente usam as ligas da sua assinatura para compor os rankings. Eles fornecem insights prontos, sem você precisar calcular manualmente essas estatísticas globalmente.
   🖼️ Logos e Imagens na API
   A API fornece algumas URLs de imagem, mas com limitações:
   Logo da Liga: Como mencionado, o campo image em league-season fornece um link para a imagem/logo do campeonato
   footystats.org
   . Você pode usar essa URL diretamente para exibir o logotipo da liga no seu app (por exemplo, logo do Brasileirão, Champions League etc.).
   Logo de Times: Atualmente, não há um campo dedicado para logo de time nos endpoints. A FootyStats pode mostrar logos em seu site, mas essas imagens não são explicitamente retornadas via API JSON. Não vemos, por exemplo, um campo team_logo nos dados de team ou league-teams. Apenas há um campo url com o caminho para a página do time no FootyStats
   footystats.org
   , mas não um link de imagem. Se exibir logos de clubes for crítico para você, existem abordagens alternativas:
   CDN FootyStats: Tentar descobrir o padrão das imagens de times no CDN da FootyStats. Muitas vezes, serviços têm URLs previsíveis (ex: cdn.footystats.org/img/teams/<team_id>.png ou similares). Contudo, isso não é documentado oficialmente e pode não funcionar para todos.
   APIs de terceiros ou próprias: Considerar usar outra fonte para logos (por exemplo, a API pública da Wikipedia/DBpedia, ou outro provedor de dados de futebol que inclua logos). Ou carregar manualmente logos em sua base e mapear por nome/time.
   Como vocês relataram "problemas toda hora que vamos puxar logos" – possivelmente porque a FootyStats não fornece diretamente, ou algumas URLs exigem autenticação – a recomendação é seguir as alternativas acima. Para ligas, use o image fornecido. Para times, prepare-se para uma solução própria\*\*, já que a API se concentra em dados estatísticos, não em assets gráficos.
   ✅ Considerações Finais
   Com essa revisão completa, temos:
   Identificação de ligas e temporadas (League List, Country List),
   Listagem de jogos por data e por liga (Today’s Matches, League Matches),
   Estatísticas agregadas de ligas e times (League Stats/Teams, League Table),
   Detalhes aprofundados de partidas (Match Details),
   Dados completos de jogadores e árbitros (League Players/Referees e individuais),
   Rankings prontos de BTTS e Over2.5.
   Essa abrangência cobre “TUDO POSSÍVEL” que a FootyStats API oferece, desde gols, escanteios, cartões, até tendências e desempenhos específicos. Abaixo, resumimos cada endpoint e seu uso típico de forma organizada:
   League List / Country List: carregar base de ligas e países suportados
   footystats.org
   footystats.org
   .
   League Stats (league-season): estatísticas globais da liga + stats de cada time
   footystats.org
   footystats.org
   .
   League Teams: lista/página de times de uma liga (use include=stats)
   footystats.org
   footystats.org
   .
   League Table: tabelas de classificação e de fases da liga
   footystats.org
   footystats.org
   .
   League Matches: calendário/resultados completos com stats dos jogos
   footystats.org
   footystats.org
   .
   Today's Matches: jogos do dia ou data específica com stats
   footystats.org
   footystats.org
   .
   Team (individual): dados de um time (e stats da temporada atual)
   footystats.org
   footystats.org
   .
   Team Last X: forma recente (5,6,10 jogos) de um time
   footystats.org
   footystats.org
   .
   Match Details: detalhes completos de uma partida (incl. escalação, H2H)
   footystats.org
   footystats.org
   .
   League Players: jogadores de uma liga com stats
   footystats.org
   footystats.org
   .
   Player (individual): histórico de stats de um jogador em todas temporadas
   footystats.org
   footystats.org
   .
   League Referees: árbitros de uma liga com stats
   footystats.org
   footystats.org
   .
   Referee (individual): histórico de stats de árbitro
   footystats.org
   .
   BTTS Stats: top ligas/times/jogos em Ambos Marcam
   footystats.org
   footystats.org
   .
   Over 2.5 Stats: top ligas/times/jogos em Over 2.5 gols
   footystats.org
   .
   Integrando esses endpoints no seu SaaS (usando seu backend Next.js como proxy, conforme mencionaram) vocês conseguirão montar painéis de estatísticas de ligas, times, partidas, jogadores e árbitros abrangentes. Sempre lembre de tratar os casos de paginação e de verificar se a liga está liberada na sua conta ao enfrentar respostas vazias. Com as informações acima e sua chave 4fd202fbc3..., você pode começar a fazer chamadas para preencher o banco de dados. Por exemplo, para começar:
   bash
   Copiar
   Editar

# Listar ligas escolhidas na assinatura (exemplo)

GET https://api.football-data-api.com/league-list?key=4fd202fbc3...&chosen_leagues_only=true

# Pegar estatísticas e equipes da temporada X (exemplo: Premier League 2019/20, season_id hipotético 1625)

GET https://api.football-data-api.com/league-season?key=4fd202fbc3...&season_id=1625

# Listar todos jogos dessa temporada

GET https://api.football-data-api.com/league-matches?key=4fd202fbc3...&season_id=1625&max_per_page=500

# etc...

Cada chamada fornecerá os dados conforme detalhado. Assim, munido desse panorama completo da API FootyStats, você poderá evitar surpresas e estruturar corretamente a extração de dados para o seu SaaS, cobrindo estatísticas de ligas, times, partidas (gols, escanteios, cartões), desempenho recente, perfis de jogadores e árbitros, e até mesmo insights prontos como rankings de BTTS e over. Boa implementação e bons jogos!
