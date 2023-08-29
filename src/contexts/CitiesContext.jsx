import { createContext, useState, useEffect, useContext } from "react";

const BASE_URL = "http://localhost:9000";

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState({});

  useEffect(function () {
    (async function () {
      try {
        setIsLoading(true);

        const response = await fetch(`${BASE_URL}/cities`);

        const data = await response.json();

        setCities(data);
      } catch (error) {
        alert("There was an error loading the data...!", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function getCity(id) {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/cities/${id}`);

      const data = await response.json();

      setCurrentCity(data);
    } catch (error) {
      alert("There was an error loading the data...!", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the Cities Provider");
  return context;
}

export { CitiesProvider, useCities };
