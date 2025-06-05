# ⚽ Odd Genius Footy Stats

A modern SaaS application for Brazilian soccer statistics and betting insights, built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality

- **Live Matches**: Real-time soccer match tracking with auto-refresh
- **Upcoming Matches**: Comprehensive view of scheduled games
- **League Management**: Browse leagues, standings, and team information
- **Match Analysis**: Detailed match statistics, H2H data, and performance metrics
- **Betting Insights**: Professional betting analysis and predictions
- **Statistics Dashboard**: Comprehensive soccer analytics and trends

### Technical Features

- **Modern UI**: Built with Shadcn/ui components and Tailwind CSS
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Auto-refreshing live match data
- **API Integration**: Seamless integration with FootyStats API
- **TypeScript**: Full type safety throughout the application
- **Performance**: Optimized with Next.js 15 and Turbopack

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks + SWR for data fetching

### Backend Integration

- **API**: FootyStats API for soccer data
- **HTTP Client**: Axios
- **Data Fetching**: SWR for caching and revalidation

### Development Tools

- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Build Tool**: Turbopack (Next.js 15)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── live/              # Live matches page
│   ├── upcoming/          # Upcoming matches page
│   ├── leagues/           # Leagues overview
│   ├── match/[id]/        # Individual match details
│   ├── statistics/        # Statistics dashboard
│   ├── insights/          # Betting insights
│   ├── settings/          # Application settings
│   ├── layout.tsx         # Root layout with sidebar
│   └── page.tsx           # Dashboard homepage
├── components/            # Reusable React components
│   ├── ui/               # Shadcn/ui components
│   ├── AppSidebar.tsx    # Navigation sidebar
│   └── MatchCard.tsx     # Match display components
├── lib/                  # Utility functions and API
│   ├── api.ts           # FootyStats API integration
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
    └── index.ts         # Application types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- FootyStats API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd odd-genius-footy-stats
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   NEXT_PUBLIC_FOOTY_STATS_API_KEY=your_api_key_here
   NEXT_PUBLIC_FOOTY_STATS_BASE_URL=https://api.football-data-api.com
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages Overview

### Dashboard (`/`)

- Overview of live matches, today's games, and upcoming fixtures
- Quick statistics and navigation to detailed sections
- Real-time updates for live matches

### Live Matches (`/live`)

- Real-time match tracking with auto-refresh every 30 seconds
- Live scores, match statistics, and current status
- Direct links to detailed match analysis

### Upcoming Matches (`/upcoming`)

- Scheduled matches for the next 3-14 days
- Grouped by date with filtering options
- Pre-match statistics and predictions

### Leagues (`/leagues`)

- Browse available soccer leagues
- Grouped by country with league information
- Links to league tables and match schedules

### Match Details (`/match/[id]`)

- Comprehensive match analysis with multiple tabs:
  - **Overview**: Basic match info and key statistics
  - **Statistics**: Detailed team performance metrics
  - **Head to Head**: Historical matchup data
  - **Betting Insights**: Odds analysis and market predictions

### Statistics (`/statistics`)

- League-wide statistics and trends
- Goals, cards, corners, and other match metrics
- Visual data representation with charts and graphs

### Betting Insights (`/insights`)

- Professional betting analysis and predictions
- Market trends and profitable betting strategies
- Risk management and betting tips

### Settings (`/settings`)

- Application preferences and configuration
- Notification settings and data management
- Account information and API usage

## 🔧 Configuration

### API Configuration

The application uses the FootyStats API for soccer data. Configure your API key in the environment variables:

```env
NEXT_PUBLIC_FOOTY_STATS_API_KEY=your_api_key_here
```

### Customization

- **Theme**: Modify `tailwind.config.js` for custom styling
- **Components**: Extend or customize Shadcn/ui components in `src/components/ui/`
- **API**: Extend API functionality in `src/lib/api.ts`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FootyStats.org** for providing comprehensive soccer data API
- **Shadcn/ui** for beautiful and accessible UI components
- **Lucide** for the icon library
- **Vercel** for Next.js and deployment platform

## 📞 Support

For support, email support@oddgenius.com or join our Discord community.

---

**Built with ❤️ for Brazilian soccer fans and betting enthusiasts**
