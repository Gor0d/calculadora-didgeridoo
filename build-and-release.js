#!/usr/bin/env node

const { execSync } = require('child_process');
const { Octokit } = require('@octokit/rest');

async function buildAndRelease() {
  try {
    console.log('🚀 Iniciando build EAS...');
    
    // Build com EAS
    const buildOutput = execSync('npx eas build --platform android --profile production-apk --non-interactive --wait', 
      { encoding: 'utf8', stdio: 'inherit' });
    
    console.log('📦 Obtendo URL do APK...');
    
    // Pegar URL do último build
    const buildList = execSync('npx eas build:list --platform android --limit 1 --json', 
      { encoding: 'utf8' });
    
    const builds = JSON.parse(buildList);
    const latestBuild = builds[0];
    
    if (!latestBuild || !latestBuild.artifacts?.buildUrl) {
      throw new Error('Build URL não encontrada');
    }
    
    console.log('🎯 APK URL:', latestBuild.artifacts.buildUrl);
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Vá em: https://github.com/Gor0d/calculadora-didgeridoo/actions');
    console.log('2. Clique em "Manual Release"');
    console.log('3. Clique em "Run workflow"');
    console.log('4. Cole esta URL:', latestBuild.artifacts.buildUrl);
    console.log('5. Clique em "Run workflow"');
    console.log('');
    console.log('✅ APK estará disponível nas releases!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

buildAndRelease();