// script.js

// Get references to HTML elements
const canvas = document.getElementById('graph-canvas'); // Canvas for drawing the graph
const ctx = canvas.getContext('2d'); // Canvas context for drawing
const generateBtnRandom = document.getElementById('generate-graph-random'); // Button to generate a new graph
const generateBtnPredefined = document.getElementById('generate-graph-predefined'); // Button to generate a new graph

const graphTypeSelect = document.getElementById('graph-type'); // Selector for graph type (random or predefined)
const predefinedGraphSelect = document.getElementById('predefined-graph-select'); // Selector for predefined graphs
const graphDirectionSelect = document.getElementById('graph-direction'); // Selector for graph direction (directed or undirected)
const modeSelect = document.getElementById('mode'); // Selector for algorithm mode (Eulerian or Hamiltonian)
const pathCircuitSelect = document.getElementById('path-circuit'); // Selector for path or circuit
const startBtn = document.getElementById('start-algorithm'); // Button to start the algorithm
const resetBtn = document.getElementById('reset-graph'); // Button to reset the graph
const stepsDisplay = document.getElementById('steps-display'); // Display area for algorithm steps
const codeDisplay = document.getElementById('code-display'); // Display area for algorithm code

// Set canvas dimensions
// FIXME KHANH

canvas.width = window.innerWidth * 1.5;
canvas.height = window.innerHeight;

function getColor(cssVariableName) {
    const rootStyles = getComputedStyle(document.querySelector(':root'));
    return rootStyles.getPropertyValue('--' + cssVariableName);
}


// Initialize the graph object
let graph = {
    nodes: [],    // Array of nodes in the graph
    edges: [],    // Array of edges in the graph
    directed: false // Indicates if the graph is directed
};

// Utility function to generate a random integer between min and max (inclusive)
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to shuffle an array in place (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
    for (let i = array.length -1; i >0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Predefined graphs for demonstration
const predefinedGraphs = [
    // Corrected Undirected Graph where Eulerian Circuit Exists (All nodes have even degree)
    {
        name: "Eulerian Circuit Exists (Undirected)",
        directed: false,
        nodes: [ { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 } ],
        edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 0 },
            { from: 0, to: 3 },
            { from: 3, to: 4 },
            { from: 4, to: 0 },
        ]
    },
    // Other predefined graphs remain unchanged
    // Eulerian Path Exists but Circuit Does Not (Exactly two nodes have odd degree)
    {
        name: "Eulerian Path Exists (Undirected)",
        directed: false,
        nodes: [ { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 } ],
        edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 4 },
            { from: 4, to: 0 },
            { from: 1, to: 3 }
        ]
    },
    // Hamiltonian Circuit Exists (Graph is a cycle)
    {
        name: "Hamiltonian Circuit Exists (Undirected)",
        directed: false,
        nodes: [ { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 } ],
        edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 4 },
            { from: 4, to: 0 }
        ]
    },
    // Hamiltonian Path Exists but Circuit Does Not (Graph is a path)
    {
        name: "Hamiltonian Path Exists (Undirected)",
        directed: false,
        nodes: [ { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 } ],
        edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 }
        ]
    },
    // === Directed Graphs ===

    // Eulerian Circuit Exists (Directed)
    {
        name: "Eulerian Circuit Exists (Directed)",
        directed: true,
        nodes: [ { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 } ],
        edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 0 },
            { from: 0, to: 3 },
            { from: 3, to: 0 }
        ]
    },
    // Eulerian Path Exists but Circuit Does Not (Directed)
    {
        name: "Eulerian Path Exists (Directed)",
        directed: true,
        nodes: [ { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 } ],
        edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 }
        ]
    },
    // Hamiltonian Circuit Exists (Directed)
    {
        name: "Hamiltonian Circuit Exists (Directed)",
        directed: true,
        nodes: [ { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 } ],
        edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 0 }
        ]
    },
    // Hamiltonian Path Exists but Circuit Does Not (Directed)
    {
        name: "Hamiltonian Path Exists (Directed)",
        directed: true,
        nodes: [ { id: 0 }, { id: 1 }, { id: 2 } ],
        edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 }
        ]
    }
];

// Populate the predefined graph select dropdown
function populatePredefinedGraphSelect() {
    predefinedGraphSelect.innerHTML = "";
    predefinedGraphs.forEach((graph, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = graph.name;
        predefinedGraphSelect.appendChild(option);
    });
}

// C++ Algorithm Codes for code tracing
const cppCodes = {
    eulerianUndirected: `
    void findEulerianUndirected(int startNode) {
        stack<int> currPath;
        vector<int> circuit;
        currPath.push(startNode);
        while (!currPath.empty()) {
            int current = currPath.top();
            if (!adj[current].empty()) {
                int next = adj[current].back();
                adj[current].pop_back();
                adj[next].erase(find(adj[next].begin(), adj[next].end(), current));
                currPath.push(next);
            } else {
                circuit.push_back(current);
                currPath.pop();
            }
        }
        return;
    }`,
    eulerianDirected: `
    void findEulerianDirected(int startNode) {
        stack<int> currPath;
        vector<int> circuit;
        currPath.push(startNode);
        while (!currPath.empty()) {
            int current = currPath.top();
            if (!adj[current].empty()) {
                int next = adj[current].back();
                adj[current].pop_back();
                currPath.push(next);
            } else {
                circuit.push_back(current);
                currPath.pop();
            }
        }
        return;
    }`,
    hamiltonian: `
    bool findHamiltonianPath(int node) {
        path.push_back(node);
        visited[node] = true;
        if (path.size() == numNodes) {
            return true;
        }
        for (int neighbor : adj[node]) {
            if (!visited[neighbor]) {
                if (findHamiltonianPath(neighbor)) 
                    return true;
            }
        }
        visited[node] = false;
        path.pop_back();
        return false;
    }`,
};

// Function to display and highlight C++ code in the code tracer
function displayCode(code, lineNumber = null) {
    const codeLines = code.trim().split('\n');
    codeDisplay.innerHTML = '';
    codeLines.forEach((line, index) => {
        const codeLineElement = document.createElement('div');
        codeLineElement.textContent = line;
        codeLineElement.classList.add('code-line');
        if (index === lineNumber) {
            codeLineElement.classList.add('highlight'); // Highlight the current line
        }
        codeDisplay.appendChild(codeLineElement);
    });
}

// Variables to hold the current C++ code and line mapping
let currentCppCode = '';
let currentCppCodeLines = [];

// Event listener for graph type selection
// FIXME: Phần này bỏ do đã tách 2 loại Graph thành 2 phần khác nhau
// graphTypeSelect.addEventListener('change', () => {
//     if (graphTypeSelect.value === 'predefined') {
//         predefinedGraphSelect.disabled = false;
//         graphDirectionSelect.disabled = true; // Disable graph direction selector
//         populatePredefinedGraphSelect();
//     } else {
//         predefinedGraphSelect.disabled = true;
//         graphDirectionSelect.disabled = false;
//     }
// });

// Function to generate a random undirected or directed graph
function generateRandomGraph(numNodes = 8, numEdges = 12, directed = false) {
    graph = { nodes: [], edges: [], directed: directed };
    // Create nodes with unique IDs
    for (let i = 0; i < numNodes; i++) {
        graph.nodes.push({ id: i, x: 0, y: 0 });
    }
    // Arrange nodes in a circle for better visualization
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 300;
    const angleStep = (2 * Math.PI) / numNodes;
    graph.nodes.forEach((node, index) => {
        node.x = centerX + radius * Math.cos(index * angleStep - Math.PI / 2);
        node.y = centerY + radius * Math.sin(index * angleStep - Math.PI / 2);
    });

    // Generate possible edges between nodes
    let possibleEdges = [];
    if (directed) {
        // For directed graphs, consider all possible edges except self-loops
        for (let i = 0; i < numNodes; i++) {
            for (let j = 0; j < numNodes; j++) {
                if (i !== j) {
                    possibleEdges.push({ from: i, to: j });
                }
            }
        }
    } else {
        // For undirected graphs, consider edges without duplication
        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                possibleEdges.push({ from: i, to: j });
            }
        }
    }
    // Shuffle and select a subset of edges
    shuffleArray(possibleEdges);
    graph.edges = possibleEdges.slice(0, Math.min(numEdges, possibleEdges.length));
}

// Function to load a predefined graph into the graph object
function loadPredefinedGraph(predefGraph) {
    graph = {
        nodes: predefGraph.nodes.map(node => ({ ...node, x: 0, y: 0 })), // Deep copy nodes
        edges: predefGraph.edges.map(edge => ({ ...edge })), // Deep copy edges
        directed: predefGraph.directed
    };
    // Arrange nodes in a circle or other pattern
    arrangeGraphNodes();
}

// Function to arrange nodes on the canvas for visualization
function arrangeGraphNodes() {
    const numNodes = graph.nodes.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 300;
    const angleStep = (2 * Math.PI) / numNodes;
    graph.nodes.forEach((node, index) => {
        node.x = centerX + radius * Math.cos(index * angleStep - Math.PI / 2);
        node.y = centerY + radius * Math.sin(index * angleStep - Math.PI / 2);
    });
}

// Function to draw the graph on the canvas
function drawGraph(options = {}) {
    const {
        currentPathNodes = [], // Nodes currently in the traversal path
        currentPathEdges = [], // Edges currently in the traversal path
        finalPathNodes = [],   // Nodes in the final path
        finalPathEdges = []    // Edges in the final path
    } = options;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    graph.edges.forEach(edge => {
        const from = graph.nodes.find(n => n.id === edge.from);
        const to = graph.nodes.find(n => n.id === edge.to);

        // Determine edge style based on its status in the algorithm
        let strokeStyle = getColor('node-edge'); // Default edge color
        let lineWidth = 2;        // Default edge width

        // Check if edge is in the final path
        if (finalPathEdges.some(fpEdge => isSameEdge(fpEdge, edge))) {
            strokeStyle = 'green';
            lineWidth = 3;
        }
        // Check if edge is in the current traversal path
        else if (currentPathEdges.some(cpEdge => isSameEdge(cpEdge, edge))) {
            strokeStyle = 'orange';
            lineWidth = 3;
        }

        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;

        // Draw the edge line
        ctx.beginPath();
        // Adjust positions to prevent overlapping with node circles
        const fromPos = adjustPosition(from, to);
        const toPos = adjustPosition(to, from);
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);
        ctx.stroke();

        // Draw arrowhead for directed edges
        if (graph.directed) {
            drawArrowhead(fromPos, toPos, strokeStyle);
        }
    });

    // Draw nodes
    graph.nodes.forEach(node => {
        // Determine node style based on its status in the algorithm
        let fillStyle = getColor('node-background');    // Default node fill color
        let strokeStyle = getColor('node-outline');  // Default node border color
        let lineWidth = 1;         // Default node border width

        // Check if node is part of the final path
        if (finalPathNodes.includes(node.id)) {
            fillStyle = 'green';
        }

        // Check if node is part of the current traversal path
        if (currentPathNodes.includes(node.id)) {
            fillStyle = 'orange';
            strokeStyle = 'orange';
            lineWidth = 3;
        }

        // Draw the node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Draw node ID
        ctx.fillStyle = getColor('node-text');
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id, node.x, node.y + 1);
    });
}

// Function to adjust positions to prevent overlapping with node circles (for edge drawing)
function adjustPosition(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const offset = 20; // Radius of the node circle
    return {
        x: from.x + offset * Math.cos(angle),
        y: from.y + offset * Math.sin(angle)
    };
}

// Function to draw arrowheads for directed edges
function drawArrowhead(fromPos, toPos, strokeStyle) {
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const angle = Math.atan2(dy, dx);
    const headLength = 10; // Length of the arrowhead
    const headWidth = 7;   // Width of the arrowhead

    ctx.fillStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(toPos.x, toPos.y);
    ctx.lineTo(
        toPos.x - headLength * Math.cos(angle - Math.PI / 6),
        toPos.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toPos.x - headLength * Math.cos(angle + Math.PI / 6),
        toPos.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
}

// Function to compare edges for equality (considering direction in directed graphs)
function isSameEdge(edge1, edge2) {
    if (graph.directed) {
        return edge1.from === edge2.from && edge1.to === edge2.to;
    } else {
        return (
            (edge1.from === edge2.from && edge1.to === edge2.to) ||
            (edge1.from === edge2.to && edge1.to === edge2.from)
        );
    }
}

// Algorithm Step Recorder to log and display the steps of the algorithm
let steps = [];
function recordStep(codeLine, cppLineNumber = null) {
    if (codeLine != null) {
        steps.push(codeLine);
        stepsDisplay.textContent = steps.join('\n');
        stepsDisplay.scrollTop = stepsDisplay.scrollHeight;
    }
    // Highlight the corresponding line in the code display
    if (cppLineNumber !== null) {
        displayCode(currentCppCode, cppLineNumber);
    }
}

// Variables to track paths and highlights in the graph visualization
let finalPathEdges = [];   // Edges in the final path
let finalPathNodes = [];   // Nodes in the final path
let currentPathEdges = []; // Edges currently being traversed
let currentPathNodes = []; // Nodes currently being traversed

// Get neighbors of a node (adjacent nodes)
function getNeighbors(nodeId) {
    if (graph.directed) {
        // For directed graphs, only consider outgoing edges
        return graph.edges
            .filter(edge => edge.from === nodeId)
            .map(edge => edge.to);
    } else {
        // For undirected graphs, consider all connected edges
        return graph.edges
            .filter(edge => edge.from === nodeId || edge.to === nodeId)
            .map(edge => edge.from === nodeId ? edge.to : edge.from);
    }
}

// Eulerian Path/Circuit Finder using Hierholzer's Algorithm
async function findEulerian() {
    // Select the appropriate C++ code based on graph direction
    if (graph.directed) {
        currentCppCode = cppCodes.eulerianDirected;
    } else {
        currentCppCode = cppCodes.eulerianUndirected;
    }
    displayCode(currentCppCode);
    recordStep("// Starting Eulerian " + (pathCircuitSelect.value), 0);
    await sleep(500);

    if (graph.directed) {
        // Directed graph conditions for Eulerian Path/Circuit
        let inDegrees = {};
        let outDegrees = {};

        // Initialize in-degrees and out-degrees for each node
        graph.nodes.forEach(node => {
            inDegrees[node.id] = 0;
            outDegrees[node.id] = 0;
        });

        // Calculate in-degrees and out-degrees
        graph.edges.forEach(edge => {
            outDegrees[edge.from]++;
            inDegrees[edge.to]++;
        });

        let startNode = null;
        let semiBalanced = 0;

        // Determine if the graph has a Eulerian Path or Circuit
        graph.nodes.forEach(node => {
            let id = node.id;
            if (outDegrees[id] - inDegrees[id] === 1) {
                startNode = id;
                semiBalanced++;
            } else if (inDegrees[id] - outDegrees[id] === 1) {
                semiBalanced++;
            } else if (inDegrees[id] !== outDegrees[id]) {
                semiBalanced += 2;
            }
        });

        if (pathCircuitSelect.value === 'circuit' && semiBalanced === 0) {
            // Eulerian Circuit exists
            if (startNode === null) startNode = graph.nodes[0].id;
        } else if (pathCircuitSelect.value === 'path' && semiBalanced === 2) {
            // Eulerian Path exists
            if (startNode === null) startNode = graph.nodes[0].id;
        } else {
            recordStep("// No Eulerian Path/Circuit exists.");
            return;
        }

        // Hierholzer's algorithm implementation for directed graphs
        let adj = {};
        graph.nodes.forEach(node => adj[node.id] = [...getNeighbors(node.id)]);

        let stack = [];
        let path = [];
        let current = startNode;

        // Initialize the stack with the start node
        stack.push(current);
        currentPathNodes.push(current);
        recordStep(null, 1);
        await sleep(200);
        recordStep(null, 2);
        await sleep(200);
        recordStep(`currPath.push(${current});`, 3);
        drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
        await sleep(200);

        // Main loop of the algorithm
        while (stack.length > 0) {
            recordStep(null, 4);
            await sleep(200);
            current = stack[stack.length -1];
            recordStep(null, 5);
            await sleep(200);
            if (adj[current].length > 0) {
                // Explore edges
                recordStep(null, 6);
                await sleep(200);
                let next = adj[current].pop();
                recordStep(null, 7);
                await sleep(200);
                stack.push(next);
                recordStep(`currPath.push(${next});`, 9);
                await sleep(200);
                currentPathNodes.push(next);

                // Highlight the current traversal edge
                let traversalEdge = { from: current, to: next };
                currentPathEdges.push(traversalEdge);

                drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
                await sleep(200);
            } else {
                // Backtrack
                recordStep(null, 10);
                await sleep(200);
                let node = stack.pop();
                recordStep(null, 11);
                await sleep(200);
                path.push(node);
                currentPathNodes.pop();
                recordStep(`circuit.push(${node}); currPath.pop();`, 12);
                await sleep(200);
                // Move traversed edges to final path edges
                if (stack.length > 0) {
                    let prevNode = stack[stack.length -1];
                    let edge = { from: prevNode, to: node };
                    finalPathEdges.push(edge);

                    // Remove edge from currentPathEdges
                    currentPathEdges = currentPathEdges.filter(e => !isSameEdge(e, edge));
                }
                finalPathNodes.push(node);

                drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
                await sleep(500);
            }
        }
        recordStep("// Eulerian Path/Circuit found:", 15);
        recordStep(path.reverse().join(' -> '));
    } else {
        // Undirected graph conditions for Eulerian Path/Circuit
        let oddDegreeNodes = graph.nodes.filter(node => {
            let degree = getNeighbors(node.id).length;
            return degree % 2 !== 0;
        });
        recordStep(`// Number of odd degree nodes: ${oddDegreeNodes.length}`);
        if (pathCircuitSelect.value === 'circuit' && oddDegreeNodes.length !== 0) {
            recordStep("// No Eulerian Circuit exists.");
            return;
        }
        if (pathCircuitSelect.value === 'path' && (oddDegreeNodes.length !== 0 && oddDegreeNodes.length !== 2)) {
            recordStep("// No Eulerian Path exists.");
            return;
        }
        // Hierholzer's algorithm implementation for undirected graphs
        let adj = {};
        graph.nodes.forEach(node => adj[node.id] = [...getNeighbors(node.id)]);

        let startNode = graph.nodes[0].id;
        if (pathCircuitSelect.value === 'path' && oddDegreeNodes.length === 2) {
            startNode = oddDegreeNodes[0].id;
        }

        let stack = [];
        let path = [];
        let current = startNode;

        // Initialize the stack with the start node
        stack.push(current);
        currentPathNodes.push(current);
        await sleep(200);
        recordStep(null, 1);
        await sleep(200);
        recordStep(null, 2);
        await sleep(200);
        recordStep(`currPath.push(${current});`, 3);
        drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
        await sleep(500);

        // Main loop of the algorithm
        while (stack.length > 0) {
            recordStep(null, 4);
            await sleep(200);
            recordStep(null, 5);
            await sleep(200);
            current = stack[stack.length -1];
            if (adj[current].length > 0) {
                // Explore edges
                recordStep(null, 6);
                await sleep(200);
                let next = adj[current].pop();
                adj[next] = adj[next].filter(id => id !== current);

                stack.push(next);
                currentPathNodes.push(next);
                recordStep(`currPath.push(${next});`, 10);

                // Highlight the current traversal edge
                let traversalEdge = { from: current, to: next };
                currentPathEdges.push(traversalEdge);

                drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
                await sleep(500);
            } else {
                // Backtrack
                recordStep(null, 11);
                await sleep(200);
                let node = stack.pop();
                path.push(node);
                currentPathNodes.pop();
                recordStep(`circuit.push(${node}); currPath.pop();`, 13);

                // Move traversed edges to final path edges
                if (stack.length > 0) {
                    let prevNode = stack[stack.length -1];
                    let edge = { from: node, to: prevNode }; // Note the order for undirected graphs
                    finalPathEdges.push(edge);

                    // Remove edge from currentPathEdges
                    currentPathEdges = currentPathEdges.filter(e => !isSameEdge(e, edge));
                }
                finalPathNodes.push(node);

                drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
                await sleep(500);
            }
        }
        recordStep("// Eulerian Path/Circuit found:", 16);
        recordStep(path.join(' -> '));
    }
}

// Hamiltonian Path/Circuit Finder using Backtracking
async function findHamiltonian() {
    // Set the current C++ code for code tracing
    currentCppCode = cppCodes.hamiltonian;
    displayCode(currentCppCode);
    recordStep("// Starting Hamiltonian " + (pathCircuitSelect.value), 0);
    await sleep(200);

    let path = [];
    let visited = new Set();
    finalPathEdges = [];
    finalPathNodes = [];
    currentPathEdges = [];
    currentPathNodes = [];

    // Recursive backtracking function
    async function backtrack(node) {
        recordStep(`path.push(${node});`, 1);
        await sleep(200);
        recordStep(`visited[${node}] = true;`, 2);
        await sleep(200);
        path.push(node);
        visited.add(node);
        currentPathNodes.push(node);
        drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
        await sleep(500);

        // Check if all nodes are included in the path
        if (path.length === graph.nodes.length) {
            if (pathCircuitSelect.value === 'circuit') {
                // Check if the last node connects to the first to form a circuit
                let last = path[path.length -1];
                let first = path[0];
                if (graph.directed) {
                    if (graph.edges.some(edge => edge.from === last && edge.to === first)) {
                        path.push(first); // Complete the circuit
                        finalPathEdges = [];
                        finalPathNodes = [...path];
                        for (let i = 0; i < path.length -1; i++) {
                            finalPathEdges.push({ from: path[i], to: path[i+1] });
                        }
                        recordStep(null, 3);
                        await sleep(200);
                        recordStep("// Hamiltonian Circuit found:", 4);
                        recordStep(path.join(' -> '));
                        drawGraph({ finalPathNodes, finalPathEdges });
                        await sleep(500);
                        return true;
                    }
                } else {
                    if (graph.edges.some(edge =>
                        (edge.from === last && edge.to === first) || (edge.from === first && edge.to === last))) {
                        path.push(first); // Complete the circuit
                        finalPathEdges = [];
                        finalPathNodes = [...path];
                        for (let i = 0; i < path.length -1; i++) {
                            finalPathEdges.push({ from: path[i], to: path[i+1] });
                        }
                        recordStep(null, 3);
                        await sleep(200);
                        recordStep("// Hamiltonian Circuit found:", 4);
                        recordStep(path.join(' -> '));
                        drawGraph({ finalPathNodes, finalPathEdges });
                        await sleep(500);
                        return true;
                    }
                }
            } else {
                // Hamiltonian Path found
                recordStep("// Hamiltonian Path found:");
                recordStep(path.join(' -> '));
                finalPathEdges = [];
                finalPathNodes = [...path];
                for (let i = 0; i < path.length -1; i++) {
                    finalPathEdges.push({ from: path[i], to: path[i+1] });
                }
                drawGraph({ finalPathNodes, finalPathEdges });
                await sleep(500);
                return true;
            }
        }

        // Explore neighbors
        let neighbors = getNeighbors(node);
        for (let neighbor of neighbors) {
            recordStep(null, 6);
            await sleep(200);
            if (!visited.has(neighbor)) {
                recordStep(null, 7);
                await sleep(200);
                // For directed graphs, ensure edge direction is respected
                if (graph.directed && !graph.edges.some(edge => edge.from === node && edge.to === neighbor)) {
                    continue;
                }
                // Highlight the traversal
                let traversalEdge = { from: node, to: neighbor };
                currentPathEdges.push(traversalEdge);
                drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
                await sleep(500);
                let found = await backtrack(neighbor);
                if (found) {
                    recordStep(null, 8);
                    await sleep(200);
                    recordStep(null, 9);
                    await sleep(200);
                    return true;
                }
                // Remove traversal edge and unhighlight
                currentPathEdges.pop();
                drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
                await sleep(500);
            }
        }

        // Backtrack: Remove current node and update highlights
        recordStep(`visited[${node}] = false;`, 12);
        await sleep(200);
        recordStep('path.pop_back();', 13);
        path.pop();
        visited.delete(node);
        currentPathNodes.pop();
        drawGraph({ currentPathNodes, currentPathEdges, finalPathNodes, finalPathEdges });
        await sleep(500);
        recordStep(null, 14);
        return false;
    }

    // Start from each node to find Hamiltonian Path/Circuit
    for (let start of graph.nodes.map(n => n.id)) {
        recordStep(`// Trying to start from node ${start}`);
        let found = await backtrack(start);
        if (found) return;
    }

    recordStep("// No Hamiltonian Path/Circuit exists.");
}

// Sleep function to control the animation speed
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event listener for the Start Algorithm button
startBtn.addEventListener('click', async () => {
    // Prevent multiple algorithms from running simultaneously
    startBtn.disabled = true;
    generateBtnRandom.disabled = true;
    generateBtnPredefined.disabled = true;
    resetBtn.disabled = true;

    // Reset steps and visualization variables
    steps = [];
    stepsDisplay.textContent = '';
    finalPathEdges = [];
    finalPathNodes = [];
    currentPathEdges = [];
    currentPathNodes = [];
    drawGraph();

    // Determine which algorithm to run based on the mode
    const mode = modeSelect.value;
    if (mode === 'eulerian') {
        await findEulerian();
    } else if (mode === 'hamiltonian') {
        await findHamiltonian();
    }

    // Re-enable buttons after algorithm completes
    startBtn.disabled = false;
    generateBtnRandom.disabled = false;
    generateBtnPredefined.disabled = false;
    resetBtn.disabled = false;
});

// Event listener for the Reset Graph button
resetBtn.addEventListener('click', () => {
    // Reset all variables and redraw the graph
    finalPathEdges = [];
    finalPathNodes = [];
    currentPathEdges = [];
    currentPathNodes = [];
    drawGraph();
    steps = [];
    stepsDisplay.textContent = '';
});

// Event listener for the Generate Graph button
generateBtnRandom.addEventListener('click', () => {
    // Reset steps and visualization variables
    steps = [];
    stepsDisplay.textContent = '';
    finalPathEdges = [];
    finalPathNodes = [];
    currentPathEdges = [];
    currentPathNodes = [];

    // Generate a new graph based on the selected type
    const directed = graphDirectionSelect.value === 'directed';
    generateRandomGraph(randInt(5, 10), randInt(7, 15), directed);
    drawGraph();
});


generateBtnPredefined.addEventListener('click', () => {
    // Reset steps and visualization variables
    steps = [];
    stepsDisplay.textContent = '';
    finalPathEdges = [];
    finalPathNodes = [];
    currentPathEdges = [];
    currentPathNodes = [];

    // Generate a new graph based on the selected type
    const selectedGraphIndex = predefinedGraphSelect.value;
    if (selectedGraphIndex !== "") {
        loadPredefinedGraph(predefinedGraphs[selectedGraphIndex]);
    } else {
        return;
    }
    drawGraph();
});

// Initial Setup: Populate the predefined graph selector and generate an initial graph
populatePredefinedGraphSelect();
// graphTypeSelect.dispatchEvent(new Event('change'));
generateBtnRandom.click();


// TODO: KHANHH
window.addEventListener("load", () => {
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth * 1.5;
        canvas.height = window.innerHeight;
        arrangeGraphNodes();
        drawGraph();
    });
});



