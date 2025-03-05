# Intégration Cal.com dans votre projet

Ce document explique comment utiliser l'intégration Cal.com qui a été ajoutée à votre projet.

## Présentation

[Cal.com](https://cal.com) est une plateforme de planification open-source qui vous permet de gérer vos rendez-vous et disponibilités. L'intégration ajoutée à votre projet vous permet d'afficher votre calendrier Cal.com directement dans votre application Next.js de deux façons différentes:

1. **Mode Inline** - Affiche le calendrier directement intégré dans votre page
2. **Mode Popup** - Affiche un bouton qui ouvre le calendrier dans une fenêtre popup quand on clique dessus

## Composants disponibles

Deux composants ont été créés:

### `CalendarWidget`

Ce composant permet d'intégrer le calendrier directement dans la page.

```tsx
import CalendarWidget from '@/components/CalendarWidget';

// Dans votre composant/page:
<CalendarWidget 
  calLink="votre-username/event-type" 
  style={{ height: '700px' }} 
/>
```

### `CalendarPopup`

Ce composant crée un bouton qui, lorsqu'on clique dessus, ouvre une fenêtre popup avec le calendrier.

```tsx
import CalendarPopup from '@/components/CalendarPopup';

// Dans votre composant/page:
<CalendarPopup 
  calLink="votre-username/event-type" 
  buttonText="Prendre rendez-vous" 
  buttonClassName="bg-blue-600 text-white px-4 py-2 rounded" 
/>
```

## Page de démonstration

Une page de démonstration a été créée à l'adresse `/calendar` qui montre les deux modes d'intégration (inline et popup). Vous pouvez la consulter pour voir comment les composants fonctionnent et se comportent.

## Configuration de votre lien Cal.com

Pour que l'intégration fonctionne, vous devez:

1. Créer un compte sur [Cal.com](https://cal.com) si vous n'en avez pas déjà un
2. Configurer vos types d'événements et vos disponibilités
3. Remplacer `yourusername/meeting` dans les exemples par votre propre lien Cal.com

### Format du lien Cal.com

Le format du lien suit cette structure: `username/event-type`

Par exemple, si votre nom d'utilisateur est "jean" et que vous avez créé un type d'événement appelé "consultation", votre lien serait: `jean/consultation`

## Note sur l'implémentation technique

L'intégration utilise l'API JavaScript de Cal.com plutôt que les éléments Web Components natifs (`<cal-inline>` ou les attributs `data-cal-*`). Cette approche a été choisie pour une meilleure compatibilité avec TypeScript, qui ne reconnaît pas nativement les éléments personnalisés sans déclarations de type supplémentaires.

Les composants fonctionnent en:
1. Chargeant le script Cal.com (`https://cal.com/embed.js`)
2. Utilisant des refs React pour référencer les éléments DOM
3. Initialisant les widgets via l'API JavaScript `Cal()` fournie par le script

Cette implémentation évite les erreurs TypeScript tout en offrant la même fonctionnalité que les solutions basées sur les Web Components.

## Personnalisation

Les deux composants proposent des options de personnalisation:

- **CalendarWidget**: vous pouvez personnaliser la taille, le style et la classe CSS
- **CalendarPopup**: vous pouvez personnaliser le texte du bouton et sa classe CSS

Pour des personnalisations plus avancées, vous pouvez modifier directement les fichiers des composants:
- `src/components/CalendarWidget.tsx`
- `src/components/CalendarPopup.tsx`

## Ressources supplémentaires

- [Documentation Cal.com](https://cal.com/docs)
- [Embeds Cal.com](https://cal.com/docs/embeds/overview)
- [Documentation sur l'API Cal.com](https://cal.com/docs/api-reference/v2/introduction)
- [Documentation JavaScript API Cal.com](https://cal.com/docs/embeds/embed-api)
