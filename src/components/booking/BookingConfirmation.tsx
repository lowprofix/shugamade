"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service as ServiceType } from "@/lib/data";
import {
  AvailableSlot,
  CustomerInfo,
  MultipleBooking,
} from "./BookingClientWrapper";
import {
  Check,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Share2,
  Download,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface BookingConfirmationProps {
  service: ServiceType;
  slot: AvailableSlot | null;
  customerInfo: CustomerInfo;
  isMultipleBooking: boolean;
  multipleBooking: MultipleBooking | null;
}

export default function BookingConfirmation({
  service,
  slot,
  customerInfo,
  isMultipleBooking,
  multipleBooking,
}: BookingConfirmationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const bookingCardRef = useRef<HTMLDivElement>(null);

  // Fonction pour formater la date pour l'affichage
  const formatDateString = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  // Générer un numéro de réservation aléatoire
  const bookingNumber = `SHG-${Math.floor(100000 + Math.random() * 900000)}`;

  // Afficher l'animation de confetti au chargement du composant
  useEffect(() => {
    setShowConfetti(true);

    // Masquer l'animation après 5 secondes
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Fonction pour télécharger les détails de la réservation au format PDF
  const handleDownload = async () => {
    if (!bookingCardRef.current) return;

    try {
      // Méthode alternative - Créer directement le PDF sans utiliser html2canvas
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Dimensions du PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Ajouter un en-tête
      pdf.setFillColor(226, 179, 247); // proche de #e2b3f7
      pdf.rect(0, 0, pdfWidth, 15, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text("SHUGAMADE - Confirmation de réservation", pdfWidth / 2, 10, {
        align: "center",
      });

      // Ajouter le numéro de réservation
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.text(`Numéro de réservation: ${bookingNumber}`, pdfWidth / 2, 25, {
        align: "center",
      });

      // Ajouter les informations du service
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Service réservé", 20, 35);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(service.name, 20, 42);
      pdf.text(service.price, 20, 48);

      // Ajouter les informations de date et heure
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Date et heure", 20, 60);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);

      if (!isMultipleBooking && slot) {
        const date = new Date(slot.date);
        const formattedDate = format(date, "EEEE d MMMM yyyy", { locale: fr });
        pdf.text(`${formattedDate}`, 20, 67);
        pdf.text(`${slot.start} - ${slot.end}`, 20, 73);
      } else if (isMultipleBooking && multipleBooking) {
        pdf.text(`${multipleBooking.sessionCount} séances réservées`, 20, 67);

        let yPos = 73;
        multipleBooking.slots.forEach((slot, index) => {
          const date = new Date(slot.date);
          const formattedDate = format(date, "d MMMM yyyy", { locale: fr });
          pdf.text(
            `${index + 1}. ${formattedDate}, ${slot.start} - ${slot.end}`,
            25,
            yPos
          );
          yPos += 6;
        });
      }

      // Ajouter les informations du client
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      const clientYPos =
        isMultipleBooking && multipleBooking
          ? 73 + multipleBooking.slots.length * 6 + 10
          : 85;
      pdf.text("Vos coordonnées", 20, clientYPos);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(customerInfo.name, 20, clientYPos + 7);
      pdf.text(
        `Téléphone: ${customerInfo.phoneCountryCode}${customerInfo.phone}`,
        20,
        clientYPos + 14
      );
      if (customerInfo.email) {
        pdf.text(`Email: ${customerInfo.email}`, 20, clientYPos + 21);
      }

      // Ajouter l'adresse du salon
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      const addressYPos = clientYPos + (customerInfo.email ? 35 : 28);
      pdf.text("Adresse du salon", 20, addressYPos);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text("Institut ShugaMade", 20, addressYPos + 7);
      pdf.text(
        "119 Rue Bangalas, Poto-Poto, Brazzaville, Congo",
        20,
        addressYPos + 14
      );

      // Ajouter les instructions pour l'acompte
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Instructions pour l'acompte", 20, addressYPos + 30);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      const acompteText =
        "Pour confirmer votre réservation, veuillez verser un acompte de 5 000 FCFA" +
        " via MoMo au 06 597 56 23 ou via Airtel au 05 092 89 99.";

      // Wrap le texte pour qu'il tienne dans la largeur
      const splitAcompte = pdf.splitTextToSize(acompteText, pdfWidth - 40);
      pdf.text(splitAcompte, 20, addressYPos + 37);

      const importantText = `Important: Veuillez mentionner votre numéro de réservation (${bookingNumber}) lors du paiement.`;
      const splitImportant = pdf.splitTextToSize(importantText, pdfWidth - 40);
      pdf.text(splitImportant, 20, addressYPos + 47);

      // Si c'est une promotion, ajouter les informations sur le kit
      if (service.isPromo) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("Kit SHUGAMADE offert", 20, addressYPos + 60);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.text(
          "Votre kit comprend: Spray Coup de pep's, sérum Coup de pousse",
          20,
          addressYPos + 67
        );
        pdf.text("et derma roller professionnel.", 20, addressYPos + 73);
        pdf.text(
          "Vous recevrez votre kit lors de votre première séance.",
          20,
          addressYPos + 79
        );
      }

      // Ajouter un pied de page
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        "Merci pour votre confiance! Nous avons hâte de vous accueillir.",
        pdfWidth / 2,
        pdfHeight - 20,
        { align: "center" }
      );
      pdf.text(
        "© SHUGAMADE - " + new Date().getFullYear(),
        pdfWidth / 2,
        pdfHeight - 15,
        { align: "center" }
      );

      // Télécharger le PDF
      pdf.save(`reservation-${bookingNumber}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert(
        "Une erreur est survenue lors de la création du PDF. Veuillez réessayer."
      );
    }
  };

  // Fonction pour partager les détails de la réservation
  const handleShare = async () => {
    // Créer le texte du message de partage
    let shareText = `J'ai réservé une séance de ${service.name} chez SHUGAMADE!\n\n`;

    if (!isMultipleBooking && slot) {
      const date = new Date(slot.date);
      const formattedDate = format(date, "EEEE d MMMM yyyy", { locale: fr });
      shareText += `Date: ${formattedDate}\n`;
      shareText += `Heure: ${slot.start} - ${slot.end}\n\n`;
    } else if (isMultipleBooking && multipleBooking) {
      shareText += `J'ai réservé ${multipleBooking.sessionCount} séances.\n\n`;
    }

    shareText +=
      "Adresse: Institut ShugaMade, 119 Rue Bangalas, Poto-Poto, Brazzaville, Congo\n\n";
    shareText += "Plus d'informations sur: https://shugamade.com";

    try {
      // Vérifier si l'API Web Share est disponible
      if (navigator.share) {
        await navigator.share({
          title: `Réservation SHUGAMADE - ${service.name}`,
          text: shareText,
          url: window.location.href,
        });
      } else {
        // Fallback pour les navigateurs qui ne prennent pas en charge l'API Web Share
        // Copier le texte dans le presse-papiers
        await navigator.clipboard.writeText(shareText);
        alert(
          "Les détails de votre réservation ont été copiés dans le presse-papiers."
        );
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      // Si l'API de partage échoue, essayons de copier dans le presse-papiers
      try {
        await navigator.clipboard.writeText(shareText);
        alert(
          "Les détails de votre réservation ont été copiés dans le presse-papiers."
        );
      } catch (clipboardError) {
        alert("Le partage n'est pas disponible sur votre appareil.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Animation de confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-0 left-1/4 animate-fall-slow">
            <Sparkles className="text-[#ffb2dd] w-6 h-6" />
          </div>
          <div className="absolute top-0 left-1/2 animate-fall-medium">
            <Sparkles className="text-[#e2b3f7] w-8 h-8" />
          </div>
          <div className="absolute top-0 left-3/4 animate-fall-fast">
            <Sparkles className="text-[#bfe0fb] w-5 h-5" />
          </div>
          <div className="absolute top-0 left-1/3 animate-fall-medium delay-300">
            <Sparkles className="text-[#9deaff] w-7 h-7" />
          </div>
          <div className="absolute top-0 left-2/3 animate-fall-slow delay-500">
            <Sparkles className="text-[#ffb2dd] w-6 h-6" />
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd]">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Réservation confirmée !
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Votre rendez-vous a été réservé avec succès.
        </p>
      </div>

      <Card
        className="overflow-hidden border-none shadow-md"
        ref={bookingCardRef}
      >
        <div className="h-2 w-full bg-gradient-to-r from-[#e2b3f7] to-[#ffb2dd]" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white">
              Détails de la réservation
            </h4>
            <div className="px-3 py-1 text-xs font-medium text-[#ffb2dd] bg-[#ffb2dd]/10 rounded-full">
              {bookingNumber}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations sur le service */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e2b3f7]/20 mr-3 flex-shrink-0">
                    <Check className="w-4 h-4 text-[#e2b3f7]" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-white">
                      Service réservé
                    </h5>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      {service.name}
                    </p>
                    <p className="text-sm font-medium text-[#ffb2dd] mt-1">
                      {service.price}
                    </p>
                  </div>
                </div>

                {!isMultipleBooking && slot && (
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#bfe0fb]/20 mr-3 flex-shrink-0">
                      <Calendar className="w-4 h-4 text-[#bfe0fb]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white">
                        Date et heure
                      </h5>
                      <p className="text-gray-700 dark:text-gray-300 mt-1 capitalize">
                        {formatDateString(slot.date)}
                      </p>
                      <div className="flex items-center text-gray-700 dark:text-gray-300 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          {slot.start} - {slot.end}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isMultipleBooking && multipleBooking && (
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#bfe0fb]/20 mr-3 flex-shrink-0">
                      <Calendar className="w-4 h-4 text-[#bfe0fb]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white">
                        Vos {multipleBooking.sessionCount} séances
                      </h5>
                      <div className="mt-2 space-y-2">
                        {multipleBooking.slots.map((slot, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-[#bfe0fb]/10 p-2 rounded-lg"
                          >
                            <div className="w-5 h-5 rounded-full bg-[#bfe0fb] text-white text-xs flex items-center justify-center mr-2">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                                {formatDateString(slot.date)}
                              </p>
                              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>
                                  {slot.start} - {slot.end}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations client */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ffb2dd]/20 mr-3 flex-shrink-0">
                    <User className="w-4 h-4 text-[#ffb2dd]" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-white">
                      Vos coordonnées
                    </h5>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      {customerInfo.name}
                    </p>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      <span>{customerInfo.phone}</span>
                    </div>
                    {customerInfo.email && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        <span>{customerInfo.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#9deaff]/20 mr-3 flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#9deaff]" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-white">
                      Adresse du salon
                    </h5>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      Institut ShugaMade
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      119 Rue Bangalas, Poto-Poto, Brazzaville, Congo
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions pour l'acompte */}
            <div className="p-4 bg-[#ffb2dd]/10 rounded-lg border border-[#ffb2dd]/20">
              <h5 className="font-medium text-gray-800 dark:text-white flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-[#ffb2dd]" />
                Instructions pour l'acompte
              </h5>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                Pour confirmer votre réservation, veuillez verser un acompte de
                5 000 FCFA via MoMo au 06 597 56 23 ou via Airtel au 05 092 89
                99.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                <span className="font-medium">Important :</span> Veuillez
                mentionner votre numéro de réservation ({bookingNumber}) lors du
                paiement.
              </p>
            </div>

            {/* Kit offert */}
            {service.isPromo && (
              <div className="p-4 bg-gradient-to-r from-[#e2b3f7]/10 to-[#ffb2dd]/10 rounded-lg border border-[#e2b3f7]/20">
                <h5 className="font-medium text-gray-800 dark:text-white flex items-center">
                  <Check className="w-4 h-4 mr-2 text-[#e2b3f7]" />
                  Kit SHUGAMADE offert
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Votre kit comprend : Spray Coup de pep's, sérum Coup de pousse
                  et derma roller professionnel.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Vous recevrez votre kit lors de votre première séance.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 border-[#bfe0fb] text-[#bfe0fb] hover:bg-[#bfe0fb]/10"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#e2b3f7] text-[#e2b3f7] hover:bg-[#e2b3f7]/10"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#ffb2dd] to-[#e2b3f7] text-white hover:from-[#e2b3f7] hover:to-[#ffb2dd]"
                onClick={() => (window.location.href = "/")}
              >
                <Check className="w-4 h-4 mr-2" />
                Terminer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note de remerciement */}
      <div className="text-center mt-6">
        <p className="text-gray-600 dark:text-gray-300">
          Merci de votre confiance ! Nous avons hâte de vous accueillir.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Un email de confirmation a été envoyé à{" "}
          {customerInfo.email || "votre adresse email"}.
        </p>
      </div>
    </div>
  );
}
