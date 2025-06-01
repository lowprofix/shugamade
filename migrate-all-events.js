#!/usr/bin/env node

/**
 * Script d'automatisation pour la migration complète des événements calendrier
 * Usage: node migrate-all-events.js
 */

const API_BASE = "http://localhost:3000";
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 2000; // 2 secondes

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/update-calendar-events-batch`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du statut:", error.message);
    return null;
  }
}

async function processBatch(startIndex) {
  try {
    console.log(`🔄 Traitement du lot à partir de l'index ${startIndex}...`);
    
    const response = await fetch(`${API_BASE}/api/update-calendar-events-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        batchSize: BATCH_SIZE,
        startIndex: startIndex,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${data.message}`);
      console.log(`📊 Succès: ${data.successCount}, Échecs: ${data.failureCount}`);
      
      if (data.failureCount > 0) {
        console.log("⚠️ Événements échoués:");
        data.results
          .filter(r => !r.success)
          .forEach(r => console.log(`   - ${r.eventId}: ${r.error}`));
      }
      
      return {
        success: true,
        nextStartIndex: data.nextStartIndex,
        completed: data.completed,
        successCount: data.successCount,
        failureCount: data.failureCount
      };
    } else {
      console.error(`❌ Erreur lors du traitement du lot: ${data.error}`);
      return { success: false };
    }
  } catch (error) {
    console.error(`❌ Erreur lors du traitement du lot ${startIndex}:`, error.message);
    return { success: false };
  }
}

async function main() {
  console.log("🚀 Début de la migration automatisée des événements calendrier");
  console.log("=" .repeat(60));

  // Vérifier le statut initial
  const initialStatus = await getStatus();
  if (!initialStatus) {
    console.error("❌ Impossible de récupérer le statut initial");
    process.exit(1);
  }

  console.log(`📊 Statut initial:`);
  console.log(`   Total événements: ${initialStatus.totalEvents}`);
  console.log(`   Événements complétés: ${initialStatus.eventsCompleted}`);
  console.log(`   Événements restants: ${initialStatus.eventsToUpdate}`);
  console.log(`   Progression: ${initialStatus.progress}%`);
  console.log("");

  if (initialStatus.eventsToUpdate === 0) {
    console.log("🎉 Tous les événements sont déjà au nouveau format !");
    process.exit(0);
  }

  let currentIndex = 0;
  let totalSuccess = 0;
  let totalFailures = 0;
  let batchNumber = 1;

  while (true) {
    console.log(`📦 Lot ${batchNumber} (index ${currentIndex}):`);
    
    const result = await processBatch(currentIndex);
    
    if (!result.success) {
      console.error("❌ Échec du traitement du lot, arrêt de la migration");
      break;
    }

    totalSuccess += result.successCount;
    totalFailures += result.failureCount;

    if (result.completed) {
      console.log("");
      console.log("🎉 Migration terminée !");
      break;
    }

    currentIndex = result.nextStartIndex;
    batchNumber++;

    console.log(`⏳ Attente de ${DELAY_BETWEEN_BATCHES/1000} secondes avant le prochain lot...`);
    console.log("");
    
    await sleep(DELAY_BETWEEN_BATCHES);
  }

  // Statut final
  console.log("=" .repeat(60));
  console.log("📊 RÉSUMÉ FINAL:");
  console.log(`   ✅ Événements mis à jour avec succès: ${totalSuccess}`);
  console.log(`   ❌ Événements échoués: ${totalFailures}`);
  console.log(`   📦 Lots traités: ${batchNumber}`);

  // Vérification finale
  const finalStatus = await getStatus();
  if (finalStatus) {
    console.log("");
    console.log("🔍 Vérification finale:");
    console.log(`   Total événements: ${finalStatus.totalEvents}`);
    console.log(`   Événements complétés: ${finalStatus.eventsCompleted}`);
    console.log(`   Événements restants: ${finalStatus.eventsToUpdate}`);
    console.log(`   Progression finale: ${finalStatus.progress}%`);
    
    if (finalStatus.eventsToUpdate === 0) {
      console.log("");
      console.log("🎉 MIGRATION COMPLÈTE ! Tous les événements sont maintenant au format 'Nom - Service' !");
    } else {
      console.log("");
      console.log(`⚠️ Il reste ${finalStatus.eventsToUpdate} événements à traiter.`);
      console.log("Vous pouvez relancer le script pour continuer la migration.");
    }
  }
}

// Gestion des erreurs globales
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Erreur non gérée:', reason);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n⏹️ Migration interrompue par l\'utilisateur');
  process.exit(0);
});

// Lancer le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 