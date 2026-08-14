# ORBIT - prototipo frontend

Prototipo interactivo del MVP de **ORBIT Enterprise Operations Platform**, construido con Angular y datos locales. No se conecta a un backend, PostgreSQL, servicios externos ni AWS.

## Qué incluye

- Login y sesión de demostración.
- Cambio instantáneo entre perfiles de Administración, RH, Manager y TI.
- Dashboard ejecutivo.
- Empresa, sedes y departamentos.
- Directorio de empleados y onboarding.
- Catálogo de activos, asignación y devolución.
- Solicitudes internas, estados y aprobación simple.
- Recorrido funcional RH -> Manager -> TI.
- Matriz visual de roles y permisos.
- Audit log generado por las acciones del usuario.
- Persistencia en `localStorage` y restauración de datos demo.
- Diseño responsive y configuración PWA básica.

## Requisitos

Instala estas herramientas antes de abrir el proyecto:

- **Node.js 24.15 o posterior dentro de la línea 24.x.** El proyecto usa Angular 22, compatible también con las líneas de Node indicadas en la documentación oficial de Angular.
- **pnpm 11.19.0**, fijado en `package.json`.
- Navegador moderno: Chrome, Edge, Firefox o Safari.

### Instalar pnpm

Con Node.js instalado:

```bash
corepack enable
corepack prepare pnpm@11.19.0 --activate
```

Si Corepack no está disponible:

```bash
npm install --global pnpm@11.19.0
```

Verifica las versiones:

```bash
node --version
pnpm --version
```

## Instalación y ejecución

Abre una terminal dentro de esta carpeta y ejecuta:

```bash
pnpm install
pnpm start
```

La aplicación se abrirá en [http://localhost:4200](http://localhost:4200).

En Windows también puedes hacer doble clic en `start-demo.cmd`. El script comprueba Node y pnpm, instala las dependencias si faltan e inicia la aplicación.

## Accesos de demostración

Todos los perfiles utilizan la contraseña `orbit2026`.

| Perfil           | Correo               | Uso principal                             |
| ---------------- | -------------------- | ----------------------------------------- |
| Administración   | `admin@orbit.demo`   | Recorrer y administrar todo el prototipo  |
| Recursos Humanos | `rh@orbit.demo`      | Registrar empleados e iniciar onboarding  |
| Manager          | `manager@orbit.demo` | Aprobar o rechazar solicitudes            |
| Tecnología       | `ti@orbit.demo`      | Gestionar activos y completar solicitudes |

También puedes ingresar con un clic desde las tarjetas de la pantalla de login.

## Recorrido recomendado

1. Ingresa como **Recursos Humanos**.
2. Abre Empleados y registra un nuevo ingreso dejando activada la solicitud automática de equipo.
3. Cambia al perfil **Manager** desde la barra superior.
4. Abre Aprobaciones y aprueba la solicitud.
5. Cambia al perfil **Tecnología**.
6. Abre Solicitudes y asigna una laptop disponible.
7. Revisa el empleado, el activo y el Audit Log actualizados.

## Comandos disponibles

```bash
pnpm start       # servidor local y apertura del navegador
pnpm start:lan   # servidor accesible desde otros dispositivos de la red local
pnpm serve:pwa   # servidor con configuración de producción/PWA
pnpm test        # pruebas automatizadas, una sola ejecución
pnpm build       # build optimizado de producción
pnpm check       # pruebas y build
```

El build se genera en `dist/orbit-frontend-demo/browser`.

## Datos locales

La aplicación guarda el estado completo en la clave `orbit-demo-state-v1` de `localStorage`. El botón con el icono de recarga en la barra superior restablece los datos iniciales.

Cada navegador mantiene su propia copia. Borrar los datos del sitio también elimina los cambios de la demostración.

## Arquitectura frontend

```text
src/app/
  core/       modelos, datos semilla, sesión, permisos y estado local
  layout/     shell, navegación responsive y cambio de perfil
  shared/     iconos y transformaciones reutilizables
  features/   pantallas cargadas de forma diferida por módulo funcional
```

Las reglas y el acceso a `localStorage` están encapsulados en `OrbitStore`. Al crear el backend, esta capa debe sustituirse por servicios HTTP sin conectar los componentes directamente a PostgreSQL.

## Evolución móvil

Esta versión utiliza Angular web responsive. **Ionic y Capacitor no están instalados.** La navegación, los componentes y el estado están separados para conservar la posibilidad de agregarlos posteriormente si se decide publicar una aplicación Android/iOS o utilizar APIs nativas.

Esa incorporación debe tratarse como una decisión futura de arquitectura, no como una dependencia del prototipo actual.

## Límites de la demo

- La autenticación y los permisos son simulaciones del lado del navegador; no proporcionan seguridad real.
- No existe sincronización entre dispositivos o usuarios.
- No se cargan archivos ni se envían correos o notificaciones reales.
- El Audit Log local es demostrativo; la inmutabilidad real debe garantizarla el backend.
- Node.js, Java, PostgreSQL y AWS quedan reservados para fases posteriores.
