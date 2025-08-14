#!/usr/bin/env node

/**
 * 🚀 Script Automatizado de Build e Release
 * Automatiza o processo de build e deploy do Didgemap
 */

const { execSync } = require('child_process');
const readline = require('readline');

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
  } catch (error) {
    log(`❌ Erro em: ${description}`, 'red');
    throw error;
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}❓ ${question}${colors.reset} `, resolve);
  });
}

async function main() {
  log('\n🚀 DIDGEMAP - BUILD E RELEASE AUTOMATIZADO', 'bright');
  log('=' .repeat(50), 'blue');

  try {
    // Verificar se está logado no Expo
    log('\n📋 Verificando configurações...', 'cyan');
    try {
      execSync('npx eas whoami', { stdio: 'pipe' });
      log('✅ Logado no Expo EAS', 'green');
    } catch {
      log('❌ Não logado no Expo EAS', 'red');
      const shouldLogin = await askQuestion('Fazer login agora? (y/n): ');
      if (shouldLogin.toLowerCase() === 'y') {
        exec('npx eas login', 'Login no Expo EAS');
      } else {
        log('❌ Login necessário para continuar', 'red');
        process.exit(1);
      }
    }

    // Escolher tipo de build
    log('\n📱 Tipos de build disponíveis:', 'bright');
    log('1. 🔧 APK Preview (Teste rápido)');
    log('2. 📦 APK Produção (Completo)');
    log('3. 🏪 App Bundle (Google Play)');
    log('4. 🍎 iOS (App Store)');
    log('5. 🌐 Web Build');
    log('6. 🔄 Update OTA (Sem rebuild)');
    log('7. 🚀 Release Completo (Android + iOS + Web)');

    const buildType = await askQuestion('Escolha o tipo de build (1-7): ');

    switch (buildType) {
      case '1':
        exec('npm run build:quick', 'Build APK Preview');
        break;
      
      case '2':
        exec('npm run build:android:apk', 'Build APK Produção');
        break;
      
      case '3':
        exec('npm run build:android:production', 'Build App Bundle');
        break;
      
      case '4':
        exec('npm run build:ios:production', 'Build iOS');
        break;
      
      case '5':
        exec('npm run build:web:prod', 'Build Web');
        log('\n🌐 Para deploy web:', 'yellow');
        log('- Vercel: vercel --prod', 'cyan');
        log('- Netlify: netlify deploy --prod', 'cyan');
        log('- Railway: railway up', 'cyan');
        break;
      
      case '6':
        const branch = await askQuestion('Branch (production/preview): ');
        const message = await askQuestion('Mensagem do update: ');
        exec(`eas update --branch ${branch} --message "${message}"`, 'Update OTA');
        break;
      
      case '7':
        const confirmFull = await askQuestion('⚠️  Release completo demora ~30min. Continuar? (y/n): ');
        if (confirmFull.toLowerCase() === 'y') {
          exec('npm run quality:check', 'Verificação de qualidade');
          exec('npm run build:web:prod', 'Build Web');
          exec('npm run build:android:production', 'Build Android');
          exec('npm run build:ios:production', 'Build iOS');
          
          const shouldSubmit = await askQuestion('Submeter para as lojas automaticamente? (y/n): ');
          if (shouldSubmit.toLowerCase() === 'y') {
            exec('npm run submit:android', 'Submissão Android');
            exec('npm run submit:ios', 'Submissão iOS');
          }
        }
        break;
      
      default:
        log('❌ Opção inválida', 'red');
        process.exit(1);
    }

    // Mostrar próximos passos
    log('\n🎉 BUILD CONCLUÍDO!', 'green');
    log('\n📋 Próximos passos:', 'bright');
    
    if (['1', '2'].includes(buildType)) {
      log('1. 📱 Baixar APK do Expo Build Dashboard');
      log('2. 📲 Instalar no dispositivo para teste');
      log('3. 🧪 Testar todas as funcionalidades');
    }
    
    if (['3', '4'].includes(buildType)) {
      log('1. 🏪 Acessar console da loja (Google Play/App Store)');
      log('2. 📤 Fazer upload do arquivo (se não automático)');
      log('3. ✍️  Preencher metadados da loja');
      log('4. 🎯 Submeter para revisão');
    }

    log('\n🔗 Links úteis:', 'blue');
    log('- 📊 Expo Dashboard: https://expo.dev/accounts/[username]/projects/didgemap-calculadora');
    log('- 🤖 Google Play Console: https://play.google.com/console');
    log('- 🍎 App Store Connect: https://appstoreconnect.apple.com');

  } catch (error) {
    log(`\n❌ Erro durante o build: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };