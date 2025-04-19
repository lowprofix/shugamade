"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, Send, Check, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Liste des indicatifs téléphoniques (même que dans CustomerInfoForm)
const countryPhoneCodes = [
  { code: "+242", country: "Congo Brazzaville" },
  { code: "+243", country: "RD Congo" },
  { code: "+241", country: "Gabon" },
  { code: "+235", country: "Tchad" },
  { code: "+236", country: "République centrafricaine" },
  { code: "+237", country: "Cameroun" },
  { code: "+33", country: "France" },
  { code: "+1", country: "États-Unis/Canada" },
  { code: "+44", country: "Royaume-Uni" },
  { code: "+32", country: "Belgique" },
  { code: "+41", country: "Suisse" },
];

export default function TestWhatsApp() {
  const [phoneCountryCode, setPhoneCountryCode] = useState("+242");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`Bonjour [Nom du client],

Nous vous confirmons votre réservation pour votre séance de hairneedling.

📅 Date et heure : 25 avril à 17h00

🔹 Préparation avant la séance
✅ Cheveux propres et sans produit : Merci de vous assurer que vos cheveux, en particulier la zone à traiter, soient propres et exempts de tout produit (huiles, gels, crèmes, etc.).

⏳ Ponctualité
• Merci d'arriver à l'heure afin de profiter pleinement de votre séance.
• Un retard de plus de 30 minutes entraînera l'annulation de la séance sans possibilité de remboursement de l'acompte.

❌ Annulation & Report
• Toute annulation ou report doit être signalé au moins 24h à l'avance.
• Au-delà de ce délai, l'acompte ne pourra pas être remboursé.

💰 Acompte
• Un acompte de 5 000 FCFA est requis pour confirmer définitivement votre réservation.
• Modes de paiement acceptés :
  - Mobile Money: +242 XX XX XX XX
  - Airtel Money: +242 XX XX XX XX

Si vous avez des questions, n'hésitez pas à me contacter.
À très bientôt !

Eunice – SHUGAMADE
📞 00 242 06 536 67 16`);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneCountryCode + phone,
          message: message,
        }),
      });

      const data = await response.json();
      setResult(data);
      setStatus(data.success ? "success" : "error");
    } catch (error) {
      console.error("Erreur lors du test de l'API WhatsApp:", error);
      setResult({ error: "Erreur lors de la requête" });
      setStatus("error");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Test de l'API WhatsApp
      </h1>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Envoyer un message WhatsApp</CardTitle>
            <CardDescription>
              Utilisez ce formulaire pour tester l'envoi de messages via l'API
              WhatsApp
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Numéro de téléphone
                </label>
                <div className="flex">
                  <Select
                    value={phoneCountryCode}
                    onValueChange={setPhoneCountryCode}
                  >
                    <SelectTrigger className="w-[140px] rounded-r-none">
                      <SelectValue placeholder="Indicatif" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryPhoneCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} {country.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Numéro sans indicatif"
                    className="flex-1 rounded-l-none"
                    type="tel"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Votre message"
                  rows={5}
                  required
                />
              </div>

              {status === "success" && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Message envoyé avec succès!</p>
                    {result && (
                      <pre className="text-xs mt-2 overflow-auto max-h-32">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      Erreur lors de l'envoi du message
                    </p>
                    {result && (
                      <pre className="text-xs mt-2 overflow-auto max-h-32">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
