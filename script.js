document.addEventListener('DOMContentLoaded', () => {

    // --- DATA STRUCTURE ---
    class Graph {
        constructor() {
            this.vertices = new Map();
            this.edges = [];
            this.vertexCounter = 0; 
        }

        addVertex() {
            const id = String.fromCharCode(65 + this.vertexCounter++);
            // Add to map with random coordinates
            const x = Math.random() * (svg.width.baseVal.value - 60) + 30;
            const y = Math.random() * (svg.height.baseVal.value - 60) + 30;
            this.vertices.set(id, { x, y });
            return id;
        }

        removeVertex(id) {
            if (!this.vertices.has(id)) return;
            this.vertices.delete(id);
            // Filter out edges connected to this vertex
            this.edges = this.edges.filter(edge => edge.from !== id && edge.to !== id);
        }

        addEdge(from, to) {
            // Check if vertices exist
            if (!this.vertices.has(from) || !this.vertices.has(to)) {
                alert("Both vertices must exist to add an edge.");
                return;
            }
            // Check if edge already exists
            const exists = this.edges.some(edge => 
                (edge.from === from && edge.to === to)
            );
            if (!exists) {
                this.edges.push({ from, to });
            }
        }

        removeEdge(from, to) {
            this.edges = this.edges.filter(edge => 
                !(edge.from === from && edge.to === to)
            );
        }

        getAdjacencyList() {
            const list = new Map();
            // Initialize list with empty arrays for all vertices
            for (const id of this.vertices.keys()) {
                list.set(id, []);
            }
            // Populate the list
            for (const edge of this.edges) {
                list.get(edge.from).push(edge.to);
            }
            return list;
        }

        getAdjacencyMatrix() {
            const sortedIds = Array.from(this.vertices.keys()).sort();
            const size = sortedIds.length;
            const matrix = Array(size).fill(0).map(() => Array(size).fill(0));
            
            // Create a map for quick index lookup
            const indexMap = new Map(sortedIds.map((id, i) => [id, i]));

            for (const edge of this.edges) {
                const fromIndex = indexMap.get(edge.from);
                const toIndex = indexMap.get(edge.to);
                if (fromIndex !== undefined && toIndex !== undefined) {
                    matrix[fromIndex][toIndex] = 1;
                }
            }
            return { matrix, ids: sortedIds };
        }
    }

    // --- DOM REFERENCES ---
    const svg = document.getElementById('graph-svg');
    const addVertexBtn = document.getElementById('add-vertex-btn');
    
    const removeVertexBtn = document.getElementById('remove-vertex-btn');
    const removeVertexSelect = document.getElementById('remove-vertex-select');
    
    const addEdgeBtn = document.getElementById('add-edge-btn');
    const addEdgeFromSelect = document.getElementById('add-edge-from-select');
    const addEdgeToSelect = document.getElementById('add-edge-to-select');
    
    const removeEdgeBtn = document.getElementById('remove-edge-btn');
    const removeEdgeFromSelect = document.getElementById('remove-edge-from-select');
    const removeEdgeToSelect = document.getElementById('remove-edge-to-select');
    
    const showListBtn = document.getElementById('show-list-btn');
    const showMatrixBtn = document.getElementById('show-matrix-btn');
    const listView = document.getElementById('list-view');
    const matrixView = document.getElementById('matrix-view');

    // --- NEW: DOM References for Properties ---
    const propVertices = document.getElementById('prop-vertices');
    const propEdges = document.getElementById('prop-edges');
    const propDensity = document.getElementById('prop-density');
    const propSourceNodes = document.getElementById('prop-source-nodes');
    const propSinkNodes = document.getElementById('prop-sink-nodes');

    // --- INSTANCE ---
    const graph = new Graph();

    // --- RENDER FUNCTIONS ---
    
    // Main render function to update everything
    function renderAll() {
        renderGraph();
        renderAdjacencyList();
        renderAdjacencyMatrix();
        updateVertexSelects();
        renderGraphProperties(); // <-- Call to new function
    }

    // Render the SVG
    function renderGraph() {
        svg.innerHTML = ''; // Clear SVG

        // Create a 'g' group for edges so they are "under" vertices
        const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Draw Edges
        for (const edge of graph.edges) {
            const fromVertex = graph.vertices.get(edge.from);
            const toVertex = graph.vertices.get(edge.to);

            if (fromVertex && toVertex) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', fromVertex.x);
                line.setAttribute('y1', fromVertex.y);
                line.setAttribute('x2', toVertex.x);
                line.setAttribute('y2', toVertex.y);
                line.setAttribute('class', 'edge');
                edgeGroup.appendChild(line);
            }
        }
        svg.appendChild(edgeGroup);

        // Create a 'g' group for vertices
        const vertexGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Draw Vertices and Labels
        for (const [id, { x, y }] of graph.vertices.entries()) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 15);
            circle.setAttribute('class', 'vertex');
            vertexGroup.appendChild(circle);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', y);
            label.setAttribute('class', 'vertex-label');
            label.textContent = id;
            vertexGroup.appendChild(label);
        }
        svg.appendChild(vertexGroup);
    }

    // Render the Adjacency List
    function renderAdjacencyList() {
        const list = graph.getAdjacencyList();
        if (list.size === 0) {
            listView.innerHTML = "<p>Graph is empty.</p>";
            return;
        }
        
        let html = "<ul>";
        for (const [id, neighbors] of list.entries()) {
            html += `<li><strong>${id}</strong> → [ ${neighbors.join(', ')} ]</li>`;
        }
        html += "</ul>";
        listView.innerHTML = html;
    }

    // Render the Adjacency Matrix
    function renderAdjacencyMatrix() {
        const { matrix, ids } = graph.getAdjacencyMatrix();
        if (ids.length === 0) {
            matrixView.innerHTML = "<p>Graph is empty.</p>";
            return;
        }

        let html = "<table>";
        // Header row
        html += "<tr><th>&nbsp;</th>";
        for (const id of ids) {
            html += `<th>${id}</th>`;
        }
        html += "</tr>";

        // Data rows
        for (let i = 0; i < ids.length; i++) {
            html += `<tr><th>${ids[i]}</th>`;
            for (let j = 0; j < ids.length; j++) {
                html += `<td>${matrix[i][j]}</td>`;
            }
            html += "</tr>";
        }
        html += "</table>";
        matrixView.innerHTML = html;
    }
    
    // Populates all dropdowns with the current list of vertices
    function updateVertexSelects() {
        const sortedIds = Array.from(graph.vertices.keys()).sort();
        
        // List of all select elements and their default "placeholder" text
        const selectsToUpdate = [
            { el: removeVertexSelect, placeholder: "Select Vertex" },
            { el: addEdgeFromSelect, placeholder: "From Vertex" },
            { el: addEdgeToSelect, placeholder: "To Vertex" },
            { el: removeEdgeFromSelect, placeholder: "From Vertex" },
            { el: removeEdgeToSelect, placeholder: "To Vertex" }
        ];

        for (const item of selectsToUpdate) {
            const selectEl = item.el;
            const currentVal = selectEl.value; // Save current selection
            
            // Clear existing options
            selectEl.innerHTML = ''; 
            
            // Add default placeholder
            const placeholder = document.createElement('option');
            placeholder.value = "";
            placeholder.textContent = item.placeholder;
            placeholder.disabled = true;
            selectEl.appendChild(placeholder);

            // Add all current vertices
            for (const id of sortedIds) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = id;
                selectEl.appendChild(option);
            }
            
            // Try to restore the previous selection
            selectEl.value = currentVal; 
            if (selectEl.value === "") {
                // Ensure placeholder is selected if the old value is gone
                selectEl.selectedIndex = 0;
            }
        }
    }

    // --- NEW FUNCTION: Renders the properties panel ---
    function renderGraphProperties() {
        const v = graph.vertices.size;
        const e = graph.edges.length;

        // 1. Set Vertex and Edge Counts
        propVertices.textContent = v;
        propEdges.textContent = e;

        // 2. Calculate Density
        // For a directed graph, E_max = V * (V - 1)
        if (v <= 1) {
            propDensity.textContent = "N/A";
        } else {
            const maxEdges = v * (v - 1);
            const density = e / maxEdges;
            propDensity.textContent = density.toFixed(3); // Show as a decimal
        }

        // 3. Find Source and Sink Nodes
        if (v === 0) {
            propSourceNodes.textContent = "N/A";
            propSinkNodes.textContent = "N/A";
            return;
        }

        const allVertices = new Set(graph.vertices.keys());
        const hasIncomingEdge = new Set();
        const hasOutgoingEdge = new Set();

        for (const edge of graph.edges) {
            hasOutgoingEdge.add(edge.from);
            hasIncomingEdge.add(edge.to);
        }

        const sourceNodes = [];
        const sinkNodes = [];

        for (const id of allVertices) {
            if (!hasIncomingEdge.has(id)) {
                sourceNodes.push(id);
            }
            if (!hasOutgoingEdge.has(id)) {
                sinkNodes.push(id);
            }
        }

        // 4. Display Source and Sink Nodes
        propSourceNodes.textContent = sourceNodes.length > 0 ? sourceNodes.join(', ') : "None";
        propSinkNodes.textContent = sinkNodes.length > 0 ? sinkNodes.join(', ') : "None";
    }

    // --- EVENT LISTENERS ---

    // Add Vertex
    addVertexBtn.addEventListener('click', () => {
        graph.addVertex();
        renderAll();
    });

    // Remove Vertex
    removeVertexBtn.addEventListener('click', () => {
        const id = removeVertexSelect.value; // Get value from select
        if (id) {
            graph.removeVertex(id);
            renderAll();
        }
    });

    // Add Edge
    addEdgeBtn.addEventListener('click', () => {
        const from = addEdgeFromSelect.value; // Get value from select
        const to = addEdgeToSelect.value;   // Get value from select
        if (from && to) {
            graph.addEdge(from, to);
            renderAll();
            // Reset dropdowns to placeholder
            addEdgeFromSelect.value = "";
            addEdgeToSelect.value = "";
        }
    });

    // Remove Edge
    removeEdgeBtn.addEventListener('click', () => {
        const from = removeEdgeFromSelect.value; // Get value from select
        const to = removeEdgeToSelect.value;   // Get value from select
        if (from && to) {
            graph.removeEdge(from, to);
            renderAll();
            // Reset dropdowns to placeholder
            removeEdgeFromSelect.value = "";
            removeEdgeToSelect.value = "";
        }
    });

    // View Toggling
    showListBtn.addEventListener('click', () => {
        listView.classList.remove('hidden');
        matrixView.classList.add('hidden');
        showListBtn.classList.add('active');
        showMatrixBtn.classList.remove('active');
    });

    showMatrixBtn.addEventListener('click', () => {
        matrixView.classList.remove('hidden');
        listView.classList.add('hidden');
        showMatrixBtn.classList.add('active');
        showListBtn.classList.remove('active');
    });

    // Initial render
    renderAll();
});