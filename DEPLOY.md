# 🚀 Guia de Deploy - Calculadora Didgeridoo

## Para Testar com o Cliente

### 1. Preparar o Build
```bash
npm run build:web
```

### 2. Iniciar o Servidor Local
```bash
npm run serve
```

### 3. Compartilhar com o Cliente

**O servidor estará rodando em:**
- **Localhost:** http://localhost:3000
- **IP da Rede Local:** http://192.168.15.15:3000

**Para o cliente acessar:**
1. Certifique-se de que o cliente está na mesma rede Wi-Fi
2. Envie para o cliente: **http://192.168.15.15:3000**
3. O cliente pode acessar no celular ou computador

### 4. Importante ⚠️

**SIM, você precisa manter o PC ligado** enquanto o cliente estiver testando, pois:
- O servidor está rodando localmente no seu PC
- Quando você desligar o PC ou fechar o terminal, o cliente perderá acesso
- Para parar o servidor: pressione `Ctrl+C` no terminal

### 5. Funcionalidades Testadas ✅

- ✅ Navegação entre telas com botão voltar
- ✅ Botões "Gerenciar" agora abrem páginas novas
- ✅ Tela escura/transparente corrigida
- ✅ Barra de navegação inferior não está mais cortada
- ✅ Stack navigation implementada
- ✅ Self-hosting configurado

### 6. Como Testar a Navegação

1. **Tela Principal:** Acesse a calculadora
2. **Botões Gerenciar:** Clique nos botões abaixo de "Gerenciar"
   - Configurações de Dicas
   - Recomendações IA  
   - Visualização 3D
3. **Navegação:** Use o botão voltar (←) no topo ou os tabs na parte inferior
4. **Teste Mobile:** Funciona perfeitamente em smartphones

### 7. Scripts Disponíveis

```bash
# Build para web
npm run build:web

# Iniciar servidor local
npm run serve

# Build + Deploy (tudo em um comando)
npm run deploy
```

---

## 📱 **Para o Cliente**

Acesse: **http://192.168.15.15:3000**

- Funciona em qualquer navegador (Chrome, Safari, Firefox)
- Responsivo para celular e tablet
- Interface igual ao app nativo