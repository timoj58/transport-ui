/*global google*/ 
import './App.css';
import { useEffect, useState, useRef } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import { init } from './util/Websocket';
import 'react-tabs/style/react-tabs.css';
import { createRoot } from "react-dom/client";

let markers = []
let transporterMarkers = []

function AdvancedMarkerTransporter(
  { map, position, children, id }
) {
  const markerRef = useRef()
  const rootRef = useRef()

  useEffect(() => {
    if (!rootRef.current) {
      const container = document.createElement("div")
      container.id = id
      rootRef.current = createRoot(container)

      const pinScaled = new google.maps.marker.PinElement({
        scale: 0.85,
      });

      const beachFlagImg = document.createElement("img");

      beachFlagImg.src =
        "https://maps.google.com/mapfiles/kml/pal3/icon26.png";
      
    
      markerRef.current = new google.maps.marker.AdvancedMarkerView({
        position,
  //      content: pinScaled.element,
        title: id,
        content: beachFlagImg,
      })
      transporterMarkers.push({
        id,
        marker: markerRef.current
      })
    }
    return () => (markerRef.current.map = null);
  }, [])

  useEffect(() => {
    rootRef.current.render(children)
    markerRef.current.position = position
    markerRef.current.map = map
  }, [map, position, children])
 

}


function AdvancedMarker(
  { map, position, children, id, name, lines }
) {
  const markerRef = useRef()
  const rootRef = useRef()

  useEffect(() => {
    if (!rootRef.current) {
      const container = document.createElement("div")
      container.id = id
      rootRef.current = createRoot(container)

      const pinScaled = new google.maps.marker.PinElement({
        scale: 0.85,
      });

      markerRef.current = new google.maps.marker.AdvancedMarkerView({
        position,
        content: pinScaled.element,
        title: name,
      })
      markers.push({
        id,
        marker: markerRef.current
      })
      let info = '<div><h3>' + name + '</h3>';
        
      lines.map(line => {
        info += '<p key={ line.id}>' + line.name + ': ' + line.id + '</p>'
      })
    
      info += '</div>'

      const infowindow = new window.google.maps.InfoWindow({
        content:  info,
        ariaLabel: "Uluru",
      });

      markerRef.current.addListener("click", () => {
        infowindow.open({
          anchor: markerRef.current,
          map,
        });
      }); 
    }
    return () => (markerRef.current.map = null);
  }, [])

  useEffect(() => {
    rootRef.current.render(children)
    markerRef.current.position = position
    markerRef.current.map = map
  }, [map, position, children])
 

}

function MyMapComponent({
  center,
  zoom,
}) {
 
  const [map, setMap] = useState();
  const ref = useRef();

  let [lines, setLines] = useState([])

 
  useEffect(() => {
    fetch("http://localhost:8080/lines", {
      method: "GET",
    }).then(response => response.json())
      .then(data => {
        setLines(data)
     })
  }, []);
  


  useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, {
      center,
      zoom,
      mapId: "cde77eaf8e3682e7",
    }));
  }, []);

  useEffect(() => {
    const socket = init();
  
    socket.onmessage = (event) => {
      const eventData = JSON.parse(event.data)
      switch (eventData.eventType) {
        case "STATION":
          switch (eventData.type) {
            case "DEPART":
              console.log("departs "+eventData.name)
            /*  markers.map(m => {    
                if (m.id === eventData.stationId) {
                  console.log("departure!")
                  const pinScaled = new google.maps.marker.PinElement({
                    scale: 0.85,
                    background: "#008000",
                  });
                  m.marker.content = pinScaled.element
                }
              }) */
              break;
            case "ARRIVE":
          /*    markers.map(m => {    
                if (m.id === eventData.stationId) {
                  console.log("arrival!")
                  const pinScaled = new google.maps.marker.PinElement({
                    scale: 0.85,
                    background: "#000000",
                  });
                  m.marker.content = pinScaled.element
                }
              }) */
              console.log("arrives "+eventData.name)
         
              break;
            default:
          }
          break; 
        case "TRANSPORT":
          transporterMarkers.map(m => {
            if (m.id === eventData.id) {
              m.marker.position = { lat: eventData.latitude, lng: eventData.longitude }
            }
          })
          break;
        default:
      }
    };
  }, []);
   

  useEffect(() => {
    if (map && lines.length !== 0) {
      lines.map(line => {

        let lineColor = "#FF0000"

        switch (line.name.toUpperCase()) {
          case "NORTHERN":
            lineColor = "#0000FF"
            break
          case "PICCADILLY":
            lineColor = "#FCCB00"
            break
          case "BAKERLOO":
            lineColor = "#964B00"
            break
          case "JUBILEE":
            lineColor = "#C0C0C0"
            break
          case "CIRCLE":
            lineColor = "#FFFF00"
            break
          case "DISTRICT":
            lineColor = "#008000"
            break
          case "HAMMERSMITH & CITY":
            lineColor = "#FFC0CB"
            break
          case "METROPOLITAN":
            lineColor = "#FF00FF"
            break
          case "WATERLOO & CITY":
            lineColor = "#40e0d0"
            break
          case "ELIZABETH":
            lineColor = "#800080"
            break
          case "DLR":
            lineColor = "#008080"
            break
          case "VICTORIA":
            lineColor = "#ADD8E6"
            break
          case "CENTRAL":
            lineColor = "#FF0000"
            break
          case "TRAM":
            lineColor = "#adff2f"
            break
          case "RIVER":
            lineColor = "#b06500"
            break
          default:  //overground
            lineColor = "#FFA500"
        }

        const lineSymbol = {
          path: "M 0,-1 0,1",
          strokeOpacity: 1,
          scale: 4,
        };

        new window.google.maps.Polyline({
            path: line.stations.map(line => { return { lat: line.latitude, lng: line.longitude } }),
            geodesic: true,
            strokeColor: lineColor,
            strokeWeight: 4,
            strokeOpacity: 0.0,
            icons: [
              {
                icon: lineSymbol,
                offset: "0",
                repeat: "20px",
              },
            ],
            map
          });
      })
    }
  })

 

  return (<>
    <div ref={ref} id="map" style={{ height: '100vh', width: '100wh' }} />
    {map && <Markers map={map} />}
  </>);
}


function Markers({ map }) {
  let [stations, setStations] = useState([])
  let [transporters, setTransporters] = useState([])
  

  useEffect(() => {
    fetch("http://localhost:8080/stations", {
      method: "GET",
    }).then(response => response.json())
      .then(data => {
        setStations(data)
      })
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/transporters", {
      method: "GET",
    }).then(response => response.json())
      .then(data => {
        setTransporters(data)
      })
  }, []);

  return ( <>
    { stations.length !== 0 &&
      stations.map(station => {
        return (<AdvancedMarker
          position={{ lat: station.latitude, lng: station.longitude }}
          map={map}
          id={ station.id}
          name={station.name}
          lines={station.lines}/>)
      })
    }
    {transporters.length !== 0 &&
      transporters.map(transporter => {
        return (<AdvancedMarkerTransporter
          position={{ lat: 0.0, lng: 0.0 }}
          map={map}
          id={ transporter.id}/>)
      
    })}
  </>)
    
}



function App() {
 
return (
  <Wrapper apiKey="ADD_YOUR_OWN"
           version="beta"
           libraries={["marker"]}>
        <MyMapComponent center={{ lat: 51.5010, lng: -0.1233 }} zoom={13} />
 </Wrapper> )
}

export default App;
