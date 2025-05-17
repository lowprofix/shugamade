import { isPointeNoireSession, getSessionLocation } from "./locations";

// Tester avec des dates connues
const testDates = [
  "vendredi 23 mai",     // Date Pointe-Noire
  "samedi 24 mai",       // Date Pointe-Noire
  "lundi 26 mai",        // Date Brazzaville
  "vendredi 27 juin",    // Date Pointe-Noire
];

console.log("=== Test des fonctions de location ===");

testDates.forEach(date => {
  console.log(`\nTest pour la date: ${date}`);
  console.log(`Est-ce une session Pointe-Noire ? ${isPointeNoireSession(date)}`);
  console.log(`Lieu de la session: ${getSessionLocation(date)}`);
});