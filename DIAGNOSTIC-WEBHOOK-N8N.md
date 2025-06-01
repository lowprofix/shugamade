# 🔧 Diagnostic : Webhook N8N ne met pas à jour Google Calendar

## 📊 **État Actuel**
- ✅ API de migration fonctionne
- ✅ Webhooks N8N répondent (status 200)
- ✅ Conversion des formats fonctionne
- ❌ **Google Calendar n'est pas mis à jour**

## 🎯 **Problème Identifié**
Le webhook `N8N_WEBHOOK_CALENDAR_UPDATE` répond positivement mais ne met pas réellement à jour Google Calendar.

## 🔍 **Vérifications à Effectuer dans N8N**

### 1. **Workflow de Mise à Jour (`/webhook/event/update`)**
Vérifiez que le workflow contient :

```
Webhook (PATCH) → Google Calendar (Update Event)
```

### 2. **Configuration du Node Google Calendar**
- ✅ **Authentification** : Compte Google connecté
- ✅ **Permissions** : Accès en écriture au calendrier
- ✅ **Calendar ID** : Bon calendrier sélectionné
- ✅ **Event ID** : Utilise `{{ $json.eventId }}`
- ✅ **Summary** : Utilise `{{ $json.summary }}`

### 3. **Mapping des Données**
Le webhook reçoit :
```json
{
  "eventId": "204j5t58f8f1urnmpnuqbl8uhh",
  "summary": "Lavina - Séance Boost",
  "description": "...",
  "start": { "dateTime": "...", "timeZone": "..." },
  "end": { "dateTime": "...", "timeZone": "..." }
}
```

### 4. **Logs N8N à Vérifier**
1. Allez dans N8N → Executions
2. Cherchez les exécutions récentes du workflow `/webhook/event/update`
3. Vérifiez s'il y a des erreurs

## 🛠️ **Solutions Recommandées**

### **Solution 1 : Vérifier le Workflow N8N**
1. Ouvrez N8N (`https://n8n.bienquoi.com`)
2. Trouvez le workflow avec le webhook `/webhook/event/update`
3. Vérifiez que le node Google Calendar est configuré pour **Update Event**
4. Testez manuellement avec des données de test

### **Solution 2 : Recréer le Node Google Calendar**
Si le node existe mais ne fonctionne pas :
1. Supprimez le node Google Calendar
2. Recréez-le avec l'opération "Update Event"
3. Reconnectez votre compte Google
4. Configurez les champs :
   - Calendar ID : Votre calendrier
   - Event ID : `{{ $json.eventId }}`
   - Summary : `{{ $json.summary }}`

### **Solution 3 : Ajouter des Logs de Debug**
Ajoutez un node "Set" avant Google Calendar pour logger :
```json
{
  "debug": {
    "eventId": "{{ $json.eventId }}",
    "oldSummary": "{{ $json.oldSummary }}",
    "newSummary": "{{ $json.summary }}",
    "timestamp": "{{ $now }}"
  }
}
```

## 🧪 **Test Manuel**
Pour tester le webhook directement :

```bash
curl -X PATCH "https://n8n.bienquoi.com/webhook/event/update" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "204j5t58f8f1urnmpnuqbl8uhh",
    "summary": "TEST MANUEL - Lavina - Séance Boost"
  }'
```

Puis vérifiez dans Google Calendar si l'événement a changé.

## 📋 **Checklist de Résolution**
- [ ] Workflow N8N existe et est activé
- [ ] Node Google Calendar configuré pour "Update Event"
- [ ] Authentification Google valide
- [ ] Permissions d'écriture sur le calendrier
- [ ] Mapping correct des champs
- [ ] Test manuel réussi
- [ ] Logs N8N sans erreurs

## 🚀 **Une fois corrigé**
Relancez la migration :
```bash
curl -X POST "http://localhost:3000/api/update-calendar-events"
```

Et vérifiez que les événements sont mis à jour :
```bash
curl -X GET "http://localhost:3000/api/update-calendar-events"
``` 