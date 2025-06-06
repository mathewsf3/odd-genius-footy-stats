# 🎯 INSTRUÇÕES PARA VSCODE CLAUDE 4 AGENT

## 🚨 PROBLEMA ATUAL
**Dashboard não está mostrando partidas ao vivo nem upcoming**

## 🧵 THREAD ATIVA
```
thread_1749213686295_7894096c
```

## 📋 SUA MISSÃO (VSCode Agent)

### **STEP 1: Conectar na colaboração**
Execute no terminal:
```bash
npm run collab:vscode thread_1749213686295_7894096c
```

### **STEP 2: Verificar componentes React**

#### **2.1 Verificar se LiveMatches existe:**
```bash
# Verificar se arquivo existe
ls -la src/components/LiveMatches.tsx
```

#### **2.2 Verificar se UpcomingMatches existe:**
```bash
# Verificar se arquivo existe  
ls -la src/components/UpcomingMatches.tsx
```

#### **2.3 Verificar página principal:**
```bash
# Ver se componentes estão importados
cat src/app/page.tsx | grep -i "LiveMatches\|UpcomingMatches"
```

### **STEP 3: Testar endpoints manualmente**

#### **3.1 Testar endpoint live:**
```bash
curl http://localhost:3000/api/matches/live
```

#### **3.2 Testar endpoint upcoming:**
```bash
curl http://localhost:3000/api/matches/upcoming
```

### **STEP 4: Verificar console do browser**

1. Abrir http://localhost:3000 no browser
2. Abrir DevTools (F12)
3. Ir na aba Console
4. Procurar por erros vermelhos
5. Verificar aba Network para ver se APIs estão sendo chamadas

### **STEP 5: Reportar achados**

Use este template para reportar:

```javascript
const ClaudeAgentSync = require('./.agent-context/claude-sync');
const vscodeAgent = ClaudeAgentSync.createVSCodeAgent();

// Conectar na thread
const thread = await vscodeAgent.startCollaboration(
  'URGENTE: Resolver problema - Dashboard não mostra partidas',
  'thread_1749213686295_7894096c'
);

// Reportar achados
await vscodeAgent.respondToWorkRequest(`
RELATÓRIO DE INVESTIGAÇÃO FRONTEND:

✅ COMPONENTES VERIFICADOS:
- LiveMatches.tsx: [EXISTE/NÃO EXISTE]
- UpcomingMatches.tsx: [EXISTE/NÃO EXISTE]
- Importados em page.tsx: [SIM/NÃO]

✅ ENDPOINTS TESTADOS:
- /api/matches/live: [STATUS_CODE] [RESPOSTA]
- /api/matches/upcoming: [STATUS_CODE] [RESPOSTA]

✅ CONSOLE DO BROWSER:
- Erros encontrados: [LISTAR ERROS]
- Chamadas de API: [SUCESSO/FALHA]

🎯 PROBLEMA IDENTIFICADO:
[DESCREVER O PROBLEMA ENCONTRADO]
`);
```

## 🔧 **POSSÍVEIS PROBLEMAS A VERIFICAR:**

### **1. Componentes não existem**
```bash
# Se não existirem, criar:
touch src/components/LiveMatches.tsx
touch src/components/UpcomingMatches.tsx
```

### **2. Componentes não importados**
Verificar se `src/app/page.tsx` tem:
```tsx
import LiveMatches from '@/components/LiveMatches';
import UpcomingMatches from '@/components/UpcomingMatches';
```

### **3. Endpoints retornando erro**
- Status 404: Endpoint não existe
- Status 500: Erro interno
- Status 0: Problema de CORS

### **4. Servidor não rodando**
```bash
# Verificar se servidor está rodando
npm run dev
```

## 📊 **MONITORAMENTO**

Execute em terminal separado para acompanhar:
```bash
npm run collab:monitor
```

## 🎯 **OBJETIVO FINAL**

Identificar exatamente **onde** está o problema:
- [ ] Componentes React não existem?
- [ ] Componentes não estão importados?
- [ ] Endpoints não funcionam?
- [ ] Servidor não está rodando?
- [ ] Erro de JavaScript no browser?

## 📞 **COMUNICAÇÃO**

Após cada verificação, use:
```javascript
await vscodeAgent.shareProgress(
  "Verificação X concluída - [RESULTADO]",
  [{ path: "arquivo-verificado", action: "verified" }]
);
```

---

**🚀 EXECUTE ESTES PASSOS E REPORTE OS RESULTADOS!**
