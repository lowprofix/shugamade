# Guide de Migration : Nouveau Format des Événements Calendrier

## Résumé du Changement

**Ancien format :** `Réservation - Service - Nom Client`  
**Nouveau format :** `Nom Client - Service`

**Exemple :**
- Avant : `Réservation - Séance Boost - Lavina`
- Après : `Lavina - Séance Boost`

## Modifications Effectuées

### 1. Fonctions de Parsing Mises à Jour

Les fonctions `extractClientName` ont été modifiées dans :
- `src/lib/reminder-utils.ts`
- `src/app/api/reminders/tomorrow/route.ts`

**Compatibilité :** Les fonctions supportent maintenant les deux formats (ancien et nouveau) pour assurer une transition en douceur.

### 2. Nouvelle API de Migration

Une nouvelle API a été créée : `/api/update-calendar-events`

#### GET /api/update-calendar-events
- **Fonction :** Aperçu des événements à mettre à jour
- **Utilisation :** Voir combien d'événements utilisent encore l'ancien format
- **Réponse :** Liste des événements avec aperçu des changements

#### POST /api/update-calendar-events
- **Fonction :** Met à jour tous les événements du calendrier Google
- **Utilisation :** Convertit automatiquement tous les événements de l'ancien vers le nouveau format
- **Réponse :** Rapport détaillé des mises à jour (succès/échecs)

### 3. Documentation Mise à Jour

- `src/app/api/reminders/tomorrow/README.md` : Mis à jour avec le nouveau format
- Exemples et documentation reflètent maintenant le nouveau pattern

## Étapes de Migration

### Étape 1 : Vérifier l'État Actuel

```bash
curl -X GET https://votre-domaine.com/api/update-calendar-events
```

Cette commande vous donnera un aperçu de :
- Nombre total d'événements
- Nombre d'événements à mettre à jour
- Aperçu des 10 premiers changements

### Étape 2 : Effectuer la Migration

```bash
curl -X POST https://votre-domaine.com/api/update-calendar-events \
  -H "Content-Type: application/json"
```

Cette commande va :
- Récupérer tous les événements via `N8N_WEBHOOK_CALENDAR_EVENTS`
- Identifier ceux avec l'ancien format
- Les convertir au nouveau format
- Les mettre à jour via `N8N_WEBHOOK_CALENDAR_UPDATE`

### Étape 3 : Vérifier les Résultats

La réponse de l'étape 2 inclura :
- Nombre d'événements mis à jour avec succès
- Nombre d'échecs (le cas échéant)
- Détails de chaque mise à jour

## Variables d'Environnement Requises

Assurez-vous que ces variables sont configurées :

```env
N8N_WEBHOOK_CALENDAR_EVENTS=https://n8n.bienquoi.com/webhook/calendar/events
N8N_WEBHOOK_CALENDAR_UPDATE=https://n8n.bienquoi.com/webhook/event/update
```

## Fonctionnalités de Sécurité

### Compatibilité Rétroactive
- Les fonctions de parsing supportent les deux formats
- Aucune interruption de service pendant la migration
- Les anciens événements continuent de fonctionner

### Gestion d'Erreurs
- Chaque mise à jour est traitée individuellement
- Les échecs n'affectent pas les autres mises à jour
- Rapport détaillé des erreurs pour diagnostic

### Validation
- Vérification du format avant mise à jour
- Seuls les événements avec l'ancien format sont modifiés
- Préservation des autres données de l'événement

## Après la Migration

### Nouveaux Événements
- Les nouveaux événements utilisent automatiquement le nouveau format
- Webhook N8N déjà configuré pour le nouveau pattern

### Système de Rappels
- Continue de fonctionner avec les deux formats
- Extraction automatique du nom client
- Aucune modification requise

### Monitoring
- Surveillez les logs pour détecter d'éventuels problèmes
- Vérifiez que les rappels WhatsApp fonctionnent correctement
- Testez la création de nouveaux événements

## Rollback (si nécessaire)

En cas de problème, vous pouvez :
1. Restaurer les fonctions `extractClientName` à leur version précédente
2. Les événements déjà mis à jour resteront au nouveau format
3. Créer un script de conversion inverse si nécessaire

## Support

En cas de problème :
1. Vérifiez les logs de l'API
2. Testez les webhooks N8N individuellement
3. Vérifiez la configuration des variables d'environnement
4. Contactez l'équipe de développement avec les détails d'erreur

## Checklist de Migration

- [ ] Vérifier que les webhooks N8N sont configurés
- [ ] Tester l'API d'aperçu (GET)
- [ ] Effectuer la migration (POST)
- [ ] Vérifier les résultats
- [ ] Tester la création d'un nouvel événement
- [ ] Tester l'envoi d'un rappel
- [ ] Mettre à jour la documentation interne si nécessaire 