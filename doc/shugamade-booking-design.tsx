import React, { useState } from 'react';
import { Calendar, ArrowRight, Clock, Check } from 'lucide-react';

// Composant principal pour la page de réservation
const ShugaMadeBooking = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  
  const services = [
    { id: 1, name: "Diagnostic capillaire", price: "10 000 FCFA", duration: "30 min" },
    { id: 2, name: "Hairneedling - Tempes", price: "35 000 FCFA", duration: "45 min" },
    { id: 3, name: "Hairneedling - Tête entière", price: "45 000 FCFA", duration: "60 min" },
    { id: 4, name: "Promo 4 séances - Tempes", price: "135 000 FCFA", duration: "4 x 45 min" },
    { id: 5, name: "Promo 4 séances - Tête entière", price: "175 000 FCFA", duration: "4 x 60 min" }
  ];
  
  const selectService = (service) => {
    setSelectedService(service);
    setStep(2);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-teal-50 p-6">
      {/* Header avec logo */}
      <header className="flex justify-center mb-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-300 to-teal-300 flex items-center justify-center shadow-md">
          <span className="text-4xl font-bold text-black">S</span>
        </div>
      </header>
      
      {/* Titre principal */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-gray-800">
          <span className="text-teal-400">SHUGA</span>
          <span className="text-pink-400">MADE</span>
        </h1>
        <p className="text-gray-600 mt-2">Soins naturels pour l'alopécie de traction</p>
      </div>
      
      {/* Indicateur d'étape */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-teal-400 text-white' : 'bg-gray-200'}`}>1</div>
          <div className="w-10 h-1 bg-gray-200 mx-1">
            <div className={`h-1 ${step >= 2 ? 'bg-teal-400' : 'bg-gray-200'}`} style={{width: step >= 2 ? '100%' : '0%'}}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-teal-400 text-white' : 'bg-gray-200'}`}>2</div>
          <div className="w-10 h-1 bg-gray-200 mx-1">
            <div className={`h-1 ${step >= 3 ? 'bg-teal-400' : 'bg-gray-200'}`} style={{width: step >= 3 ? '100%' : '0%'}}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-teal-400 text-white' : 'bg-gray-200'}`}>3</div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        {step === 1 && (
          <>
            <h2 className="text-xl text-gray-800 mb-6 font-light flex items-center">
              <Check className="text-teal-400 mr-2" size={20} />
              Sélectionnez votre soin
            </h2>
            <div className="space-y-4">
              {services.map(service => (
                <div 
                  key={service.id} 
                  className="border border-gray-100 hover:border-teal-200 p-4 rounded-lg flex justify-between items-center cursor-pointer transition-all hover:shadow-sm"
                  onClick={() => selectService(service)}
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{service.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock size={14} className="mr-1" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-right text-teal-600 font-medium">{service.price}</span>
                    <ArrowRight size={16} className="ml-2 text-pink-400" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {step === 2 && selectedService && (
          <>
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setStep(1)} 
                className="text-sm text-gray-500 hover:text-teal-500"
              >
                ← Retour aux services
              </button>
              <div className="bg-teal-50 text-teal-700 py-1 px-3 rounded-full text-sm">
                {selectedService.name}
              </div>
            </div>
            
            <h2 className="text-xl text-gray-800 mb-6 font-light flex items-center">
              <Calendar className="text-teal-400 mr-2" size={20} />
              Choisissez votre date et heure
            </h2>
            
            <div className="border border-gray-200 rounded-lg p-2 text-center py-12">
              {/* Ici sera intégré le calendrier Cal.com */}
              <p className="text-gray-500">Calendrier Cal.com sera intégré ici</p>
            </div>
          </>
        )}
      </div>
      
      {/* Informations additionnelles */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-800 font-medium mb-3">Information importante</h3>
        <p className="text-sm text-gray-600">
          Il est recommandé de réaliser 4 à 6 séances (1 séance toutes les deux semaines pendant 2 à 3 mois). 
          Des séances d'entretien peuvent être proposées pour maintenir les résultats.
        </p>
        
        <div className="mt-4 bg-pink-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Kit SHUGAMADE offert :</span> Spray Coup de pep's, sérum Coup de pousse, derma roller.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShugaMadeBooking;
