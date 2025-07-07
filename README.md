# 🎺 Calculadora de Didgeridoo

Uma aplicação web para análise de geometria e cálculo de frequências de ressonância de instrumentos de tubo como didgeridoos.

## 🌟 Funcionalidades

- ✅ **Análise de Geometria**: Insira pontos de posição e diâmetro
- ✅ **Visualização 3D**: Veja o perfil do seu instrumento
- ✅ **Cálculo de Frequências**: Harmônicos e notas musicais
- ✅ **Formas Pré-definidas**: Didgeridoo, tubo reto, com campana, cônico
- ✅ **Exportação**: Salve e carregue configurações (JSON/CSV)
- ✅ **Responsivo**: Funciona em desktop e mobile
- ✅ **Offline**: Funciona sem internet após o primeiro carregamento

## 🚀 Deploy Rápido

### Opção 1: Netlify (Recomendado)

1. **Fork/Clone este repositório**
2. **Conecte ao Netlify**:
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Selecione seu repositório
   - Deploy automático! 🎉

3. **URL personalizada**:
   - Vá em Site settings > Domain management
   - Adicione seu domínio personalizado

### Opção 2: Vercel

1. **Fork/Clone este repositório**
2. **Deploy no Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório
   - Deploy automático! 🎉

### Opção 3: GitHub Pages

1. **Fork este repositório**
2. **Ativar GitHub Pages**:
   - Vá em Settings > Pages
   - Source: Deploy from a branch
   - Branch: main / root
   - Salvar

## 📁 Estrutura do Projeto

```
calculadora-didgeridoo/
├── index.html          # Arquivo principal da aplicação
├── netlify.toml        # Configuração para Netlify
├── vercel.json         # Configuração para Vercel
├── README.md           # Este arquivo
└── _headers            # Headers de segurança (opcional)
```

## 🛠️ Desenvolvimento Local

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/calculadora-didgeridoo.git
   cd calculadora-didgeridoo
   ```

2. **Servir localmente**:
   ```bash
   # Opção 1: Python
   python -m http.server 8000
   
   # Opção 2: Node.js
   npx serve .
   
   # Opção 3: PHP
   php -S localhost:8000
   ```

3. **Abrir no navegador**:
   ```
   http://localhost:8000
   ```

## 📱 Funcionalidades Principais

### 🎯 Como Usar

1. **Inserir Geometria**:
   ```
   0 28      # posição 0mm, diâmetro 28mm
   100 26    # posição 100mm, diâmetro 26mm
   200 30    # posição 200mm, diâmetro 30mm
   1400 38   # posição 1400mm, diâmetro 38mm
   ```

2. **Escolher Forma Pré-definida**:
   - Didgeridoo Tradicional
   - Tubo Reto
   - Com Campana
   - Cônico

3. **Configurar Parâmetros**:
   - Diâmetro do bocal (mm)
   - Velocidade do som (m/s)

4. **Analisar**:
   - Clique em "Analisar"
   - Veja a visualização
   - Confira as frequências calculadas

### 🎵 Interpretação dos Resultados

- **Frequência**: Em Hz (Hertz)
- **Nota Musical**: Nome da nota mais próxima
- **Oitava**: Registro da nota (0-7)
- **Desvio**: Diferença em centavos (¢)
  - 🟢 Verde: Bem afinado (< 10¢)
  - 🟡 Laranja: Afinação aceitável (10-50¢)
  - 🔴 Vermelho: Desafinado (> 50¢)
- **Harmônico**: Qual harmônico da série

### ⌨️ Atalhos de Teclado

- `Ctrl/Cmd + Enter`: Analisar
- `Ctrl/Cmd + S`: Salvar arquivo
- `Ctrl/Cmd + O`: Carregar arquivo

## 🔧 Personalização

### Modificar Formas Pré-definidas

Edite o objeto `PREDEFINED_SHAPES` no JavaScript:

```javascript
const PREDEFINED_SHAPES = {
  minha_forma: `0 25
200 30
800 35
1200 40`,
  // ...
};
```

### Alterar Parâmetros de Cálculo

Modifique o objeto `CONFIG`:

```javascript
const CONFIG = {
  MAX_HARMONICS: 10,    // Mais harmônicos
  MIN_FREQUENCY: 30,    // Frequência mínima
  MAX_FREQUENCY: 2000,  // Frequência máxima
  // ...
};
```

### Adicionar Novas Funcionalidades

O código está bem estruturado e comentado para facilitar modificações:

- `parseGeometry()`: Parser da geometria
- `calculateFrequencies()`: Cálculo das frequências
- `drawShape()`: Visualização no canvas
- `displayResults()`: Exibição dos resultados

## 🐛 Solução de Problemas

### Erro: "É necessário pelo menos 2 pontos"
- Verifique se você tem pelo menos 2 linhas de geometria
- Confirme o formato: `posição diâmetro`

### Visualização não aparece
- Verifique se o navegador suporta Canvas
- Tente atualizar a página
- Veja o console do navegador (F12)

### Resultados estranhos
- Verifique se as unidades estão corretas (mm)
- Confirme se a velocidade do som está apropriada
- Geometria deve estar em ordem crescente de posição

## 📄 Licença

Este projeto é open source. Sinta-se livre para usar, modificar e distribuir.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

- 🐛 **Bugs**: Abra uma issue no GitHub
- 💡 **Sugestões**: Use as discussions do GitHub
- 📧 **Contato**: [seu-email@exemplo.com]

## 🔗 Links Úteis

- [Netlify Deploy](https://netlify.com)
- [Vercel Deploy](https://vercel.com)
- [GitHub Pages](https://pages.github.com)
- [Teoria de Tubos Sonoros](https://pt.wikipedia.org/wiki/Tubo_sonoro)

---

**Feito com ❤️ para a comunidade musical** 🎵