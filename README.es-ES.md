

# AgentKit

AgentKit es una plantilla inicial lista para producción para crear agentes de IA con capacidades de búsqueda web. Está diseñada para ayudar a los desarrolladores a construir rápidamente aplicaciones de chat con IA con autenticación, persistencia en base de datos y una hermosa interfaz de usuario: todo lo necesario para lanzar rápido.

<img width="980" height="500" alt="aaaagent" src="https://github.com/user-attachments/assets/54da3860-48af-4754-9490-62660dd918c9" />


## Características

- 🚀 **Búsqueda Web Impulsada por IA**: Activa o desactiva la búsqueda web con un solo clic. Tu agente de IA puede buscar en la web información actual, eventos recientes y datos actualizados cuando sea necesario.
- 💬 **Interfaz de Chat Moderna**: UI de chat preconstruida con respuestas en streaming, carga de archivos, historial de mensajes y visualización de llamadas a herramientas. Construida con shadcn/ui y Tailwind CSS.
- 🔐 **Autenticación de Usuarios**: Autenticación Clerk integrada con soporte para correo/contraseña y OAuth. Historial de chat con alcance de usuario y persistencia segura en base de datos.
- 💾 **Persistencia en Base de Datos**: PostgreSQL con Prisma ORM. Todas las conversaciones se guardan automáticamente con datos con alcance de usuario para facilitar las consultas y la gestión.
- 🎨 **Interfaz de Usuario Hermosa**: Construida con componentes de shadcn/ui y Tailwind CSS para un diseño moderno y responsivo.
- ⚡ **Streaming en Tiempo Real**: Observa el proceso de búsqueda de tu agente en tiempo real con citas de fuentes colapsables y visualización de llamadas a herramientas.
- 🛡️ **Listo para Producción**: Incluye manejo de errores, estados de carga, diseño responsivo y está optimizado para despliegue en Vercel.
- 📝 **TypeScript**: Seguridad de tipos completa en toda la base de código para una mejor experiencia de desarrollo.
- 🔧 **Experiencia de Desarrollo**: Arquitectura limpia, fácil de personalizar y código bien documentado.

## Desarrollado con

- [Next.js](https://nextjs.org/) 16.1.1
- [React](https://react.dev/) 19.2.3
- [TypeScript](https://www.typescriptlang.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Anthropic](https://www.anthropic.com/) (Claude Sonnet 4.5)
- [Clerk](https://clerk.com/) (Autenticación)
- [Prisma](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Magic UI](https://magicui.design) (Componentes de la página de destino)
- [ExaLabs AI SDK](https://www.exalabs.com/) (Herramienta de búsqueda web)

### Herramientas

- [Biome](https://biomejs.dev/) (Linting y formateo)
- [Husky](https://typicode.github.io/husky/) (Ganchos de Git)
- [Commitlint](https://commitlint.js.org/) (Linting de mensajes de commit)
- [lint-staged](https://github.com/lint-staged/lint-staged) (Comprobaciones pre-commit)

## Primeros Pasos

### Requisitos previos

- Node.js 18+ (recomendado: 20+)
- pnpm, npm, yarn o bun
- Base de datos PostgreSQL (local o en la nube)
- Cuenta en Clerk (para autenticación)
- Clave API de Anthropic (para el modelo de IA)

### Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/anayatkhan1/agentkit-starter.git
cd agentkit-starter
```

2. Instala las dependencias:

```bash
pnpm install
# o
npm install
# o
yarn install
```

3. Configura las variables de entorno (consulta la sección [Variables de Entorno](#variables-de-entorno) a continuación).

4. Configura la base de datos:

```bash
# Genera el cliente de Prisma
pnpm prisma generate

# Ejecuta las migraciones de la base de datos
pnpm prisma migrate dev
```

5. Inicia el servidor de desarrollo:

```bash
pnpm dev
# o
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## Variables de Entorno

Para ejecutar el proyecto localmente, debes configurar las siguientes variables de entorno. Crea un archivo `.env.local` o `.env` en el directorio raíz del proyecto:

```env
# Autenticación Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clave_publicable_clerk
CLERK_SECRET_KEY=tu_clave_secreta_clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/chat
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/chat

# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/agentkit

# IA Anthropic
ANTHROPIC_API_KEY=tu_clave_api_anthropic

# Opcional: URL de Producción
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Obtención de Claves API

- **Clerk**: Regístrate en [clerk.com](https://clerk.com/) y crea una nueva aplicación. Copia tu clave publicable y clave secreta desde el panel de control.
- **Anthropic**: Obtén tu clave API desde [console.anthropic.com](https://console.anthropic.com/).
- **PostgreSQL**: Usa una instancia local de PostgreSQL o un proveedor en la nube como [Neon](https://neon.tech/), [Supabase](https://supabase.com/) o [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres).

## Configuración de la Base de Datos

Este proyecto usa Prisma como ORM con PostgreSQL. El esquema de la base de datos incluye:

- **Chat**: Representa un hilo de conversación con ID de usuario, título y marcas de tiempo
- **Message**: Representa mensajes individuales en un chat con rol, contenido (JSON) y marcas de tiempo

### Ejecución de Migraciones

Después de configurar tu `DATABASE_URL`, ejecuta:

```bash
# Genera el cliente de Prisma
pnpm prisma generate

# Crea y aplica las migraciones
pnpm prisma migrate dev

# (Opcional) Visualiza tu base de datos en Prisma Studio
pnpm prisma studio
```

## Estructura del Proyecto

```env
agentkit-starter/
├── src/
│   ├── agents/              # Implementaciones de agentes de IA
│   │   └── web-search-agent/ # Agente de búsqueda web con integración de herramientas
│   ├── app/                  # Enrutador de aplicaciones de Next.js
│   │   ├── api/              # Rutas API (chat, chats)
│   │   ├── chat/             # Páginas de chat
│   │   └── page.tsx          # Página de destino
│   ├── components/           # Componentes de React
│   │   ├── chat-ui/          # Componentes de la interfaz de chat
│   │   ├── sections/        # Secciones de la página de destino
│   │   └── ui/               # Componentes de shadcn/ui
│   ├── lib/                  # Utilidades y configuraciones
│   │   ├── chat-store.ts     # Lógica de persistencia de chat
│   │   ├── config.tsx        # Configuración del sitio
│   │   └── prisma.ts         # Instancia del cliente de Prisma
│   └── tools/                # Herramientas del SDK de IA
│       └── web-search/       # Conjunto de herramientas de búsqueda web
├── prisma/                   # Esquema de base de datos y migraciones
│   ├── schema.prisma         # Esquema de Prisma
│   └── migrations/          # Migraciones de base de datos
└── public/                   # Activos estáticos
```

## Uso

### Alternador de Búsqueda Web

La interfaz de chat incluye un botón para alternar la búsqueda. Cuando está habilitado, el agente de IA utilizará la búsqueda web para encontrar información actual. Cuando está deshabilitado, el agente responde utilizando únicamente su conocimiento de entrenamiento.

### Persistencia del Chat

Todas las conversaciones se guardan automáticamente en PostgreSQL. Cada chat está asociado con un ID de usuario (de Clerk), lo que permite un historial de chat con alcance de usuario. Los chats se cargan automáticamente cuando navegas a una página de chat.

### Personalización del Agente

Puedes personalizar el agente de IA mediante:

1. **Modificar el prompt del sistema**: Edita `src/agents/web-search-agent/prompt.ts`
2. **Agregar nuevas herramientas**: Crea herramientas en `src/tools/` e intégralas en el agente
3. **Cambiar el modelo de IA**: Actualiza el modelo en `src/agents/web-search-agent/agent.ts` o `src/app/api/chat/route.ts`

## Solicitudes de Funcionalidades

Para solicitar una funcionalidad, abre un [problema en GitHub](https://github.com/anayatkhan1/agentkit-starter/issues).

## Directrices de Contribución

¡Gracias por considerar contribuir a AgentKit! Sigue estas directrices para garantizar una colaboración fluida:

1. Haz un fork del repositorio a tu cuenta de GitHub.

2. Clona el repositorio bifurcado en tu máquina local:

```bash
git clone https://github.com/tu-usuario/agentkit-starter.git
cd agentkit-starter
```

3. Crea una nueva rama para tus cambios:

```bash
git checkout -b feature/tu-nombre-de-funcionalidad
```

4. Realiza tus cambios y asegúrate de que cumplan con el estilo de código y las directrices del proyecto.

5. Prueba tus cambios a fondo para evitar introducir errores.

6. Confirma tus cambios con mensajes de commit claros y descriptivos:

```bash
git commit -m 'feat: Agrega tu mensaje descriptivo de commit'
```

**Nota:** Antes de confirmar los cambios, asegúrate de incluir una de estas etiquetas en tu mensaje: `feat`, `fix`, `wip`, `patch`, `build`.

7. Envía tus cambios a tu repositorio bifurcado:

```bash
git push origin feature/tu-nombre-de-funcionalidad
```

8. Abre una solicitud de extracción (pull request) contra la rama `main` del repositorio original.

9. Proporciona una descripción clara y concisa de tus cambios en la solicitud de extracción, junto con cualquier información relevante.

10. Asegúrate de que tu solicitud de extracción pase todas las comprobaciones y pruebas antes de solicitar una revisión.

### Estilo de Código

Este proyecto usa [Biome](https://biomejs.dev/) para linting y formateo. Antes de confirmar, ejecuta:

```bash
pnpm lint
pnpm format
```

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

Construido con ❤️ por [Anayat Khan](https://anayat.xyz)
