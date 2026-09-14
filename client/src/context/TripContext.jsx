import { createContext, useContext, useState } from 'react';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [tripData, setTripData] = useState({
    prompt: '',
    constraints: null,
    itinerary: null,
    steps: [],
    booking: null,
    disruption: null,
  });

  const updateTrip = (updates) => {
    setTripData(prev => ({ ...prev, ...updates }));
  };

  const resetTrip = () => {
    setTripData({
      prompt: '',
      constraints: null,
      itinerary: null,
      steps: [],
      booking: null,
      disruption: null,
    });
  };

  return (
    <TripContext.Provider value={{ tripData, updateTrip, resetTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}
