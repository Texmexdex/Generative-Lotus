// AudioControlPanel.js
// UI for audio input selection and audio-to-visual parameter mapping

export class AudioControlPanel {
    constructor(audioAnalyzer, audioReactiveController) {
        this.audioAnalyzer = audioAnalyzer;
        this.audioReactiveController = audioReactiveController;
        
        this.isAudioEnabled = false;
        
        this.initializeUI();
        this.attachEventListeners();
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Get UI elements
        this.audioToggle = document.getElementById('audioToggle');
        this.audioDeviceSelect = document.getElementById('audioDevice');
        this.audioStatus = document.getElementById('audioStatus');
        this.mappingContainer = document.getElementById('audioMappings');
        
        // Populate audio devices
        this.populateAudioDevices();
    }

    /**
     * Populate audio device dropdown
     */
    async populateAudioDevices() {
        const devices = await this.audioAnalyzer.getAudioDevices();
        
        this.audioDeviceSelect.innerHTML = '<option value="">Default Microphone</option>';
        
        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label || `Microphone ${device.deviceId.substring(0, 8)}`;
            this.audioDeviceSelect.appendChild(option);
        });
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Audio toggle
        this.audioToggle.addEventListener('click', () => this.toggleAudio());
        
        // Device selection
        this.audioDeviceSelect.addEventListener('change', () => this.changeAudioDevice());
        
        // Create mapping button
        const addMappingBtn = document.getElementById('addAudioMapping');
        if (addMappingBtn) {
            addMappingBtn.addEventListener('click', () => this.showMappingDialog());
        }
        
        // Reset mappings button
        const resetMappingsBtn = document.getElementById('resetAudioMappings');
        if (resetMappingsBtn) {
            resetMappingsBtn.addEventListener('click', () => this.resetMappings());
        }
    }

    /**
     * Toggle audio on/off
     */
    async toggleAudio() {
        if (this.isAudioEnabled) {
            // Stop audio
            this.audioAnalyzer.stop();
            this.isAudioEnabled = false;
            this.audioToggle.textContent = 'Enable Audio Input';
            this.audioStatus.textContent = 'Audio: Disabled';
            this.audioStatus.style.color = '#888';
        } else {
            // Start audio
            const deviceId = this.audioDeviceSelect.value || null;
            const success = await this.audioAnalyzer.initialize(deviceId);
            
            if (success) {
                this.isAudioEnabled = true;
                this.audioToggle.textContent = 'Disable Audio Input';
                this.audioStatus.textContent = 'Audio: Active';
                this.audioStatus.style.color = '#4CAF50';
            } else {
                alert('Failed to access audio input. Please check permissions.');
            }
        }
    }

    /**
     * Change audio device
     */
    async changeAudioDevice() {
        if (this.isAudioEnabled) {
            // Restart with new device
            this.audioAnalyzer.stop();
            const deviceId = this.audioDeviceSelect.value || null;
            await this.audioAnalyzer.initialize(deviceId);
        }
    }

    /**
     * Show mapping configuration dialog
     */
    showMappingDialog() {
        const parameters = this.audioReactiveController.getParameters();
        const audioVars = this.audioReactiveController.getAudioVariables();
        
        // Create dialog HTML
        let html = '<div class="mapping-dialog-content">';
        
        parameters.forEach(param => {
            const mapping = this.audioReactiveController.getMapping(param.id);
            
            html += `
                <div class="mapping-row">
                    <label class="mapping-label">${param.name}</label>
                    <select class="mapping-audio-var" data-param="${param.id}">
                        ${audioVars.map(v => `<option value="${v}" ${mapping.audioVar === v ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                    <label class="mapping-influence-label">Influence:</label>
                    <input type="range" class="mapping-influence" data-param="${param.id}" 
                           min="0" max="1" step="0.01" value="${mapping.influence}">
                    <span class="mapping-influence-value">${(mapping.influence * 100).toFixed(0)}%</span>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Update mapping container
        this.mappingContainer.innerHTML = html;
        
        // Attach listeners to new elements
        this.attachMappingListeners();
    }

    /**
     * Attach listeners to mapping controls
     */
    attachMappingListeners() {
        // Audio variable selects
        const audioVarSelects = this.mappingContainer.querySelectorAll('.mapping-audio-var');
        audioVarSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const paramId = e.target.dataset.param;
                const audioVar = e.target.value;
                const param = this.audioReactiveController.getParameters().find(p => p.id === paramId);
                const mapping = this.audioReactiveController.getMapping(paramId);
                
                this.audioReactiveController.setMapping(
                    paramId,
                    audioVar,
                    param.min,
                    param.max,
                    mapping.influence
                );
            });
        });
        
        // Influence sliders
        const influenceSliders = this.mappingContainer.querySelectorAll('.mapping-influence');
        influenceSliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const paramId = e.target.dataset.param;
                const influence = parseFloat(e.target.value);
                const mapping = this.audioReactiveController.getMapping(paramId);
                const param = this.audioReactiveController.getParameters().find(p => p.id === paramId);
                
                // Update display
                const valueSpan = e.target.nextElementSibling;
                if (valueSpan) {
                    valueSpan.textContent = `${(influence * 100).toFixed(0)}%`;
                }
                
                // Update mapping
                this.audioReactiveController.setMapping(
                    paramId,
                    mapping.audioVar,
                    param.min,
                    param.max,
                    influence
                );
            });
        });
    }

    /**
     * Reset all mappings
     */
    resetMappings() {
        if (confirm('Reset all audio mappings?')) {
            this.audioReactiveController.resetMappings();
            this.showMappingDialog(); // Refresh UI
        }
    }

    /**
     * Update audio visualizer (optional - shows current audio levels)
     */
    updateVisualizer() {
        if (!this.isAudioEnabled) return;
        
        const data = this.audioAnalyzer.getData();
        
        // Update visualizer bars if they exist
        const visualizerBars = {
            'viz-volume': data.volume,
            'viz-bass': data.bass,
            'viz-mids': data.mids,
            'viz-treble': data.treble
        };
        
        for (const [id, value] of Object.entries(visualizerBars)) {
            const bar = document.getElementById(id);
            if (bar) {
                bar.style.width = `${value * 100}%`;
            }
        }
    }
}
