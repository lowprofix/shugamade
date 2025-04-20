"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, RefreshCw, AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
  customers_id: number;
  customers_first_name: string;
  customers_last_name: string;
  customers_email: string;
  customers_phone_number: string;
  customers_created: string;
  customers_visit_counter: number;
  customers_last_visit: string | null;
  [key: string]: any; // Pour les autres propriétés éventuelles
}

export default function ClientsList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rawResponse, setRawResponse] = useState<string>("");

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hiboutik/clients");

      // Stocker la réponse brute pour debugging
      const responseText = await response.text();
      setRawResponse(responseText);

      // Essayer de parser le JSON si possible
      let data;
      try {
        data = JSON.parse(responseText);
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          setCustomers([]);
          setError("Format de réponse inattendu");
        }
      } catch (e) {
        setError("Réponse non JSON");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtrer les clients par la recherche
  const filteredCustomers = customers.filter((customer) => {
    const fullName =
      `${customer.customers_first_name} ${customer.customers_last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      (customer.customers_phone_number &&
        customer.customers_phone_number.includes(searchTerm)) ||
      (customer.customers_email &&
        customer.customers_email.toLowerCase().includes(searchLower))
    );
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Liste des Clients Hiboutik
      </h1>

      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Clients enregistrés</CardTitle>
                <CardDescription>
                  Liste de tous les clients enregistrés dans Hiboutik
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={fetchCustomers}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, téléphone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-lg">Chargement des clients...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Erreur: {error}</span>
                </div>
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">
                    Voir la réponse brute
                  </summary>
                  <pre className="text-xs mt-1 overflow-auto max-h-32 bg-gray-100 p-2 rounded">
                    {rawResponse}
                  </pre>
                </details>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm
                  ? "Aucun client ne correspond à votre recherche"
                  : "Aucun client n'a été trouvé"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead>Visites</TableHead>
                      <TableHead>Dernière visite</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.customers_id}>
                        <TableCell className="font-medium">
                          {customer.customers_id}
                        </TableCell>
                        <TableCell>
                          {`${customer.customers_first_name} ${customer.customers_last_name}`}
                        </TableCell>
                        <TableCell>
                          {customer.customers_phone_number || "N/A"}
                        </TableCell>
                        <TableCell>
                          {customer.customers_email || "N/A"}
                        </TableCell>
                        <TableCell>
                          {formatDate(customer.customers_created)}
                        </TableCell>
                        <TableCell>
                          {customer.customers_visit_counter || 0}
                        </TableCell>
                        <TableCell>
                          {customer.customers_last_visit
                            ? formatDate(customer.customers_last_visit)
                            : "Jamais"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="text-sm text-gray-500">
              Total: {filteredCustomers.length} client(s)
              {searchTerm && customers.length !== filteredCustomers.length
                ? ` (sur ${customers.length} au total)`
                : ""}
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto mt-6 text-center">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/test-hiboutik")}
        >
          Retour à la création de client
        </Button>
      </div>
    </div>
  );
}
