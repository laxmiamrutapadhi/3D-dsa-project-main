// Custom Cursor
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (cursor && follower) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        }, 100);
    }
});

class AlgorithmVisualizer3D {
    constructor() {
        this.array = [];
        this.speed = 50;
        this.isPaused = false;
        this.isRunning = false;
        this.comparisons = 0;
        this.swaps = 0;
        this.arraySize = 30;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.bars = [];
        this.nodes = [];
        this.edges = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.initThreeJS();
        this.generateArray();
        this.updateAlgorithmInfo();
        this.animate();
    }

    initializeElements() {
        this.visualizer = document.getElementById('visualizer');
        this.algorithmSelect = document.getElementById('algorithm');
        this.speedSlider = document.getElementById('speed');
        this.speedValue = document.getElementById('speedValue');
        this.arraySizeSlider = document.getElementById('arraySize');
        this.arraySizeValue = document.getElementById('arraySizeValue');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.comparisonsEl = document.getElementById('comparisons');
        this.swapsEl = document.getElementById('swaps');
        this.timeComplexityEl = document.getElementById('timeComplexity');
        this.spaceComplexityEl = document.getElementById('spaceComplexity');
        this.descriptionEl = document.getElementById('algorithmDescription');
    }

    initThreeJS() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.visualizer.offsetWidth / 600,
            0.1,
            1000
        );
        this.camera.position.set(0, 15, 35);
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.visualizer.offsetWidth, 600);
        this.visualizer.appendChild(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.camera && this.renderer) {
                this.camera.aspect = this.visualizer.offsetWidth / 600;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.visualizer.offsetWidth, 600);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate camera slightly for dynamic effect
        if (this.camera && !this.isRunning) {
            const time = Date.now() * 0.0001;
            this.camera.position.x = Math.sin(time) * 2;
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.generateBtn.addEventListener('click', () => this.generateArray());
        
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = e.target.value;
            this.speedValue.textContent = this.speed;
        });
        
        this.arraySizeSlider.addEventListener('input', (e) => {
            this.arraySize = e.target.value;
            this.arraySizeValue.textContent = this.arraySize;
            if (!this.isRunning) {
                this.generateArray();
            }
        });
        
        this.algorithmSelect.addEventListener('change', () => {
            this.updateAlgorithmInfo();
            if (!this.isRunning) {
                this.reset();
            }
        });
    }

    clearScene() {
        this.bars.forEach(bar => this.scene.remove(bar));
        this.nodes.forEach(node => this.scene.remove(node));
        this.edges.forEach(edge => this.scene.remove(edge));
        this.bars = [];
        this.nodes = [];
        this.edges = [];
    }

    generateArray() {
        this.clearScene();
        this.array = [];
        const algorithm = this.algorithmSelect.value;
        
        if (algorithm === 'binarySearch') {
            for (let i = 0; i < this.arraySize; i++) {
                this.array.push(i * 3 + 1);
            }
            this.render3DBars();
        } else if (['bfs', 'dfs', 'dijkstra'].includes(algorithm)) {
            this.renderGraph3D();
        } else if (['binaryTree', 'bst'].includes(algorithm)) {
            this.renderTree3D();
        } else if (algorithm === 'towerOfHanoi') {
            this.renderHanoi3D();
        } else if (algorithm === 'fibonacci') {
            this.renderFibonacci3D();
        } else {
            for (let i = 0; i < this.arraySize; i++) {
                this.array.push(Math.floor(Math.random() * 100) + 10);
            }
            this.render3DBars();
        }
    }

    render3DBars() {
        this.clearScene();
        const maxValue = Math.max(...this.array);
        const spacing = 0.8;
        const startX = -(this.array.length * spacing) / 2;
        
        this.array.forEach((value, index) => {
            const height = (value / maxValue) * 15;
            const geometry = new THREE.BoxGeometry(0.6, height, 0.6);
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0x000000,
                specular: 0x111111,
                shininess: 30
            });
            
            const bar = new THREE.Mesh(geometry, material);
            bar.position.set(startX + index * spacing, height / 2, 0);
            bar.userData = { index, originalColor: 0xffffff };
            
            this.scene.add(bar);
            this.bars.push(bar);
        });
    }

    renderGraph3D() {
        this.clearScene();
        const nodeCount = Math.min(15, Math.max(8, Math.floor(this.arraySize / 5)));
        this.graph = {};
        
        // Create nodes in 3D space
        const radius = 12;
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Math.sin(i * 0.5) * 3;
            
            // Node sphere
            const geometry = new THREE.SphereGeometry(0.8, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0x000000,
                specular: 0x111111,
                shininess: 30
            });
            
            const node = new THREE.Mesh(geometry, material);
            node.position.set(x, y, z);
            node.userData = { index: i, originalColor: 0xffffff };
            
            // Node label
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 64;
            context.fillStyle = '#ffffff';
            context.font = 'Bold 40px Inter';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(i.toString(), 32, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(1.5, 1.5, 1);
            sprite.position.copy(node.position);
            
            this.scene.add(node);
            this.scene.add(sprite);
            this.nodes.push(node);
            
            // Create edges
            this.graph[i] = [];
            const connections = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < connections; j++) {
                const target = Math.floor(Math.random() * nodeCount);
                if (target !== i && !this.graph[i].includes(target)) {
                    this.graph[i].push(target);
                    
                    // Draw edge
                    const targetNode = this.nodes[target];
                    if (targetNode) {
                        const points = [node.position, targetNode.position];
                        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                        const lineMaterial = new THREE.LineBasicMaterial({
                            color: 0x333333,
                            transparent: true,
                            opacity: 0.3
                        });
                        const line = new THREE.Line(lineGeometry, lineMaterial);
                        this.scene.add(line);
                        this.edges.push(line);
                    }
                }
            }
        }
    }

    renderTree3D() {
        this.clearScene();
        const depth = Math.min(4, Math.max(3, Math.floor(this.arraySize / 20)));
        this.treeNodes = [];
        
        this.createTreeNode(0, 0, 0, 0, depth, 8);
    }

    createTreeNode(value, x, y, z, depth, spread) {
        if (depth === 0) return;
        
        // Create node
        const geometry = new THREE.SphereGeometry(0.6, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x000000,
            specular: 0x111111,
            shininess: 30
        });
        
        const node = new THREE.Mesh(geometry, material);
        node.position.set(x, y, z);
        node.userData = { value, originalColor: 0xffffff };
        
        // Node label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        context.fillStyle = '#ffffff';
        context.font = 'Bold 32px Inter';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(value.toString(), 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1.2, 1.2, 1);
        sprite.position.copy(node.position);
        
        this.scene.add(node);
        this.scene.add(sprite);
        this.nodes.push(node);
        this.treeNodes.push({ node, value });
        
        // Create children
        if (depth > 1) {
            const newY = y - 4;
            const newSpread = spread / 2;
            
            // Left child
            const leftX = x - newSpread;
            const leftValue = value * 2 + 1;
            this.createTreeNode(leftValue, leftX, newY, z, depth - 1, newSpread);
            
            // Draw edge to left child
            const leftPos = new THREE.Vector3(leftX, newY, z);
            const points = [node.position, leftPos];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.5
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
            this.edges.push(line);
            
            // Right child
            const rightX = x + newSpread;
            const rightValue = value * 2 + 2;
            this.createTreeNode(rightValue, rightX, newY, z, depth - 1, newSpread);
            
            // Draw edge to right child
            const rightPos = new THREE.Vector3(rightX, newY, z);
            const points2 = [node.position, rightPos];
            const lineGeometry2 = new THREE.BufferGeometry().setFromPoints(points2);
            const lineMaterial2 = new THREE.LineBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.5
            });
            const line2 = new THREE.Line(lineGeometry2, lineMaterial2);
            this.scene.add(line2);
            this.edges.push(line2);
        }
    }

    renderHanoi3D() {
        this.clearScene();
        this.hanoi = { A: [], B: [], C: [] };
        
        const diskCount = Math.min(7, Math.max(3, Math.floor(this.arraySize / 15)));
        
        // Create rods
        const rodPositions = [-10, 0, 10];
        rodPositions.forEach((x, idx) => {
            const rodGeometry = new THREE.CylinderGeometry(0.3, 0.3, 12, 32);
            const rodMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const rod = new THREE.Mesh(rodGeometry, rodMaterial);
            rod.position.set(x, 0, 0);
            this.scene.add(rod);
            
            // Base
            const baseGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 32);
            const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(x, -6.5, 0);
            this.scene.add(base);
        });
        
        // Create disks on rod A
        for (let i = diskCount; i > 0; i--) {
            this.hanoi.A.push(i);
        }
        
        this.updateHanoi3D();
    }

    updateHanoi3D() {
        // Remove old disks
        this.bars.forEach(disk => this.scene.remove(disk));
        this.bars = [];
        
        const rodPositions = { A: -10, B: 0, C: 10 };
        
        Object.keys(this.hanoi).forEach(rod => {
            this.hanoi[rod].forEach((size, idx) => {
                const width = size * 0.8;
                const geometry = new THREE.CylinderGeometry(width, width, 0.8, 32);
                const material = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    emissive: 0x000000,
                    specular: 0x111111,
                    shininess: 30
                });
                
                const disk = new THREE.Mesh(geometry, material);
                disk.rotation.x = Math.PI / 2;
                disk.position.set(
                    rodPositions[rod],
                    -6 + idx * 1,
                    0
                );
                
                this.scene.add(disk);
                this.bars.push(disk);
            });
        });
    }

    renderFibonacci3D() {
        this.clearScene();
        // Will be populated during animation
    }

    async start() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.pauseBtn.disabled = false;
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.comparisons = 0;
        this.swaps = 0;
        this.updateStats();
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.generateBtn.disabled = true;
        this.algorithmSelect.disabled = true;
        this.arraySizeSlider.disabled = true;
        
        const algorithm = this.algorithmSelect.value;
        
        try {
            switch(algorithm) {
                case 'bubbleSort':
                    await this.bubbleSort();
                    break;
                case 'selectionSort':
                    await this.selectionSort();
                    break;
                case 'insertionSort':
                    await this.insertionSort();
                    break;
                case 'mergeSort':
                    await this.mergeSort(0, this.array.length - 1);
                    break;
                case 'quickSort':
                    await this.quickSort(0, this.array.length - 1);
                    break;
                case 'linearSearch':
                    await this.linearSearch();
                    break;
                case 'binarySearch':
                    await this.binarySearch();
                    break;
                case 'binaryTree':
                    await this.binaryTreeTraversal();
                    break;
                case 'bst':
                    await this.binarySearchTree();
                    break;
                case 'bfs':
                    await this.breadthFirstSearch();
                    break;
                case 'dfs':
                    await this.depthFirstSearch();
                    break;
                case 'dijkstra':
                    await this.dijkstra();
                    break;
                case 'fibonacci':
                    await this.fibonacci();
                    break;
                case 'towerOfHanoi':
                    await this.towerOfHanoi();
                    break;
            }
        } catch (error) {
            console.error('Algorithm error:', error);
        }
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.generateBtn.disabled = false;
        this.algorithmSelect.disabled = false;
        this.arraySizeSlider.disabled = false;
    }

    pause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    reset() {
        this.isPaused = false;
        this.isRunning = false;
        this.comparisons = 0;
        this.swaps = 0;
        this.updateStats();
        this.generateArray();
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
        this.generateBtn.disabled = false;
        this.algorithmSelect.disabled = false;
        this.arraySizeSlider.disabled = false;
    }

    async sleep() {
        const delay = 1000 - (this.speed * 9.5);
        await new Promise(resolve => {
            const checkPause = () => {
                if (!this.isPaused) {
                    setTimeout(resolve, delay);
                } else {
                    setTimeout(checkPause, 100);
                }
            };
            checkPause();
        });
    }

    updateStats() {
        this.comparisonsEl.textContent = this.comparisons;
        this.swapsEl.textContent = this.swaps;
    }

    highlightBar(index, color) {
        if (this.bars[index]) {
            this.bars[index].material.color.setHex(color);
            this.bars[index].material.emissive.setHex(color * 0.3);
        }
    }

    resetBarColor(index) {
        if (this.bars[index]) {
            this.bars[index].material.color.setHex(0xffffff);
            this.bars[index].material.emissive.setHex(0x000000);
        }
    }

    // Sorting Algorithms
    async bubbleSort() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                this.highlightBar(j, 0x666666);
                this.highlightBar(j + 1, 0x666666);
                this.comparisons++;
                this.updateStats();
                await this.sleep();
                
                if (this.array[j] > this.array[j + 1]) {
                    this.highlightBar(j, 0x999999);
                    this.highlightBar(j + 1, 0x999999);
                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                    this.swaps++;
                    this.updateStats();
                    this.render3DBars();
                    await this.sleep();
                }
                
                this.resetBarColor(j);
                this.resetBarColor(j + 1);
            }
            this.highlightBar(n - i - 1, 0xcccccc);
        }
        this.highlightBar(0, 0xcccccc);
    }

    async selectionSort() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            this.highlightBar(i, 0x444444);
            
            for (let j = i + 1; j < n; j++) {
                this.highlightBar(j, 0x666666);
                this.comparisons++;
                this.updateStats();
                await this.sleep();
                
                if (this.array[j] < this.array[minIdx]) {
                    this.resetBarColor(minIdx);
                    minIdx = j;
                    this.highlightBar(minIdx, 0x666666);
                } else {
                    this.resetBarColor(j);
                }
            }
            
            if (minIdx !== i) {
                this.highlightBar(i, 0x999999);
                this.highlightBar(minIdx, 0x999999);
                [this.array[i], this.array[minIdx]] = [this.array[minIdx], this.array[i]];
                this.swaps++;
                this.updateStats();
                this.render3DBars();
                await this.sleep();
            }
            
            this.highlightBar(i, 0xcccccc);
        }
        this.highlightBar(n - 1, 0xcccccc);
    }

    async insertionSort() {
        const n = this.array.length;
        this.highlightBar(0, 0xcccccc);
        
        for (let i = 1; i < n; i++) {
            let key = this.array[i];
            let j = i - 1;
            
            this.highlightBar(i, 0x666666);
            await this.sleep();
            
            while (j >= 0 && this.array[j] > key) {
                this.comparisons++;
                this.updateStats();
                this.highlightBar(j, 0x999999);
                this.highlightBar(j + 1, 0x999999);
                
                this.array[j + 1] = this.array[j];
                this.swaps++;
                this.updateStats();
                this.render3DBars();
                await this.sleep();
                
                j--;
            }
            
            this.array[j + 1] = key;
            this.render3DBars();
            
            for (let k = 0; k <= i; k++) {
                this.highlightBar(k, 0xcccccc);
            }
            await this.sleep();
        }
    }

    async mergeSort(left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(left, mid);
            await this.mergeSort(mid + 1, right);
            await this.merge(left, mid, right);
        }
    }

    async merge(left, mid, right) {
        const leftArr = this.array.slice(left, mid + 1);
        const rightArr = this.array.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            this.comparisons++;
            this.updateStats();
            this.highlightBar(k, 0x666666);
            await this.sleep();
            
            if (leftArr[i] <= rightArr[j]) {
                this.array[k] = leftArr[i];
                i++;
            } else {
                this.array[k] = rightArr[j];
                j++;
            }
            
            this.swaps++;
            this.updateStats();
            this.render3DBars();
            this.highlightBar(k, 0x999999);
            await this.sleep();
            this.resetBarColor(k);
            k++;
        }
        
        while (i < leftArr.length) {
            this.array[k] = leftArr[i];
            this.render3DBars();
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            this.array[k] = rightArr[j];
            this.render3DBars();
            j++;
            k++;
        }
    }

    async quickSort(low, high) {
        if (low < high) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        const pivot = this.array[high];
        this.highlightBar(high, 0x444444);
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            this.comparisons++;
            this.updateStats();
            this.highlightBar(j, 0x666666);
            await this.sleep();
            
            if (this.array[j] < pivot) {
                i++;
                this.highlightBar(i, 0x999999);
                this.highlightBar(j, 0x999999);
                [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
                this.swaps++;
                this.updateStats();
                this.render3DBars();
                await this.sleep();
            }
            
            this.resetBarColor(j);
        }
        
        this.highlightBar(i + 1, 0x999999);
        this.highlightBar(high, 0x999999);
        [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
        this.swaps++;
        this.updateStats();
        this.render3DBars();
        await this.sleep();
        this.resetBarColor(high);
        
        return i + 1;
    }

    async linearSearch() {
        const target = this.array[Math.floor(Math.random() * this.array.length)];
        this.descriptionEl.textContent = `Searching for value: ${target}`;
        
        for (let i = 0; i < this.array.length; i++) {
            this.comparisons++;
            this.updateStats();
            this.highlightBar(i, 0x666666);
            await this.sleep();
            
            if (this.array[i] === target) {
                this.highlightBar(i, 0xcccccc);
                this.descriptionEl.textContent = `Found ${target} at index ${i}!`;
                return;
            }
            
            this.resetBarColor(i);
        }
        
        this.descriptionEl.textContent = `Value ${target} not found.`;
    }

    async binarySearch() {
        const target = this.array[Math.floor(Math.random() * this.array.length)];
        this.descriptionEl.textContent = `Searching for value: ${target}`;
        
        let left = 0;
        let right = this.array.length - 1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            this.comparisons++;
            this.updateStats();
            this.highlightBar(mid, 0x666666);
            await this.sleep();
            
            if (this.array[mid] === target) {
                this.highlightBar(mid, 0xcccccc);
                this.descriptionEl.textContent = `Found ${target} at index ${mid}!`;
                return;
            }
            
            if (this.array[mid] < target) {
                this.resetBarColor(mid);
                left = mid + 1;
            } else {
                this.resetBarColor(mid);
                right = mid - 1;
            }
        }
        
        this.descriptionEl.textContent = `Value ${target} not found.`;
    }

    async binaryTreeTraversal() {
        // In-order traversal
        await this.inOrderTraversal(0);
    }

    async inOrderTraversal(index) {
        if (index >= this.treeNodes.length) return;
        
        const leftChild = index * 2 + 1;
        const rightChild = index * 2 + 2;
        
        if (leftChild < this.treeNodes.length) {
            await this.inOrderTraversal(leftChild);
        }
        
        const node = this.nodes[index];
        if (node) {
            node.material.color.setHex(0x666666);
            node.material.emissive.setHex(0x333333);
            this.comparisons++;
            this.updateStats();
            await this.sleep();
            node.material.color.setHex(0xcccccc);
            node.material.emissive.setHex(0x666666);
        }
        
        if (rightChild < this.treeNodes.length) {
            await this.inOrderTraversal(rightChild);
        }
    }

    async binarySearchTree() {
        // Simulate BST search
        const target = Math.floor(Math.random() * this.treeNodes.length);
        let current = 0;
        
        while (current < this.treeNodes.length) {
            const node = this.nodes[current];
            if (node) {
                node.material.color.setHex(0x666666);
                node.material.emissive.setHex(0x333333);
                this.comparisons++;
                this.updateStats();
                await this.sleep();
                
                if (current === target) {
                    node.material.color.setHex(0xcccccc);
                    node.material.emissive.setHex(0x666666);
                    this.descriptionEl.textContent = `Found node ${target}!`;
                    return;
                }
                
                node.material.color.setHex(0xffffff);
                node.material.emissive.setHex(0x000000);
                
                if (target < current) {
                    current = current * 2 + 1;
                } else {
                    current = current * 2 + 2;
                }
            } else {
                break;
            }
        }
    }

    async breadthFirstSearch() {
        const startNode = 0;
        const queue = [startNode];
        const visited = new Set([startNode]);
        
        while (queue.length > 0) {
            const nodeIdx = queue.shift();
            const node = this.nodes[nodeIdx];
            
            if (node) {
                node.material.color.setHex(0x666666);
                node.material.emissive.setHex(0x333333);
                await this.sleep();
                
                if (this.graph[nodeIdx]) {
                    for (const neighbor of this.graph[nodeIdx]) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            queue.push(neighbor);
                            this.comparisons++;
                            this.updateStats();
                        }
                    }
                }
                
                node.material.color.setHex(0xcccccc);
                node.material.emissive.setHex(0x666666);
            }
        }
    }

    async depthFirstSearch() {
        const visited = new Set();
        await this.dfsHelper(0, visited);
    }

    async dfsHelper(nodeIdx, visited) {
        visited.add(nodeIdx);
        const node = this.nodes[nodeIdx];
        
        if (node) {
            node.material.color.setHex(0x666666);
            node.material.emissive.setHex(0x333333);
            await this.sleep();
            
            if (this.graph[nodeIdx]) {
                for (const neighbor of this.graph[nodeIdx]) {
                    if (!visited.has(neighbor)) {
                        this.comparisons++;
                        this.updateStats();
                        await this.dfsHelper(neighbor, visited);
                    }
                }
            }
            
            node.material.color.setHex(0xcccccc);
            node.material.emissive.setHex(0x666666);
        }
    }

    async dijkstra() {
        const nodeCount = this.nodes.length;
        const distances = Array(nodeCount).fill(Infinity);
        const visited = new Set();
        distances[0] = 0;
        
        for (let i = 0; i < nodeCount; i++) {
            let minDist = Infinity;
            let minNode = -1;
            
            for (let j = 0; j < nodeCount; j++) {
                if (!visited.has(j) && distances[j] < minDist) {
                    minDist = distances[j];
                    minNode = j;
                }
            }
            
            if (minNode === -1) break;
            
            visited.add(minNode);
            const node = this.nodes[minNode];
            
            if (node) {
                node.material.color.setHex(0x666666);
                node.material.emissive.setHex(0x333333);
                this.comparisons++;
                this.updateStats();
                await this.sleep();
                
                if (this.graph[minNode]) {
                    for (const neighbor of this.graph[minNode]) {
                        const newDist = distances[minNode] + 1;
                        if (newDist < distances[neighbor]) {
                            distances[neighbor] = newDist;
                        }
                    }
                }
                
                node.material.color.setHex(0xcccccc);
                node.material.emissive.setHex(0x666666);
            }
        }
    }

    async towerOfHanoi() {
        const n = this.hanoi.A.length;
        await this.solveHanoi(n, 'A', 'C', 'B');
    }

    async solveHanoi(n, from, to, aux) {
        if (n === 1) {
            const disk = this.hanoi[from].pop();
            this.hanoi[to].push(disk);
            this.swaps++;
            this.updateStats();
            this.updateHanoi3D();
            await this.sleep();
            return;
        }
        
        await this.solveHanoi(n - 1, from, aux, to);
        
        const disk = this.hanoi[from].pop();
        this.hanoi[to].push(disk);
        this.swaps++;
        this.updateStats();
        this.updateHanoi3D();
        await this.sleep();
        
        await this.solveHanoi(n - 1, aux, to, from);
    }

    async fibonacci() {
        this.clearScene();
        const count = Math.min(15, Math.max(8, Math.floor(this.arraySize / 3)));
        let a = 0, b = 1;
        
        this.addFibNumber3D(a, 0);
        await this.sleep();
        this.addFibNumber3D(b, 1);
        await this.sleep();
        
        for (let i = 2; i < count; i++) {
            const next = a + b;
            this.addFibNumber3D(next, i);
            this.comparisons++;
            this.updateStats();
            await this.sleep();
            a = b;
            b = next;
        }
    }

    addFibNumber3D(num, index) {
        const x = (index % 5) * 4 - 8;
        const z = Math.floor(index / 5) * 4 - 4;
        
        const geometry = new THREE.BoxGeometry(3, 2, 0.5);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x000000,
            specular: 0x111111,
            shininess: 30
        });
        
        const box = new THREE.Mesh(geometry, material);
        box.position.set(x, 0, z);
        
        // Add text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        context.fillStyle = '#ffffff';
        context.font = 'Bold 48px Inter';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(num.toString(), 128, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(3, 1.5, 1);
        sprite.position.copy(box.position);
        
        this.scene.add(box);
        this.scene.add(sprite);
        this.bars.push(box);
    }

    updateAlgorithmInfo() {
        const algorithm = this.algorithmSelect.value;
        const info = this.getAlgorithmInfo(algorithm);
        
        this.timeComplexityEl.textContent = info.timeComplexity;
        this.spaceComplexityEl.textContent = info.spaceComplexity;
        this.descriptionEl.textContent = info.description;
    }

    getAlgorithmInfo(algorithm) {
        const info = {
            bubbleSort: {
                timeComplexity: 'O(n²)',
                spaceComplexity: 'O(1)',
                description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Watch as larger elements "bubble" to the top in this immersive 3D visualization.'
            },
            selectionSort: {
                timeComplexity: 'O(n²)',
                spaceComplexity: 'O(1)',
                description: 'Selection Sort divides the input into sorted and unsorted regions. It repeatedly selects the smallest element from the unsorted region and moves it to the sorted region. Experience the selection process in 3D space.'
            },
            insertionSort: {
                timeComplexity: 'O(n²)',
                spaceComplexity: 'O(1)',
                description: 'Insertion Sort builds the final sorted array one item at a time. Each element is inserted into its correct position in the already sorted portion. Watch the insertion process unfold in three dimensions.'
            },
            mergeSort: {
                timeComplexity: 'O(n log n)',
                spaceComplexity: 'O(n)',
                description: 'Merge Sort is a divide-and-conquer algorithm that recursively divides the array into halves, sorts them, and merges them back together. Witness the elegant divide-and-conquer strategy in 3D.'
            },
            quickSort: {
                timeComplexity: 'O(n log n)',
                spaceComplexity: 'O(log n)',
                description: 'Quick Sort picks a pivot element and partitions the array around it. Elements smaller than the pivot go before it, larger elements after. See the partitioning process in stunning 3D detail.'
            },
            linearSearch: {
                timeComplexity: 'O(n)',
                spaceComplexity: 'O(1)',
                description: 'Linear Search sequentially checks each element until a match is found. The simplest search algorithm, now visualized in an immersive 3D environment.'
            },
            binarySearch: {
                timeComplexity: 'O(log n)',
                spaceComplexity: 'O(1)',
                description: 'Binary Search works on sorted arrays by repeatedly dividing the search interval in half. Watch as the algorithm efficiently narrows down the search space in 3D.'
            },
            binaryTree: {
                timeComplexity: 'O(n)',
                spaceComplexity: 'O(h)',
                description: 'Binary Tree Traversal visits each node in a specific order. Experience in-order traversal through a beautifully rendered 3D tree structure with proper parent-child relationships.'
            },
            bst: {
                timeComplexity: 'O(log n)',
                spaceComplexity: 'O(h)',
                description: 'Binary Search Tree maintains a sorted structure where left children are smaller and right children are larger. Navigate through the tree in immersive 3D space.'
            },
            bfs: {
                timeComplexity: 'O(V + E)',
                spaceComplexity: 'O(V)',
                description: 'Breadth-First Search explores all vertices at the current depth before moving deeper. Watch the wave-like exploration pattern through a 3D graph with connected nodes and edges.'
            },
            dfs: {
                timeComplexity: 'O(V + E)',
                spaceComplexity: 'O(V)',
                description: 'Depth-First Search explores as far as possible along each branch before backtracking. Experience the deep exploration strategy in a fully connected 3D graph visualization.'
            },
            dijkstra: {
                timeComplexity: 'O(V²)',
                spaceComplexity: 'O(V)',
                description: "Dijkstra's Algorithm finds the shortest path between nodes in a graph. Watch as it calculates distances and finds optimal paths through a 3D network of interconnected nodes."
            },
            fibonacci: {
                timeComplexity: 'O(n)',
                spaceComplexity: 'O(1)',
                description: 'The Fibonacci Sequence generates numbers where each is the sum of the two preceding ones. Watch the sequence grow in a beautiful 3D grid layout: 0, 1, 1, 2, 3, 5, 8, 13, 21...'
            },
            towerOfHanoi: {
                timeComplexity: 'O(2ⁿ)',
                spaceComplexity: 'O(n)',
                description: 'Tower of Hanoi is a mathematical puzzle where disks must be moved between rods following specific rules. Experience the recursive solution in stunning 3D with realistic disk movements.'
            }
        };
        
        return info[algorithm] || {
            timeComplexity: 'N/A',
            spaceComplexity: 'N/A',
            description: 'Select an algorithm to see its description and begin the 3D visualization experience.'
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AlgorithmVisualizer3D();
});
