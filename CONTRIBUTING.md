# Guia de Contribuição - Didgemap

Obrigado por considerar contribuir com o Didgemap! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Mensagens de Commit](#mensagens-de-commit)
- [Pull Requests](#pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

---

## 📜 Código de Conduta

### Nossa Promessa

Nós, como membros, contribuidores e líderes, nos comprometemos a fazer da participação em nossa comunidade uma experiência livre de assédio para todos, independentemente de idade, tamanho corporal, deficiência visível ou invisível, etnia, características sexuais, identidade e expressão de gênero, nível de experiência, educação, status socioeconômico, nacionalidade, aparência pessoal, raça, religião ou identidade e orientação sexual.

### Nossos Padrões

Exemplos de comportamento que contribuem para criar um ambiente positivo incluem:

- Demonstrar empatia e gentileza com outras pessoas
- Ser respeitoso com opiniões, pontos de vista e experiências diferentes
- Dar e aceitar feedback construtivo de forma graciosa
- Aceitar responsabilidade e pedir desculpas aos afetados por nossos erros
- Focar no que é melhor não apenas para nós como indivíduos, mas para a comunidade como um todo

### Comportamentos Inaceitáveis

- Uso de linguagem ou imagens sexualizadas e atenção ou avanços sexuais de qualquer tipo
- Trolling, comentários insultuosos ou depreciativos e ataques pessoais ou políticos
- Assédio público ou privado
- Publicação de informações privadas de outras pessoas sem permissão explícita
- Outra conduta que poderia ser razoavelmente considerada inapropriada em um ambiente profissional

---

## 🤝 Como Posso Contribuir?

### 1. Reportando Bugs

Bugs são rastreados como [GitHub Issues](https://github.com/yourusername/didgemap/issues). Antes de criar um bug report:

- **Verifique se o bug já foi reportado** procurando nas issues existentes
- **Verifique se você está usando a versão mais recente** do app
- **Colete informações sobre o bug** e siga o template abaixo

#### Template de Bug Report

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Como Reproduzir**
Passos para reproduzir o comportamento:
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
Descrição clara do que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar o problema.

**Ambiente:**
 - Dispositivo: [ex: iPhone 12, Samsung Galaxy S21]
 - OS: [ex: iOS 15.0, Android 12]
 - Versão do App: [ex: 1.0.0]

**Informações Adicionais**
Qualquer outro contexto sobre o problema.
```

### 2. Sugerindo Melhorias

Sugestões de melhorias também são rastreadas como [GitHub Issues](https://github.com/yourusername/didgemap/issues).

#### Template de Feature Request

```markdown
**A feature está relacionada a um problema? Descreva.**
Uma descrição clara do problema. Ex: Eu fico frustrado quando [...]

**Descreva a solução que você gostaria**
Descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas que você considerou**
Descrição de soluções ou features alternativas que você considerou.

**Contexto adicional**
Adicione qualquer outro contexto ou screenshots sobre a feature request.
```

### 3. Contribuindo com Código

Contribuições de código são bem-vindas! Áreas onde você pode ajudar:

#### 🐛 Correção de Bugs
- Corrigir bugs existentes nas issues
- Melhorar tratamento de erros
- Corrigir edge cases

#### ✨ Novas Features
- Implementar features do roadmap
- Adicionar novos cálculos acústicos
- Melhorar visualizações
- Adicionar novos formatos de export

#### 📚 Documentação
- Melhorar README
- Adicionar comentários no código
- Criar tutoriais
- Traduzir documentação

#### 🧪 Testes
- Adicionar testes unitários
- Melhorar cobertura de testes
- Criar testes de integração
- Adicionar testes end-to-end

#### 🎨 UI/UX
- Melhorar design
- Adicionar animações
- Melhorar acessibilidade
- Otimizar performance

---

## 🛠 Configuração do Ambiente

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **Git**
- **Expo CLI** (opcional)

### Setup Inicial

1. **Fork o repositório**

   Clique no botão "Fork" no GitHub

2. **Clone seu fork**
   ```bash
   git clone https://github.com/seu-usuario/didgemap.git
   cd didgemap
   ```

3. **Adicione o repositório upstream**
   ```bash
   git remote add upstream https://github.com/yourusername/didgemap.git
   ```

4. **Instale as dependências**
   ```bash
   npm install
   ```

5. **Inicie o app**
   ```bash
   npm start
   ```

### Verificar Instalação

```bash
# Verificar se testes passam
npm test

# Verificar se lint está ok
npm run lint:check

# Verificar se build funciona
npm run build:web
```

---

## 🔄 Fluxo de Trabalho

### 1. Sincronizar com Upstream

Antes de começar a trabalhar, sincronize com o repositório principal:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Criar Branch

Crie uma branch para sua feature/fix:

```bash
# Para feature
git checkout -b feature/nome-da-feature

# Para bug fix
git checkout -b fix/nome-do-bug

# Para documentação
git checkout -b docs/topico-da-doc
```

**Convenções de nome:**
- `feature/` - Novas funcionalidades
- `fix/` - Correções de bugs
- `docs/` - Documentação
- `refactor/` - Refatoração de código
- `test/` - Adição ou correção de testes
- `chore/` - Tarefas de manutenção

### 3. Fazer Mudanças

- Faça suas mudanças no código
- Adicione testes para novas funcionalidades
- Certifique-se de que todos os testes passam
- Siga os padrões de código

### 4. Commit

```bash
git add .
git commit -m "tipo: descrição clara da mudança"
```

Ver [Mensagens de Commit](#mensagens-de-commit) para detalhes.

### 5. Push

```bash
git push origin nome-da-sua-branch
```

### 6. Abrir Pull Request

1. Vá para o GitHub
2. Clique em "Compare & pull request"
3. Preencha o template de PR
4. Aguarde revisão

---

## 📝 Padrões de Código

### JavaScript/React

#### Nomenclatura

```javascript
// Components: PascalCase
const GeometryEditor = () => {};

// Functions e variáveis: camelCase
const calculateFrequency = () => {};
const userInput = '';

// Constants: UPPER_SNAKE_CASE
const DEFAULT_SPEED_OF_SOUND = 343;
const MAX_HARMONICS = 8;

// Private/internal: prefixo _
const _internalHelper = () => {};
```

#### Estrutura de Componentes

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

// Imports de componentes locais
import Button from '../common/Button';

// Imports de services/utils
import { formatFrequency } from '../../utils/formatters';

/**
 * Descrição do componente
 *
 * @param {Object} props
 * @param {string} props.title - Título do componente
 * @param {Function} props.onPress - Callback ao pressionar
 */
const MyComponent = ({ title, onPress }) => {
  // Hooks no topo
  const [state, setState] = useState(null);

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handlePress = () => {
    onPress();
  };

  // Render helpers
  const renderContent = () => {
    // ...
  };

  // Main render
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
      {renderContent()}
    </View>
  );
};

// PropTypes
MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func
};

// Default props
MyComponent.defaultProps = {
  onPress: () => {}
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  }
});

export default MyComponent;
```

#### ESLint

O projeto usa ESLint com as seguintes configurações:
- `eslint-config-expo`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-prettier`

```bash
# Verificar lint
npm run lint:check

# Fix automático
npm run lint
```

#### Prettier

```bash
# Formatar código
npm run format

# Verificar formatação
npm run format:check
```

### Comentários

#### JSDoc para Funções

```javascript
/**
 * Calcula a frequência fundamental de um didgeridoo
 *
 * @param {Array<Object>} geometry - Array de pontos da geometria
 * @param {number} geometry[].x - Posição ao longo do comprimento (mm)
 * @param {number} geometry[].y - Raio interno (mm)
 * @param {Object} options - Opções de cálculo
 * @param {number} options.temperature - Temperatura em °C
 * @returns {number} Frequência em Hz
 * @throws {Error} Se geometria for inválida
 *
 * @example
 * const freq = calculateFundamental([
 *   { x: 0, y: 30 },
 *   { x: 1200, y: 80 }
 * ], { temperature: 20 });
 * // Returns: 65.2
 */
const calculateFundamental = (geometry, options = {}) => {
  // ...
};
```

#### Comentários Inline

```javascript
// BOM: Explica o "por quê"
// Usamos 0.85 porque o bocal perde ~15% de eficiência
const mouthpieceCorrection = 0.85;

// RUIM: Repete o código
// Multiplica por 0.85
const mouthpieceCorrection = 0.85;
```

### Organização de Arquivos

```
src/
├── components/
│   ├── common/           # Componentes genéricos
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── Card.js
│   ├── acoustic/         # Componentes específicos de acústica
│   └── geometry/         # Componentes de geometria
│
├── screens/              # Telas (uma por arquivo)
│   ├── HomeScreen.js
│   └── CalculatorScreen.js
│
├── services/             # Lógica de negócio
│   ├── acoustic/
│   │   ├── AcousticEngine.js
│   │   └── __tests__/
│   │       └── AcousticEngine.test.js
│   └── storage/
│
├── hooks/                # Custom hooks
│   └── useAcousticCalculation.js
│
└── utils/                # Utilitários puros
    ├── constants.js
    ├── validators.js
    └── formatters.js
```

---

## 🧪 Testes

### Escrevendo Testes

#### Teste Unitário

```javascript
// src/services/acoustic/__tests__/AcousticEngine.test.js
import AcousticEngine from '../AcousticEngine';

describe('AcousticEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new AcousticEngine();
  });

  describe('calculateFundamental', () => {
    it('deve calcular frequência para tubo cilíndrico', () => {
      const geometry = [
        { x: 0, y: 30 },
        { x: 1200, y: 30 }
      ];

      const result = engine.calculateFundamental(geometry);

      expect(result).toBeGreaterThan(60);
      expect(result).toBeLessThan(80);
    });

    it('deve lançar erro para geometria inválida', () => {
      const invalidGeometry = [];

      expect(() => {
        engine.calculateFundamental(invalidGeometry);
      }).toThrow('Geometria inválida');
    });
  });
});
```

#### Teste de Componente

```javascript
// src/components/common/__tests__/Button.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('deve renderizar com texto correto', () => {
    const { getByText } = render(<Button title="Calcular" />);
    expect(getByText('Calcular')).toBeTruthy();
  });

  it('deve chamar onPress quando pressionado', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Calcular" onPress={onPress} />
    );

    fireEvent.press(getByText('Calcular'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Executando Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Testes específicos
npm test AcousticEngine

# Com coverage
npm run test:coverage
```

### Cobertura de Testes

Objetivo: **> 80%** de cobertura

```bash
npm run test:coverage
```

Áreas críticas que devem ter 100% de cobertura:
- Services (AcousticEngine, StorageService, etc)
- Utils (validators, formatters)
- Cálculos acústicos

---

## 💬 Mensagens de Commit

Usamos o padrão [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
tipo(escopo): descrição curta

Descrição mais detalhada (opcional)

BREAKING CHANGE: descrição da mudança quebrada (se aplicável)
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação de código (sem mudança de lógica)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção
- `perf`: Melhorias de performance
- `ci`: Mudanças em CI/CD

### Exemplos

```bash
# Nova feature
git commit -m "feat(acoustic): adiciona cálculo de impedância"

# Bug fix
git commit -m "fix(storage): corrige erro ao salvar projeto"

# Documentação
git commit -m "docs(readme): atualiza seção de instalação"

# Breaking change
git commit -m "feat(api): altera formato de retorno do cálculo

BREAKING CHANGE: O formato de retorno agora inclui unidades explícitas"
```

---

## 🔍 Pull Requests

### Antes de Submeter

- [ ] Código segue os padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Todos os testes passam (`npm test`)
- [ ] Lint sem erros (`npm run lint:check`)
- [ ] Documentação atualizada
- [ ] Commits seguem o padrão
- [ ] Branch está atualizado com `main`

### Template de PR

```markdown
## Descrição
Descrição clara das mudanças.

## Tipo de Mudança
- [ ] Bug fix (non-breaking change que corrige um issue)
- [ ] Nova feature (non-breaking change que adiciona funcionalidade)
- [ ] Breaking change (fix ou feature que causa mudança na API existente)
- [ ] Documentação

## Como Testar
Passos para testar as mudanças:
1. ...
2. ...

## Checklist
- [ ] Meu código segue o style guide do projeto
- [ ] Fiz self-review do código
- [ ] Comentei áreas complexas do código
- [ ] Atualizei a documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes
- [ ] Testes novos e existentes passam localmente

## Screenshots (se aplicável)
...
```

### Processo de Review

1. **Submissão:** Você abre o PR
2. **CI/CD:** Testes automáticos executam
3. **Review:** Mantenedores revisam o código
4. **Mudanças:** Você faz ajustes se necessário
5. **Aprovação:** PR é aprovado
6. **Merge:** Código é mesclado ao main

### Feedback

- Seja receptivo a feedback construtivo
- Responda a comentários prontamente
- Faça mudanças solicitadas
- Comunique se discordar de alguma sugestão

---

## 🐛 Reportando Bugs

### Issues Existentes

Antes de criar uma nova issue, procure por issues similares:
1. Use a busca do GitHub
2. Verifique issues fechadas também
3. Verifique discussions

### Informações Necessárias

- **Descrição clara** do problema
- **Passos para reproduzir**
- **Comportamento esperado vs atual**
- **Screenshots ou vídeos** (se aplicável)
- **Ambiente:**
  - Dispositivo
  - OS e versão
  - Versão do app
- **Logs de erro** (se disponível)

### Severidade

- **Critical:** App crasha, perda de dados
- **High:** Feature principal não funciona
- **Medium:** Feature secundária com problema
- **Low:** Problema cosmético

---

## 💡 Sugerindo Melhorias

### Diretrizes

- **Seja específico:** Descreva claramente a melhoria
- **Explique o benefício:** Por que seria útil?
- **Considere alternativas:** Outras formas de resolver?
- **Pense na viabilidade:** É possível implementar?

### Áreas de Melhoria

- Novos cálculos acústicos
- Melhorias na UI/UX
- Novas features de export
- Integrações com outras ferramentas
- Performance
- Acessibilidade

---

## 📞 Dúvidas?

- **Documentação:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/didgemap/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/didgemap/discussions)
- **Email:** contato@didgemap.app

---

## 🎉 Obrigado!

Sua contribuição ajuda a tornar o Didgemap melhor para todos!

---

**Última atualização:** 27/10/2025
