# Horaires & Tarifs — Affichage en temps réel

Application web légère affichant les horaires et tarifs en temps réel, avec gestion des jours fériés, de la TVA et des tarifs professionnels.

## Fonctionnalités

- **Affichage en temps réel** : heure courante et tarif applicable mis à jour automatiquement
- **Tableau des tarifs** : vue hebdomadaire avec les trois plages horaires (00h-07h, 07h-19h, 19h-24h)
- **Jours fériés** : détection automatique avec tarif spécifique (`holidayPrice`)
- **Mode professionnel** : majoration configurable (+10 €/h par défaut)
- **HT / TTC** : bascule entre tarifs hors taxes et toutes taxes comprises (TVA 20%)

## Structure du projet

```
index.html   — Structure HTML de la page
script.js    — Logique métier (configuration des tarifs, affichage dynamique)
styles.css   — Feuille de styles
```

## Configuration des tarifs

Tous les tarifs sont définis dans `script.js`, dans l'objet `schedule` :

```js
const schedule = {
  0: [ // Dimanche
    {start: '00:00', end: '07:00', price: 90},
    {start: '07:00', end: '19:00', price: 90},
    {start: '19:00', end: '24:00', price: 90}
  ],
  1: [ // Lundi
    {start: '00:00', end: '07:00', price: 90},
    {start: '07:00', end: '19:00', price: 40},
    {start: '19:00', end: '24:00', price: 60}
  ],
  // ...
  holidayPrice: 100  // tarif applicable les jours fériés
};
```

Pour modifier un tarif, changez la valeur `price` de la plage correspondante.

## Utilisation

Ouvrez simplement `index.html` dans un navigateur — aucune dépendance ni serveur requis.

## Auteur

Grégory HARGOUS
