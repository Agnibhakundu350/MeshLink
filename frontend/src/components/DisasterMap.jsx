import React from "react";
import { Circle, CircleMarker, MapContainer, Polyline, Popup, Rectangle, Tooltip } from "react-leaflet";
import { CRS } from "leaflet";

const bounds = [[0, 0], [100, 100]];
const rescueNodes = [
  { id: "NODE-A", pos: [72, 22], status: "stable" },
  { id: "NODE-B", pos: [54, 43], status: "warning" },
  { id: "NODE-C", pos: [38, 66], status: "stable" },
  { id: "NODE-D", pos: [22, 32], status: "stable" },
  { id: "NODE-E", pos: [64, 76], status: "stable" },
  { id: "NODE-F", pos: [18, 78], status: "stable" }
];

const sosMarkers = [
  { id: "SOS-1", pos: [62, 58], priority: "critical" },
  { id: "SOS-2", pos: [48, 24], priority: "warning" },
  { id: "SOS-3", pos: [28, 50], priority: "critical" }
];

function colorFor(status) {
  if (status === "critical" || status === "failed") return "#fb7185";
  if (status === "warning") return "#fbbf24";
  return "#34d399";
}

export default function DisasterMap({ intel, internetOffline }) {
  const criticalNode = rescueNodes.find((node) => node.id === intel.node) || rescueNodes[1];
  const route = intel.node === "NODE-F" ? [[10, 12], [22, 32], [54, 43], [72, 86]] : [[10, 12], criticalNode.pos, [72, 86]];
  const dangerRadius = intel.severity === "CRITICAL" ? 18 : intel.severity === "WARNING" ? 12 : 8;

  return (
    <section className={`ares-card ${intel.severity === "CRITICAL" ? "ares-critical-panel" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="ares-section-title">Live Disaster Map</h2>
        <span className="ares-live-pill">{internetOffline ? "OFFLINE MAP ACTIVE" : "CLOUD MAP READY"}</span>
      </div>

      <div className="overflow-hidden rounded-md border border-cyan-400/20">
        <MapContainer
          className="h-[420px] w-full bg-[#06111f]"
          crs={CRS.Simple}
          bounds={bounds}
          maxBounds={bounds}
          minZoom={-1}
          zoom={1}
          center={[50, 50]}
          zoomControl={false}
          attributionControl={false}
        >
          <Rectangle bounds={bounds} pathOptions={{ color: "#164e63", weight: 1, fillColor: "#07111f", fillOpacity: 1 }} />
          <Rectangle bounds={[[8, 8], [92, 92]]} pathOptions={{ color: "#0e7490", weight: 1, dashArray: "6 8", fillOpacity: 0 }} />
          <Circle center={criticalNode.pos} radius={dangerRadius} pathOptions={{ color: "#fb7185", fillColor: "#fb7185", fillOpacity: 0.12, weight: 2, className: "leaflet-danger-zone" }} />
          <Polyline positions={route} pathOptions={{ color: "#22d3ee", weight: 3, dashArray: "8 8", className: "leaflet-route-line" }} />

          {rescueNodes.map((node) => {
            const active = node.id === intel.node;
            const failed = intel.node === "NODE-F" && node.id === "NODE-F";
            const status = failed ? "failed" : active && intel.severity !== "NORMAL" ? "critical" : node.status;
            return (
              <CircleMarker
                key={node.id}
                center={node.pos}
                radius={active ? 10 : 7}
                pathOptions={{ color: colorFor(status), fillColor: colorFor(status), fillOpacity: 0.9, weight: 2, className: active ? "leaflet-sos-pulse" : "" }}
              >
                <Tooltip permanent direction="top" offset={[0, -8]}>{node.id}</Tooltip>
                <Popup>{node.id} - {status.toUpperCase()}</Popup>
              </CircleMarker>
            );
          })}

          {sosMarkers.map((marker) => (
            <CircleMarker
              key={marker.id}
              center={marker.pos}
              radius={9}
              pathOptions={{ color: colorFor(marker.priority), fillColor: colorFor(marker.priority), fillOpacity: 0.75, weight: 2, className: "leaflet-sos-pulse" }}
            >
              <Popup>{marker.id} - SOS {marker.priority.toUpperCase()}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
