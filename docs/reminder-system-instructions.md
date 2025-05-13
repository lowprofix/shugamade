# Système de rappels ShugaMade

Ce document explique comment configurer et utiliser le nouveau système de rappels pour ShugaMade.

## Architecture du système

Le système de rappels a été conçu pour éviter les problèmes de timeout sur Vercel en divisant le processus en plusieurs étapes :

1. **Préparation des rappels** : Récupère les rendez-vous du lendemain et stocke les informations dans la base de données.
2. **Traitement par lots** : Envoie les messages WhatsApp par petits lots pour respecter la limite de 10 secondes de Vercel.
3. **Suivi de progression** : Garde une trace de l'avancement et permet de reprendre en cas d'interruption.

## Configuration requise

1. **Variables d'environnement** :

   - Ajoutez ces variables dans votre fichier `.env.local` et dans la configuration Vercel :

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://gktuvdoqpexlorlmgpox.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdHV2ZG9xcGV4bG9ybG1ncG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzk1NTYsImV4cCI6MjA2MjcxNTU1Nn0.nZh8OH5hes50t7eVn7f8MHh__jVGj4fAolwZOC_Llng
   N8N_WEBHOOK_CALENDAR_EVENTS_TOMORROW=<votre_url_webhook_n8n>
   ```

2. **Configuration n8n** :
   - Importez le workflow fourni dans le fichier `docs/n8n-reminder-workflow.json`
   - Configurez la variable d'environnement `BASE_URL` dans n8n pour pointer vers votre site (ex: `https://shugamade.com`)

## Points d'API

### 1. Préparation des rappels

**Endpoint** : `GET /api/reminders/prepare`

Cette route récupère les rendez-vous du lendemain et stocke les informations dans la base de données Supabase.

**Réponse** :

```json
{
  "success": true,
  "message": "Préparation réussie. 4 clients prêts pour l'envoi des rappels.",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "mercredi 14 mai",
    "total_clients": 4
  }
}
```

### 2. Envoi d'un message à un client spécifique

**Endpoint** : `GET /api/reminders/send/:id`

Cette route envoie un message WhatsApp à un client spécifique.

**Réponse** :

```json
{
  "success": true,
  "message": "Message envoyé avec succès",
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "client_name": "John Doe",
    "phone_number": "+242065366700",
    "appointment_time": "10:00"
  }
}
```

### 3. Vérification du statut d'une session

**Endpoint** : `GET /api/reminders/status/:id`

Cette route permet de vérifier le statut d'une session de rappels.

**Réponse** :

```json
{
  "success": true,
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2025-05-14",
    "status": "processing",
    "total_clients": 4,
    "processed_clients": 2,
    "success_count": 2,
    "error_count": 0
  },
  "statistics": {
    "pending": 2,
    "sent": 2,
    "error": 0
  },
  "clients": [...]
}
```

### 4. Liste des clients en attente

**Endpoint** : `GET /api/reminders/clients/pending/:session_id`

Cette route récupère la liste des clients en attente pour une session donnée.

**Réponse** :

```json
{
  "success": true,
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2025-05-14",
    "status": "processing"
  },
  "pending_count": 2,
  "clients": [...]
}
```

### 5. Orchestration du processus complet

**Endpoint** : `POST /api/reminders/process`

Cette route orchestre l'ensemble du processus de rappels.

**Paramètres** :

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000", // Optionnel pour reprendre une session
  "batch_size": 3 // Nombre de clients à traiter par lot
}
```

**Réponse** :

```json
{
  "success": true,
  "completed": false,
  "message": "Traitement en cours. 2 clients restants.",
  "session": {...},
  "results": [...],
  "statistics": {...},
  "next_batch": {
    "remaining": 2,
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "batch_size": 3
  }
}
```

## Utilisation recommandée

1. **Automatisation avec n8n** :

   - Configurez le workflow n8n pour s'exécuter quotidiennement à 17h30
   - Le workflow appellera `/api/reminders/process` et gérera automatiquement les lots de messages

2. **Test manuel** :
   - Appelez `/api/reminders/prepare` pour préparer les rappels
   - Utilisez `/api/reminders/status/:id` pour vérifier l'état
   - Appelez `/api/reminders/process` manuellement avec un `session_id` si nécessaire

## Dépannage

1. **Messages non envoyés** :

   - Vérifiez les logs d'erreur sur Vercel
   - Consultez le statut des clients avec `/api/reminders/status/:id`
   - Réessayez l'envoi manuellement pour un client spécifique avec `/api/reminders/send/:id`

2. **Erreurs de récupération des rendez-vous** :

   - Vérifiez que le webhook n8n est correctement configuré
   - Assurez-vous que les formats des rendez-vous sont conformes aux attentes

3. **Erreurs de base de données** :
   - Vérifiez les informations de connexion Supabase dans les variables d'environnement
   - Consultez les logs Supabase pour plus de détails sur les erreurs
