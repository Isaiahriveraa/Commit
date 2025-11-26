# Commit

A team accountability platform that helps remote and hybrid teams stay aligned through transparent commitments, deliverables tracking, and status updates.

## Features

- **Team Agreements**: Create and sign shared commitments about work hours, availability, communication norms, and team values
- **Deliverables Roadmap**: Track milestones and project deadlines with clear ownership and progress visibility
- **Status Updates**: Post regular updates on what you're working on, creating transparency across the team
- **Smart Notifications**: Get alerted when teammates need help, deadlines are approaching, or new agreements need signing
- **Analytics Dashboard**: Visualize team productivity trends and accountability metrics

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI component library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Recharts](https://recharts.org/)** - Data visualization

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** or **pnpm** or **bun**

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Commit
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Development Mode

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

The page auto-reloads when you make changes to the code.

### Production Build

Build the app for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Linting

Run the linter to check code quality:

```bash
npm run lint
```

## Project Structure

```
Commit/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── agreements/        # Team agreements page
│   ├── deliverables/      # Deliverables roadmap page
│   ├── analytics/         # Analytics page
│   └── updates/           # Status updates page
├── components/            # Reusable React components
│   ├── Navbar.tsx        # Navigation bar with notifications
│   ├── NotificationCenter.tsx
│   ├── ViewAgreementModal.tsx
│   ├── CreateAgreementModal.tsx
│   └── AddDeliverableModal.tsx
├── public/               # Static assets
└── package.json          # Project dependencies
```

## Key Pages

- **Dashboard** (`/dashboard`) - Overview of team activity and quick actions
- **Team Agreements** (`/agreements`) - View, create, and sign team agreements
- **Deliverables** (`/deliverables`) - Track project milestones and deadlines
- **Analytics** (`/analytics`) - Team productivity metrics and trends
- **Status Updates** (`/updates`) - Team member progress updates

## Contributing

This project was built for the Claude Builder Club Hackathon. Feel free to fork and extend it for your own use!

## License

MIT
