function getColor(cssVariableName) {
    const rootStyles = getComputedStyle(document.querySelector(':root'));
    return rootStyles.getPropertyValue('--' + cssVariableName);
}

const SPEED = 200;

class Node {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = x;
        this.y = y;
        this.color = getColor('node-outline');
        const edgeColor = getColor('node-edge');
        this.leftEdgeColor = edgeColor;
        this.rightEdgeColor = edgeColor;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    async insert(value, onStep, ctx, canvas, showSteps = true) {
        const newNode = new Node(value);
        this.root = await this.insertNode(this.root, newNode, onStep, ctx, canvas, showSteps);
        this.resetColors();
        this.resetColors();
        this.redrawTree(ctx, canvas);
    }

    async insertNode(node, newNode, onStep, ctx, canvas, showSteps = true) {
        await this.highlightCppCode('insert', 0);
        await this.sleep(showSteps ? SPEED : 0);

        if (node === null) {
            await this.highlightCppCode('insert', 1);
            if (showSteps) {
                onStep(`// Node is null, creating new node with value ${newNode.value}`);
            }
            await this.sleep(showSteps ? SPEED : 0);

            await this.highlightCppCode('insert', 2);
            await this.sleep(showSteps ? SPEED : 0);

            return newNode;
        }

        if (showSteps) {
            node.color = "orange";
            this.redrawTree(ctx, canvas);
            await this.sleep(SPEED);
        }

        await this.highlightCppCode('insert', 4);
        await this.sleep(showSteps ? SPEED : 0);

        if (newNode.value < node.value) {
            await this.highlightCppCode('insert', 4);
            await this.sleep(SPEED);
            if (showSteps) {
                onStep(`if (${newNode.value} < ${node.value}) { \n   node->left = insert(node->left, ${newNode.value}); \n}`);
            }
            await this.highlightCppCode('insert', 5);
            await this.sleep(showSteps ? 1000 : 0);

            node.leftEdgeColor = "orange";
            this.redrawTree(ctx, canvas);
            node.left = await this.insertNode(node.left, newNode, onStep, ctx, canvas, showSteps);

            if (node.left === newNode) {
                node.left.color = "green";
                this.redrawTree(ctx, canvas);
                await this.sleep(SPEED);
            }
        } else if (newNode.value > node.value) {
            await this.highlightCppCode('insert', 6);
            await this.sleep(SPEED);
            if (showSteps) {
                onStep(`else if (${newNode.value} > ${node.value}) { \n   node->right = insert(node->right, ${newNode.value}); \n}`);
            }
            await this.highlightCppCode('insert', 7);
            await this.sleep(showSteps ? 1000 : 0);

            node.rightEdgeColor = "orange";
            this.redrawTree(ctx, canvas);
            node.right = await this.insertNode(node.right, newNode, onStep, ctx, canvas, showSteps);

            if (node.right === newNode) {
                node.right.color = "green";
                this.redrawTree(ctx, canvas);
                await this.sleep(SPEED);
            }
        }

        if (showSteps) {
            node.color = getColor("node-edge");
            node.leftEdgeColor = getColor("node-edge");
            node.rightEdgeColor = getColor("node-edge");
            this.redrawTree(ctx, canvas);
            await this.sleep(SPEED);
        }

        await this.highlightCppCode('insert', 9);
        await this.sleep(showSteps ? SPEED : 0);
        return node;
    }

    async delete(value, onStep, ctx, canvas) {
        if (this.root === null) {
            await this.highlightCppCode('delete', 1);
            onStep(`// The tree is empty.`);
        } else {
            this.root = await this.deleteNode(this.root, value, onStep, ctx, canvas);
            this.redrawTree(ctx, canvas);
            onStep(`// Deletion of ${value} complete.`);
        }
        this.resetColors();
        this.redrawTree(ctx, canvas);
    }

    async deleteNode(node, value, onStep, ctx, canvas) {
        await this.highlightCppCode('delete', 0);
        await this.sleep(SPEED);

        if (node === null) {
            await this.highlightCppCode('delete', 1);
            onStep(`// Node ${value} not found. Return null.`);
            await this.sleep(SPEED);
            return null;
        }

        node.color = "orange";
        this.redrawTree(ctx, canvas);
        await this.sleep(SPEED);

        if (value < node.value) {
            await this.highlightCppCode('delete', 2);
            onStep(`if (${value} < ${node.value}) { \n   node->left = deleteNode(node->left, ${value}); \n}`);
            await this.sleep(SPEED);
            await this.highlightCppCode('delete', 3);
            await this.sleep(1000);
            node.leftEdgeColor = "orange";
            this.redrawTree(ctx, canvas);
            node.left = await this.deleteNode(node.left, value, onStep, ctx, canvas);
        } else if (value > node.value) {
            await this.highlightCppCode('delete', 4);
            onStep(`else if (${value} > ${node.value}) { \n   node->right = deleteNode(node->right, ${value}); \n}`);
            await this.sleep(SPEED);
            await this.highlightCppCode('delete', 5);
            await this.sleep(1000);
            node.rightEdgeColor = "orange";
            this.redrawTree(ctx, canvas);
            node.right = await this.deleteNode(node.right, value, onStep, ctx, canvas);
        } else {
            await this.highlightCppCode('delete', 6);
            onStep(`// Node ${value} found. Deleting...`);
            await this.sleep(SPEED);

            if (node.left === null && node.right === null) {
                await this.highlightCppCode('delete', 7);
                onStep(`// Node ${value} is a leaf node. Delete it.\nif (node->left == nullptr && node->right == nullptr) {\n   delete node;\n   return nullptr;\n}`);
                await this.sleep(SPEED);
                await this.highlightCppCode('delete', 8);
                await this.sleep(SPEED);
                await this.highlightCppCode('delete', 9);
                await this.animateDeletion(node, ctx, canvas);
                return null;
            } else if (node.left === null) {
                await this.highlightCppCode('delete', 10);
                onStep(`// Node ${value} has only right child. Replace node with right child.\nif (node->left == nullptr) {\n   Node* temp = node->right;\n   delete node;\n   return temp;\n}`);
                await this.sleep(SPEED);
                await this.highlightCppCode('delete', 11);
                await this.highlightCppCode('delete', 12);
                await this.highlightCppCode('delete', 13);
                await this.animateDeletion(node, ctx, canvas);
                return node.right;
            } else if (node.right === null) {
                await this.highlightCppCode('delete', 14);
                onStep(`// Node ${value} has only left child. Replace node with left child.\nif (node->right == nullptr) {\n   Node* temp = node->left;\n   delete node;\n   return temp;\n}`);
                await this.sleep(SPEED);
                await this.highlightCppCode('delete', 15);
                await this.highlightCppCode('delete', 16);
                await this.highlightCppCode('delete', 17);
                await this.animateDeletion(node, ctx, canvas);
                return node.left;
            } else {
                await this.highlightCppCode('delete', 18);
                const successor = this.minValueNode(node.right);
                onStep(`// Node ${value} has two children. Finding successor: ${successor.value}\nNode* successor = minValueNode(node->right);\nnode->value = successor->value;\nnode->right = deleteNode(node->right, successor->value);`);
                await this.sleep(SPEED);
                await this.highlightCppCode('delete', 19);
                node.value = successor.value;
                await this.highlightCppCode('delete', 20);
                await this.sleep(SPEED);
                await this.highlightCppCode('delete', 21);
                node.right = await this.deleteNode(node.right, successor.value, onStep, ctx, canvas);
            }
        }

        node.color = getColor("node-edge");
        node.leftEdgeColor = getColor("node-edge");
        node.rightEdgeColor = getColor("node-edge");
        this.redrawTree(ctx, canvas);
        await this.sleep(SPEED);

        await this.highlightCppCode('delete', 25);
        return node;
    }

    async find(value, onStep, ctx, canvas) {
        if (this.root === null) {
            await this.highlightCppCode('find', 0);
            onStep(`// The tree is empty.`);
            return null;
        } else {
            onStep(`// Find node ${value} :`);
            return await this.findNode(this.root, value, onStep, ctx, canvas);
        }
    }

    async findNode(node, value, onStep, ctx, canvas) {
        await this.highlightCppCode('find', 0);
        await this.sleep(SPEED);

        if (node === null || node.value === value) {
            await this.highlightCppCode('find', 1);
            if (node === null) {
                onStep(`// Node ${value} not found.`);
                document.getElementById('nodeNotFoundNotification').innerText = `Node ${value} not found.`
                document.getElementById('nodeNotFoundNotification').setAttribute('data-status', 'shown')
                document.getElementById('nodeNotFoundNotification').setAttribute('data-status', 'hidden')

            } else {
                onStep(`// Node ${value} found!`);
                node.color = "green";
                this.redrawTree(ctx, canvas);
            }
            await this.highlightCppCode('find', 2);
            await this.sleep(999999);
            return node;
        }

        node.color = "orange";
        this.redrawTree(ctx, canvas);
        await this.sleep(SPEED);

        if (value < node.value) {
            await this.highlightCppCode('find', 4);
            await this.sleep(SPEED);
            await this.highlightCppCode('find', 5);
            onStep(`if (${value} < ${node.value}) { \n   return findNode(node->left, ${value}); \n}`);
            await this.sleep(1000);
            node.leftEdgeColor = "orange";
            this.redrawTree(ctx, canvas);
            const result = await this.findNode(node.left, value, onStep, ctx, canvas);
            node.leftEdgeColor = getColor('node-edge');
            this.redrawTree(ctx, canvas);
            return result;
        } else {
            await this.highlightCppCode('find', 6);
            await this.sleep(SPEED);
            await this.highlightCppCode('find', 7);
            onStep(`else { \n   return findNode(node->right, ${value}); \n}`);
            await this.sleep(1000);
            node.rightEdgeColor = "orange";
            this.redrawTree(ctx, canvas);
            const result = await this.findNode(node.right, value, onStep, ctx, canvas);
            node.rightEdgeColor = getColor('node-edge');
            this.redrawTree(ctx, canvas);
            return result;
        }
    }

    async highlightCppCode(operation, lineNumber) {
        const codeContainer = document.getElementById('cppCodeContainer');
        const lines = codeContainer.getElementsByTagName('div');

        for (let i = 0; i < lines.length; i++) {
            lines[i].classList.remove('highlighted');
        }

        if (lines[lineNumber]) {
            lines[lineNumber].classList.add('highlighted');
        }

        // Wait for a short time to ensure the highlight is visible
        await this.sleep(SPEED);
    }

    resetColors() {
        const resetNodeColors = (node) => {
            if (node === null) return;
            node.color = getColor('node-outline');
            const edgeColor = getColor('node-edge');
            node.leftEdgeColor = edgeColor;
            node.rightEdgeColor = edgeColor;
            resetNodeColors(node.left);
            resetNodeColors(node.right);
        };
        resetNodeColors(this.root);
    }

    async insertBalanced(values, ctx, canvas, showSteps = false) {
        const sortedValues = values.sort((a, b) => a - b);
        this.root = await this.buildBalancedTree(sortedValues, 0, sortedValues.length - 1, showSteps ? ctx : null, canvas);
        this.redrawTree(ctx, canvas);
    }

    async buildBalancedTree(sortedValues, start, end, ctx, canvas) {
        if (start > end) {
            return null;
        }

        const mid = Math.floor((start + end) / 2);
        const newNode = new Node(sortedValues[mid]);

        newNode.left = await this.buildBalancedTree(sortedValues, start, mid - 1, ctx, canvas);
        newNode.right = await this.buildBalancedTree(sortedValues, mid + 1, end, ctx, canvas);

        if (ctx) this.redrawTree(ctx, canvas);

        return newNode;
    }

    async animateDeletion(node, ctx, canvas) {
        for (let i = 1.0; i >= 0; i -= 0.1) {
            node.color = `rgba(255, 0, 0, ${i})`;
            this.redrawTree(ctx, canvas);
            await this.sleep(100);
        }
        node.color = getColor('node-edge');
    }

    minValueNode(node) {
        let current = node;
        while (current.left !== null) {
            current = current.left;
        }
        return current;
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    drawNode(ctx, node) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.strokeStyle = node.color;

        ctx.stroke();
        ctx.fillStyle = getColor('node-background');
        ctx.fill();
        ctx.fillStyle = getColor('node-text');
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.value, node.x, node.y + 1);
    }

    drawEdge(ctx, x1, y1, x2, y2, color) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawTree(ctx, node, x, y, levelDistance, horizontalSpacing) {
        if (node === null) return;

        node.x = x;
        node.y = y;

        if (node.left !== null) {
            const leftX = x - horizontalSpacing;
            const leftY = y + levelDistance;
            this.drawEdge(ctx, x, y, leftX, leftY, node.leftEdgeColor);
            this.drawTree(ctx, node.left, leftX, leftY, levelDistance, horizontalSpacing / 2);
        }

        if (node.right !== null) {
            const rightX = x + horizontalSpacing;
            const rightY = y + levelDistance;
            this.drawEdge(ctx, x, y, rightX, rightY, node.rightEdgeColor);
            this.drawTree(ctx, node.right, rightX, rightY, levelDistance, horizontalSpacing / 2);
        }

        this.drawNode(ctx, node);
    }

    redrawTree(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const levelDistance = 50;
        const horizontalSpacing = GLOBAL_NODE_COUNT * 8;
        this.drawTree(ctx, this.root, canvas.width / 2, 125, levelDistance, horizontalSpacing);
    }
}

let GLOBAL_NODE_COUNT = undefined;

async function generateTree() {
    bst.resetColors();
    bst.redrawTree(ctx, canvas);
    GLOBAL_NODE_COUNT = parseInt(document.getElementById("randomCount").value);
    resize()
    window.scrollTo(canvas.width / 2 - window.innerWidth / 2, 0);
    if (!isNaN(GLOBAL_NODE_COUNT)) {
        stepsContainer.innerHTML = '';
        bst.root = null;

        const randomValuesSet = new Set();
        while (randomValuesSet.size < GLOBAL_NODE_COUNT) {
            const randomValue = Math.floor(Math.random() * GLOBAL_NODE_COUNT * 2);
            randomValuesSet.add(randomValue);
        }

        const randomValues = Array.from(randomValuesSet);

        await bst.insertBalanced(randomValues, ctx, canvas, false);

        addStep("Balanced random tree generation complete.");
    }
}

function resize() {
    canvas.width = Math.max(GLOBAL_NODE_COUNT * 40, window.innerWidth + GLOBAL_NODE_COUNT * 30);
    canvas.height = window.innerHeight;
    bst.redrawTree(ctx, canvas);
}

// Window load event to initialize elements
const canvas = document.getElementById("treeCanvas");

const ctx = canvas.getContext("2d");
const bst = new BinarySearchTree();



const stepsContainer = document.getElementById("stepsContainer");
    
function addStep(step) {
    const stepElement = document.createElement("p");
    stepElement.innerText = step;
    stepsContainer.appendChild(stepElement);
    stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

const cppCode = {
    insert: [
        'Node* insert(Node* node, int newValue) {',
        '    if (node == nullptr) {',
        '        return new Node(newValue);',
        '    }',
        '    if (newValue < node->value) {',
        '        node->left = insert(node->left, newValue);',
        '    } else if (newValue > node->value) {',
        '        node->right = insert(node->right, newValue);',
        '    }',
        '    return node;',
        '}'
    ],
    delete: [
        'Node* deleteNode(Node* node, int value) {',
        '    if (node == nullptr) return node;',
        '    if (value < node->value) {',
        '        node->left = deleteNode(node->left, value);',
        '    } else if (value > node->value) {',
        '        node->right = deleteNode(node->right, value);',
        '    } else {',
        '        if (node->left == nullptr && node->right == nullptr) {',
        '            delete node;',
        '            return nullptr;',
        '        }',
        '        if (node->left == nullptr) {',
        '            Node* temp = node->right;',
        '            delete node;',
        '            return temp;',
        '        }',
        '        if (node->right == nullptr) {',
        '            Node* temp = node->left;',
        '            delete node;',
        '            return temp;',
        '        }',
        '        Node* successor = minValueNode(node->right);',
        '        node->value = successor->value;',
        '        node->right = deleteNode(node->right, successor->value);',
        '    }',
        '    return node;',
        '}'
    ],
    find: [
        'Node* findNode(Node* node, int value) {',
        '    if (node == nullptr || node->value == value) {',
        '        return node;',
        '    }',
        '    if (value < node->value) {',
        '        return findNode(node->left, value);',
        '    } else {',
        '        return findNode(node->right, value);',
        '    }',
        '}'
    ]
};

function displayCppCode(operation) {
    cppCodeContainer.innerHTML = '';
    cppCode[operation].forEach((line, index) => {
        const lineElement = document.createElement('div');
        lineElement.textContent = line;
        lineElement.setAttribute('data-line-number', index);
        cppCodeContainer.appendChild(lineElement);
    });
}

document.getElementById("insertBtn").addEventListener("click", () => {
    bst.resetColors();
    bst.redrawTree(ctx, canvas);
    const value = parseInt(document.getElementById("nodeValue").value);
    if (!isNaN(value)) {
        displayCppCode('insert');
        bst.insert(
            value,
            (step) => addStep(step),
            ctx,
            canvas,
            true
        );
    }
});

document.getElementById("deleteBtn").addEventListener("click", () => {
    bst.resetColors();
    bst.redrawTree(ctx, canvas);
    const value = parseInt(document.getElementById("nodeValue").value);
    if (!isNaN(value)) {
        displayCppCode('delete');
        bst.delete(
            value,
            (step) => addStep(step),
            ctx,
            canvas
        );
    }
});

document.getElementById("findBtn").addEventListener("click", () => {
    bst.resetColors();
    bst.redrawTree(ctx, canvas);
    const value = parseInt(document.getElementById("nodeValue").value);
    if (!isNaN(value)) {
        displayCppCode('find');
        bst.find(
            value,
            (step) => addStep(step),
            ctx,
            canvas
        ).then(() => {
            bst.resetColors();
            bst.redrawTree(ctx, canvas);
        });
    }
});

document.getElementById("generateRandomTreeBtn").addEventListener("click", generateTree);

window.addEventListener("load", () => {
    window.addEventListener('resize', resize);
    generateTree();
    resize();
});

function closeCodePreviewWindow() {
    const codePreviewWindow = document.getElementById('codePreviewContainer');
    codePreviewWindow.style.visibility = 'hidden';
}

function codePreviewCopy() {
    const copyText = document.getElementById("codePreview");
    navigator.clipboard.writeText(copyText.innerText).then(r =>
        alert("Code copied to clipboard")
    );

}