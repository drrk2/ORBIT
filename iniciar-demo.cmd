@echo off
setlocal
title ORBIT - Demo local
set "ORBIT_HOME=%~dp0"
cd /d "%ORBIT_HOME%"

where node >nul 2>nul
if errorlevel 1 if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 goto :missing_node

node -e "const [major,minor]=process.versions.node.split('.').map(Number);process.exit(major===24&&minor>=15?0:1)"
if errorlevel 1 goto :wrong_node

set "ORBIT_PNPM=pnpm"
where pnpm >nul 2>nul
if not errorlevel 1 goto :pnpm_ready
where corepack >nul 2>nul
if errorlevel 1 goto :missing_pnpm
set "ORBIT_PNPM=corepack pnpm"

:pnpm_ready
call %ORBIT_PNPM% --version
if errorlevel 1 goto :missing_pnpm

if exist "node_modules\.bin\ng.cmd" goto :prepare_start
echo.
echo Instalando dependencias por primera vez...
call %ORBIT_PNPM% install --frozen-lockfile
if errorlevel 1 goto :install_error

:prepare_start
echo.
echo Iniciando ORBIT en http://127.0.0.1:4200
if defined ORBIT_NO_OPEN goto :start_without_browser
echo El navegador se abrira automaticamente.
call %ORBIT_PNPM% start -- --open
goto :after_start

:start_without_browser
call %ORBIT_PNPM% start

:after_start
set "ORBIT_EXIT=%ERRORLEVEL%"
if not "%ORBIT_EXIT%"=="0" goto :run_error
goto :end

:missing_node
echo.
echo [ERROR] Node.js no esta instalado o no aparece en PATH.
echo Instala Node.js 24 LTS desde https://nodejs.org/ y vuelve a ejecutar este archivo.
goto :pause_error

:wrong_node
echo.
echo [ERROR] ORBIT requiere Node.js 24.15 o superior dentro de la rama 24 LTS.
echo Version detectada:
node --version
goto :pause_error

:missing_pnpm
echo.
echo [ERROR] pnpm no esta disponible.
echo Ejecuta en PowerShell: npm install --global pnpm@11.21.0
goto :pause_error

:install_error
echo.
echo [ERROR] No se pudieron instalar las dependencias. Revisa README.md.
goto :pause_error

:run_error
echo.
echo [ERROR] Angular no pudo iniciar. Revisa el mensaje anterior.

:pause_error
echo.
pause
exit /b 1

:end
endlocal
