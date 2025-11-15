// ColorPaletteUI.js
// Manages the color palette UI with add/remove controls

export class ColorPaletteUI {
    constructor(stateManager, colorManager) {
        this.stateManager = stateManager;
        this.colorManager = colorManager;
        this.container = document.getElementById('colorPreset');
        this.randomButton = document.getElementById('randomPalette');
        
        if (!this.container) {
            console.error('Color preset container not found');
            return;
        }
        
        this.initializeUI();
        this.bindEventListeners();
        
        // Subscribe to state changes
        this.stateManager.subscribe((state) => {
            this.updatePaletteDisplay(state.color.palette);
        });
    }

    /**
     * Initialize the palette UI
     */
    initializeUI() {
        const state = this.stateManager.getColorState();
        this.updatePaletteDisplay(state.palette);
    }

    /**
     * Bind event listeners
     */
    bindEventListeners() {
        // Random palette button
        if (this.randomButton) {
            this.randomButton.addEventListener('click', () => {
                this.colorManager.generateRandomPalette();
            });
        }
    }

    /**
     * Update the palette display
     * @param {string[]} palette - Array of hex color strings
     */
    updatePaletteDisplay(palette) {
        if (!this.container) return;
        
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create palette container
        const paletteContainer = document.createElement('div');
        paletteContainer.className = 'palette-container';
        
        // Add color swatches
        palette.forEach((color, index) => {
            const swatch = this.createColorSwatch(color, index);
            paletteContainer.appendChild(swatch);
        });
        
        // Add "add color" button if under limit
        if (palette.length < 10) {
            const addButton = this.createAddButton();
            paletteContainer.appendChild(addButton);
        }
        
        this.container.appendChild(paletteContainer);
    }

    /**
     * Create a color swatch element
     * @param {string} color - Hex color string
     * @param {number} index - Color index in palette
     * @returns {HTMLElement} Swatch element
     */
    createColorSwatch(color, index) {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.title = `Click to edit, right-click to remove\n${color}`;
        
        // Create color input (hidden)
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = color;
        colorInput.style.display = 'none';
        
        // Click to edit color
        swatch.addEventListener('click', (e) => {
            e.preventDefault();
            colorInput.click();
        });
        
        // Color input change handler
        colorInput.addEventListener('input', (e) => {
            const newColor = e.target.value;
            this.updateColor(index, newColor);
        });
        
        // Right-click to remove (if more than 1 color)
        swatch.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const state = this.stateManager.getColorState();
            if (state.palette.length > 1) {
                this.removeColor(index);
            } else {
                console.warn('Cannot remove the last color');
            }
        });
        
        // Create remove button (visible on hover)
        const removeBtn = document.createElement('button');
        removeBtn.className = 'color-remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Remove color';
        
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const state = this.stateManager.getColorState();
            if (state.palette.length > 1) {
                this.removeColor(index);
            }
        });
        
        swatch.appendChild(colorInput);
        swatch.appendChild(removeBtn);
        
        return swatch;
    }

    /**
     * Create add color button
     * @returns {HTMLElement} Add button element
     */
    createAddButton() {
        const addButton = document.createElement('div');
        addButton.className = 'color-swatch add-color-btn';
        addButton.innerHTML = '+';
        addButton.title = 'Add new color';
        
        addButton.addEventListener('click', () => {
            this.addColor();
        });
        
        return addButton;
    }

    /**
     * Update a color in the palette
     * @param {number} index - Color index
     * @param {string} newColor - New hex color
     */
    updateColor(index, newColor) {
        const state = this.stateManager.getColorState();
        const newPalette = [...state.palette];
        newPalette[index] = newColor;
        
        this.stateManager.setState({
            color: { palette: newPalette }
        });
    }

    /**
     * Add a new color to the palette
     */
    addColor() {
        const state = this.stateManager.getColorState();
        
        if (state.palette.length >= 10) {
            console.warn('Maximum palette size reached');
            return;
        }
        
        // Generate a random color or use a default
        const randomColor = this.generateRandomColor();
        this.colorManager.addColor(randomColor);
    }

    /**
     * Remove a color from the palette
     * @param {number} index - Color index to remove
     */
    removeColor(index) {
        this.colorManager.removeColor(index);
    }

    /**
     * Generate a random color
     * @returns {string} Random hex color
     */
    generateRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        const toHex = (n) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}
