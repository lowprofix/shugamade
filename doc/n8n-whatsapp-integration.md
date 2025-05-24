# Intégration n8n WhatsApp Media - Shugamade

Cette documentation explique comment utiliser les nouvelles fonctionnalités d'envoi d'images de produits via WhatsApp dans votre workflow n8n.

## 🆕 Nouveaux nœuds disponibles

### 1. `send_product_image_whatsapp`
**Description :** Envoie l'image d'un produit spécifique via WhatsApp avec caption enrichie.

**Paramètres :**
- `phoneNumber` (string) : Numéro WhatsApp du destinataire (format international avec +)
- `productIdentifier` (string) : Identifiant flexible du produit (voir détails ci-dessous)
- `caption` (string, optionnel) : Caption personnalisée
- `delay` (number, optionnel) : Délai avant envoi en ms (défaut: 1000)

**🔍 Recherche intelligente de produits :**
Le paramètre `productIdentifier` accepte plusieurs formats :
- **ID Supabase** : `27` (numérique)
- **hiboutik_id** : `1234` (numérique) 
- **Nom du produit** : `"Dermaroller 0,5mm"` (recherche partielle insensible à la casse)
- **Nom partiel** : `"spray"` (trouvera "Spray coup de pep's")

L'API essaie automatiquement ces méthodes dans l'ordre jusqu'à trouver le produit.

**Exemple d'utilisation :**
```json
{
  "phoneNumber": "+33668118966",
  "productIdentifier": "Dermaroller 0,5mm",
  "caption": "Découvrez notre produit phare !",
  "delay": 1000
}
```

**Autres exemples valides :**
```json
// Par ID Supabase
{"phoneNumber": "+33668118966", "productIdentifier": "27"}

// Par hiboutik_id  
{"phoneNumber": "+33668118966", "productIdentifier": "1234"}

// Par nom exact
{"phoneNumber": "+33668118966", "productIdentifier": "Spray coup de pep's 100ml"}

// Par nom partiel
{"phoneNumber": "+33668118966", "productIdentifier": "dermaroller"}
```

### 2. `send_multiple_product_images_whatsapp`
**Description :** Envoie plusieurs images de produits en séquence avec délai entre chaque envoi.

**Paramètres :**
- `phoneNumber` (string) : Numéro WhatsApp du destinataire
- `productIds` (string) : Liste des IDs au format JSON string (ex: "[27,28,29]")
- `delayBetweenMessages` (number, optionnel) : Délai entre messages en ms (défaut: 2000)

**Exemple d'utilisation :**
```json
{
  "phoneNumber": "+33668118966",
  "productIds": "[27,28,29]",
  "delayBetweenMessages": 3000
}
```

⚠️ **Important :** Le paramètre `productIds` doit être fourni comme une chaîne JSON, pas un tableau direct.

### 3. `search_and_send_product_images_whatsapp`
**Description :** Recherche des produits selon des critères et envoie leurs images.

**Paramètres :**
- `phoneNumber` (string) : Numéro WhatsApp du destinataire
- `searchCriteria` (string) : Critères de recherche au format JSON string
- `maxResults` (number, optionnel) : Nombre max de résultats (défaut: 5)

**Format des critères de recherche (JSON string) :**
```json
"{\"name\":\"spray\",\"category\":\"supplements\",\"priceMin\":10,\"priceMax\":50,\"inStock\":true,\"isAvailable\":true}"
```

**Critères disponibles :**
- `name` : Recherche dans le nom du produit
- `category` : Catégorie spécifique (supplements, oils, accessories)
- `priceMin` : Prix minimum en euros
- `priceMax` : Prix maximum en euros
- `inStock` : Seulement les produits en stock (true/false)
- `isAvailable` : Seulement les produits disponibles (true/false)

⚠️ **Important :** Le paramètre `searchCriteria` doit être fourni comme une chaîne JSON échappée.

## 🔄 Amélioration du nœud `get_products`

Le nœud `get_products` retourne maintenant des informations enrichies pour l'intégration WhatsApp :

### Nouvelle structure de réponse :

```json
{
  "products": [
    {
      "id": 27,
      "name": "Spray coup de pep's 100ml",
      "description": "...",
      "price": "25",
      "image": "https://...",
      "category": "supplements",
      "stock": 15,
      "is_available": true,
      
      // 🆕 Nouvelles propriétés pour WhatsApp
      "whatsapp_ready": true,           // Prêt pour envoi WhatsApp
      "image_available": true,          // Image disponible
      "stock_status": "in_stock",       // Statut du stock
      "can_send_whatsapp": true,        // Peut être envoyé via WhatsApp
      "display_price": "25€",           // Prix formaté
      "stock_label": "15 en stock"      // Label de stock
    }
  ],
  "summary": {
    "total": 30,
    "with_images": 25,
    "whatsapp_ready": 20,
    "in_stock": 18,
    "available": 22
  },
  "whatsapp_integration": {
    "endpoint": "/api/whatsapp/media",
    "methods": {
      "single": "POST /api/whatsapp/media",
      "multiple": "POST /api/whatsapp/media/multiple",
      "search": "POST /api/whatsapp/media/search"
    }
  }
}
```

## 🎯 Cas d'usage dans n8n

### 1. Envoi d'un produit spécifique
```
Client demande "Dermaroller" → send_product_image_whatsapp avec productIdentifier: "dermaroller"
```

### 2. Envoi de produits par catégorie
```
Client demande "supplements" → search_and_send_product_images_whatsapp avec criteria JSON
```

### 3. Envoi de nouveautés en stock
```
Trigger quotidien → get_products → Filtrer whatsapp_ready=true → send_multiple_product_images_whatsapp
```

### 4. Recommandations personnalisées
```
Analyse client → get_products → Logique de recommandation → send_multiple_product_images_whatsapp
```

## 📋 Workflow d'exemple

### Scénario : Client demande un produit spécifique

```json
{
  "nodes": [
    {
      "name": "Trigger",
      "type": "webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "product-request"
      }
    },
    {
      "name": "Extract Product Name",
      "type": "code",
      "parameters": {
        "jsCode": "const productName = $input.first().json.productName || 'dermaroller';\nconst phoneNumber = $input.first().json.phoneNumber;\nreturn [{ productName, phoneNumber }];"
      }
    },
    {
      "name": "Send Product Image",
      "type": "send_product_image_whatsapp",
      "parameters": {
        "phoneNumber": "={{ $json.phoneNumber }}",
        "productIdentifier": "={{ $json.productName }}",
        "delay": 1000
      }
    }
  ]
}
```

## 🔍 Filtrage intelligent des produits

### Utiliser les nouvelles propriétés pour filtrer :

```javascript
// Dans un nœud Code, filtrer les produits prêts pour WhatsApp
const products = $input.first().json.products;
const whatsappReady = products.filter(p => p.whatsapp_ready);
const inStock = products.filter(p => p.stock_status === 'in_stock');
const withImages = products.filter(p => p.image_available);

// Préparer les IDs pour envoi multiple
const productIds = whatsappReady.slice(0, 5).map(p => p.id);

return [{
  phoneNumber: "+33668118966",
  productIds: JSON.stringify(productIds), // ⚠️ Important: JSON.stringify
  delayBetweenMessages: 2000
}];
```

## ⚡ Optimisations et bonnes pratiques

### 1. Limitation des envois
- Maximum 10 produits par envoi multiple
- Délai minimum de 1 seconde entre messages
- Vérification automatique des numéros WhatsApp

### 2. Gestion des erreurs
```javascript
// Vérifier le succès de l'envoi
if ($json.success) {
  console.log(`✅ ${$json.message}`);
} else {
  console.error(`❌ Erreur: ${$json.error}`);
  // L'erreur contient maintenant des détails sur la recherche
  console.log(`Identifiant recherché: ${$json.searchedIdentifier}`);
}
```

### 3. Recherche flexible de produits
```javascript
// Utiliser différents types d'identifiants
const productRequests = [
  { phoneNumber: "+33668118966", productIdentifier: "27" }, // ID Supabase
  { phoneNumber: "+33668118966", productIdentifier: "1234" }, // hiboutik_id
  { phoneNumber: "+33668118966", productIdentifier: "Dermaroller" }, // Nom
  { phoneNumber: "+33668118966", productIdentifier: "spray" } // Nom partiel
];

return productRequests;
```

### 4. Préparation des critères de recherche
```javascript
// Générer des critères de recherche dynamiques
const category = $json.requestedCategory || 'supplements';
const priceMax = $json.budget || 50;

const searchCriteria = JSON.stringify({
  category: category,
  priceMax: priceMax,
  isAvailable: true,
  inStock: true
});

return { 
  phoneNumber: "+33668118966",
  searchCriteria: searchCriteria,
  maxResults: 5
};
```

### 5. Préparation des IDs multiples
```javascript
// Préparer une liste d'IDs pour envoi multiple
const selectedProducts = [27, 28, 29, 30];
const productIds = JSON.stringify(selectedProducts);

return { 
  phoneNumber: "+33668118966",
  productIds: productIds,
  delayBetweenMessages: 3000
};
```

## 🔧 Configuration requise

### Variables d'environnement
```env
# API Evolution (déjà configuré)
EVOLUTION_API_SERVER=https://your-evolution-server.com
EVOLUTION_API_INSTANCE=your-instance
EVOLUTION_API_KEY=your-api-key

# Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Endpoints disponibles
- `GET /api/products` - Liste enrichie des produits
- `POST /api/whatsapp/media` - Envoi simple avec recherche intelligente
- `POST /api/whatsapp/media/multiple` - Envoi multiple
- `POST /api/whatsapp/media/search` - Recherche et envoi

## 📊 Monitoring et analytics

### Suivre les performances d'envoi :
```javascript
// Dans un nœud Code après envoi
const result = $input.first().json;

if (result.summary) {
  console.log(`📊 Statistiques d'envoi:
  - Total: ${result.summary.total}
  - Succès: ${result.summary.success}
  - Échecs: ${result.summary.failed}`);
}

// Logger pour analytics
return {
  timestamp: new Date().toISOString(),
  phoneNumber: result.phoneNumber,
  success: result.success,
  productCount: result.summary?.total || 1,
  searchedIdentifier: result.searchedIdentifier
};
```

## 🚀 Mise en production

1. **Tester les workflows** avec des numéros de test
2. **Configurer les délais** appropriés pour éviter le spam
3. **Monitorer les logs** pour détecter les erreurs
4. **Optimiser les critères** de recherche selon les retours clients

## ⚠️ Points d'attention

### Recherche de produits
- ✅ Utilisez `productIdentifier` pour une recherche flexible
- ✅ L'API essaie automatiquement : ID → hiboutik_id → nom → nom partiel
- ✅ Les messages d'erreur indiquent l'identifiant recherché
- ❌ Évitez les identifiants trop génériques (ex: "a", "1")

### Format JSON String
Les paramètres complexes (`productIds`, `searchCriteria`) doivent être fournis comme des chaînes JSON :
- ✅ `"[27,28,29]"` pour productIds
- ✅ `"{\"category\":\"supplements\"}"` pour searchCriteria
- ❌ `[27,28,29]` (tableau direct)
- ❌ `{category: "supplements"}` (objet direct)

### Échappement des guillemets
Dans les critères de recherche JSON, utilisez `\"` pour échapper les guillemets :
```javascript
const criteria = JSON.stringify({name: "spray", category: "supplements"});
// Résultat: "{\"name\":\"spray\",\"category\":\"supplements\"}"
```

## 🎉 Avantages de la recherche intelligente

1. **Plus de flexibilité** : L'IA peut utiliser des noms de produits au lieu d'IDs
2. **Moins d'erreurs** : Recherche automatique par plusieurs critères
3. **Meilleure UX** : Messages d'erreur détaillés avec contexte
4. **Rétrocompatibilité** : Fonctionne avec les anciens workflows

Cette intégration permet maintenant d'envoyer automatiquement des images de produits via WhatsApp directement depuis vos workflows n8n, avec une gestion intelligente des stocks, des prix et de la disponibilité !