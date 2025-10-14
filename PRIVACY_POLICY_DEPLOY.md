# 🔐 Deploy da Política de Privacidade

## ✅ Arquivos Criados

- `privacy-policy.html` - Arquivo raiz
- `public/privacy.html` - Arquivo na pasta public

## 🚀 Opções de Hospedagem (TODAS GRATUITAS)

---

## OPÇÃO 1: GitHub Pages (MAIS FÁCIL) ⭐

### Passo 1: Fazer commit e push
```bash
cd calculadora-didgeridoo
git add .
git commit -m "Add privacy policy"
git push origin master
```

### Passo 2: Ativar GitHub Pages
1. Acesse: https://github.com/Gor0d/calculadora-didgeridoo/settings/pages
2. Em "Source", selecione: `master` branch
3. Em "Folder", selecione: `/ (root)`
4. Clique em "Save"

### Passo 3: Aguardar deploy (1-2 minutos)
**URL da sua política:**
```
https://gor0d.github.io/calculadora-didgeridoo/privacy-policy.html
```

---

## OPÇÃO 2: Vercel (RECOMENDADO PARA WEB APP) ⚡

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Deploy
```bash
cd calculadora-didgeridoo
vercel --prod
```

### Passo 3: Configurar domínio
A Vercel vai gerar um URL automático tipo:
```
https://calculadora-didgeridoo.vercel.app
```

**URL da política seria:**
```
https://calculadora-didgeridoo.vercel.app/privacy-policy.html
```

---

## OPÇÃO 3: Netlify (ALTERNATIVA) 🌐

### Método A: Arrastar e soltar
1. Acesse: https://app.netlify.com/drop
2. Arraste a pasta `calculadora-didgeridoo`
3. Netlify vai gerar um URL automático

### Método B: CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd calculadora-didgeridoo
netlify deploy --prod
```

**URL da política:**
```
https://seu-site.netlify.app/privacy-policy.html
```

---

## OPÇÃO 4: Usar o Deploy Existente

Se você já tem o app web deployado, a política está em:
- `/privacy-policy.html` (raiz)
- `/public/privacy.html` (alternativa)

Basta usar a URL do seu deploy existente!

---

## 📱 URL PARA PLAY STORE

Depois de escolher uma opção, use uma dessas URLs no Google Play Console:

### Se usar GitHub Pages:
```
https://gor0d.github.io/calculadora-didgeridoo/privacy-policy.html
```

### Se usar Vercel:
```
https://calculadora-didgeridoo.vercel.app/privacy-policy.html
```

### Se usar Netlify:
```
https://seu-dominio.netlify.app/privacy-policy.html
```

---

## ⚡ RECOMENDAÇÃO RÁPIDA

**Para publicar AGORA na Play Store:**

1. **Faça commit e push**:
```bash
cd calculadora-didgeridoo
git add .
git commit -m "Add privacy policy for Play Store"
git push origin master
```

2. **Ative GitHub Pages** (2 minutos):
   - https://github.com/Gor0d/calculadora-didgeridoo/settings/pages
   - Source: `master` branch
   - Folder: `/ (root)`
   - Save

3. **Use esta URL na Play Store**:
```
https://gor0d.github.io/calculadora-didgeridoo/privacy-policy.html
```

4. **Pronto!** 🎉

---

## 🔍 Testar Antes de Enviar

Depois do deploy, abra a URL no navegador e verifique:
- ✅ Página carrega corretamente
- ✅ Formatação está bonita
- ✅ Todas as seções estão visíveis
- ✅ Links funcionam
- ✅ Responsivo (funciona no celular)

---

## 💡 DICA PRO

Se você já tem o app rodando em algum domínio, apenas faça o push e a política estará automaticamente disponível em:

```
https://seu-dominio-existente.com/privacy-policy.html
```

---

## 📋 Checklist

- [ ] Arquivo `privacy-policy.html` criado
- [ ] Commit feito
- [ ] Push para GitHub
- [ ] GitHub Pages ativado OU Vercel deploy feito
- [ ] URL testada e funcionando
- [ ] URL adicionada no Google Play Console

**Tempo estimado: 5 minutos** ⚡
