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
import { Loader2, UserPlus, Check, AlertCircle } from "lucide-react";
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

export default function TestHiboutik() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+242");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Créer l'objet client selon les attentes de l'API Hiboutik
    const clientData = {
      customers_first_name: firstName,
      customers_last_name: lastName,
      customers_phone_number: `${phoneCountryCode} ${phone.replace(/\s/g, "")}`,
      customers_email: email || "",
    };

    try {
      const response = await fetch("/api/hiboutik/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      // Stocker la réponse brute pour debugging
      const responseText = await response.text();
      setRawResponse(responseText);

      // Essayer de parser le JSON si possible
      let data;
      try {
        data = JSON.parse(responseText);
        setResult(data);
      } catch (e) {
        // Si ce n'est pas du JSON valide, utiliser le texte brut
        setResult({ rawText: responseText });
      }

      setStatus(response.ok ? "success" : "error");
    } catch (error) {
      console.error("Erreur lors du test de l'API Hiboutik:", error);
      setResult({ error: "Erreur lors de la requête" });
      setStatus("error");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Test de l'API Hiboutik - Création de Client
      </h1>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Créer un client dans Hiboutik</CardTitle>
            <CardDescription>
              Utilisez ce formulaire pour tester la création de clients via
              l'API Hiboutik
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                  required
                />
              </div>

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
                <label className="text-sm font-medium">Email (optionnel)</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  type="email"
                />
              </div>

              {status === "success" && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Client créé avec succès!</p>
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
                      Erreur lors de la création du client
                    </p>
                    {result && (
                      <pre className="text-xs mt-2 overflow-auto max-h-32">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">
                        Voir la réponse brute
                      </summary>
                      <pre className="text-xs mt-1 overflow-auto max-h-32 bg-gray-100 p-2 rounded">
                        {rawResponse}
                      </pre>
                    </details>
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
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer le client
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Débogage API</h2>
          <Card>
            <CardHeader>
              <CardTitle>Format des données</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Données envoyées à l'API :</p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-xs overflow-auto">
                  {`{
  "customers_first_name": "${firstName || "Prénom"}",
  "customers_last_name": "${lastName || "Nom"}",
  "customers_phone_number": "${phoneCountryCode} ${
                    phone.replace(/\s/g, "") || "123456789"
                  }",
  "customers_email": "${email || "exemple@email.com"}"
}`}
                </pre>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium">
                  Endpoint :{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                    /api/hiboutik/clients
                  </code>
                </p>
                <p className="text-sm mt-2">
                  Méthode :{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                    POST
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-md mx-auto mt-6 text-center">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/test-hiboutik/clients-list")}
          className="mt-4"
        >
          Voir la liste des clients
        </Button>
      </div>
    </div>
  );
}
