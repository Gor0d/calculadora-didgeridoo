# 📖 Como Usar o Conversor de Unidades

**Atualização:** 13/10/2025
**Versão:** 1.2.0

---

## 🎯 Problema Resolvido

Você fez medições em **milímetros** e quer inserir no app que usa **centímetros**.

---

## ✨ Solução Automática

### **Passo 1: Cole suas medidas em MM**

No modal do conversor, cole exatamente como você tem:

```
0 30
100 30
200 35
300 35
400 35
500 35
600 35
700 35
800 40
900 45
1000 45
1100 40
1200 40
1300 50
1400 55
1500 60
1550 65
1600 70
1695 90
```

### **Passo 2: Clique "Converter para CM"**

O sistema automaticamente:
1. ✅ Detecta que está em MM
2. ✅ Converte para CM
3. ✅ Formata corretamente
4. ✅ **Preenche a tabela automaticamente!**

### **Resultado:**

A tabela será preenchida assim:

| Posição (cm) | Diâmetro (mm) |
|--------------|---------------|
| 0.0          | 3.0           |
| 10.0         | 3.0           |
| 20.0         | 3.5           |
| 30.0         | 3.5           |
| 40.0         | 3.5           |
| 50.0         | 3.5           |
| 60.0         | 3.5           |
| 70.0         | 3.5           |
| 80.0         | 4.0           |
| 90.0         | 4.5           |
| 100.0        | 4.5           |
| 110.0        | 4.0           |
| 120.0        | 4.0           |
| 130.0        | 5.0           |
| 140.0        | 5.5           |
| 150.0        | 6.0           |
| 155.0        | 6.5           |
| 160.0        | 7.0           |
| 169.5        | 9.0           |

---

## 🔄 Conversão Rápida (Um Clique)

Se você já colou a geometria no campo principal:

1. **Clique no botão "🔄 Converter MM ↔ CM"**
2. Sistema detecta automaticamente: "Valores parecem estar em MILÍMETROS"
3. **Clique "Converter para CM"**
4. ✅ Pronto! Tabela preenchida automaticamente

---

## 📋 Formatos Aceitos

O conversor é inteligente e aceita:

### Formato 1: Separado por espaço
```
0 30
100 30
200 35
```

### Formato 2: Separado por vírgula
```
0,30
100,30
200,35
```

### Formato 3: Misturado (espaços e quebras de linha)
```
0 30  100 30  200 35
300 35
400 35
```

**Todos são convertidos corretamente!**

---

## 🎯 Seu Didgeridoo Específico

### Medições Originais (MM):
```
0 30
100 30
200 35
300 35
400 35
500 35
600 35
700 35
800 40
900 45
1000 45
1100 40
1200 40
1300 50
1400 55
1500 60
1550 65
1600 70
1695 90
```

### Após Conversão (CM) - Formato para tabela:
```
0.0 3.0
10.0 3.0
20.0 3.5
30.0 3.5
40.0 3.5
50.0 3.5
60.0 3.5
70.0 3.5
80.0 4.0
90.0 4.5
100.0 4.5
110.0 4.0
120.0 4.0
130.0 5.0
140.0 5.5
150.0 6.0
155.0 6.5
160.0 7.0
169.5 9.0
```

### Características:
- **Comprimento total:** 169.5 cm
- **Bocal:** 3.0 cm (30 mm)
- **Saída:** 9.0 cm (90 mm)
- **Fundamental esperado:** ~42 Hz (E1)
- **Estilo:** Yidaki tradicional (grave e longo)

---

## 💡 Dicas de Uso

### ✅ Faça:
- Cole diretamente do seu arquivo de medições
- Use o botão de conversão automática
- Deixe o sistema detectar a unidade
- Verifique o resultado antes de analisar

### ❌ Evite:
- Misturar MM e CM na mesma medição
- Valores negativos
- Deixar linhas vazias no meio
- Usar vírgula como decimal (use ponto: 169.5, não 169,5)

---

## 🔍 Detecção Automática

### Como funciona:

```
Se maior_posição > 300:
    ⚠️ "Valores parecem estar em MILÍMETROS"
    💡 Sugestão: Converter para CM

Senão:
    ✅ "Valores parecem estar em CENTÍMETROS"
    💡 Pode usar diretamente
```

### Threshold: 300

**Por quê?**
- Didgeridoos típicos: 100-200 cm
- Se valor > 300 → Muito grande para ser CM
- Provavelmente está em MM

---

## 📊 Exemplo Prático Passo-a-Passo

### 1. Você tem medições em MM:
```
0 30
100 30
...
1695 90
```

### 2. Clica "🔄 Converter MM ↔ CM"

### 3. Modal abre:
```
┌─────────────────────────────────────────┐
│ 🔄 Conversor de Unidades           ×    │
├─────────────────────────────────────────┤
│ Unidade dos valores originais:          │
│ ┌─────────────┐  ┌──────────────┐      │
│ │✓Milímetros  │  │ Centímetros  │      │
│ └─────────────┘  └──────────────┘      │
│                                         │
│ 🔍 Valores parecem estar em MILÍMETROS  │
│    Posição máxima: 1695                 │
│                                         │
│ [Cole aqui...]                          │
└─────────────────────────────────────────┘
```

### 4. Cola as medidas

### 5. Clica "Converter para CM"

### 6. ✅ Tabela preenchida automaticamente!

### 7. Clica "Analisar"

### 8. Resultado:
```
🎵 Fundamental: 42.35 Hz (E1)
📊 4-6 harmônicos detectados
🎯 Ótimo para drone meditativo!
```

---

## 🚀 Atalhos

### Conversão Rápida:
1. Cola geometria no campo
2. Clica "🔄 Converter MM ↔ CM"
3. Confirma
4. ✅ Pronto!

### Conversão Manual:
1. Clica "🔄 Converter MM ↔ CM"
2. Seleciona unidade origem
3. Cola medidas
4. Clica "Converter"
5. ✅ Pronto!

---

## ❓ Perguntas Frequentes

### P: Meus valores já estão em CM, preciso converter?
**R:** Não! O sistema detecta automaticamente.

### P: Posso converter de CM para MM?
**R:** Sim! Selecione "Centímetros" como unidade origem.

### P: O que acontece se eu colar valores misturados?
**R:** O sistema tenta detectar, mas recomendamos padronizar primeiro.

### P: Posso editar depois de converter?
**R:** Sim! Os valores ficam na tabela editável.

### P: O conversor salva minha preferência?
**R:** Ainda não, mas está no roadmap (próxima sprint).

---

## 🎓 Entendendo as Unidades

### Posição:
- **Centímetros (cm):** Padrão do app
- **Milímetros (mm):** Comum em paquímetros digitais
- **Conversão:** 1 cm = 10 mm

### Diâmetro:
- **Milímetros (mm):** Padrão do app
- Diâmetro interno do bore
- Medido com paquímetro

### Exemplo:
```
Medição no paquímetro: 1695 mm (posição)
Convertido para app: 169.5 cm (posição)

Medição no paquímetro: 30 mm (diâmetro)
No app: 30 mm (já está correto!)
```

---

**✨ Com o conversor, suas medições em MM ficam prontas para o app em segundos!**

*"De milímetros para centímetros, sem erro!"*
