This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Système de Rappel de Rendez-vous

Le système de rappel de rendez-vous a été implémenté pour envoyer automatiquement des messages WhatsApp aux clients la veille de leur rendez-vous.

## Fonctionnalités

- Envoi automatique de rappels WhatsApp la veille du rendez-vous entre 17h et 18h
- Détection automatique des rendez-vous du lendemain
- Personnalisation du message en fonction de la date, l'heure et le type de service
- Possibilité de déclencher manuellement l'envoi des rappels

## API

L'API de rappel est accessible via les endpoints suivants:

- `GET /api/reminder` - Déclenche l'envoi des rappels pour les rendez-vous du lendemain
  - Paramètre `force=true` pour ignorer la restriction horaire (17h-18h)
- `POST /api/reminder` - Endpoint prévu pour configurer des paramètres personnalisés

## Automatisation

Les rappels sont automatiquement envoyés chaque jour à 17h grâce à un workflow GitHub Actions configuré dans `.github/workflows/appointment-reminders.yml`.

## Configuration requise

Les variables d'environnement suivantes sont nécessaires:

- `NEXT_PUBLIC_BASE_URL` - URL de base de l'application
- `N8N_WEBHOOK_CALENDAR_EVENTS` - URL du webhook pour récupérer les événements du calendrier
- `EVOLUTION_API_SERVER` - URL du serveur EvolutionAPI
- `EVOLUTION_API_INSTANCE` - Nom de l'instance WhatsApp
- `EVOLUTION_API_KEY` - Clé API pour EvolutionAPI
