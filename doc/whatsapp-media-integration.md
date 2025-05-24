# Intégration WhatsApp Media avec Supabase

Cette documentation explique comment utiliser le système d'envoi d'images de produits via WhatsApp en utilisant l'API Evolution et la base de données Supabase.

## Architecture

Le système est composé de trois parties principales :

1. **Route API** (`/api/whatsapp/media`) - Endpoint pour envoyer des médias via WhatsApp
2. **Intégration Supabase** (`/lib/whatsapp/media-integration.ts`) - Fonctions utilitaires pour gérer les produits
3. **Base de données Supabase** - Table `products` contenant les informations des produits

## Structure de la base de données

### Table `products`

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  hiboutik_id INTEGER,
  name VARCHAR NOT NULL,
  description TEXT,
  price VARCHAR,
  image VARCHAR,
  category VARCHAR,
  stock INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  last_sync_status TEXT DEFAULT 'pending'
);
```

## Variables d'environnement requises

```env
# API Evolution
EVOLUTION_API_SERVER=https://your-evolution-api-server.com
EVOLUTION_API_INSTANCE=your-instance-name
EVOLUTION_API_KEY=your-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Base URL de votre application
NEXT_PUBLIC_BASE_URL=https://your-app.com
```

## Utilisation

### 1. Envoi d'une image de produit simple

```typescript
import { sendProductImageWhatsApp } from '@/lib/whatsapp/media-integration';

// Envoyer l'image du produit ID 123 au numéro +33123456789
const result = await sendProductImageWhatsApp(
  '+33123456789',
  123
);

if (result.success) {
  console.log('Image envoyée avec succès !');
} else {
  console.error('Erreur:', result.error);
}
```

### 2. Envoi avec caption personnalisée

```typescript
const result = await sendProductImageWhatsApp(
  '+33123456789',
  123,
  'Voici notre produit phare ! Disponible maintenant 🎉',
  2000 // délai de 2 secondes
);
```

### 3. Envoi de plusieurs produits

```typescript
import { sendMultipleProductImages } from '@/lib/whatsapp/media-integration';

const results = await sendMultipleProductImages(
  '+33123456789',
  [123, 124, 125], // IDs des produits
  3000 // délai de 3 secondes entre chaque envoi
);

// Vérifier les résultats
results.forEach((result, index) => {
  if (result.success) {
    console.log(`Produit ${index + 1} envoyé avec succès`);
  } else {
    console.error(`Erreur produit ${index + 1}:`, result.error);
  }
});
```

### 4. Recherche et envoi par critères

```typescript
import { sendProductImagesBySearch } from '@/lib/whatsapp/media-integration';

const result = await sendProductImagesBySearch(
  '+33123456789',
  {
    name: 'smartphone',        // Recherche dans le nom
    category: 'electronique',  // Catégorie spécifique
    priceMin: 100,            // Prix minimum
    priceMax: 500,            // Prix maximum
    inStock: true,            // Seulement les produits en stock
    isAvailable: true         // Seulement les produits disponibles
  },
  3 // Maximum 3 résultats
);
```

### 5. Récupération de produits

```typescript
import { 
  getAvailableProductsWithImages, 
  getProductsByCategory 
} from '@/lib/whatsapp/media-integration';

// Tous les produits disponibles avec images
const availableProducts = await getAvailableProductsWithImages();

// Produits d'une catégorie spécifique
const electronicsProducts = await getProductsByCategory('electronique');
```

## API Endpoint

### POST `/api/whatsapp/media`

Envoie une image de produit via WhatsApp.

#### Paramètres

```typescript
{
  phoneNumber: string;    // Numéro de téléphone (format international)
  productId: number;      // ID du produit dans Supabase
  caption?: string;       // Caption personnalisée (optionnel)
  delay?: number;         // Délai en millisecondes (optionnel, défaut: 1000)
}
```

#### Exemple de requête

```bash
curl -X POST https://your-app.com/api/whatsapp/media \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+33123456789",
    "productId": 123,
    "caption": "Découvrez notre nouveau produit !",
    "delay": 1000
  }'
```

#### Réponse de succès

```json
{
  "success": true,
  "message": "Média WhatsApp envoyé avec succès",
  "product": {
    "id": 123,
    "name": "Smartphone XYZ",
    "image_url": "https://example.com/image.jpg",
    "category": "electronique",
    "stock": 5,
    "price": "299"
  },
  "data": {
    "key": {
      "remoteJid": "33123456789@s.whatsapp.net",
      "fromMe": true,
      "id": "BAE5F5A632EAE722"
    },
    "message": {
      "imageMessage": {
        "url": "https://mmg.whatsapp.net/...",
        "caption": "📦 *Smartphone XYZ*\n\n..."
      }
    }
  }
}
```

#### Réponse d'erreur

```json
{
  "success": false,
  "error": "Le numéro n'est pas enregistré sur WhatsApp",
  "whatsapp": false,
  "phoneNumber": "+33123456789"
}
```

## Gestion des erreurs

Le système gère plusieurs types d'erreurs :

1. **Numéro non WhatsApp** - Le numéro n'est pas enregistré sur WhatsApp
2. **Produit non trouvé** - L'ID du produit n'existe pas dans Supabase
3. **Produit indisponible** - Le produit est marqué comme non disponible
4. **Image manquante** - Aucune image n'est associée au produit
5. **Erreur API Evolution** - Problème avec l'API Evolution
6. **Erreur Supabase** - Problème de connexion à la base de données

## Format des captions automatiques

Les captions sont générées automatiquement avec les informations suivantes :

```
🛍️ *Nom du produit*

📝 Description du produit

💰 Prix: 299€

📦 Stock disponible: 5 unités

🏷️ Catégorie: electronique

🆔 Référence: 123
🔗 ID Hiboutik: 456
🏪 Shugamade - Votre boutique de confiance
```

## Bonnes pratiques

1. **Délais entre messages** - Utilisez des délais appropriés pour éviter le spam
2. **Vérification des numéros** - Le système vérifie automatiquement si le numéro est sur WhatsApp
3. **Gestion des erreurs** - Toujours vérifier le champ `success` dans les réponses
4. **Limitation des envois** - Limitez le nombre de produits envoyés simultanément
5. **Images optimisées** - Assurez-vous que les URLs d'images sont accessibles et optimisées

## Exemples d'intégration

### Dans un composant React

```typescript
'use client';

import { useState } from 'react';
import { sendProductImageWhatsApp } from '@/lib/whatsapp/media-integration';

export default function ProductShare({ productId }: { productId: number }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    setLoading(true);
    setMessage('');

    try {
      const result = await sendProductImageWhatsApp(phoneNumber, productId);
      
      if (result.success) {
        setMessage('Image envoyée avec succès !');
      } else {
        setMessage(`Erreur: ${result.error}`);
      }
    } catch (error) {
      setMessage('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="tel"
        placeholder="+33123456789"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Envoi...' : 'Envoyer via WhatsApp'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
```

### Dans une API Route

```typescript
// app/api/send-product/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendProductImageWhatsApp } from '@/lib/whatsapp/media-integration';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, productId } = await request.json();
    
    const result = await sendProductImageWhatsApp(phoneNumber, productId);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

## Dépannage

### Problèmes courants

1. **"Configuration serveur incomplète"**
   - Vérifiez les variables d'environnement Evolution API

2. **"Produit non trouvé"**
   - Vérifiez que l'ID du produit existe dans Supabase
   - Vérifiez la connexion à Supabase

3. **"Aucune image disponible"**
   - Assurez-vous que le champ `image` contient une URL valide
   - Vérifiez que l'image est accessible publiquement

4. **"Le numéro n'est pas enregistré sur WhatsApp"**
   - Vérifiez le format du numéro (international avec +)
   - Assurez-vous que le numéro est bien sur WhatsApp

### Logs de débogage

Le système génère des logs détaillés pour faciliter le débogage :

```typescript
console.log("Envoi de média WhatsApp:", {
  phoneNumber: "+33123456789",
  productId: 123,
  media: "https://example.com/image.jpg..."
});
```

## Sécurité

- Les clés API sont stockées dans les variables d'environnement
- Validation des numéros de téléphone
- Vérification de l'existence des produits
- Gestion des erreurs sans exposition d'informations sensibles 