#!/usr/bin/env node

/**
 * 🛠️ Script de Configuração de Deploy
 * Configura automaticamente as ferramentas necessárias para deploy
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, description) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} concluído!`, 'green');
    return true;
  } catch (error) {
    log(`❌ Erro em: ${description}`, 'red');
    return false;
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}❓ ${question}${colors.reset} `, resolve);
  });
}

async function checkRequirement(command, name, installCommand) {
  try {
    execSync(command, { stdio: 'pipe' });
    log(`✅ ${name} instalado`, 'green');
    return true;
  } catch {
    log(`❌ ${name} não encontrado`, 'red');
    const install = await askQuestion(`Instalar ${name}? (y/n): `);
    if (install.toLowerCase() === 'y') {
      return exec(installCommand, `Instalando ${name}`);
    }
    return false;
  }
}

function createEnvExample() {
  const envExample = `# 🔐 Variáveis de Ambiente - Deploy
# Copie para .env.local e preencha os valores

# Expo
EXPO_TOKEN=your_expo_token_here

# Vercel
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here

# GitHub Actions Secrets (configurar no GitHub)
# EXPO_TOKEN
# VERCEL_TOKEN
# VERCEL_ORG_ID
# VERCEL_PROJECT_ID

# Google Play Store (opcional)
GOOGLE_SERVICE_ACCOUNT_KEY=path/to/service-account.json

# Apple App Store (opcional)
APPLE_ID=your_apple_id@email.com
APPLE_APP_SPECIFIC_PASSWORD=your_app_specific_password
APPLE_TEAM_ID=your_team_id`;

  fs.writeFileSync('.env.example', envExample);
  log('✅ Arquivo .env.example criado', 'green');
}

function createVercelConfig() {
  const vercelConfig = {
    "name": "didgemap-calculadora",
    "version": 2,
    "buildCommand": "npm run build:web:prod",
    "outputDirectory": "build",
    "installCommand": "npm ci",
    "framework": null,
    "public": false,
    "github": {
      "enabled": true,
      "autoAlias": true
    }
  };

  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  log('✅ vercel.json criado', 'green');
}

function createNetlifyConfig() {
  const netlifyConfig = `[build]
  command = "npm run build:web:prod"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;

  fs.writeFileSync('netlify.toml', netlifyConfig);
  log('✅ netlify.toml criado', 'green');
}

async function setupExpo() {
  log('\n📱 Configurando Expo...', 'bright');
  
  // Verificar se já está configurado
  try {
    execSync('npx eas whoami', { stdio: 'pipe' });
    log('✅ Já logado no Expo', 'green');
    return true;
  } catch {
    log('❌ Não logado no Expo', 'yellow');
    const doLogin = await askQuestion('Fazer login no Expo agora? (y/n): ');
    
    if (doLogin.toLowerCase() === 'y') {
      return exec('npx eas login', 'Login no Expo');
    }
    
    log('⚠️  Lembre-se de fazer login depois: npx eas login', 'yellow');
    return false;
  }
}

async function setupVercel() {
  log('\n🌐 Configurando Vercel...', 'bright');
  
  const hasVercel = await checkRequirement(
    'vercel --version',
    'Vercel CLI',
    'npm install -g vercel'
  );
  
  if (hasVercel) {
    createVercelConfig();
    
    const doLogin = await askQuestion('Fazer login no Vercel agora? (y/n): ');
    if (doLogin.toLowerCase() === 'y') {
      exec('vercel login', 'Login no Vercel');
    }
  }
}

async function main() {
  log('\n🛠️  DIDGEMAP - CONFIGURAÇÃO DE DEPLOY', 'bright');
  log('=' .repeat(50), 'blue');

  try {
    // Verificar Node.js
    log('\n🔍 Verificando requisitos...', 'cyan');
    await checkRequirement('node --version', 'Node.js', 'Instale Node.js em https://nodejs.org');
    await checkRequirement('npm --version', 'NPM', 'NPM vem com Node.js');
    await checkRequirement('git --version', 'Git', 'Instale Git em https://git-scm.com');

    // Instalar dependências
    log('\n📦 Instalando dependências...', 'cyan');
    exec('npm ci', 'Instalação das dependências');

    // Instalar CLIs globais
    log('\n🌍 Instalando CLIs globais...', 'cyan');
    await checkRequirement('@expo/eas-cli --version', 'EAS CLI', 'npm install -g @expo/eas-cli');

    // Configurar serviços
    await setupExpo();
    await setupVercel();

    // Criar arquivos de configuração
    log('\n📄 Criando arquivos de configuração...', 'cyan');
    createEnvExample();
    createNetlifyConfig();

    // Verificar EAS
    log('\n🏗️  Verificando configuração EAS...', 'cyan');
    if (fs.existsSync('eas.json')) {
      log('✅ eas.json encontrado', 'green');
    } else {
      const configureEas = await askQuestion('Configurar EAS agora? (y/n): ');
      if (configureEas.toLowerCase() === 'y') {
        exec('npx eas build:configure', 'Configuração EAS');
      }
    }

    // Resumo final
    log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!', 'green');
    log('\n📋 Próximos passos:', 'bright');
    log('1. 🔐 Configure as variáveis de ambiente (.env.local)', 'cyan');
    log('2. 🐱 Configure secrets no GitHub Actions', 'cyan');
    log('3. 🚀 Execute: npm run release', 'cyan');
    log('4. 🌐 Deploy web: vercel --prod', 'cyan');

    log('\n🔗 Links importantes:', 'blue');
    log('- Expo Dashboard: https://expo.dev', 'cyan');
    log('- Vercel Dashboard: https://vercel.com/dashboard', 'cyan');
    log('- GitHub Actions: https://github.com/settings/secrets/actions', 'cyan');

  } catch (error) {
    log(`\n❌ Erro durante a configuração: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };