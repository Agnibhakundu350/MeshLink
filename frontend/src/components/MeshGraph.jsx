import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

const elements = [
  { data: { id: "AI", label: "AI CORE", type: "core" }, position: { x: 320, y: 170 } },
  { data: { id: "A", label: "ESP32-A", type: "node" }, position: { x: 110, y: 90 } },
  { data: { id: "B", label: "ESP32-B", type: "node" }, position: { x: 210, y: 260 } },
  { data: { id: "C", label: "ESP32-C", type: "node" }, position: { x: 430, y: 78 } },
  { data: { id: "D", label: "RELAY-01", type: "relay" }, position: { x: 525, y: 260 } },
  { data: { id: "F", label: "NODE-F", type: "node" }, position: { x: 650, y: 145 } },
  { data: { id: "A-B", source: "A", target: "B" } },
  { data: { id: "A-AI", source: "A", target: "AI" } },
  { data: { id: "B-AI", source: "B", target: "AI" } },
  { data: { id: "AI-C", source: "AI", target: "C" } },
  { data: { id: "AI-D", source: "AI", target: "D" } },
  { data: { id: "C-F", source: "C", target: "F" } },
  { data: { id: "D-F", source: "D", target: "F" } }
];

const nodeMap = {
  "NODE-A": "A",
  "NODE-B": "B",
  "NODE-C": "C",
  "NODE-D": "D",
  "NODE-E": "D",
  "NODE-F": "F",
  "RELAY-01": "D",
  "AI-CORE": "AI"
};

export default function MeshGraph({ intel }) {
  const container = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!container.current) return undefined;

    cyRef.current = cytoscape({
      container: container.current,
      elements,
      layout: { name: "preset" },
      userZoomingEnabled: false,
      userPanningEnabled: false,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "#22d3ee",
            color: "#e2e8f0",
            "font-size": 11,
            "font-weight": 900,
            "text-valign": "bottom",
            "text-margin-y": 8,
            width: 44,
            height: 44,
            "border-color": "#67e8f9",
            "border-width": 2,
            "shadow-blur": 18,
            "shadow-color": "#22d3ee",
            "shadow-opacity": 0.45
          }
        },
        { selector: 'node[type="core"]', style: { "background-color": "#a78bfa", "border-color": "#ddd6fe", width: 58, height: 58 } },
        { selector: 'node[type="relay"]', style: { "background-color": "#34d399", "border-color": "#bbf7d0" } },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#155e75",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#155e75",
            "curve-style": "bezier",
            "line-style": "dashed",
            "line-dash-pattern": [8, 5]
          }
        },
        {
          selector: ".hot",
          style: {
            "line-color": "#22d3ee",
            "target-arrow-color": "#22d3ee",
            width: 4,
            "shadow-blur": 18,
            "shadow-color": "#22d3ee",
            "shadow-opacity": 0.8
          }
        },
        {
          selector: ".packet",
          style: {
            "line-color": "#67e8f9",
            "target-arrow-color": "#67e8f9",
            width: 5,
            "shadow-blur": 26,
            "shadow-color": "#22d3ee",
            "shadow-opacity": 1
          }
        },
        {
          selector: ".active-node",
          style: {
            width: 54,
            height: 54,
            "shadow-blur": 28,
            "shadow-opacity": 0.95
          }
        },
        {
          selector: ".reroute",
          style: {
            "line-color": "#34d399",
            "target-arrow-color": "#34d399",
            width: 5,
            "shadow-blur": 22,
            "shadow-color": "#34d399",
            "shadow-opacity": 0.9
          }
        },
        {
          selector: ".broken",
          style: {
            "line-color": "#fb7185",
            "target-arrow-color": "#fb7185",
            width: 4,
            "line-style": "dotted",
            "shadow-blur": 18,
            "shadow-color": "#fb7185",
            "shadow-opacity": 0.9
          }
        },
        {
          selector: ".critical",
          style: {
            "background-color": "#fb7185",
            "border-color": "#fecdd3",
            "shadow-color": "#fb7185",
            "shadow-opacity": 0.9
          }
        }
      ]
    });

    const packetTimer = window.setInterval(() => {
      const cy = cyRef.current;
      if (!cy) return;

      const edges = cy.edges();
      const nodes = cy.nodes();
      const edgeIndex = Math.floor(Date.now() / 450) % Math.max(edges.length, 1);

      edges.removeClass("packet");
      edges.eq(edgeIndex).addClass("packet");

      cy.$("#AI").animate({ style: { width: 66, height: 66 } }, { duration: 360 }).animate({ style: { width: 58, height: 58 } }, { duration: 360 });
      nodes.filter(".active-node, .critical").animate({ style: { width: 58, height: 58 } }, { duration: 320 }).animate({ style: { width: 48, height: 48 } }, { duration: 320 });
    }, 520);

    return () => {
      window.clearInterval(packetTimer);
      cyRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass("hot critical reroute broken active-node");
    cy.edges().forEach((edge, index) => {
      window.setTimeout(() => edge.addClass("hot"), index * 90);
    });

    const activeNode = nodeMap[intel.node];
    if (activeNode && activeNode !== "AI") {
      cy.$(`#${activeNode}`).addClass(`active-node ${intel.severity === "CRITICAL" ? "critical" : "hot"}`);
    }

    if (intel.node === "NODE-F" || intel.emergency.includes("NODE")) {
      cy.$("#F").addClass("critical");
      cy.$("#C-F, #D-F").addClass("broken");
      cy.$("#B-AI, #AI-D").addClass("reroute");
    }

    if (intel.severity === "CRITICAL") {
      cy.$("#AI").addClass("hot");
      cy.$("#B-AI, #AI-D").addClass("hot");
    }
  }, [intel]);

  return (
    <section className={`ares-card ${intel.severity === "CRITICAL" ? "ares-critical-panel" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="ares-section-title">Self-Healing Rescue Swarm</h2>
        <span className="ares-live-pill">PACKET REROUTING</span>
      </div>
      <div ref={container} className="h-[420px] rounded-md border border-cyan-400/20 bg-[#06111f]" />
    </section>
  );
}
