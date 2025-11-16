// RangeInputEnhancer.js
// Adds value display and min/max controls to range sliders

export class RangeInputEnhancer {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.enhancedInputs = new Map();
        this.customRanges = new Map(); // Store custom min/max values
        
        // Default ranges for each parameter
        this.defaultRanges = {
            cameraZoom: { min: 0.1, max: 5, step: 0.1 },
            strokeWidth: { min: 0.01, max: 1, step: 0.01 },
            colorShiftSpeed: { min: 0.1, max: 5, step: 0.1 },
            sequenceCount: { min: 10, max: 2000, step: 1 },
            shapeSize: { min: 10, max: 200, step: 1 },
            baseScale: { min: 0.1, max: 3, step: 0.1 },
            scaleTransition: { min: 0.9, max: 1.1, step: 0.001 },
            baseRotation: { min: 0, max: 360, step: 1 },
            rotationTransition: { min: -10, max: 10, step: 0.1 },
            baseX: { min: -200, max: 200, step: 1 },
            baseY: { min: -200, max: 200, step: 1 },
            startOpacity: { min: 0, max: 1, step: 0.01 },
            endOpacity: { min: 0, max: 1, step: 0.01 },
            fadeRate: { min: 0.1, max: 3, step: 0.1 }
        };
        
        this.initialize();
    }

    /**
     * Initialize and enhance all range inputs
     */
    initialize() {
        // Find all range inputs
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        
        rangeInputs.forEach(rangeInput => {
            this.enhanceRangeInput(rangeInput);
        });
        
        console.log(`Enhanced ${rangeInputs.length} range inputs with controls`);
    }

    /**
     * Enhance a single range input with value display and min/max controls
     */
    enhanceRangeInput(rangeInput) {
        // Skip if already enhanced
        if (this.enhancedInputs.has(rangeInput.id)) {
            return;
        }
        
        // Get original range properties from defaults or HTML attributes
        const defaults = this.defaultRanges[rangeInput.id] || { min: 0, max: 100, step: 1 };
        
        // For class-based inputs (animations), use generic defaults
        let originalMin, originalMax, step;
        if (rangeInput.classList.contains('amplitude')) {
            originalMin = 0;
            originalMax = rangeInput.dataset.prop === 'scale' ? 1 : 100;
            step = rangeInput.dataset.prop === 'scale' ? 0.01 : 1;
        } else if (rangeInput.classList.contains('frequency') || rangeInput.classList.contains('speed')) {
            originalMin = 0.01;
            originalMax = 2;
            step = 0.01;
        } else {
            originalMin = defaults.min;
            originalMax = defaults.max;
            step = defaults.step;
        }
        
        const value = parseFloat(rangeInput.value) || defaults.min || 0;
        
        // Determine if this parameter can go negative
        const canBeNegative = originalMin < 0 || this.canParameterBeNegative(rangeInput.id);
        
        // Create container
        const container = document.createElement('div');
        container.className = 'range-enhanced-container';
        
        // Create top row (value display + range controls toggle)
        const topRow = document.createElement('div');
        topRow.className = 'range-top-row';
        
        // Value display
        const valueDisplay = document.createElement('input');
        valueDisplay.type = 'number';
        valueDisplay.className = 'range-value-display';
        valueDisplay.value = value;
        valueDisplay.step = step;
        // Don't set min constraint on value display - let users type any value
        // Constraint will be applied when updating the slider
        
        // Range controls toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'range-toggle-btn';
        toggleBtn.textContent = '⚙';
        toggleBtn.title = 'Adjust slider range';
        toggleBtn.type = 'button';
        
        topRow.appendChild(valueDisplay);
        topRow.appendChild(toggleBtn);
        
        // Create slider row
        const sliderRow = document.createElement('div');
        sliderRow.className = 'range-slider-row';
        
        // Create range controls (min/max inputs) - hidden by default
        const rangeControls = document.createElement('div');
        rangeControls.className = 'range-controls';
        rangeControls.style.display = 'none';
        
        const minInput = document.createElement('input');
        minInput.type = 'number';
        minInput.className = 'range-min-input';
        minInput.value = originalMin;
        minInput.step = step;
        minInput.placeholder = 'Min';
        minInput.title = 'Slider minimum';
        // Don't set min constraint - let users set any min value
        // Constraint will be applied in updateSliderRange if needed
        
        const maxInput = document.createElement('input');
        maxInput.type = 'number';
        maxInput.className = 'range-max-input';
        maxInput.value = originalMax;
        maxInput.step = step;
        maxInput.placeholder = 'Max';
        maxInput.title = 'Slider maximum';
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'range-reset-btn';
        resetBtn.textContent = '↺';
        resetBtn.title = 'Reset to default range';
        resetBtn.type = 'button';
        
        rangeControls.appendChild(minInput);
        rangeControls.appendChild(maxInput);
        rangeControls.appendChild(resetBtn);
        
        // Set initial slider attributes (since HTML no longer has them)
        rangeInput.setAttribute('min', originalMin);
        rangeInput.setAttribute('max', originalMax);
        rangeInput.setAttribute('step', step);
        rangeInput.min = originalMin;
        rangeInput.max = originalMax;
        rangeInput.step = step;
        
        // Wrap the range input
        const parent = rangeInput.parentNode;
        parent.insertBefore(container, rangeInput);
        container.appendChild(topRow);
        container.appendChild(sliderRow);
        sliderRow.appendChild(rangeInput);
        container.appendChild(rangeControls);
        
        // Toggle range controls visibility
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isVisible = rangeControls.style.display !== 'none';
            rangeControls.style.display = isVisible ? 'none' : 'flex';
            toggleBtn.classList.toggle('active', !isVisible);
        });
        
        // Sync range slider -> value display
        rangeInput.addEventListener('input', () => {
            valueDisplay.value = rangeInput.value;
            // Debug: log slider state
            if (rangeInput.id === 'cameraZoom') {
                console.log(`Slider moved: value=${rangeInput.value}, min=${rangeInput.min}, max=${rangeInput.max}`);
            }
        });
        
        // Sync value display -> range slider
        valueDisplay.addEventListener('input', () => {
            const numValue = parseFloat(valueDisplay.value);
            if (isNaN(numValue)) return;
            
            const currentMin = parseFloat(rangeInput.min);
            const currentMax = parseFloat(rangeInput.max);
            
            // Update slider (clamped to its current range)
            const clampedValue = Math.max(currentMin, Math.min(currentMax, numValue));
            rangeInput.value = clampedValue;
            
            // Trigger input event on the range input
            rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Highlight if out of range
            if (numValue < currentMin || numValue > currentMax) {
                valueDisplay.classList.add('out-of-range');
            } else {
                valueDisplay.classList.remove('out-of-range');
            }
        });
        
        valueDisplay.addEventListener('change', () => {
            const numValue = parseFloat(valueDisplay.value);
            if (isNaN(numValue)) return;
            
            const currentMin = parseFloat(rangeInput.min);
            const currentMax = parseFloat(rangeInput.max);
            
            // If value is outside range, expand the range to accommodate it
            // Keep a reasonable range around the value
            if (numValue < currentMin) {
                minInput.value = numValue;
                // Don't change max unless it needs to be bigger
                if (currentMax < numValue) {
                    maxInput.value = numValue * 2; // Give some headroom
                }
                updateSliderRange();
            } else if (numValue > currentMax) {
                maxInput.value = numValue;
                // Don't change min unless it needs to be smaller
                if (currentMin > numValue) {
                    minInput.value = Math.max(0, numValue / 2); // Give some headroom
                }
                updateSliderRange();
            }
            
            rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        // Update slider min/max when range controls change
        const updateSliderRange = () => {
            let newMin = parseFloat(minInput.value);
            let newMax = parseFloat(maxInput.value);
            
            if (isNaN(newMin) || isNaN(newMax)) return;
            
            // Ensure min < max
            if (newMin >= newMax) {
                newMax = newMin + step;
                maxInput.value = newMax;
            }
            
            // No constraints - let devs push the limits!
            
            // Calculate appropriate step size for the new range
            const range = newMax - newMin;
            let newStep = step;
            
            // Adjust step to give smooth control across the range
            if (range < 0.1) {
                newStep = 0.001; // Very small range needs tiny steps
            } else if (range < 1) {
                newStep = 0.01; // Small range
            } else if (range < 10) {
                newStep = 0.1; // Medium range
            } else if (range < 100) {
                newStep = 1; // Large range
            } else {
                newStep = 10; // Very large range
            }
            
            // Update slider attributes (use setAttribute to force update)
            rangeInput.setAttribute('min', newMin);
            rangeInput.setAttribute('max', newMax);
            rangeInput.setAttribute('step', newStep);
            rangeInput.min = newMin;
            rangeInput.max = newMax;
            rangeInput.step = newStep;
            
            // Update value display step too
            valueDisplay.setAttribute('step', newStep);
            valueDisplay.step = newStep;
            
            // Store custom range
            this.customRanges.set(rangeInput.id, { min: newMin, max: newMax });
            
            // Clamp current value to new range if needed
            const currentValue = parseFloat(rangeInput.value);
            if (currentValue < newMin) {
                rangeInput.value = newMin;
                valueDisplay.value = newMin;
                rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (currentValue > newMax) {
                rangeInput.value = newMax;
                valueDisplay.value = newMax;
                rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            console.log(`Updated ${rangeInput.id} range: ${newMin} to ${newMax} (step: ${newStep})`);
            console.log(`  Slider attributes: min=${rangeInput.min}, max=${rangeInput.max}, step=${rangeInput.step}`);
        };
        
        minInput.addEventListener('change', updateSliderRange);
        maxInput.addEventListener('change', updateSliderRange);
        
        // Reset button
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            minInput.value = originalMin;
            maxInput.value = originalMax;
            updateSliderRange();
            this.customRanges.delete(rangeInput.id);
        });
        
        // Store reference
        this.enhancedInputs.set(rangeInput.id, {
            rangeInput,
            valueDisplay,
            minInput,
            maxInput,
            originalMin,
            originalMax,
            canBeNegative,
            container
        });
    }

    /**
     * Determine if a parameter can be negative based on its ID
     * (No longer used for constraints - kept for reference)
     */
    canParameterBeNegative(inputId) {
        // All parameters can now go negative - no constraints!
        // Let devs push the limits and see what breaks
        return true;
    }

    /**
     * Get custom range for a parameter (for audio reactive system)
     */
    getCustomRange(inputId) {
        const customRange = this.customRanges.get(inputId);
        if (customRange) {
            return customRange;
        }
        
        // Return original range if no custom range set
        const enhanced = this.enhancedInputs.get(inputId);
        if (enhanced) {
            return {
                min: enhanced.originalMin,
                max: enhanced.originalMax
            };
        }
        
        return null;
    }

    /**
     * Get all custom ranges (for export/import)
     */
    getAllCustomRanges() {
        const ranges = {};
        this.customRanges.forEach((range, id) => {
            ranges[id] = range;
        });
        return ranges;
    }

    /**
     * Set custom ranges (for import)
     */
    setCustomRanges(ranges) {
        Object.entries(ranges).forEach(([id, range]) => {
            const enhanced = this.enhancedInputs.get(id);
            if (enhanced) {
                enhanced.minInput.value = range.min;
                enhanced.maxInput.value = range.max;
                enhanced.rangeInput.min = range.min;
                enhanced.rangeInput.max = range.max;
                this.customRanges.set(id, range);
            }
        });
    }

    /**
     * Update value display programmatically
     */
    updateValue(inputId, value) {
        const enhanced = this.enhancedInputs.get(inputId);
        if (enhanced) {
            enhanced.valueDisplay.value = value;
            
            const currentMin = parseFloat(enhanced.rangeInput.min);
            const currentMax = parseFloat(enhanced.rangeInput.max);
            
            // Check if out of range
            if (value < currentMin || value > currentMax) {
                enhanced.valueDisplay.classList.add('out-of-range');
            } else {
                enhanced.valueDisplay.classList.remove('out-of-range');
            }
        }
    }

    /**
     * Re-scan and enhance any new range inputs (for dynamically added content)
     */
    refresh() {
        this.initialize();
    }
}
