# LCRAS Frontend

React + TypeScript frontend for Long COVID Risk Assessment System.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your backend URL
nano .env
```

### 3. Run Development Server

```bash
npm run dev
```

Access the app at http://localhost:3000

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   │   ├── RiskScoreCard.tsx
│   │   ├── BatchInfoCard.tsx
│   │   ├── BatchTable.tsx
│   │   ├── SymptomChart.tsx
│   │   └── UserProfileForm.tsx
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   ├── RiskAssessment.tsx
│   │   └── SymptomPatterns.tsx
│   ├── services/       # API client services
│   │   ├── api.ts
│   │   ├── batchService.ts
│   │   └── riskService.ts
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx         # Main app component with routing
│   └── main.tsx        # Application entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

## Key Features

### Pages

- **Home** (`/`) - Batch code lookup and search
- **Risk Assessment** (`/risk-assessment/:batchCode`) - Personalized risk scoring
- **Symptom Patterns** (`/symptom-patterns`) - Batch comparison and analysis

### Components

- **RiskScoreCard** - Displays personalized risk assessment with factors
- **BatchInfoCard** - Shows batch details and statistics
- **BatchTable** - DataTable for browsing multiple batches
- **SymptomChart** - Chart.js visualization of risk distribution
- **UserProfileForm** - User profile input for risk assessment

### API Services

- **batchService** - Batch search, details, top symptoms
- **riskService** - Risk assessment, batch risk statistics

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **Chart.js** - Data visualization

## Development

### Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8000/api/v1)

### API Integration

The frontend expects the backend to be running at the URL specified in `VITE_API_BASE_URL`.

During development, Vite proxy forwards `/api` requests to the backend (configured in `vite.config.ts`).

## Sprint 2 Status

✅ Project structure initialized
✅ React Router setup with 3 pages
✅ Material-UI theme configuration
✅ API client with Axios interceptors
✅ Service modules for batch and risk endpoints
✅ TypeScript type definitions
✅ Core components (RiskScoreCard, BatchTable, etc.)

⏳ React Query hooks integration (Sprint 3)
⏳ Component unit tests (Sprint 3)
⏳ E2E tests with Playwright (Sprint 4)

## License

MIT
