@echo off
setlocal
title ORBIT - Validacion
set "ORBIT_HOME=%~dp0"
cd /d "%ORBIT_HOME%"

where node >nul 2>nul
if errorlevel 1 if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 goto :environment_error

set "ORBIT_PNPM=pnpm"
where pnpm >nul 2>nul
if not errorlevel 1 goto :run_install
where corepack >nul 2>nul
if errorlevel 1 goto :environment_error
set "ORBIT_PNPM=corepack pnpm"

:run_install
echo [1/4] Instalacion reproducible
call %ORBIT_PNPM% install --frozen-lockfile
if errorlevel 1 goto :check_error
call :map_orbit

echo.
echo [2/4] Dependencias peer
call %ORBIT_PNPM% peers check
if errorlevel 1 goto :check_error
echo.
echo [3/4] Pruebas unitarias
call %ORBIT_PNPM% test
if errorlevel 1 goto :check_error
echo.
echo [4/4] Build PWA de produccion
call %ORBIT_PNPM% build
if errorlevel 1 goto :check_error

call :cleanup_map
echo.
echo ORBIT paso todas las validaciones.
pause
exit /b 0

:map_orbit
set "ORBIT_DRIVE="
if not exist Q:\ (
  subst Q: "%ORBIT_HOME%.." >nul 2>nul
  if exist Q:\ORBIT\package.json set "ORBIT_DRIVE=Q:"
)
if defined ORBIT_DRIVE goto :mapped
if not exist R:\ (
  subst R: "%ORBIT_HOME%.." >nul 2>nul
  if exist R:\ORBIT\package.json set "ORBIT_DRIVE=R:"
)
if defined ORBIT_DRIVE goto :mapped
cd /d "%ORBIT_HOME%"
exit /b 0

:mapped
cd /d "%ORBIT_DRIVE%\ORBIT"
exit /b 0

:cleanup_map
if not defined ORBIT_DRIVE exit /b 0
cd /d "%ORBIT_HOME%"
subst %ORBIT_DRIVE% /d >nul 2>nul
set "ORBIT_DRIVE="
exit /b 0

:environment_error
echo [ERROR] Falta Node.js 24 LTS o pnpm 11.
echo Consulta README.md.
pause
exit /b 1

:check_error
call :cleanup_map
echo.
echo [ERROR] La validacion se detuvo. Revisa el error anterior.
pause
exit /b 1
