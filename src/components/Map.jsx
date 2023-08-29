import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import Button from "./Button";
import styles from "./Map.module.css";

const flagEmojiToPNG = (flag) => {
  var countryCode = Array.from(flag, (codeUnit) => codeUnit.codePointAt())
    .map((char) => String.fromCharCode(char - 127397).toLowerCase())
    .join("");
  return (
    <img src={`https://flagcdn.com/24x18/${countryCode}.png`} alt="flag" />
  );
};

function Map() {
  const [mapPosition, setMapPosition] = useState([40, 0]);
  const { cities } = useCities();
  // const { currentCity } = useCities();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    isLoading: isLoadingPosition,
    position: geoLocationPosition,
    getPosition,
  } = useGeolocation();

  const mapLat = searchParams.get("lat");
  const mapLng = searchParams.get("lng");

  // Change the mapPosition based on the lat and lng params value
  useEffect(
    function () {
      if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
    },
    [mapLat, mapLng]
  );

  // Alternative way of getting the lat lng through the current city
  // useEffect(
  //   function () {
  //     if (currentCity?.position?.length) setMapPosition(currentCity.position);
  //     console.log(currentCity.position);
  //   },
  //   [currentCity]
  // );

  return (
    <div className={styles.mapContainer}>
      <Button type="position" onClick={getPosition}>
        {isLoadingPosition ? "Loading" : "Use your position"}
      </Button>
      <MapContainer
        className={styles.map}
        center={mapPosition}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {/* Set all the markers before hand and not after clicking on a city */}
        {cities.map((city) => (
          <Marker
            position={[city?.position.lat, city?.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>{flagEmojiToPNG(city.emoji)}</span>
              <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}

        {/* reposition the map as the mapPosition object changes */}
        {/* Could have used the js mode and just called the function but it is better like this as the syntax looks clean */}
        <ChangeCenter position={mapPosition} />

        <DetectClick />
      </MapContainer>
    </div>
  );
}

// Custom component function for repositioning the map
function ChangeCenter({ position }) {
  const map = useMap();
  map.setView(position);

  return null;
}

function DetectClick() {
  const navigate = useNavigate();

  useMapEvents({
    click: (e) => {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
}

export default Map;
