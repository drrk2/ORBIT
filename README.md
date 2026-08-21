# ORBIT - demo frontend del MVP

Prototipo ejecutable de ORBIT en Angular. No usa backend, PostgreSQL, AWS ni servicios externos: todos los datos demo se guardan en `localStorage` del navegador.

## Qué incluye

- Inicio de sesión con perfiles demo: Recursos Humanos, Manager, Tecnología y Administrador.
- Dashboard ejecutivo y organización por sedes/departamentos.
- Directorio de empleados y alta con onboarding automático.
- Catálogo de activos, asignación y devolución.
- Solicitudes internas, aprobación simple de manager y cierre por Tecnología.
- Matriz RBAC básica y registro de auditoría.
- Diseño responsive para computadora, tablet y celular.
- PWA con manifest y service worker para el build de producción.

## Versiones verificadas

| Herramienta | Versión del proyecto |
| --- | --- |
| Node.js | 24.15 o superior, dentro de la rama 24 LTS |
| pnpm | 11.21.0 recomendada; compatible desde 11.19 |
| Angular CLI | 22.1.4 |
| Angular | 22.1.2 |
| TypeScript | 6.0.3 |

No actualices TypeScript a 7 por separado: Angular 22 requiere TypeScript 6.0.x.

## Uso de NVM en Windows

Si usas NVM para Windows, activa la versión compatible antes de iniciar el proyecto:


```powershell
nvm install 24.15.0
nvm use 24.15.0  
node --version 


npm install --global pnpm@11.21.0
pnpm --version
<# Debe mostrar 11.21.0 #>
```

Abre una terminal integrada y ejecuta:

```powershell
nvm use 24.15.0
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm start
```

## Despliegue de la aplicacion:
orbit-blue-two.vercel.app 

## Arquitectura frontend

La aplicación usa una estructura por responsabilidades para que cada módulo pueda evolucionar sin cargar todas las vistas al inicio:

```text
src/app/
├── core/
│   ├── auth/          # Perfiles demo y permisos RBAC
│   ├── data/          # Datos iniciales del demo
│   ├── models/        # Contratos de dominio
│   ├── persistence/   # Adaptador de localStorage
│   ├── state/         # Estado y operaciones de negocio
│   └── ui/            # Estado transversal de búsqueda, modales y mensajes
├── features/          # Vistas cargadas bajo demanda por ruta
├── layout/            # Login, navegación, cabecera y modales compartidos
└── shared/            # Utilidades puras reutilizables
```

Las rutas `dashboard`, `organization`, `employees`, `assets`, `requests`, `approvals`, `roles` y `audit` usan `loadComponent`. El componente raíz solo aloja el router. Para sustituir `localStorage` por una API en una fase posterior, el punto de cambio queda aislado en `core/persistence` y `core/state`.

## Opción rápida en Windows

1. Instala [Node.js 24 LTS](https://nodejs.org/) y durante la instalación permite que se agregue a `PATH`.
2. Abre PowerShell y ejecuta:

   ```powershell
   npm install --global pnpm@11.21.0
   ```

3. Haz doble clic en `iniciar-demo.cmd`.

El script instala dependencias si faltan, inicia Angular y abre `http://127.0.0.1:4200`.

## Inicio desde terminal

Abre PowerShell en la raíz real del repositorio:

```powershell
cd C:\Users\Cesar\OneDrive\Escritorio\ORBIT\ORBIT
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm start
```

Abre `http://127.0.0.1:4200` si el navegador no se abre automáticamente.

## Flujo recomendado para probar el MVP

1. Entra como **Recursos Humanos** y crea un empleado. ORBIT genera automáticamente una solicitud de equipo.
2. Cambia el selector superior al perfil **Manager** y abre **Aprobaciones**.
3. Aprueba la solicitud pendiente.
4. Cambia al perfil **Tecnología**, selecciona un activo disponible y completa la asignación.
5. Revisa **Activos** y **Auditoría** para confirmar la entrega y la trazabilidad.

Usa **Restaurar demo** en el dashboard para regresar a los datos iniciales. Esta acción también cierra la sesión.

## Validación completa

Haz doble clic en `validar-proyecto.cmd` o ejecuta:

```powershell
pnpm install --frozen-lockfile
pnpm peers check
pnpm test
pnpm build
```

En Windows, el ejecutable de validación monta una unidad temporal solo durante las pruebas/build para evitar recorridos de esbuild por carpetas protegidas y la retira al concluir.

El build PWA queda en `dist/orbit/browser`. Para probar ese build:

```powershell
pnpm preview
```

Después abre `http://127.0.0.1:8080`.

## Comandos disponibles

| Comando | Uso |
| --- | --- |
| `pnpm start` | Servidor Angular de desarrollo |
| `pnpm start:lan` | Servidor accesible desde otro dispositivo en la red local |
| `pnpm test` | Pruebas unitarias una sola vez |
| `pnpm test:watch` | Pruebas en modo observación |
| `pnpm build` | Build PWA de producción |
| `pnpm preview` | Sirve el build local en el puerto 8080 |
| `pnpm check` | Ejecuta pruebas y build |

## OneDrive y errores `EPERM` / `Invalid argument`

OneDrive puede dejar archivos como marcadores “solo en línea” y bloquear herramientas que leen muchos archivos (`git`, `pnpm`, Angular/esbuild).

- En el Explorador, haz clic derecho sobre la carpeta `ORBIT` y selecciona **Mantener siempre en este dispositivo**. Espera a que aparezca la marca verde.
- No agregues `node_modules`, `.pnpm-store`, `dist` ni `.angular` a Git; ya están incluidos en `.gitignore`.
- Si siguen apareciendo errores `EPERM`, `EACCES`, `Invalid argument` o archivos que “no existen”, mueve o clona el repositorio fuera de OneDrive, por ejemplo en `C:\dev\ORBIT`.

## Git

Este repositorio comienza en `C:\Users\Cesar\OneDrive\Escritorio\ORBIT\ORBIT`. Compruébalo antes de agregar archivos:

```powershell
git rev-parse --show-toplevel
git status
git add .
```

`git rev-parse --show-toplevel` debe devolver exactamente la carpeta `...\ORBIT\ORBIT`.

## Alcance técnico

Esta etapa es únicamente frontend. Las acciones simulan el flujo empresarial y persisten datos locales; no realizan autenticación real, autorización de servidor, envío de correo, WebSockets, acceso a PostgreSQL ni integraciones. La estructura permite reemplazar el store local por APIs cuando se decida el backend. Angular PWA deja abierta la evolución posterior a Ionic + Capacitor sin introducirlos todavía.
