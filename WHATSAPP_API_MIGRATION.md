# Migration vers l'API officielle WhatsApp Business

Ce document explique la migration de l'API Evolution vers l'API officielle WhatsApp Business de Meta.

## ✅ Conformité avec la documentation officielle

Cette implémentation a été vérifiée et est **entièrement conforme** à la documentation officielle de l'API WhatsApp Cloud de Meta. Toutes les structures de payload, endpoints et formats respectent les spécifications officielles.

## ⚠️ **IMPORTANT : Vérification de numéros WhatsApp**

### **Problème identifié**
L'API officielle WhatsApp Cloud **N'A PAS** de fonctionnalité pour vérifier si un numéro de téléphone est enregistré sur WhatsApp, contrairement à l'API Evolution qui proposait cette fonctionnalité.

### **Pourquoi cette limitation ?**
- **Politique de Meta** : Suppression volontaire pour protéger la confidentialité des utilisateurs
- **Prévention des abus** : Éviter le spam et le scraping de numéros
- **Conformité RGPD** : Respect des réglementations sur la protection des données

### **Solution implémentée : Vérification par tentative**

Nous avons créé un nouveau système conforme aux recommandations de Meta :

#### **1. Nouvel endpoint `/api/whatsapp/verify-and-send`**
- Tente d'envoyer un message WhatsApp directement
- Si erreur 131026 ("Message Undeliverable") → numéro sans WhatsApp
- Met en cache les résultats pour éviter les vérifications répétées

#### **2. Table de cache `whatsapp_status_cache`**
```sql
-- Exécuter ce script dans votre base de données
-- Voir le fichier database/whatsapp_status_cache.sql
```

#### **3. Interface utilisateur adaptée**
- ✅ Suppression de la vérification en temps réel
- ✅ Message informatif : "Notifications intelligentes"
- ✅ Stratégie WhatsApp-first avec fallback SMS automatique

### **Avantages de cette approche**
1. **Conformité** : Respecte les recommandations officielles de Meta
2. **Performance** : Cache les résultats pendant 7 jours
3. **UX améliorée** : Plus de délais de vérification en temps réel
4. **Fiabilité** : Gestion automatique des fallbacks

### **Utilisation du nouvel endpoint**

```javascript
// Exemple d'utilisation
const response = await fetch('/api/whatsapp/verify-and-send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+33668118966',
    message: 'Votre rendez-vous est confirmé',
    linkPreview: true,
    cacheResult: true // Optionnel, true par défaut
  })
});

const result = await response.json();

if (result.success) {
  // Message WhatsApp envoyé avec succès
  console.log('WhatsApp:', result.hasWhatsApp);
} else if (result.hasWhatsApp === false) {
  // Numéro sans WhatsApp, utiliser SMS
  console.log('Fallback vers SMS nécessaire');
} else {
  // Erreur technique (configuration, limite, etc.)
  console.log('Erreur:', result.error);
}
```

## Variables d'environnement requises

Remplacez les anciennes variables d'environnement par les nouvelles :

### Anciennes variables (Evolution API) - À SUPPRIMER
```env
EVOLUTION_API_SERVER=
EVOLUTION_API_INSTANCE=
EVOLUTION_API_KEY=
```

### Nouvelles variables (API officielle WhatsApp Business) - À AJOUTER
```env
WHATSAPP_PHONE_NUMBER_ID=votre_phone_number_id
WHATSAPP_ACCESS_TOKEN=votre_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=votre_business_account_id
```

## Comment obtenir les credentials

### 1. WHATSAPP_PHONE_NUMBER_ID
- Connectez-vous à [Facebook Developers](https://developers.facebook.com/)
- Créez une application WhatsApp Business
- Dans la section WhatsApp > Configuration, trouvez votre "Phone Number ID"

### 2. WHATSAPP_ACCESS_TOKEN
- Dans votre application Facebook, allez dans WhatsApp > Configuration
- Générez un token d'accès permanent
- **Important** : Utilisez un token permanent, pas temporaire

### 3. WHATSAPP_BUSINESS_ACCOUNT_ID
- Dans la section WhatsApp > Configuration
- Trouvez votre "WhatsApp Business Account ID"

## Endpoints modifiés

### **NOUVEAU : Vérification et envoi - `/api/whatsapp/verify-and-send`**
```json
{
  "phoneNumber": "+33668118966",
  "message": "Votre rendez-vous est confirmé",
  "linkPreview": true,
  "cacheResult": true
}
```

**Réponses possibles :**

**✅ Succès WhatsApp :**
```json
{
  "success": true,
  "hasWhatsApp": true,
  "messageDelivered": true,
  "method": "whatsapp",
  "phoneNumber": "+33668118966"
}
```

**❌ Numéro sans WhatsApp :**
```json
{
  "success": false,
  "hasWhatsApp": false,
  "messageDelivered": false,
  "error": "Numéro non enregistré sur WhatsApp",
  "errorCode": 131026,
  "recommendation": "Utilisez SMS pour contacter ce numéro"
}
```

**⚠️ Erreur technique :**
```json
{
  "success": false,
  "hasWhatsApp": "unknown",
  "messageDelivered": false,
  "error": "Erreur lors de l'envoi WhatsApp",
  "errorCode": 130429,
  "recommendation": "Vérifiez la configuration WhatsApp ou réessayez plus tard"
}
```

### 1. Messages texte - `/api/whatsapp`
**Avant (Evolution API) :**
```json
{
  "phoneNumber": "+33668118966",
  "message": "Bonjour !",
  "delay": 1000,
  "linkPreview": true
}
```

**Après (API officielle) :**
```json
{
  "phoneNumber": "+33668118966",
  "message": "Bonjour !",
  "linkPreview": true
}
```

### 2. Médias - `/api/whatsapp/media`
**Avant :**
```json
{
  "phoneNumber": "+33668118966",
  "productId": "123",
  "caption": "Voici votre produit",
  "delay": 1000
}
```

**Après :**
```json
{
  "phoneNumber": "+33668118966",
  "productIdentifier": "123",
  "caption": "Voici votre produit"
}
```

### 3. Boutons - `/api/whatsapp/buttons`
**Avant :**
```json
{
  "phoneNumber": "+33668118966",
  "title": "Choisissez une option",
  "footer": "Shugamade",
  "buttons": [
    {
      "title": "Option 1",
      "displayText": "Option 1",
      "id": "opt1",
      "type": "reply"
    }
  ]
}
```

**Après :**
```json
{
  "phoneNumber": "+33668118966",
  "title": "Choisissez une option",
  "footer": "Shugamade",
  "buttons": [
    {
      "title": "Option 1",
      "id": "opt1"
    }
  ]
}
```

### 4. Listes - `/api/whatsapp/list`
**Avant :**
```json
{
  "phoneNumber": "+33668118966",
  "title": "Nos produits",
  "buttonText": "Voir la liste",
  "sections": [
    {
      "title": "Catégorie 1",
      "rows": [
        {
          "title": "Produit 1",
          "description": "Description",
          "rowId": "prod1"
        }
      ]
    }
  ]
}
```

**Après (même format) :**
```json
{
  "phoneNumber": "+33668118966",
  "title": "Nos produits",
  "buttonText": "Voir la liste",
  "sections": [
    {
      "title": "Catégorie 1",
      "rows": [
        {
          "title": "Produit 1",
          "description": "Description",
          "rowId": "prod1"
        }
      ]
    }
  ]
}
```

## Fonctionnalités supprimées

### ❌ 1. Vérification de numéros WhatsApp
L'endpoint `/api/whatsapp/check` a été **supprimé** car l'API officielle ne propose pas cette fonctionnalité.

**✅ Remplacement :**
- Utilisez `/api/whatsapp/verify-and-send` qui combine vérification et envoi
- Implémentez une logique de fallback SMS automatique

### ❌ 2. Sondages
L'endpoint `/api/whatsapp/poll` n'est plus disponible car l'API officielle ne supporte pas les sondages.

**Alternative :**
- Utilisez des boutons ou des listes pour créer des interactions similaires

### 3. Profil WhatsApp
L'endpoint `/api/whatsapp/profile` a été supprimé.

## Nouvelles fonctionnalités

### 1. Statut amélioré - `/api/whatsapp/status`
Le nouveau endpoint de statut fournit des informations détaillées :
- Statut du numéro de téléphone
- Informations du compte business
- Test de connectivité
- Évaluation de la qualité

## Format des numéros de téléphone

### Avant (Evolution API)
- Nécessitait le préfixe `+`
- Format : `+33668118966`

### Après (API officielle) - ✅ CONFORME À LA DOCUMENTATION
- **Recommande fortement** l'inclusion du préfixe `+` et du code pays
- Le `+` est automatiquement ajouté s'il est manquant
- Format recommandé : `+33668118966`
- Format interne conservé : `+33668118966`

**Note importante** : La documentation officielle WhatsApp indique : *"We highly recommend that you include both the plus sign and country calling code when sending a message to a customer. If the plus sign is omitted, your business phone number's country calling code is prepended to the customer's phone number. This can result in undelivered or misdelivered messages."*

## Gestion des erreurs

### Avant
```json
{
  "success": false,
  "error": "Échec de l'envoi du message WhatsApp",
  "details": "Error text"
}
```

### Après
```json
{
  "success": false,
  "error": "Échec de l'envoi du message WhatsApp",
  "details": {
    "error": {
      "message": "Message d'erreur détaillé",
      "type": "OAuthException",
      "code": 190
    }
  },
  "statusCode": 400
}
```

## Limites de l'API officielle

### Messages
- **Templates requis** : Pour les nouveaux contacts, vous devez utiliser des templates approuvés
- **Fenêtre de 24h** : Après qu'un utilisateur vous écrit, vous avez 24h pour envoyer des messages libres

### Boutons
- **Maximum 3 boutons** par message
- **20 caractères maximum** par titre de bouton

### Listes
- **Maximum 10 sections** par liste
- **Maximum 10 lignes** par section
- **24 caractères maximum** pour les titres de ligne
- **72 caractères maximum** pour les descriptions

## Test de la migration

1. **Vérifiez le statut** :
```bash
curl -X GET http://localhost:3000/api/whatsapp/status
```

2. **Testez un message simple** :
```bash
curl -X POST http://localhost:3000/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "33668118966", "message": "Test API officielle"}'
```

3. **Testez un média** :
```bash
curl -X POST http://localhost:3000/api/whatsapp/media \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "33668118966", "productIdentifier": "1"}'
```

## Avantages de la migration

1. **Fiabilité** : API officielle de Meta, plus stable
2. **Support** : Support officiel de WhatsApp Business
3. **Fonctionnalités** : Accès aux dernières fonctionnalités WhatsApp
4. **Conformité** : Respect des politiques officielles WhatsApp
5. **Évolutivité** : Meilleure gestion des gros volumes

## Points d'attention

1. **Templates** : Préparez vos templates de messages pour les nouveaux contacts
2. **Webhook** : Configurez les webhooks pour recevoir les réponses
3. **Monitoring** : Surveillez la qualité de votre numéro (quality_rating)
4. **Limites** : Respectez les limites de débit de l'API

## Support

Pour toute question sur la migration :
1. Consultez la [documentation officielle WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
2. Vérifiez les logs de votre application
3. Utilisez l'endpoint `/api/whatsapp/status` pour diagnostiquer les problèmes 

## Conformité technique détaillée

### ✅ Structure des requêtes
- **URL** : `https://graph.facebook.com/v22.0/{phone-number-id}/messages` ✅
- **Headers** : `Authorization: Bearer {token}`, `Content-Type: application/json` ✅
- **Payload de base** : `messaging_product: "whatsapp"`, `recipient_type: "individual"`, `to: "..."`, `type: "..."` ✅

### ✅ Messages texte
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+33668118966",
  "type": "text",
  "text": {
    "body": "Message content",
    "preview_url": true
  }
}
```

### ✅ Messages image
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual", 
  "to": "+33668118966",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "Image caption"
  }
}
```

### ✅ Boutons interactifs
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+33668118966", 
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": { "text": "Choose an option" },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": { "id": "btn1", "title": "Option 1" }
        }
      ]
    }
  }
}
```

### ✅ Listes interactives
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+33668118966",
  "type": "interactive", 
  "interactive": {
    "type": "list",
    "body": { "text": "Select from list" },
    "action": {
      "button": "View List",
      "sections": [
        {
          "title": "Section 1",
          "rows": [
            {
              "id": "row1",
              "title": "Row 1",
              "description": "Description"
            }
          ]
        }
      ]
    }
  }
}
```

## Gestion des erreurs spécifiques

### **Code 131026 - Message Undeliverable**
```json
{
  "error": {
    "code": 131026,
    "message": "Message Undeliverable",
    "details": "Unable to deliver message. Reasons can include: The recipient phone number is not a WhatsApp phone number..."
  }
}
```

**Action recommandée :** Marquer le numéro comme "sans WhatsApp" et utiliser SMS.

### **Autres codes d'erreur importants**
- **130429** : Rate limit hit → Réessayer plus tard
- **131047** : Re-engagement message → Utiliser un template
- **131050** : User stopped marketing messages → Ne plus envoyer

## Migration du code existant

### **Avant (avec vérification)**
```javascript
// Ancien code avec API Evolution
const checkResponse = await fetch('/api/whatsapp/check', {
  method: 'POST',
  body: JSON.stringify({ phoneNumber })
});

if (checkResponse.isWhatsApp) {
  await fetch('/api/whatsapp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, message })
  });
} else {
  // Envoyer SMS
}
```

### **Après (nouvelle approche)**
```javascript
// Nouveau code avec API officielle
const response = await fetch('/api/whatsapp/verify-and-send', {
  method: 'POST',
  body: JSON.stringify({ phoneNumber, message })
});

if (!response.success && response.hasWhatsApp === false) {
  // Envoyer SMS automatiquement
  await sendSMS(phoneNumber, message);
}
```

## Test de la nouvelle fonctionnalité

1. **Créer la table de cache** :
```bash
psql -d votre_db -f database/whatsapp_status_cache.sql
```

2. **Tester avec un numéro WhatsApp** :
```bash
curl -X POST http://localhost:3000/api/whatsapp/verify-and-send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+33668118966", "message": "Test"}'
```

3. **Tester avec un numéro sans WhatsApp** :
```bash
curl -X POST http://localhost:3000/api/whatsapp/verify-and-send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+33123456789", "message": "Test"}'
```

## Recommandations d'implémentation

1. **Logique de notification** :
   ```javascript
   async function sendNotification(phoneNumber, message) {
     const whatsappResult = await tryWhatsApp(phoneNumber, message);
     
     if (!whatsappResult.success && whatsappResult.hasWhatsApp === false) {
       return await sendSMS(phoneNumber, message);
     }
     
     return whatsappResult;
   }
   ```

2. **Gestion du cache** :
   - Les résultats sont cachés 7 jours
   - Utilisez `cacheResult: false` pour forcer une nouvelle vérification
   - Surveillez la table `whatsapp_status_cache` pour les statistiques

3. **Monitoring** :
   - Surveillez les codes d'erreur 131026 (numéros sans WhatsApp)
   - Trackez le ratio WhatsApp vs SMS
   - Alertes sur les erreurs de configuration (130429, etc.)

## Points d'attention

1. **Templates** : Préparez vos templates de messages pour les nouveaux contacts
2. **Webhook** : Configurez les webhooks pour recevoir les réponses
3. **Monitoring** : Surveillez la qualité de votre numéro (quality_rating)
4. **Limites** : Respectez les limites de débit de l'API

## Support

Pour toute question sur la migration :
1. Consultez la [documentation officielle WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
2. Vérifiez les logs de votre application
3. Utilisez l'endpoint `/api/whatsapp/status` pour diagnostiquer les problèmes 

## Conformité technique détaillée

### ✅ Structure des requêtes
- **URL** : `https://graph.facebook.com/v22.0/{phone-number-id}/messages` ✅
- **Headers** : `Authorization: Bearer {token}`, `Content-Type: application/json` ✅
- **Payload de base** : `messaging_product: "whatsapp"`, `recipient_type: "individual"`, `to: "..."`, `type: "..."` ✅

### ✅ Messages texte
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+33668118966",
  "type": "text",
  "text": {
    "body": "Message content",
    "preview_url": true
  }
}
```

### ✅ Messages image
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual", 
  "to": "+33668118966",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "Image caption"
  }
}
```

### ✅ Boutons interactifs
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+33668118966", 
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": { "text": "Choose an option" },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": { "id": "btn1", "title": "Option 1" }
        }
      ]
    }
  }
}
```

### ✅ Listes interactives
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+33668118966",
  "type": "interactive", 
  "interactive": {
    "type": "list",
    "body": { "text": "Select from list" },
    "action": {
      "button": "View List",
      "sections": [
        {
          "title": "Section 1",
          "rows": [
            {
              "id": "row1",
              "title": "Row 1",
              "description": "Description"
            }
          ]
        }
      ]
    }
  }
}
``` 