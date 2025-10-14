# 📋 Próximas Tarefas - Modo Dark e Melhorias

**Data:** 13/10/2025
**Status:** Modo Dark Implementado ✅

---

## ✅ Concluído Nesta Sessão

### Modo Dark Completo
- [x] Transição animada de background (500ms) entre light/dark
- [x] Logo dinâmica (logo_dark.png para modo escuro)
- [x] Suporte ao tema em todos os componentes:
  - [x] SimpleHomeScreen (background, visualização, resultados)
  - [x] GeometryInput (tabela com cores dinâmicas)
  - [x] QuickExamples (templates adaptáveis)
  - [x] SettingsScreen (seções com tema)
  - [x] TabNavigator (footer dinâmico)
  - [x] TuningDisplay (tabela de afinação responsiva)
  - [x] AnalysisResults (tabelas e metadata)
- [x] Correção de visibilidade de texto em inputs
- [x] Responsividade melhorada em TuningDisplay (tablet/mobile)

---

## 🔜 Próximas Tarefas (Prioridade Alta)

### 1. **Componentes Pendentes de Tema Dark** 🎨
**Prioridade:** Alta
**Estimativa:** 2-3h

Verificar e adicionar suporte ao tema nos componentes restantes:
- [ ] ImpedanceSpectrumChart (gráfico de espectro)
- [ ] ProjectManager (gerenciador de projetos)
- [ ] AdvancedExport (exportação avançada)
- [ ] TutorialOverlay (overlay de tutorial)
- [ ] FirstRunTutorial (tutorial inicial)
- [ ] PerformanceSettings (configurações de performance)
- [ ] OfflineSettings (configurações offline)
- [ ] LanguageSelector (seletor de idioma)
- [ ] UnitSelector (seletor de unidades)

**Checklist por componente:**
- [ ] Adicionar `themeService` import
- [ ] Criar `currentTheme` state com listener
- [ ] Aplicar `colors.background`, `colors.text`, etc.
- [ ] Testar em light/dark mode

---

### 2. **Persistência de Preferência de Tema** 💾
**Prioridade:** Alta
**Estimativa:** 1h

- [ ] Salvar preferência de tema em AsyncStorage
- [ ] Restaurar tema ao abrir app
- [ ] Adicionar toggle no SettingsScreen
- [ ] Opção "Auto (Sistema)" para seguir tema do OS

**Implementação:**
```javascript
// ThemeService.js
async saveThemePreference(themeName) {
  await AsyncStorage.setItem('theme_preference', themeName);
}

async loadThemePreference() {
  const theme = await AsyncStorage.getItem('theme_preference');
  return theme || 'auto'; // light, dark, auto
}
```

---

### 3. **Modo "Auto" (Seguir Sistema)** 🌗
**Prioridade:** Média
**Estimativa:** 1-2h

- [ ] Detectar tema do sistema operacional
- [ ] Atualizar automaticamente quando sistema mudar
- [ ] Adicionar listener para mudanças do OS

**Implementação:**
```javascript
import { useColorScheme } from 'react-native';

const systemTheme = useColorScheme(); // 'light' | 'dark'
```

---

### 4. **Otimização de Performance** ⚡
**Prioridade:** Média
**Estimativa:** 2-3h

Melhorar performance da transição de tema:
- [ ] Memoizar componentes com React.memo
- [ ] Usar useMemo para interpolações de cores
- [ ] Evitar re-renders desnecessários
- [ ] Otimizar animações com useNativeDriver onde possível

**Componentes críticos:**
- SimpleHomeScreen (muitos elementos)
- AnalysisResults (tabelas grandes)
- GeometryVisualization (SVG pesado)

---

### 5. **Testes de Tema** 🧪
**Prioridade:** Média
**Estimativa:** 2h

- [ ] Testes unitários para ThemeService
- [ ] Testes de snapshot para componentes em light/dark
- [ ] Testes de transição de tema
- [ ] Testes de persistência

**Exemplo:**
```javascript
describe('ThemeService', () => {
  it('deve alternar entre light e dark', () => {
    themeService.toggleTheme();
    expect(themeService.getCurrentTheme().name).toBe('Dark');
  });
});
```

---

### 6. **Ajustes Finos de Design** 🎨
**Prioridade:** Baixa
**Estimativa:** 2-3h

Melhorias visuais no modo dark:
- [ ] Ajustar opacidades e sombras
- [ ] Melhorar contraste em elementos críticos
- [ ] Adicionar efeito de "glow" sutil em botões primários
- [ ] Suavizar transições de hover/active states
- [ ] Revisar cores de status (success, error, warning)

**Cores sugeridas para ajuste:**
```javascript
dark: {
  // Melhorar contraste
  textPrimary: '#F9FAFB', // Mais claro
  textSecondary: '#D1D5DB', // Mais claro

  // Sombras mais sutis
  shadowColor: '#000000',
  shadowOpacity: 0.4, // Aumentar

  // Glow em botões
  primaryGlow: 'rgba(16, 185, 129, 0.3)',
}
```

---

### 7. **Documentação de Tema** 📚
**Prioridade:** Baixa
**Estimativa:** 1h

- [ ] Documentar sistema de temas no README
- [ ] Criar guia para adicionar tema em novos componentes
- [ ] Documentar paleta de cores
- [ ] Adicionar screenshots light/dark

**Estrutura:**
```markdown
# Sistema de Temas

## Como Usar

### Adicionar Tema a um Componente
1. Import ThemeService
2. Criar state com listener
3. Aplicar colors.* nos estilos
4. Testar em ambos os modos

## Paleta de Cores

### Light Mode
- background: #FFFFFF
- text: #1F2937
...

### Dark Mode
- background: #111827
- text: #F9FAFB
...
```

---

## 🐛 Bugs Conhecidos

### 1. **Logo duplicada na raiz**
**Severidade:** Baixa
**Arquivo:** `logo_dark.png` na raiz do projeto

- [x] Mover para `assets/` (já feito)
- [ ] Remover arquivo duplicado da raiz
- [ ] Verificar se não há referências ao caminho antigo

**Fix:**
```bash
rm logo_dark.png
```

---

### 2. **Animação pode travar em transições rápidas**
**Severidade:** Baixa
**Componente:** SimpleHomeScreen (bgColorAnim)

Se usuário alternar tema muito rápido, animação pode não completar.

**Fix sugerido:**
```javascript
useEffect(() => {
  // Cancelar animação anterior antes de iniciar nova
  bgColorAnim.stopAnimation(() => {
    Animated.timing(bgColorAnim, {
      toValue: newTheme.name === 'Dark' ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  });
}, [currentTheme]);
```

---

## 📊 Arquivos Não Commitados (Para Revisão)

### Documentação Técnica (Adicionar ao próximo commit?)
- `IMPLEMENTACAO_COMPLETA.md` - Overview da implementação TMM
- `MELHORIAS_PRECISAO.md` - Melhorias de cálculos acústicos
- `COMO_USAR_CONVERSOR.md` - Guia do conversor de unidades
- `CONVERSOR_UNIDADES.md` - Docs técnicas do conversor

**Decisão necessária:** Commitar documentação ou mover para wiki?

### Componentes Não Utilizados (Remover?)
- `src/components/MeasurementUnitSelector.js` - Cancelado pelo usuário
- `logo_dark.png` (raiz) - Duplicado, já está em assets/

### Scripts de Teste (Manter ou remover?)
- `test-tmm-simple.js` - Validação TMM standalone
- `test-geometria-real.js` - Análise de geometria real
- `test-tmm-validation.js` - Validação adicional

**Sugestão:** Mover para pasta `scripts/` ou remover se não são mais necessários.

### Testes Unitários Pendentes
- `src/__tests__/services/AcousticEngine.TMM.test.js` - 35 testes para TMM
- Precisa configurar Jest para rodar no projeto

---

## 🎯 Metas de Longo Prazo

### 1. **Temas Customizáveis**
Permitir usuário criar temas personalizados:
- Escolher cores primárias/secundárias
- Salvar múltiplos temas
- Compartilhar temas com comunidade

### 2. **Modo de Alto Contraste**
Para acessibilidade:
- Contraste aumentado
- Bordas mais visíveis
- Fontes mais grossas

### 3. **Modo OLED True Black**
Para displays OLED:
- Background #000000 puro
- Economizar bateria
- Reduzir burn-in

---

## 📝 Notas da Sessão

### O que funcionou bem:
- Transição suave de background
- Sistema de cores centralizado no ThemeService
- Inline styles com `colors.*` funcionam perfeitamente
- Responsividade melhorou bastante

### Desafios encontrados:
- Muitos componentes com cores hardcoded
- Precisou adicionar tema em múltiplos arquivos
- Alguns estilos estáticos precisaram de override inline

### Lições aprendidas:
- Sempre usar `colors.*` desde o início do projeto
- Manter estilos estáticos mínimos
- Testar em dark mode durante desenvolvimento
- Usar `backgroundColor: colors.background` evita muitos problemas

---

**✨ Modo Dark está funcional e pronto para uso!**

*Próximos passos: Completar componentes pendentes e adicionar persistência.*
