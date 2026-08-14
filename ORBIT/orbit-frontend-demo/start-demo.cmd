@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo [ORBIT] Node.js no esta instalado o no esta en PATH.
  echo Consulta la seccion Requisitos de README.md.
  pause
  exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo [ORBIT] pnpm no esta instalado o no esta en PATH.
  echo Ejecuta: corepack enable
  echo Luego: corepack prepare pnpm@11.19.0 --activate
  pause
  exit /b 1
)

if not exist node_modules (
  echo [ORBIT] Instalando dependencias por primera vez...
  call pnpm install
  if errorlevel 1 exit /b 1
)

echo [ORBIT] Iniciando demo en http://localhost:4200
call pnpm start
