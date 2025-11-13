@echo off
echo ======================================
echo   LIMPEZA DE ARQUIVOS NAO UTILIZADOS
echo   Didgeomap - Calculadora Didgeridoo
echo ======================================
echo.

echo Este script vai remover arquivos nao utilizados do projeto.
echo Leia CLEANUP_REPORT.md para detalhes completos.
echo.

echo FASE 1: Remover componentes orfaos (SEGURO)
echo -------------------------------------------
echo.

set /p fase1="Remover 4 componentes orfaos + 1 hook? (S/N): "
if /i "%fase1%"=="S" (
    echo.
    echo Removendo componentes orfaos...

    del /f "src\components\SaveStatusIndicator.js" 2>nul && echo [OK] SaveStatusIndicator.js removido
    del /f "src\components\TipCard.js" 2>nul && echo [OK] TipCard.js removido
    del /f "src\components\ResponsiveLayout.js" 2>nul && echo [OK] ResponsiveLayout.js removido
    del /f "src\components\MeasurementUnitSelector.js" 2>nul && echo [OK] MeasurementUnitSelector.js removido
    del /f "src\hooks\useAutoSave.js" 2>nul && echo [OK] useAutoSave.js removido

    echo.
    echo Fase 1 concluida! ~1.750 linhas removidas.
    echo.
) else (
    echo Fase 1 pulada.
    echo.
)

echo FASE 2: Remover arquivo de backup (VERIFICAR ANTES)
echo ----------------------------------------------------
echo.

set /p fase2="Remover GeometryEditorScreen_BACKUP.js? (S/N): "
if /i "%fase2%"=="S" (
    echo.
    echo Removendo backup...

    del /f "GeometryEditorScreen_BACKUP.js" 2>nul && echo [OK] GeometryEditorScreen_BACKUP.js removido

    echo.
    echo Fase 2 concluida!
    echo.
) else (
    echo Fase 2 pulada.
    echo.
)

echo FASE 3: Organizar arquivos de teste (16 arquivos test-*.js)
echo ------------------------------------------------------------
echo.

echo Opcoes:
echo 1 - Mover para __tests__\archive\
echo 2 - Remover permanentemente
echo 3 - Pular
echo.

set /p fase3="Escolha uma opcao (1/2/3): "

if "%fase3%"=="1" (
    echo.
    echo Criando diretorio de arquivo...
    mkdir "__tests__\archive" 2>nul

    echo Movendo arquivos de teste...
    move /y "test-*.js" "__tests__\archive\" 2>nul

    echo.
    echo Fase 3 concluida! Arquivos movidos para __tests__\archive\
    echo.
) else if "%fase3%"=="2" (
    echo.
    echo ATENCAO: Esta acao e IRREVERSIVEL (exceto via Git)!
    set /p confirma="Tem certeza que deseja remover permanentemente? (S/N): "

    if /i "!confirma!"=="S" (
        echo.
        echo Removendo arquivos de teste...
        del /f "test-*.js" 2>nul

        echo.
        echo Fase 3 concluida! Arquivos removidos.
        echo.
    ) else (
        echo Remocao cancelada.
        echo.
    )
) else (
    echo Fase 3 pulada.
    echo.
)

echo FASE 4: Remover GeometryVisualization duplicado (VERIFICAR)
echo ------------------------------------------------------------
echo.

set /p fase4="Remover src\components\GeometryVisualization.js? (S/N): "
if /i "%fase4%"=="S" (
    echo.
    echo Removendo componente duplicado...

    del /f "src\components\GeometryVisualization.js" 2>nul && echo [OK] GeometryVisualization.js removido

    echo.
    echo Fase 4 concluida!
    echo.
) else (
    echo Fase 4 pulada.
    echo.
)

echo ======================================
echo   LIMPEZA CONCLUIDA
echo ======================================
echo.

echo Proximo passos recomendados:
echo.
echo 1. Executar: npm install
echo 2. Executar: npm test
echo 3. Executar: npm run lint:check
echo 4. Executar: npm start
echo 5. Testar funcionalidades principais
echo.
echo Se tudo funcionar, fazer commit:
echo   git add -A
echo   git commit -m "chore: remove unused files and components"
echo.

pause
