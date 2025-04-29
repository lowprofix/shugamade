# API de Réservation ShugaMade

Cette API permet de gérer les réservations pour les différents lieux de ShugaMade. Elle prend en charge les réservations individuelles et les réservations multiples (packs).

## Structure des données

### Réservation (Booking)

```typescript
{
  id: string;
  locationId: number;
  start: Date;
  end: Date;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}
```

### Demande de réservation (BookingRequest)

```typescript
{
  locationId: number;
  start: Date | string; // Format ISO
  end: Date | string;   // Format ISO
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
}
```

### Demande de réservations multiples (MultipleBookingRequest)

```typescript
{
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  locationId: number;
  packageName: string;
  packageDescription?: string;
  bookings: {
    title: string;
    start: string; // Format ISO
    end: string;   // Format ISO
    description?: string;
  }[];
}
```

## Endpoints

### Réservations

- `GET /api/bookings` - Récupérer toutes les réservations

  - Paramètres de requête:
    - `locationId`: Filtrer par lieu
    - `startDate`: Date de début (format ISO)
    - `endDate`: Date de fin (format ISO)
    - `status`: Filtrer par statut ("confirmed", "pending", "cancelled")

- `POST /api/bookings` - Créer une nouvelle réservation

  - Corps: `BookingRequest`

- `POST /api/bookings` - Créer des réservations multiples (pack)
  - En-tête: `Content-Type: application/json; multiple-booking=true`
  - Corps: `MultipleBookingRequest`

### Réservation individuelle

- `GET /api/bookings/:id` - Récupérer une réservation spécifique
- `PUT /api/bookings/:id` - Mettre à jour une réservation complète
  - Corps: `BookingRequest`
- `PATCH /api/bookings/:id` - Mettre à jour partiellement une réservation
  - Corps: Objet partiel de `BookingRequest`
- `DELETE /api/bookings/:id` - Supprimer une réservation

### Statut

- `PUT /api/bookings/:id/status` - Mettre à jour le statut d'une réservation
  - Corps: `{ status: "confirmed" | "pending" | "cancelled" }`

### Disponibilité

- `POST /api/bookings/availability` - Vérifier la disponibilité d'un créneau
  - Corps:
    ```typescript
    {
      locationId: number;
      start: string; // Format ISO
      end: string; // Format ISO
    }
    ```
  - Réponse:
    ```typescript
    {
      available: boolean;
      reason?: "CLOSED_DAY" | "OUTSIDE_HOURS" | "ALREADY_BOOKED" | "INVALID_LOCATION";
      conflictingBookingId?: string;
    }
    ```

## Codes de statut HTTP

- `200 OK` - Requête réussie
- `201 Created` - Ressource créée avec succès
- `400 Bad Request` - Requête invalide (données manquantes ou incorrectes)
- `404 Not Found` - Ressource non trouvée
- `409 Conflict` - Conflit (créneau non disponible)
- `500 Internal Server Error` - Erreur serveur

## Exemples d'utilisation

### Créer une réservation

```javascript
fetch("/api/bookings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    locationId: 1,
    start: "2024-07-15T10:00:00.000Z",
    end: "2024-07-15T11:00:00.000Z",
    clientName: "Marie Dupont",
    clientPhone: "+242 06 123 45 67",
    clientEmail: "marie@exemple.com",
    notes: "Première consultation",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### Vérifier la disponibilité

```javascript
fetch("/api/bookings/availability", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    locationId: 1,
    start: "2024-07-15T10:00:00.000Z",
    end: "2024-07-15T11:00:00.000Z",
  }),
})
  .then((response) => response.json())
  .then((data) => {
    if (data.available) {
      console.log("Créneau disponible");
    } else {
      console.log("Créneau non disponible:", data.reason);
    }
  });
```

### Créer des réservations multiples (pack)

```javascript
fetch("/api/bookings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; multiple-booking=true",
  },
  body: JSON.stringify({
    clientName: "Marie Dupont",
    clientPhone: "+242 06 123 45 67",
    clientEmail: "marie@exemple.com",
    locationId: 1,
    packageName: "Promo 4 séances - Tempes",
    packageDescription:
      "Pack promotionnel de 4 séances de traitement des tempes",
    bookings: [
      {
        title: "Séance 1",
        start: "2024-07-15T10:00:00.000Z",
        end: "2024-07-15T11:00:00.000Z",
        description: "Première séance du pack",
      },
      {
        title: "Séance 2",
        start: "2024-07-22T10:00:00.000Z",
        end: "2024-07-22T11:00:00.000Z",
        description: "Deuxième séance du pack",
      },
      {
        title: "Séance 3",
        start: "2024-07-29T10:00:00.000Z",
        end: "2024-07-29T11:00:00.000Z",
        description: "Troisième séance du pack",
      },
      {
        title: "Séance 4",
        start: "2024-08-05T10:00:00.000Z",
        end: "2024-08-05T11:00:00.000Z",
        description: "Dernière séance du pack",
      },
    ],
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```
