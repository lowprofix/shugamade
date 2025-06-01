# README: API de Rappels de Rendez-vous WhatsApp

## Introduction

Cette API permet d'envoyer automatiquement des rappels WhatsApp aux clients ayant des rendez-vous le lendemain. Le système récupère les événements depuis Google Calendar, extrait les informations de contact, et envoie des messages personnalisés.

## Fonctionnalités principales

- Récupération des rendez-vous du lendemain
- Extraction des numéros de téléphone depuis divers formats de descriptions
- Extraction des noms de clients depuis les résumés d'événements
- Création de messages personnalisés
- Envoi de messages WhatsApp via l'API existante
- Recherche dans Hiboutik pour les clients sans numéro de téléphone

## Endpoints

L'API comporte deux endpoints principaux:

### 1. GET /api/reminders/tomorrow

Récupère et affiche les rendez-vous prévus pour demain.

**Exemple de réponse**:

```json
{
  "success": true,
  "message": "3 rendez-vous trouvés pour demain",
  "date": "mercredi 15 novembre",
  "appointments": [
    {
      "summary": "Jean Dupont - Massage",
      "date": "2023-11-15T14:00:00Z",
      "time": "15:00",
      "hasDescription": true,
      "phoneExtracted": true,
      "phoneNumber": "+242064123456",
      "description": "Client: Jean Dupont\nTéléphone: +242064123456"
    }
  ]
}
```

### 2. POST /api/reminders/tomorrow

Envoie les rappels WhatsApp aux clients ayant un rendez-vous demain.

**Corps de requête**:

```json
{
  "testMode": false
}
```

Le paramètre `testMode` est optionnel (défaut: false).

**Exemple de réponse**:

```json
{
  "success": true,
  "message": "Rappels envoyés pour 3 clients sur 5 (dont 1 résolus via Hiboutik)",
  "date": "mercredi 15 novembre",
  "sent": [...],
  "failed": [...],
  "manuallyProcessNeeded": true,
  "manualProcessing": [...],
  "hiboutikResolved": [...]
}
```

## Formats des descriptions d'événements supportés

L'API peut extraire les numéros de téléphone depuis plusieurs formats:

1. Numéro simple: `064123456`
2. Numéro avec préfixe international: `+242064123456`
3. Format avec tiret: `- +242064123456`
4. Description structurée: `Client: Jean\nTéléphone: 064123456`

## Formats des résumés d'événements

Pour extraire correctement le nom du client, utilisez le nouveau format:

**Format recommandé (nouveau):**
- `Nom du client - Service`

**Formats legacy (anciens, encore supportés):**
1. `Réservation - Service - Nom du client`
2. `Réservation - Service Nom du client`

**Note:** Le système supporte automatiquement les deux formats pour assurer la compatibilité pendant la transition. Les nouveaux événements utilisent le format "Nom - Service" tandis que les anciens événements avec le format "Réservation - Service - Nom" continuent de fonctionner.

## Mode test

Activez le mode test en envoyant `{ "testMode": true }` dans le corps de la requête POST. Cela permet de vérifier l'extraction des informations sans envoyer de messages.

## Intégration avec n8n

L'API s'intègre avec n8n pour récupérer les rendez-vous via le webhook configuré dans la variable d'environnement `N8N_WEBHOOK_CALENDAR_EVENTS_TOMORROW`.

## Configuration requise

Variables d'environnement:

- `N8N_WEBHOOK_CALENDAR_EVENTS_TOMORROW` - URL du webhook n8n pour récupérer les événements
- `NEXT_PUBLIC_APP_URL` - URL de base de l'application (par défaut: `https://shugamade.com`)

## Exemples d'utilisation

### Vérifier les rendez-vous de demain

```bash
curl -X GET https://shugamade.com/api/reminders/tomorrow
```

### Tester l'extraction sans envoyer de messages

```bash
curl -X POST https://shugamade.com/api/reminders/tomorrow \
  -H "Content-Type: application/json" \
  -d '{"testMode": true}'
```

### Envoyer les rappels

```bash
curl -X POST https://shugamade.com/api/reminders/tomorrow \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Dépannage

Si des clients n'ont pas de numéro dans la description de l'événement:

1. L'API tentera de rechercher le client dans Hiboutik par son nom
2. Si trouvé, le message sera envoyé au numéro récupéré
3. Sinon, le client sera listé dans `manualProcessing` dans la réponse

Pour les clients sans numéro valide, ajoutez le numéro dans la description de l'événement Google Calendar selon l'un des formats supportés.
