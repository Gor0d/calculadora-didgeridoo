#!/usr/bin/env node

/**
 * Pre-Build Checklist Script
 * Verifica se tudo está pronto para build do Google Play
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 PRÉ-BUILD CHECKLIST - GOOGLE PLAY STORE\n');
console.log('='.repeat(50));

let allChecksPassed = true;
const warnings = [];
const errors = [];

// Função auxiliar para verificar arquivos
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, filePath));
}

// Função auxiliar para ler JSON
function readJSON(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    return null;
  }
}

// Função para executar comando
function runCommand(command) {
  try {
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// CHECK 1: Verificar arquivos de configuração
console.log('\n✓ 1. Verificando arquivos de configuração...');
const appJson = readJSON('app.json');
const packageJson = readJSON('package.json');
const easJson = readJSON('eas.json');

if (!appJson) {
  errors.push('app.json não encontrado ou inválido');
  allChecksPassed = false;
} else {
  console.log('  ✓ app.json encontrado');
}

if (!packageJson) {
  errors.push('package.json não encontrado ou inválido');
  allChecksPassed = false;
} else {
  console.log('  ✓ package.json encontrado');
}

if (!easJson) {
  errors.push('eas.json não encontrado ou inválido');
  allChecksPassed = false;
} else {
  console.log('  ✓ eas.json encontrado');
}

// CHECK 2: Verificar versões
console.log('\n✓ 2. Verificando versões...');
if (appJson && appJson.expo) {
  const version = appJson.expo.version;
  const versionCode = appJson.expo.android?.versionCode;

  console.log(`  ✓ Version: ${version}`);
  console.log(`  ✓ Version Code: ${versionCode || 'não definido'}`);

  if (!versionCode) {
    warnings.push('versionCode não está definido em app.json -> android.versionCode');
  }
} else {
  errors.push('Configuração expo não encontrada em app.json');
  allChecksPassed = false;
}

// CHECK 3: Verificar package name e bundle identifier
console.log('\n✓ 3. Verificando identificadores...');
if (appJson && appJson.expo) {
  const androidPackage = appJson.expo.android?.package;
  const iosBundle = appJson.expo.ios?.bundleIdentifier;

  if (androidPackage) {
    console.log(`  ✓ Android Package: ${androidPackage}`);
  } else {
    errors.push('Android package não definido');
    allChecksPassed = false;
  }

  if (iosBundle) {
    console.log(`  ✓ iOS Bundle: ${iosBundle}`);
  }
}

// CHECK 4: Verificar assets
console.log('\n✓ 4. Verificando assets...');
const requiredAssets = [
  'assets/icon.png',
  'assets/adaptive-icon.png',
  'assets/splash-icon.png',
  'assets/didgemap-flat.png'
];

requiredAssets.forEach(asset => {
  if (fileExists(asset)) {
    console.log(`  ✓ ${asset}`);
  } else {
    errors.push(`Asset não encontrado: ${asset}`);
    allChecksPassed = false;
  }
});

// CHECK 5: Verificar política de privacidade
console.log('\n✓ 5. Verificando política de privacidade...');
if (fileExists('privacy-policy.html')) {
  console.log('  ✓ privacy-policy.html encontrado');

  const privacyContent = fs.readFileSync(path.join(__dirname, 'privacy-policy.html'), 'utf8');
  if (privacyContent.includes('gorod@fisiohubtech.com.br')) {
    console.log('  ✓ Email de contato presente');
  } else {
    warnings.push('Email de contato não encontrado na política de privacidade');
  }
} else {
  errors.push('privacy-policy.html não encontrado');
  allChecksPassed = false;
}

// CHECK 6: Verificar dependências
console.log('\n✓ 6. Verificando dependências...');
if (fileExists('node_modules')) {
  console.log('  ✓ node_modules existe');
} else {
  errors.push('node_modules não encontrado - execute npm install');
  allChecksPassed = false;
}

// CHECK 7: Verificar se é um repositório git
console.log('\n✓ 7. Verificando git...');
if (fileExists('.git')) {
  console.log('  ✓ Repositório git inicializado');

  // Verificar se há mudanças não commitadas
  try {
    execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' });
    console.log('  ✓ Nenhuma mudança não commitada');
  } catch (error) {
    warnings.push('Existem mudanças não commitadas - considere fazer commit antes da build');
  }
} else {
  warnings.push('Não é um repositório git - considere inicializar com git init');
}

// CHECK 8: Verificar EAS CLI
console.log('\n✓ 8. Verificando EAS CLI...');
const hasEasCli = runCommand('npx eas-cli --version');
if (hasEasCli) {
  console.log('  ✓ EAS CLI disponível');
} else {
  warnings.push('EAS CLI não encontrado - será instalado automaticamente quando necessário');
}

// CHECK 9: Verificar conexão com internet (para build)
console.log('\n✓ 9. Verificando conectividade...');
try {
  execSync('ping -n 1 google.com', { stdio: 'pipe', timeout: 5000 });
  console.log('  ✓ Conexão com internet OK');
} catch (error) {
  warnings.push('Sem conexão com internet - necessária para build no EAS');
}

// CHECK 10: Verificar scripts de build
console.log('\n✓ 10. Verificando scripts de build...');
if (packageJson && packageJson.scripts) {
  const requiredScripts = [
    'build:android:production',
    'build:android:apk',
    'test',
    'lint:check'
  ];

  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`  ✓ Script "${script}" definido`);
    } else {
      warnings.push(`Script "${script}" não encontrado em package.json`);
    }
  });
} else {
  errors.push('Scripts não definidos em package.json');
  allChecksPassed = false;
}

// RESUMO FINAL
console.log('\n' + '='.repeat(50));
console.log('\n📊 RESUMO DA VERIFICAÇÃO\n');

if (errors.length > 0) {
  console.log('❌ ERROS CRÍTICOS:');
  errors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error}`);
  });
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  AVISOS:');
  warnings.forEach((warning, index) => {
    console.log(`  ${index + 1}. ${warning}`);
  });
  console.log('');
}

if (allChecksPassed && errors.length === 0) {
  console.log('✅ TODOS OS CHECKS OBRIGATÓRIOS PASSARAM!');
  console.log('');
  console.log('🎉 Projeto pronto para build de produção!');
  console.log('');
  console.log('📝 Próximos passos:');
  console.log('  1. Execute: npm run build:android:production');
  console.log('  2. Aguarde a build completar (15-30 min)');
  console.log('  3. Baixe o arquivo .aab gerado');
  console.log('  4. Faça upload no Google Play Console');
  console.log('');
  console.log('📚 Para mais detalhes, consulte: GOOGLE_PLAY_BUILD_GUIDE.md');
  process.exit(0);
} else {
  console.log('❌ VERIFICAÇÃO FALHOU!');
  console.log('');
  console.log('Por favor, corrija os erros acima antes de continuar.');
  console.log('');
  process.exit(1);
}
