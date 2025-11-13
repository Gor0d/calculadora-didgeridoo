# Relatório de Limpeza - Arquivos Não Utilizados

**Data:** 27/10/2025
**Projeto:** Didgeomap - Calculadora Didgeridoo

---

## 📊 Resumo Executivo

Foram identificados **arquivos não utilizados** no projeto que podem ser removidos com segurança, liberando:
- **~1.700 linhas** de código não utilizado em componentes
- **~3.980 linhas** totais incluindo backups e testes

---

## 🗑️ Arquivos para Remoção Imediata

### 1. Componentes Órfãos (Nunca Importados)

#### ❌ `src/components/SaveStatusIndicator.js`
- **Linhas:** ~150
- **Exporta:** `SaveStatusIndicator`, `SaveStatistics`
- **Status:** Nunca importado em nenhum arquivo
- **Ação:** ✅ **Remover com segurança**

```bash
rm "src/components/SaveStatusIndicator.js"
```

---

#### ❌ `src/components/TipCard.js`
- **Linhas:** ~680
- **Exporta:** `TipCard`, `FloatingTipManager`, `TipTrigger`, `DailyTipCard`
- **Status:** Nunca importado em nenhum arquivo
- **Ação:** ✅ **Remover com segurança**

```bash
rm "src/components/TipCard.js"
```

---

#### ❌ `src/components/ResponsiveLayout.js`
- **Linhas:** ~340
- **Exporta:** `ResponsiveContainer`, `ResponsiveScrollView`, `ResponsiveHeader`, etc.
- **Status:** Nunca importado (funcionalidades estão em `utils/responsive.js`)
- **Ação:** ✅ **Remover com segurança**

```bash
rm "src/components/ResponsiveLayout.js"
```

---

#### ❌ `src/components/MeasurementUnitSelector.js`
- **Linhas:** ~530
- **Exporta:** `MeasurementUnitSelector`, conversores de unidades
- **Status:** Nunca importado em nenhum arquivo
- **Ação:** ✅ **Remover com segurança**

```bash
rm "src/components/MeasurementUnitSelector.js"
```

---

### 2. Hook Órfão

#### ❌ `src/hooks/useAutoSave.js`
- **Status:** Definido mas nunca importado
- **Ação:** ✅ **Remover com segurança**

```bash
rm "src/hooks/useAutoSave.js"
```

---

## ⚠️ Arquivos para Verificação Manual

### 1. Arquivo de Backup

#### 🔍 `GeometryEditorScreen_BACKUP.js` (Raiz do projeto)
- **Linhas:** ~680
- **Tipo:** Backup com sufixo `_BACKUP`
- **Status:** Não importado
- **Ação:** ⚠️ **Verificar se é necessário manter para histórico**
- **Recomendação:** Se existir versão ativa em `SimpleHomeScreen.js`, pode remover

```bash
# Verificar antes de remover
rm "GeometryEditorScreen_BACKUP.js"
```

---

### 2. Componente Possivelmente Duplicado

#### 🔍 `src/components/GeometryVisualization.js`
- **Status:** Existe como arquivo separado, mas não é importado
- **Observação:** `SimpleHomeScreen.js` tem um componente local com mesmo nome
- **Ação:** ⚠️ **Verificar se arquivo é necessário**
- **Recomendação:** Provavelmente pode remover (implementação real está em SimpleHomeScreen)

```bash
# Verificar antes de remover
rm "src/components/GeometryVisualization.js"
```

---

## 📁 Arquivos de Teste na Raiz (16 arquivos)

Arquivos de teste dispersos na raiz do projeto:

```
test-acoustic.js
test-acoustics.js
test-full-scroll.js
test-geometria-real.js
test-harmonics.js
test-interactive-zoom.js
test-mouthpiece-refinement.js
test-proportion-fix.js
test-scroll-and-spacing.js
test-scroll-fix.js
test-tmm-simple.js
test-tmm-validation.js
test-visualization-improvements.js
```

**Ação:** ⚠️ **Mover para diretório `__tests__/` ou `archive/` ou remover**

### Opção 1: Criar arquivo de testes consolidados
```bash
mkdir -p __tests__/archive
mv test-*.js __tests__/archive/
```

### Opção 2: Remover (se não forem mais necessários)
```bash
rm test-*.js
```

---

## ✅ Componentes ATIVOS (NÃO remover)

Estes componentes ESTÃO sendo utilizados:

### Componentes em Uso:
- ✅ `AppHeader.js`
- ✅ `AppWrapper.js`
- ✅ `DynamicLogo.js`
- ✅ `ErrorBoundary.js`
- ✅ `FirstRunTutorial.js`
- ✅ `GeometryInput.js`
- ✅ `IconSystem.js`
- ✅ `ImpedanceSpectrumChart.js`
- ✅ `LanguageSelector.js`
- ✅ `OfflineSettings.js`
- ✅ `OnboardingScreen.js`
- ✅ `OptimizedComponents.js`
- ✅ `PerformanceSettings.js`
- ✅ `ProjectManager.js`
- ✅ `QuickExamples.js`
- ✅ `ThemeToggle.js`
- ✅ `TipsSettings.js`
- ✅ `TuningSelector.js`
- ✅ `TuningDisplay.js`
- ✅ `TutorialOverlay.js`
- ✅ `TutorialSettings.js`
- ✅ `UnitSelector.js`
- ✅ `Visualization3D.js`
- ✅ `AdvancedExport.js`
- ✅ `AIRecommendations.js`

### Services em Uso:
- ✅ Todos os services em `src/services/` estão ativos

### Hooks em Uso:
- ✅ `useTutorial.js` - Ativo
- ✅ `useTranslation.js` - Definido (pode ser usado dinamicamente)
- ✅ `usePerformance.js` - Definido (pode ser usado dinamicamente)
- ✅ `useDeviceInfo.js` - Definido (pode ser usado dinamicamente)

---

## 📊 Impacto da Limpeza

### Remoção Imediata (Componentes órfãos)
```
SaveStatusIndicator.js:      ~150 linhas
TipCard.js:                  ~680 linhas
ResponsiveLayout.js:         ~340 linhas
MeasurementUnitSelector.js:  ~530 linhas
useAutoSave.js:              ~50 linhas
─────────────────────────────────────────
Total:                       ~1.750 linhas
```

### Remoção Após Verificação
```
GeometryEditorScreen_BACKUP.js:  ~680 linhas
GeometryVisualization.js:        ~200 linhas
16x test-*.js:                   ~1.600 linhas
─────────────────────────────────────────
Total adicional:                 ~2.480 linhas
```

### Total Potencial
```
TOTAL GERAL: ~4.230 linhas de código não utilizado
```

---

## 🚀 Plano de Ação Recomendado

### Fase 1: Remoção Segura Imediata
```bash
# Remover componentes órfãos
rm "src/components/SaveStatusIndicator.js"
rm "src/components/TipCard.js"
rm "src/components/ResponsiveLayout.js"
rm "src/components/MeasurementUnitSelector.js"
rm "src/hooks/useAutoSave.js"

# Commit
git add -A
git commit -m "chore: remove unused components and hooks"
```

### Fase 2: Verificação e Remoção de Backups
```bash
# Verificar se backup é necessário
# Se não for, remover:
rm "GeometryEditorScreen_BACKUP.js"

# Commit
git add -A
git commit -m "chore: remove backup files"
```

### Fase 3: Organizar Arquivos de Teste
```bash
# Opção A: Arquivar
mkdir -p __tests__/archive
mv test-*.js __tests__/archive/

# Ou Opção B: Remover
# rm test-*.js

# Commit
git add -A
git commit -m "chore: organize/remove old test files"
```

### Fase 4: Verificar GeometryVisualization
```bash
# Analisar se src/components/GeometryVisualization.js é necessário
# Se não for, remover:
rm "src/components/GeometryVisualization.js"

# Commit
git add -A
git commit -m "chore: remove duplicate GeometryVisualization component"
```

---

## ✅ Checklist de Validação

Após remoção, verificar:

- [ ] `npm install` - Instalar dependências
- [ ] `npm test` - Todos os testes passam
- [ ] `npm run lint:check` - Sem erros de lint
- [ ] `npm start` - App inicia corretamente
- [ ] Testar funcionalidades principais:
  - [ ] Cálculos acústicos
  - [ ] Visualização de geometria
  - [ ] Salvar/carregar projetos
  - [ ] Exportar dados
  - [ ] Configurações

---

## 📝 Notas Importantes

### Por Que Esses Arquivos Existem?

Provavelmente são de fases anteriores do desenvolvimento:
- **SaveStatusIndicator:** Feature de indicador de salvamento automático (não implementada)
- **TipCard:** Sistema de dicas/tutoriais (substituído por outro sistema)
- **ResponsiveLayout:** Abordagem inicial de responsividade (consolidada em `utils/responsive.js`)
- **MeasurementUnitSelector:** Seletor de unidades alternativo (substituído por `UnitSelector`)
- **test-*.js:** Scripts de teste/debug durante desenvolvimento

### Manter no Git History?

Sim! Mesmo removendo, o Git mantém o histórico completo:
```bash
# Para recuperar um arquivo removido no futuro
git log --all --full-history -- "src/components/TipCard.js"
git checkout <commit-hash> -- "src/components/TipCard.js"
```

---

## 🎯 Benefícios da Limpeza

1. **Código mais limpo:** Menos confusão sobre quais componentes usar
2. **Build mais rápido:** Menos arquivos para processar
3. **Manutenção mais fácil:** Menos código para manter
4. **Bundle menor:** Potencialmente menor tamanho final
5. **Clareza:** Estrutura mais clara do projeto

---

## 📞 Dúvidas?

Se houver dúvidas sobre algum arquivo específico, consulte:
- Histórico do Git: `git log --follow <arquivo>`
- Verificar imports: `grep -r "from.*<nome-arquivo>" src/`
- Discussões da equipe

---

**Relatório gerado automaticamente**
**Última atualização:** 27/10/2025
