# AgentKit

AgentKit is a production-ready starter template for building AI agents with web search capabilities. It's designed to help developers quickly build AI chat applications with authentication, database persistence, and a beautiful UI—everything you need to launch fast.

![AgentKit](https://github.com/user-attachments/assets/agentkit-thumbnail)

## Features

- 🚀 **AI-Powered Web Search**: Toggle web search on/off with a single click. Your AI agent can search the web for current information, recent events, and up-to-date data when needed.
- 💬 **Modern Chat Interface**: Pre-built chat UI with streaming responses, file uploads, message history, and tool call visualization. Built with shadcn/ui and Tailwind CSS.
- 🔐 **User Authentication**: Integrated Clerk authentication with email/password and OAuth support. User-scoped chat history with secure database persistence.
- 💾 **Database Persistence**: PostgreSQL with Prisma ORM. All conversations are automatically saved with user-scoped data for easy querying and management.
- 🎨 **Beautiful UI**: Built with shadcn/ui components and Tailwind CSS for a modern, responsive design.
- ⚡ **Real-time Streaming**: See your agent's search process in real-time with collapsible source citations and tool call visualization.
- 🛡️ **Production Ready**: Includes error handling, loading states, responsive design, and optimized for Vercel deployment.
- 📝 **TypeScript**: Full type safety throughout the codebase for better developer experience.
- 🔧 **Developer Experience**: Clean architecture, easy to customize, and well-documented code.

## Built with

- [Next.js](https://nextjs.org/) 16.1.1
- [React](https://react.dev/) 19.2.3
- [TypeScript](https://www.typescriptlang.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Anthropic](https://www.anthropic.com/) (Claude Sonnet 4.5)
- [Clerk](https://clerk.com/) (Authentication)
- [Prisma](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Magic UI](https://magicui.design) (Landing page components)
- [ExaLabs AI SDK](https://www.exalabs.com/) (Web search tool)

### Tools

- [Biome](https://biomejs.dev/) (Linting and formatting)
- [Husky](https://typicode.github.io/husky/) (Git hooks)
- [Commitlint](https://commitlint.js.org/) (Commit message linting)
- [lint-staged](https://github.com/lint-staged/lint-staged) (Pre-commit checks)

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- pnpm, npm, yarn, or bun
- PostgreSQL database (local or cloud)
- Clerk account (for authentication)
- Anthropic API key (for AI model)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/anayatkhan1/agentkit-starter.git
cd agentkit-starter
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
# or
yarn install
```

3. Set up environment variables (see [Environment Variables](#environment-variables) section below).

4. Set up the database:

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev
```

5. Start the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

To run the project locally, you need to set up the following environment variables. Create a `.env.local` or `.env` file in the root directory of the project:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/chat
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/chat

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agentkit

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: Production URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting API Keys

- **Clerk**: Sign up at [clerk.com](https://clerk.com/) and create a new application. Copy your publishable key and secret key from the dashboard.
- **Anthropic**: Get your API key from [console.anthropic.com](https://console.anthropic.com/).
- **PostgreSQL**: Use a local PostgreSQL instance or a cloud provider like [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres).

## Database Setup

This project uses Prisma as the ORM with PostgreSQL. The database schema includes:

- **Chat**: Represents a conversation thread with user ID, title, and timestamps
- **Message**: Represents individual messages in a chat with role, content (JSON), and timestamps

### Running Migrations

After setting up your `DATABASE_URL`, run:

```bash
# Generate Prisma client
pnpm prisma generate

# Create and apply migrations
pnpm prisma migrate dev

# (Optional) View your database in Prisma Studio
pnpm prisma studio
```

## Project Structure

```
agentkit-starter/
├── src/
│   ├── agents/              # AI agent implementations
│   │   └── web-search-agent/ # Web search agent with tool integration
│   ├── app/                  # Next.js app router
│   │   ├── api/              # API routes (chat, chats)
│   │   ├── chat/             # Chat pages
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   │   ├── chat-ui/          # Chat interface components
│   │   ├── sections/        # Landing page sections
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utilities and configurations
│   │   ├── chat-store.ts     # Chat persistence logic
│   │   ├── config.tsx        # Site configuration
│   │   └── prisma.ts         # Prisma client instance
│   └── tools/                # AI SDK tools
│       └── web-search/       # Web search toolset
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma         # Prisma schema
│   └── migrations/          # Database migrations
└── public/                   # Static assets
```

## Usage

### Web Search Toggle

The chat interface includes a search toggle button. When enabled, the AI agent will use web search to find current information. When disabled, the agent responds using its training knowledge only.

### Chat Persistence

All conversations are automatically saved to PostgreSQL. Each chat is associated with a user ID (from Clerk), allowing for user-scoped chat history. Chats are loaded automatically when you navigate to a chat page.

### Customizing the Agent

You can customize the AI agent by:

1. **Modifying the system prompt**: Edit `src/agents/web-search-agent/prompt.ts`
2. **Adding new tools**: Create tools in `src/tools/` and integrate them in the agent
3. **Changing the AI model**: Update the model in `src/agents/web-search-agent/agent.ts` or `src/app/api/chat/route.ts`

## Feature Requests

To request a feature, open a [GitHub issue](https://github.com/anayatkhan1/agentkit-starter/issues).

## Contribution Guidelines

Thank you for considering contributing to AgentKit! Please follow these guidelines to ensure smooth collaboration:

1. Fork the repository to your GitHub account.

2. Clone the forked repository to your local machine:

```bash
git clone https://github.com/your-username/agentkit-starter.git
cd agentkit-starter
```

3. Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

4. Make your changes and ensure they adhere to the project's coding style and guidelines.

5. Test your changes thoroughly to avoid introducing bugs.

6. Commit your changes with clear and descriptive commit messages:

```bash
git commit -m 'feat: Add your descriptive commit message'
```

**Note:** Before committing changes, ensure you include one of these tags in your commit message: `feat`, `fix`, `wip`, `patch`, `build`.

7. Push your changes to your forked repository:

```bash
git push origin feature/your-feature-name
```

8. Open a pull request against the `main` branch of the original repository.

9. Provide a clear and concise description of your changes in the pull request, along with any relevant information.

10. Ensure your pull request passes all checks and tests before requesting a review.

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. Before committing, run:

```bash
pnpm lint
pnpm format
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Anayat Khan](https://anayat.xyz)
