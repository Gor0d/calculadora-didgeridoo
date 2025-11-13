# Guia Completo: Configuração de Faturamento Google Play Console

## App: Didgeomap - Calculadora Didgeridoo
**Package Name:** `com.didgemap.app`

---

## Índice
1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração da Conta de Desenvolvedor](#2-configuração-da-conta-de-desenvolvedor)
3. [Perfil de Faturamento (Merchant Account)](#3-perfil-de-faturamento-merchant-account)
4. [Configuração de Conta Bancária](#4-configuração-de-conta-bancária)
5. [Impostos e Informações Fiscais](#5-impostos-e-informações-fiscais)
6. [Implementação Técnica no App](#6-implementação-técnica-no-app)
7. [Configuração de Produtos In-App](#7-configuração-de-produtos-in-app)
8. [Testes e Validação](#8-testes-e-validação)
9. [Publicação e Aprovação](#9-publicação-e-aprovação)
10. [Monitoramento e Relatórios](#10-monitoramento-e-relatórios)

---

## 1. Pré-requisitos

### 1.1 Documentação Necessária
- [ ] CPF ou CNPJ do desenvolvedor/empresa
- [ ] RG ou documento com foto
- [ ] Comprovante de endereço atualizado
- [ ] Dados bancários completos (banco, agência, conta)
- [ ] E-mail de contato válido
- [ ] Telefone de contato

### 1.2 Requisitos da Conta Google Play
- [ ] Conta Google Play Console ativa
- [ ] Taxa de registro paga ($25 USD - pagamento único)
- [ ] App publicado ou em fase de teste
- [ ] Política de privacidade publicada (já configurado em: https://didgemap.app/privacy-policy.html)

### 1.3 Status Atual do Projeto
```json
{
  "app_name": "Didgemap - Calculadora Didgeridoo",
  "package_name": "com.didgemap.app",
  "version": "1.0.0",
  "version_code": 1,
  "build_number": 1,
  "platforms": ["Android", "iOS", "Web"],
  "billing_implemented": false,
  "privacy_policy": "https://didgemap.app/privacy-policy.html"
}
```

---

## 2. Configuração da Conta de Desenvolvedor

### 2.1 Acessar Google Play Console
1. Acesse: https://play.google.com/console
2. Faça login com sua conta Google
3. Verifique se sua conta está ativa e verificada

### 2.2 Verificar Dados da Conta
1. No menu lateral, clique em **"Configurações"** > **"Conta do desenvolvedor"**
2. Verifique/Complete os seguintes dados:
   - Nome do desenvolvedor (aparecerá público na Play Store)
   - E-mail de contato público
   - Telefone de contato
   - Endereço completo
   - Website (opcional): https://didgemap.app

### 2.3 Tipo de Conta
Escolha o tipo de conta adequado:

#### Opção A: Conta Individual (Pessoa Física)
- **Vantagens:**
  - Configuração mais simples
  - Menos burocracia
  - Ideal para desenvolvedores solo
- **Desvantagens:**
  - Impostos sobre pessoa física
  - Responsabilidade pessoal
  - Limite de faturamento

**Documentos necessários:**
- CPF
- RG
- Comprovante de endereço
- Dados bancários pessoais

#### Opção B: Conta Empresarial (Pessoa Jurídica)
- **Vantagens:**
  - Impostos potencialmente menores
  - Imagem profissional
  - Separação patrimonial
- **Desvantagens:**
  - Mais burocracia
  - Requer CNPJ ativo
  - Documentação adicional

**Documentos necessários:**
- CNPJ
- Contrato social
- Documentos do representante legal
- Comprovante de endereço da empresa
- Dados bancários empresariais

---

## 3. Perfil de Faturamento (Merchant Account)

### 3.1 Criar Perfil de Pagamento do Google
1. Acesse: https://pay.google.com/payments/home
2. Clique em **"Configurações"** > **"Perfis de pagamento"**
3. Selecione **"Perfil comercial"** (Business profile)

### 3.2 Informações do Perfil Comercial

#### Passo 1: Informações Básicas
```
Nome da empresa/desenvolvedor: [Seu nome ou nome da empresa]
País: Brasil
Moeda: BRL (Real Brasileiro)
Fuso horário: America/Sao_Paulo (GMT-3)
```

#### Passo 2: Endereço Comercial
```
Endereço linha 1: [Rua/Avenida, número]
Endereço linha 2: [Complemento, apartamento]
Cidade: [Cidade]
Estado: [UF]
CEP: [00000-000]
País: Brasil
```

#### Passo 3: Informações de Contato
```
E-mail principal: [email@exemplo.com]
E-mail de backup: [backup@exemplo.com]
Telefone: +55 (XX) XXXXX-XXXX
Website: https://didgemap.app
```

### 3.3 Vincular ao Google Play Console
1. Volte ao **Google Play Console**
2. Vá em **"Configurações"** > **"Perfil do pagamento"**
3. Clique em **"Criar perfil do comerciante"** ou **"Vincular perfil existente"**
4. Selecione o perfil criado no Google Pay
5. Aceite os **Termos de Serviço do Google Play** para vendas de apps

---

## 4. Configuração de Conta Bancária

### 4.1 Adicionar Conta Bancária (Brasil)

1. No **Google Pay (Perfil Comercial)**, vá em **"Pagamentos"** > **"Configurações de pagamento"**
2. Clique em **"Adicionar forma de pagamento"** > **"Conta bancária"**

#### Informações Necessárias:
```
Tipo de conta: Conta Corrente ou Poupança
País do banco: Brasil
Moeda: BRL

Dados bancários:
- Nome do banco: [Ex: Banco do Brasil, Itaú, Bradesco, etc]
- Código do banco: [Ex: 001, 341, 237, etc]
- Agência: [0000] (sem dígito)
- Dígito da agência: [0] (se houver)
- Número da conta: [00000]
- Dígito da conta: [0]
- Tipo: Corrente / Poupança

Titular da conta:
- Nome completo: [Igual ao documento]
- CPF/CNPJ: [000.000.000-00 ou 00.000.000/0001-00]
```

### 4.2 Verificação da Conta Bancária
- O Google fará um **depósito de verificação** (valor pequeno, geralmente R$ 0,01 a R$ 1,00)
- Você precisará confirmar o valor exato no Google Pay
- Prazo: 2-5 dias úteis para o depósito aparecer

### 4.3 Forma de Pagamento Secundária (Backup)
Recomendado adicionar uma segunda conta para backup:
- PayPal (se disponível no Brasil)
- Segunda conta bancária
- Conta internacional (se aplicável)

---

## 5. Impostos e Informações Fiscais

### 5.1 Informações Fiscais do Brasil

1. No **Google Play Console**, vá em **"Configurações"** > **"Impostos e conformidade"**
2. Selecione **"Brasil"** como país

#### Para Pessoa Física (CPF):
```
Tipo de contribuinte: Pessoa Física
CPF: 000.000.000-00
Nome completo: [Como no CPF]
Endereço fiscal: [Mesmo do cadastro]
```

#### Para Pessoa Jurídica (CNPJ):
```
Tipo de contribuinte: Pessoa Jurídica
CNPJ: 00.000.000/0001-00
Razão Social: [Nome da empresa]
Inscrição Estadual: [Se aplicável]
Endereço fiscal: [Endereço da empresa]
```

### 5.2 Retenção de Impostos nos EUA (W-8BEN)

Como o Google é empresa americana, você precisa preencher o formulário **W-8BEN** (pessoa física) ou **W-8BEN-E** (pessoa jurídica):

**O que é:** Formulário que comprova que você NÃO é residente fiscal dos EUA, evitando retenção de 30% de imposto americano.

**Como preencher:**
1. No Google Play Console, vá em **"Configurações"** > **"Informações fiscais"**
2. Clique em **"Gerenciar informações fiscais"**
3. Selecione **"Brasil"** como país de residência fiscal
4. Preencha o formulário W-8BEN:

```
Part I - Identification:
1. Nome: [Seu nome ou nome da empresa]
2. País de cidadania: Brazil
3. Endereço permanente: [Seu endereço no Brasil]
4. Endereço para correspondência: [Mesmo endereço]

Part II - Claim of Tax Treaty Benefits (se aplicável):
- Brazil tem tratado tributário com EUA
- Marcar: "Resident of Brazil within the meaning of the income tax treaty"
- Artigo do tratado: Consultar tratado Brasil-EUA

Part III - Certification:
- Assinar e datar digitalmente
```

### 5.3 Impostos no Brasil

#### Vendas para Clientes Brasileiros:
- **PIS/COFINS:** Incide sobre receitas
- **IRPF/IRPJ:** Imposto de renda
- **ISS:** Para serviços (alíquota varia por município)

**Importante:** Consulte um contador para:
- Apuração correta de impostos
- Emissão de notas fiscais (se CNPJ)
- Declaração no Imposto de Renda

#### Vendas Internacionais:
- Geralmente isentas de alguns impostos
- Sujeitas a tratados internacionais
- Consulte contador especializado em comércio exterior

---

## 6. Implementação Técnica no App

### 6.1 Status Atual
O app **NÃO possui** implementação de billing. Será necessário adicionar.

### 6.2 Instalar Biblioteca de Billing

#### Opção Recomendada: react-native-iap
```bash
npm install react-native-iap --save
# ou
yarn add react-native-iap
```

**Vantagens:**
- Suporte a Android e iOS
- API unificada
- Bem mantida e documentada
- Grande comunidade

#### Configuração no projeto:
```bash
# Após instalar, fazer prebuild para gerar arquivos nativos
npx expo prebuild --clean
```

### 6.3 Estrutura de Arquivos Sugerida

Criar os seguintes arquivos:

```
src/services/billing/
├── BillingManager.js           # Manager principal
├── GooglePlayBilling.js        # Implementação Android
├── AppStoreBilling.js          # Implementação iOS (futuro)
├── types.js                    # TypeScript types/PropTypes
└── __tests__/
    └── BillingManager.test.js  # Testes unitários
```

### 6.4 Código Base - BillingManager.js

```javascript
// src/services/billing/BillingManager.js
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { LoggingService } from '../logging/LoggingService';

class BillingManager {
  constructor() {
    this.isInitialized = false;
    this.products = [];
    this.subscriptions = [];
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
  }

  /**
   * Inicializa a conexão com o serviço de billing
   */
  async initialize() {
    try {
      await RNIap.initConnection();
      this.isInitialized = true;
      LoggingService.info('BillingManager initialized successfully');

      // Setup listeners
      this.setupPurchaseListeners();

      return true;
    } catch (error) {
      LoggingService.error('Failed to initialize BillingManager', error);
      return false;
    }
  }

  /**
   * Setup listeners para updates de compras
   */
  setupPurchaseListeners() {
    // Listener para compras bem-sucedidas
    this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            // Validar compra no seu backend (recomendado)
            await this.validatePurchase(purchase);

            // Finalizar transação
            await RNIap.finishTransaction(purchase, false);

            LoggingService.info('Purchase completed', { productId: purchase.productId });

            // Notificar o app sobre a compra
            this.onPurchaseSuccess?.(purchase);
          } catch (error) {
            LoggingService.error('Purchase validation failed', error);
            this.onPurchaseError?.(error);
          }
        }
      }
    );

    // Listener para erros
    this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
      (error) => {
        LoggingService.error('Purchase error', error);
        this.onPurchaseError?.(error);
      }
    );
  }

  /**
   * Busca produtos disponíveis para compra
   * @param {string[]} productIds - Array de IDs dos produtos
   */
  async getProducts(productIds) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const products = await RNIap.getProducts({ skus: productIds });
      this.products = products;

      LoggingService.info('Products loaded', { count: products.length });
      return products;
    } catch (error) {
      LoggingService.error('Failed to load products', error);
      return [];
    }
  }

  /**
   * Busca assinaturas disponíveis
   * @param {string[]} subscriptionIds - Array de IDs das assinaturas
   */
  async getSubscriptions(subscriptionIds) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const subscriptions = await RNIap.getSubscriptions({ skus: subscriptionIds });
      this.subscriptions = subscriptions;

      LoggingService.info('Subscriptions loaded', { count: subscriptions.length });
      return subscriptions;
    } catch (error) {
      LoggingService.error('Failed to load subscriptions', error);
      return [];
    }
  }

  /**
   * Inicia processo de compra de um produto
   * @param {string} productId - ID do produto
   */
  async purchaseProduct(productId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      LoggingService.info('Starting purchase', { productId });

      const purchase = await RNIap.requestPurchase({ sku: productId });
      return purchase;
    } catch (error) {
      if (error.code === 'E_USER_CANCELLED') {
        LoggingService.info('Purchase cancelled by user');
      } else {
        LoggingService.error('Purchase failed', error);
      }
      throw error;
    }
  }

  /**
   * Inicia processo de assinatura
   * @param {string} subscriptionId - ID da assinatura
   */
  async purchaseSubscription(subscriptionId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      LoggingService.info('Starting subscription', { subscriptionId });

      const purchase = await RNIap.requestSubscription({ sku: subscriptionId });
      return purchase;
    } catch (error) {
      if (error.code === 'E_USER_CANCELLED') {
        LoggingService.info('Subscription cancelled by user');
      } else {
        LoggingService.error('Subscription failed', error);
      }
      throw error;
    }
  }

  /**
   * Valida uma compra no backend (IMPLEMENTAR)
   * @param {object} purchase - Objeto de compra
   */
  async validatePurchase(purchase) {
    // TODO: Implementar validação no backend
    // Enviar receipt para seu servidor validar com Google Play
    // Retornar true se válido, false se inválido

    LoggingService.warn('Purchase validation not implemented yet');
    return true;
  }

  /**
   * Restaura compras anteriores
   */
  async restorePurchases() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const purchases = await RNIap.getAvailablePurchases();
      LoggingService.info('Purchases restored', { count: purchases.length });

      return purchases;
    } catch (error) {
      LoggingService.error('Failed to restore purchases', error);
      return [];
    }
  }

  /**
   * Limpa recursos ao desmontar
   */
  async destroy() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }

    try {
      await RNIap.endConnection();
      this.isInitialized = false;
      LoggingService.info('BillingManager destroyed');
    } catch (error) {
      LoggingService.error('Failed to destroy BillingManager', error);
    }
  }

  /**
   * Callbacks para eventos de compra (definir no componente)
   */
  onPurchaseSuccess = null;
  onPurchaseError = null;
}

export default new BillingManager();
```

### 6.5 Configuração no app.json

Adicionar permissões necessárias:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "INTERNET",
        "com.android.vending.BILLING"
      ]
    }
  }
}
```

### 6.6 Atualizar eas.json

Nenhuma alteração necessária, mas garantir que está configurado corretamente:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 7. Configuração de Produtos In-App

### 7.1 Acessar Google Play Console

1. Entre no **Google Play Console**
2. Selecione o app **"Didgemap - Calculadora Didgeridoo"**
3. No menu lateral, vá em **"Monetização"** > **"Produtos no app"**

### 7.2 Criar Produto de Compra Única (Managed Product)

#### Exemplo: Recursos Premium

Clique em **"Criar produto"**:

```
ID do produto: premium_features_v1
(Use apenas letras minúsculas, números e underscores)

Nome: Recursos Premium
Descrição: Desbloqueie todos os recursos premium do Didgemap

Preço padrão: R$ 19,90
(O Google converte automaticamente para outras moedas)

Status: Ativo
```

**Sugestões de produtos para o Didgeomap:**

| ID do Produto | Nome | Descrição | Preço Sugerido |
|---------------|------|-----------|----------------|
| `premium_features_v1` | Recursos Premium | Todos os recursos premium desbloqueados | R$ 19,90 |
| `ai_recommendations` | Recomendações de IA | Sistema de recomendações com IA | R$ 9,90 |
| `3d_visualization` | Visualização 3D | Visualização 3D de didgeridoos | R$ 14,90 |
| `export_premium` | Exportação Premium | Exportar em PDF com marca d'água removida | R$ 4,90 |
| `bundle_complete` | Pacote Completo | Todos os recursos + futuros updates | R$ 39,90 |

### 7.3 Criar Assinatura (Subscription)

#### Exemplo: Assinatura Mensal Premium

Clique em **"Criar assinatura"**:

```
ID da assinatura: premium_monthly
Nome: Premium Mensal
Descrição: Acesso ilimitado a todos os recursos premium

Plano base:
- Período de cobrança: Mensal (1 mês)
- Preço: R$ 9,90/mês
- Período de teste gratuito: 7 dias (opcional)
- Período de carência: 3 dias (recomendado)

Planos adicionais (opcional):
- premium_yearly: R$ 89,90/ano (economia de 25%)
- premium_quarterly: R$ 24,90/trimestre

Status: Ativo
```

**Sugestões de assinaturas:**

| ID da Assinatura | Nome | Período | Preço | Trial |
|------------------|------|---------|-------|-------|
| `premium_monthly` | Premium Mensal | 1 mês | R$ 9,90 | 7 dias |
| `premium_yearly` | Premium Anual | 1 ano | R$ 89,90 | 7 dias |
| `pro_monthly` | Pro Mensal | 1 mês | R$ 14,90 | Não |
| `pro_yearly` | Pro Anual | 1 ano | R$ 149,90 | Não |

### 7.4 Configurações Avançadas de Assinatura

#### Renovação Automática:
- [x] Ativada por padrão
- [x] Notificar usuário antes da renovação
- [x] Permitir cancelamento a qualquer momento

#### Período de Carência (Grace Period):
```
Duração: 3 dias
- Se o pagamento falhar, usuário mantém acesso por 3 dias
- Google tenta cobrar novamente
- Reduz cancelamentos por problemas temporários
```

#### Reativação:
```
Permitir reativação: Sim
Preço de reativação: Mesmo preço
Período para reativar: 30 dias após cancelamento
```

#### Upgrade/Downgrade:
```
Premium Monthly → Premium Yearly:
- Tipo: Upgrade
- Proporcional: Sim (crédito pelo período não usado)
- Efetivação: Imediata

Premium Yearly → Premium Monthly:
- Tipo: Downgrade
- Efetivação: No final do período atual
```

---

## 8. Testes e Validação

### 8.1 Configurar Testadores

1. No **Google Play Console**, vá em **"Configurações"** > **"Testadores de licença"**
2. Adicione e-mails dos testadores:

```
Testadores internos:
- seu-email@gmail.com
- desenvolvedor@exemplo.com

Testadores fechados (alpha/beta):
- tester1@gmail.com
- tester2@gmail.com
```

### 8.2 Modo de Teste

#### Contas de teste têm acesso a:
- Compras sem cobrança real
- Todas as funcionalidades de billing
- Cancelamento instantâneo de assinaturas

#### Adicionar testadores:
1. **Google Play Console** > **"Monetização"** > **"Testadores de licença"**
2. Adicionar e-mails das contas de teste
3. Testadores devem aceitar convite por e-mail

### 8.3 Testar Fluxo de Compra

#### Checklist de Testes:

**Compras Únicas:**
- [ ] Listar produtos disponíveis
- [ ] Iniciar compra
- [ ] Completar pagamento
- [ ] Verificar desbloqueio de recursos
- [ ] Cancelar compra (antes de completar)
- [ ] Restaurar compra (após reinstalar app)

**Assinaturas:**
- [ ] Listar assinaturas disponíveis
- [ ] Iniciar assinatura com trial
- [ ] Iniciar assinatura sem trial
- [ ] Cancelar assinatura
- [ ] Reativar assinatura cancelada
- [ ] Fazer upgrade de plano
- [ ] Fazer downgrade de plano
- [ ] Verificar renovação automática

**Cenários de Erro:**
- [ ] Sem conexão internet
- [ ] Pagamento rejeitado
- [ ] Conta sem forma de pagamento
- [ ] Produto não disponível
- [ ] Compra já realizada

### 8.4 Validação de Receipts

**IMPORTANTE:** Sempre validar compras no backend para evitar fraudes.

#### Fluxo recomendado:
1. App recebe receipt do Google Play
2. App envia receipt para seu backend
3. Backend valida com Google Play Developer API
4. Backend confirma para o app
5. App desbloqueia recursos

#### Endpoint de validação Google:
```
POST https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{packageName}/purchases/products/{productId}/tokens/{token}
```

**Requer:**
- Service Account credentials
- Google Play Developer API ativada

---

## 9. Publicação e Aprovação

### 9.1 Revisar Política de Privacidade

Seu app já tem política de privacidade em:
`https://didgemap.app/privacy-policy.html`

**Adicionar seção sobre pagamentos:**

```markdown
## Pagamentos e Compras In-App

### Informações de Pagamento
- Não armazenamos dados de cartão de crédito
- Pagamentos processados via Google Play
- Histórico de compras disponível no Google Play

### Assinaturas
- Renovação automática (pode cancelar a qualquer momento)
- Cancelamento no Google Play Store
- Reembolsos conforme política da Play Store

### Dados de Compra
Coletamos:
- ID da transação
- Produtos adquiridos
- Data e hora da compra
- Status da assinatura (se aplicável)

Usamos esses dados para:
- Validar compras
- Desbloquear recursos pagos
- Prevenir fraudes
- Gerar relatórios de receita
```

### 9.2 Configurar Informações de Monetização

1. No **Google Play Console** > **"Política"** > **"App Content"**
2. Em **"Anúncios"**, selecione:
   - [ ] Não, este app não contém anúncios (se não tiver ads)
3. Em **"Compras no app"**, selecione:
   - [x] Sim, contém compras no app
   - Faixa de preço: R$ 4,90 - R$ 149,90 (ajustar conforme seus produtos)

### 9.3 Build e Submit

#### Criar build de produção:
```bash
cd /c/Users/emerson.guimaraes/Pessoal/Didgeomap/didgeo/calculadora-didgeridoo

# Build Android (App Bundle)
npm run build:android:production

# Aguardar build terminar no EAS

# Submit para Play Store
npm run submit:android
```

#### Preencher informações no Google Play Console:

```
Tipo de lançamento: Produção

Notas da versão (PT-BR):
"
Versão 1.0.0
- Lançamento inicial
- Calculadora profissional de didgeridoo
- Recursos premium disponíveis via compra no app
- Análise acústica avançada
- Exportação de projetos em PDF
"

Notas da versão (EN):
"
Version 1.0.0
- Initial release
- Professional didgeridoo calculator
- Premium features available via in-app purchase
- Advanced acoustic analysis
- Export projects to PDF
"
```

### 9.4 Processo de Aprovação

#### Timeline esperado:
- **Envio:** Imediato
- **Revisão inicial:** 1-3 dias
- **Aprovação:** 3-7 dias (primeira vez pode ser mais longo)
- **Publicação:** Imediata após aprovação

#### Possíveis motivos de rejeição:
- Política de privacidade inadequada
- Descrição não clara sobre compras no app
- Produtos mal configurados
- Screenshots não representativos
- Permissões desnecessárias

#### Se rejeitado:
1. Ler atentamente o motivo da rejeição
2. Corrigir o problema
3. Reenviar para revisão
4. Responder ao Google se necessário

---

## 10. Monitoramento e Relatórios

### 10.1 Dashboard de Receita

**Google Play Console** > **"Relatórios"** > **"Receita"**

Informações disponíveis:
- Receita total por período
- Receita por produto
- Receita por país
- Novos compradores vs recorrentes
- Taxa de conversão
- Churn rate (taxa de cancelamento)

### 10.2 Relatórios Financeiros

**Google Play Console** > **"Pagamentos"** > **"Relatórios financeiros"**

Acessar:
- Relatórios mensais de receita
- Deduções (taxa do Google: 15-30%)
- Impostos retidos
- Valor líquido a receber
- Histórico de pagamentos

### 10.3 Pagamentos do Google

**Ciclo de pagamento:**
```
Mês de venda: Janeiro
Fechamento: 15 de Fevereiro
Pagamento: Até 15 de Março

Exemplo:
- Vendas em Jan 2025: R$ 1.000,00
- Taxa Google (15%): -R$ 150,00
- Impostos (variável): -R$ 50,00
- Líquido: R$ 800,00
- Pagamento: Até 15 de Março em sua conta bancária
```

**Taxa do Google:**
- **15%** para primeiros $1 milhão USD de receita anual
- **30%** após $1 milhão USD

### 10.4 KPIs Importantes

Monitorar regularmente:

| Métrica | Descrição | Meta |
|---------|-----------|------|
| **Conversion Rate** | % de usuários que compram | > 2% |
| **ARPU** | Receita média por usuário | Crescente |
| **LTV** | Lifetime value por usuário | > CAC |
| **Churn Rate** | % de cancelamentos mensais | < 5% |
| **MRR** | Receita recorrente mensal | Crescente |
| **Trials to Paid** | % de trials que convertem | > 40% |

### 10.5 Análise com Google Analytics

Integrar eventos de billing:

```javascript
// Em BillingManager.js
import Analytics from '../analytics/Analytics';

// Após compra bem-sucedida
Analytics.logEvent('purchase', {
  transaction_id: purchase.transactionId,
  value: purchase.price,
  currency: 'BRL',
  items: [{
    item_id: purchase.productId,
    item_name: purchase.productName
  }]
});

// Início de assinatura
Analytics.logEvent('start_trial', {
  subscription_id: subscriptionId,
  trial_period: '7d'
});

// Cancelamento
Analytics.logEvent('cancel_subscription', {
  subscription_id: subscriptionId,
  reason: reason
});
```

---

## 11. Checklist Final

### Antes de Publicar:

**Configuração Google:**
- [ ] Conta Google Play Console ativa
- [ ] Taxa de $25 paga
- [ ] Perfil de pagamento criado e verificado
- [ ] Conta bancária adicionada e verificada
- [ ] Formulário W-8BEN preenchido
- [ ] Informações fiscais completas

**Configuração do App:**
- [ ] Biblioteca react-native-iap instalada
- [ ] BillingManager implementado
- [ ] Produtos criados no Play Console
- [ ] IDs dos produtos configurados no app
- [ ] Fluxo de compra implementado
- [ ] Validação de receipts implementada (backend)

**Testes:**
- [ ] Testadores configurados
- [ ] Compras testadas em modo de teste
- [ ] Assinaturas testadas
- [ ] Restauração de compras testada
- [ ] Cenários de erro testados

**Documentação:**
- [ ] Política de privacidade atualizada
- [ ] Termos de uso atualizados
- [ ] Descrição do app menciona compras no app
- [ ] Screenshots mostram recursos premium

**Build:**
- [ ] Build de produção criado
- [ ] App Bundle (.aab) gerado
- [ ] Versionamento correto
- [ ] App enviado para revisão

### Após Publicação:

- [ ] Monitorar primeiras compras
- [ ] Verificar relatórios de receita
- [ ] Acompanhar reviews sobre billing
- [ ] Verificar taxa de conversão
- [ ] Receber primeiro pagamento do Google (45-60 dias)

---

## 12. Suporte e Recursos

### Documentação Oficial:
- Google Play Billing: https://developer.android.com/google/play/billing
- react-native-iap: https://github.com/dooboolab/react-native-iap
- Expo In-App Purchases: https://docs.expo.dev/versions/latest/sdk/in-app-purchases/

### Contatos:
- Suporte Google Play Console: https://support.google.com/googleplay/android-developer
- Comunidade react-native-iap: https://github.com/dooboolab/react-native-iap/discussions

### Consultoria Recomendada:
- **Contador:** Para questões fiscais e tributárias
- **Advogado:** Para contratos e termos de uso
- **Consultor App Store:** Para otimização de conversão

---

## 13. Próximos Passos

### Fase 1: Configuração (Semana 1-2)
1. Criar perfil de pagamento Google
2. Adicionar conta bancária
3. Preencher informações fiscais
4. Criar produtos no Play Console

### Fase 2: Desenvolvimento (Semana 3-4)
1. Instalar react-native-iap
2. Implementar BillingManager
3. Criar UI de produtos premium
4. Implementar fluxo de compra

### Fase 3: Testes (Semana 5)
1. Adicionar testadores
2. Testar todos os fluxos
3. Corrigir bugs encontrados
4. Validar receipts

### Fase 4: Publicação (Semana 6)
1. Atualizar documentação
2. Criar build de produção
3. Submeter para revisão
4. Aguardar aprovação

### Fase 5: Monitoramento (Contínuo)
1. Acompanhar métricas
2. Otimizar conversão
3. Iterar baseado em feedback
4. Escalar receita

---

## 14. Observações Importantes

### Compliance e Legal:
- Sempre siga as políticas do Google Play
- Mantenha termos de uso e privacidade atualizados
- Seja transparente sobre preços e assinaturas
- Ofereça suporte ao cliente adequado

### Melhores Práticas:
- Ofereça trial gratuito em assinaturas
- Preços competitivos mas sustentáveis
- Comunicação clara de valor
- Processo de compra simples e rápido
- Suporte a múltiplas formas de pagamento

### Segurança:
- Sempre validar purchases no backend
- Nunca confiar apenas em validação client-side
- Proteger Service Account credentials
- Monitorar transações suspeitas
- Implementar rate limiting

### Experiência do Usuário:
- Não forçar compras
- Mostrar valor antes de pedir pagamento
- Permitir uso básico gratuitamente
- Oferecer opções de preço variadas
- Facilitar cancelamento e reembolso

---

## Informações de Contato e Dados do Projeto

```json
{
  "project": {
    "name": "Didgemap - Calculadora Didgeridoo",
    "package_name": "com.didgemap.app",
    "version": "1.0.0",
    "platform": "Expo (React Native)",
    "repo": "c:\\Users\\emerson.guimaraes\\Pessoal\\Didgeomap\\didgeo\\calculadora-didgeridoo"
  },
  "google_play": {
    "url": "https://play.google.com/store/apps/details?id=com.didgemap.app",
    "console": "https://play.google.com/console"
  },
  "documentation": {
    "privacy_policy": "https://didgemap.app/privacy-policy.html",
    "website": "https://didgemap.app"
  }
}
```

---

**Última atualização:** 27 de Outubro de 2025
**Versão do documento:** 1.0
**Autor:** Claude (Anthropic)
**Para:** Didgeomap - Calculadora Didgeridoo
