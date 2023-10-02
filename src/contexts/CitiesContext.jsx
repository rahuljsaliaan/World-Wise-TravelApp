import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

// const BASE_URL = "http://localhost:9000";
const API_KEY = "$2b$10$irYLZBjxwe50Mepn.GukxuchuufY.N/KdwfP/aGkSLm1OX.rtb7He";
const BIN_URL = "https://api.jsonbin.io/v3/b/";
const BIN_ID = "64f0ba0c8d92e126ae655887";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

// NOTE: reducer's should be pure
function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };

    case "rejected":
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    (async function () {
      try {
        dispatch({ type: "loading" });

        const response = await fetch(`${BIN_URL}${BIN_ID}/latest`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY,
          },
        });

        const data = await response.json();

        dispatch({ type: "cities/loaded", payload: data.record.cities });
      } catch (error) {
        dispatch({
          type: "rejected",
          payload: "There was an error loading data...!",
        });
      }
    })();
  }, []);

  const getCity = useCallback(
    function getCity(id) {
      try {
        if (id === currentCity.id) return;

        dispatch({ type: "loading" });

        const data = cities.find((city) => city.id === id);

        dispatch({ type: "city/loaded", payload: data });
      } catch (error) {
        dispatch({
          type: "rejected",
          payload: "There was an error loading cities...!",
        });
      }
    },
    [cities, currentCity.id]
  );

  async function createCity(newCity) {
    try {
      dispatch({ type: "loading" });

      const response = await fetch(`${BIN_URL}${BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
      });

      if (!response.ok) {
        // Handle the case where the fetch fails
        throw new Error("Failed to fetch data from JSONBin.io");
      }

      const currentData = await response.json();

      // 2. Modify the data (assuming newCity has the changes)

      newCity.id = new Date().toISOString();

      const updatedData = {
        cities: [...currentData.record.cities, newCity],
      };

      // 3. Send the updated data back to JSONBin.io
      const updateResponse = await fetch(`${BIN_URL}${BIN_ID}`, {
        method: "PUT", // Use PUT to update the entire data
        body: JSON.stringify(updatedData),
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
      });

      await updateResponse.json();

      const updatedResponse = await fetch(`${BIN_URL}${BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
      });

      const data = await updatedResponse.json();

      dispatch({
        type: "city/created",
        payload: data.record.cities.find((item) => item.id === newCity.id),
      });
    } catch (error) {
      dispatch({
        type: "rejected",
        payload: "There was an error creating city...!",
      });
    }
  }

  async function deleteCity(id) {
    try {
      dispatch({ type: "loading" });

      const response = await fetch(`${BIN_URL}${BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
      });

      if (!response.ok) {
        // Handle the case where the fetch fails
        throw new Error("Failed to fetch data from JSONBin.io");
      }

      const currentData = await response.json();

      // 2. Modify the data (assuming newCity has the changes

      const updatedData = {
        cities: currentData.record.cities.filter((city) => city.id !== id),
      };

      // 3. Send the updated data back to JSONBin.io
      const updateResponse = await fetch(`${BIN_URL}${BIN_ID}`, {
        method: "PUT", // Use PUT to update the entire data
        body: JSON.stringify(updatedData),
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
      });

      await updateResponse.json();

      const updatedResponse = await fetch(`${BIN_URL}${BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
      });

      const data = await updatedResponse.json();

      dispatch({
        type: "city/deleted",
        payload: data.record.cities,
      });
    } catch (error) {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting city...!",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
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
