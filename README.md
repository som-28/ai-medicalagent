# EchoDoc AI - AI Medical Voice Agent

An AI-powered medical consultation platform that connects users with specialized AI doctors through voice conversations. Get instant medical advice and automated health reports, available 24/7.

## Features

- 🎤 **Voice Consultations** - Natural conversations with AI doctors using VAPI
- 📊 **Automated Reports** - AI-generated medical reports after each consultation
- 👨‍⚕️ **Multiple Specialists** - 10+ AI medical specialists across various fields
- 🔒 **Secure Authentication** - Powered by Clerk
- 🌐 **Real-time Database** - PostgreSQL with Drizzle ORM
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Authentication**: Clerk
- **AI**: OpenRouter API (Gemini 2.5 Flash Lite)
- **Voice AI**: VAPI
- **UI Components**: shadcn/ui + Tabler Icons

## 🚀 Deploy to Vercel (Production)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository (`som-28/ai-medicalagent`)
4. **Don't click Deploy yet!** First, add environment variables:

### Step 3: Add Environment Variables in Vercel
In the Vercel project settings, go to **"Environment Variables"** and add:

```env
DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_PRIVATE_KEY=your_vapi_private_key
```

### Step 4: Deploy
- Click **"Deploy"**
- Wait 2-3 minutes for the build
- Your app will be live at `https://your-app.vercel.app`

### Step 5: Setup Database (First Time Only)
After deployment, run migrations:
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run database migrations
vercel env pull .env.local
npx drizzle-kit push
```

## 💻 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- API keys (see below)

### Required API Keys
1. **Neon Database** - [neon.tech](https://neon.tech) (Free tier)
2. **Clerk** - [clerk.com](https://clerk.com) (Free tier)
3. **OpenRouter** - [openrouter.ai](https://openrouter.ai) (Pay-as-you-go)
4. **VAPI** - [vapi.ai](https://vapi.ai) (Free tier available)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/som-28/ai-medicalagent.git
cd ai-medicalagent
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Fill in your API keys in `.env.local`

5. Push database schema:
```bash
npx drizzle-kit push
```

6. Run development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/
├── (auth)/          # Authentication pages (Clerk)
├── (routes)/        # Protected routes
│   └── dashboard/   # Main dashboard & consultations
├── api/             # API routes
├── globals.css      # Global styles
├── layout.tsx       # Root layout
└── page.tsx         # Landing page
components/          # Reusable components
config/              # Database & AI configuration
context/             # React context providers
lib/                 # Utilities
```

## 🔐 Environment Variables

See `.env.example` for the complete list of required environment variables.

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
