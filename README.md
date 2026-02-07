# SchemeFinder India

A React web app that helps Indian citizens discover government schemes they are eligible for.

## Features

- **Smart Matching** — Fill in your profile (age, gender, caste, income, education, occupation, state) and get a ranked list of matching schemes
- **280+ Schemes** — Curated from NSP, Buddy4Study, MyGov, and official ministry portals
- **Multiple Categories** — Scholarships, loans, subsidies, and grants
- **Search & Filter** — Filter by scheme type and search by keywords

## Tech Stack

- React 19 + TypeScript
- Vite + TailwindCSS 4
- Single-file build output (vite-plugin-singlefile)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── App.tsx       # Main application component with form & results
├── schemes.ts    # Scheme data and eligibility types
├── main.tsx      # Entry point
└── index.css     # Styles
```

## License

MIT
