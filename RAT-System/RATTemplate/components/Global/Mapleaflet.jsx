import React, { useEffect, useRef } from "react";
import L from "leaflet";
import LocStorage from './locStorage';

const style = { width: "100%", height: "400px" };

function Map({ markerPosition, olat, olng, direccion_origen, markerPositionGRAL }) {
  // create map
  const mapRef = useRef(null);
  const currenturlapi = LocStorage().urlapi;

  useEffect(() => {
    mapRef.current = L.map("map", {
      center: [olat, olng],
      zoom: 16,
      layers: [
        L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="http://osm.org/copyright"  target="_blank" >OpenStreetMap</a> contributors'
        })
      ]
    });


  }, []);

  // add marker
  const markerRef = useRef(null);
  var redIcon = L.icon({
    iconUrl: currenturlapi + 'icon_marker.png',
    iconAnchor: [20, 45],
  });

  useEffect(
    () => {
      
      markerRef.current = L.marker(
        markerPosition,
        {
          //icon: redIcon,
          iconAnchor: [20, 45],
        }
      )
        .bindPopup("<p>Origen: <br />" + direccion_origen).openTooltip()
        .addTo(mapRef.current)

    },
    [markerPosition]
  );


  return <div id="map" style={style} />;
}

export default Map;