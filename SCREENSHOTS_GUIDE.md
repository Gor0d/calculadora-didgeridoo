# 📸 Guia de Screenshots para Google Play Store

## 📋 Requisitos

### Dimensões Aceitas
- **Phone Portrait:** 1080x1920px (16:9) ou 1080x2340px (19.5:9)
- **Phone Landscape:** 1920x1080px
- **Tablet:** 1200x1920px ou 1600x2560px

### Quantidade
- **Mínimo:** 2 screenshots
- **Recomendado:** 5-8 screenshots
- **Máximo:** 8 screenshots

### Formato
- **Tipo:** PNG ou JPEG
- **Tamanho máximo:** 8 MB por imagem
- **Qualidade:** Alta resolução

---

## 🎯 Screenshots Recomendados

### 1. **Tela Principal - Entrada de Geometria** (Obrigatório)
**O que mostrar:**
- Interface de entrada de geometria com tabela
- Exemplo de didgeridoo preenchido
- Botões de ação visíveis (Analisar, Visualizar)

**Captura:**
- Tela inicial do app com um exemplo carregado
- Mostrar a tabela de posição/diâmetro preenchida

**Texto overlay (opcional):**
```
"📊 Interface Intuitiva
Digite medidas facilmente"
```

---

### 2. **Visualização Gráfica** (Obrigatório)
**O que mostrar:**
- Gráfico 2D da geometria do didgeridoo
- Controles de zoom/pan visíveis
- Indicação de escala

**Captura:**
- Após clicar em "Visualizar"
- Mostrar gráfico completo e bem formatado

**Texto overlay (opcional):**
```
"🎨 Visualização Interativa
Veja sua geometria em 2D"
```

---

### 3. **Resultados de Análise** (Obrigatório)
**O que mostrar:**
- Tabela de resultados acústicos
- Frequências calculadas
- Notas musicais
- Harmônicos

**Captura:**
- Após análise completar
- Scroll para mostrar vários harmônicos

**Texto overlay (opcional):**
```
"🔬 Análise Precisa
Frequências e harmônicos em tempo real"
```

---

### 4. **Espectro de Impedância**
**O que mostrar:**
- Gráfico de impedância vs frequência
- Picos de ressonância marcados
- Eixos bem rotulados

**Captura:**
- Na tela de análise, scroll até o gráfico
- Mostrar gráfico completo

**Texto overlay (opcional):**
```
"📈 Análise Profissional
Espectro de impedância detalhado"
```

---

### 5. **Gerenciador de Projetos**
**O que mostrar:**
- Lista de projetos salvos
- Cards de projeto com preview
- Botões de ação (carregar, deletar, compartilhar)

**Captura:**
- Menu → Projetos Salvos
- Mostrar 2-3 projetos de exemplo

**Texto overlay (opcional):**
```
"💾 Gerenciamento Fácil
Salve e organize seus projetos"
```

---

### 6. **Exemplos Prontos**
**O que mostrar:**
- Biblioteca de templates
- Diferentes tipos de didgeridoos
- Preview rápido

**Captura:**
- Menu → Exemplos
- Mostrar lista de exemplos disponíveis

**Texto overlay (opcional):**
```
"🎵 Templates Prontos
Comece rapidamente com exemplos"
```

---

### 7. **Tema Dark Mode**
**O que mostrar:**
- Interface em modo escuro
- Contraste e legibilidade
- Toggle de tema visível

**Captura:**
- Configurações → ativar tema escuro
- Mostrar tela principal em dark mode

**Texto overlay (opcional):**
```
"🌙 Tema Escuro
Conforto visual dia e noite"
```

---

### 8. **Configurações e Personalização**
**O que mostrar:**
- Tela de configurações
- Opções de idioma
- Unidades de medida
- Configurações de áudio

**Captura:**
- Menu → Configurações
- Mostrar opções disponíveis

**Texto overlay (opcional):**
```
"⚙️ Totalmente Personalizável
Ajuste para suas necessidades"
```

---

## 🛠️ Ferramentas para Criar Screenshots

### Opção 1: Emulador Android Studio
```bash
# 1. Abrir Android Studio
# 2. AVD Manager → Create Virtual Device
# 3. Escolher Pixel 6 ou similar (1080x2340px)
# 4. Iniciar emulador
# 5. Instalar app: npm run build:local:android
# 6. Capturar com ferramenta do emulador
```

### Opção 2: Dispositivo Real
```bash
# 1. Conectar dispositivo via USB
# 2. Ativar depuração USB
# 3. Executar: npx expo run:android
# 4. Usar ferramenta de screenshot do dispositivo
```

### Opção 3: Expo Go (Mais Rápido)
```bash
# 1. Instalar Expo Go no smartphone
# 2. Executar: npm start
# 3. Escanear QR code
# 4. Tirar screenshots direto no dispositivo
# 5. Redimensionar para 1080x2340px se necessário
```

---

## 🎨 Edição de Screenshots

### Ferramentas Recomendadas

#### Online (Gratuito)
- **Canva:** https://canva.com
  - Templates prontos para Play Store
  - Adicionar texto e elementos gráficos

- **Figma:** https://figma.com
  - Profissional e gratuito
  - Frames predefinidos para screenshots

#### Desktop
- **Photoshop/GIMP:** Edição avançada
- **Sketch (Mac):** Design de interfaces
- **Affinity Designer:** Alternativa ao Photoshop

### Template de Texto Overlay

**Fonte:** Roboto ou Inter (sans-serif)
**Tamanho do texto:** 64-80px para título
**Cor:** Branco com sombra ou fundo semi-transparente
**Posição:** Top 20% ou bottom 20%

**Exemplo de estilo:**
```
┌─────────────────────────────────┐
│                                 │
│  [Emoji] Título Curto           │
│  Descrição em 2-3 palavras      │
│                                 │
│                                 │
│   [Screenshot do App]           │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

---

## 📐 Redimensionamento

Se suas screenshots não estão nas dimensões corretas:

### Online
- **TinyPNG:** https://tinypng.com (compressão)
- **BeFunky:** https://befunky.com/create/resize-image/
- **Canva:** Resize automático

### Linha de Comando
```bash
# Instalar ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt install imagemagick

# Redimensionar para 1080x2340
convert input.png -resize 1080x2340 output.png

# Redimensionar múltiplos
for file in *.png; do
    convert "$file" -resize 1080x2340 "resized_$file"
done
```

---

## ✅ Checklist de Qualidade

Antes de fazer upload, verifique cada screenshot:

- [ ] Resolução correta (1080x2340px ou similar)
- [ ] Tamanho < 8 MB
- [ ] Sem informações pessoais visíveis
- [ ] Texto legível em dispositivos pequenos
- [ ] Cores consistentes com brand do app
- [ ] Sem erros de interface ou bugs visíveis
- [ ] Representa funcionalidade real do app
- [ ] Ordem lógica (primeiro contato → funcionalidades avançadas)

---

## 📤 Upload no Google Play Console

### Ordem Recomendada
1. Tela Principal (entrada de dados)
2. Visualização gráfica
3. Resultados de análise
4. Gerenciador de projetos
5. Exemplos prontos
6. Configurações
7. Dark mode
8. Feature especial

### Processo
1. Play Console → Página da Loja → Screenshots
2. Selecionar categoria (Phone, 7-inch tablet, 10-inch tablet)
3. Fazer upload na ordem desejada
4. Arrastar para reordenar se necessário
5. Salvar como rascunho

---

## 🎭 Banner Promocional (Opcional)

### Especificações
- **Dimensões:** 1024x500px
- **Formato:** PNG ou JPEG
- **Tamanho:** < 1 MB

### Conteúdo Sugerido
```
┌────────────────────────────────────────┐
│  [Logo]  Didgemap                      │
│                                        │
│  Calculadora Profissional              │
│  de Didgeridoo                         │
│                                        │
│  ✓ Análise Acústica  ✓ Visualização   │
└────────────────────────────────────────┘
```

### Cores do Brand
- **Primary:** #6366F1 (Indigo)
- **Secondary:** #10B981 (Green)
- **Accent:** #22D3EE (Cyan)
- **Background:** #FFFFFF ou #1F2937

---

## 📱 Vídeo de Demonstração (Opcional)

### Especificações
- **Duração:** 30 segundos - 2 minutos
- **Resolução:** 1920x1080px mínimo
- **Formato:** MP4, MOV, AVI
- **Tamanho:** < 100 MB

### Roteiro Sugerido
```
0:00-0:05  Logo e título do app
0:05-0:15  Digitando geometria
0:15-0:25  Analisando e mostrando resultados
0:25-0:35  Visualização gráfica
0:35-0:45  Gerenciando projetos
0:45-0:55  Funcionalidades extras
0:55-1:00  Call to action: "Baixe agora!"
```

---

## 💡 Dicas Profissionais

1. **Consistência:** Use mesmo dispositivo/emulador para todos
2. **Limpeza:** Barra de status limpa, sem notificações
3. **Dados reais:** Use exemplos realistas, não "teste123"
4. **Storytelling:** Conte uma história com a sequência
5. **Destaque:** Mostre o diferencial do app
6. **Localização:** Considere criar versões em inglês também

---

## 📞 Recursos Adicionais

- **Design Assets:** https://material.io/resources
- **Icon Library:** https://materialdesignicons.com
- **Color Palette:** https://coolors.co
- **Screenshot Mockups:** https://mockuphone.com

---

**Boa sorte com as screenshots! 📸✨**
