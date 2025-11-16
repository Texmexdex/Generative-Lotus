// AudioTriggerUI.js
// UI for managing audio triggers

export class AudioTriggerUI {
    constructor(audioTriggerSystem) {
        this.audioTriggerSystem = audioTriggerSystem;
        this.container = document.getElementById('audioTriggers');
        this.addButton = document.getElementById('addAudioTrigger');
        
        this.attachEventListeners();
        this.render();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (this.addButton) {
            this.addButton.addEventListener('click', () => this.showAddTriggerDialog());
        }
    }

    /**
     * Show dialog to add new trigger
     */
    showAddTriggerDialog() {
        const triggerTypes = this.audioTriggerSystem.getTriggerTypes();
        const actions = this.audioTriggerSystem.getActions();
        const audioVars = this.audioTriggerSystem.getAudioVariables();
        
        // Create a simple trigger with defaults
        const triggerId = this.audioTriggerSystem.addTrigger({
            type: 'beat',
            action: 'randomPalette',
            beatInterval: 4,
            threshold: 0.5,
            cooldown: 200
        });
        
        this.render();
    }

    /**
     * Render all triggers
     */
    render() {
        if (!this.container) return;
        
        const triggers = this.audioTriggerSystem.getTriggers();
        
        if (triggers.length === 0) {
            this.container.innerHTML = '<div class="no-triggers">No triggers configured. Click "Add Trigger" to create one.</div>';
            return;
        }
        
        this.container.innerHTML = '';
        
        triggers.forEach(trigger => {
            const triggerEl = this.createTriggerElement(trigger);
            this.container.appendChild(triggerEl);
        });
    }

    /**
     * Create a trigger element
     */
    createTriggerElement(trigger) {
        const el = document.createElement('div');
        el.className = 'audio-trigger-item';
        
        const triggerTypes = this.audioTriggerSystem.getTriggerTypes();
        const actions = this.audioTriggerSystem.getActions();
        const audioVars = this.audioTriggerSystem.getAudioVariables();
        
        // Header with enable toggle and delete
        const header = document.createElement('div');
        header.className = 'trigger-header';
        
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = trigger.enabled;
        toggle.addEventListener('change', () => {
            this.audioTriggerSystem.updateTrigger(trigger.id, { enabled: toggle.checked });
        });
        
        const label = document.createElement('span');
        label.className = 'trigger-label';
        label.textContent = this.getTriggerDescription(trigger);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'trigger-delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Delete trigger';
        deleteBtn.addEventListener('click', () => {
            this.audioTriggerSystem.removeTrigger(trigger.id);
            this.render();
        });
        
        header.appendChild(toggle);
        header.appendChild(label);
        header.appendChild(deleteBtn);
        
        // Controls
        const controls = document.createElement('div');
        controls.className = 'trigger-controls';
        
        // Trigger type
        const typeSelect = document.createElement('select');
        typeSelect.className = 'trigger-type-select';
        triggerTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            option.selected = trigger.type === type.id;
            typeSelect.appendChild(option);
        });
        typeSelect.addEventListener('change', () => {
            this.audioTriggerSystem.updateTrigger(trigger.id, { type: typeSelect.value });
            this.render();
        });
        
        // Action
        const actionSelect = document.createElement('select');
        actionSelect.className = 'trigger-action-select';
        
        // Group actions by category
        const categories = {};
        actions.forEach(action => {
            if (!categories[action.category]) {
                categories[action.category] = [];
            }
            categories[action.category].push(action);
        });
        
        Object.entries(categories).forEach(([category, categoryActions]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category.charAt(0).toUpperCase() + category.slice(1);
            categoryActions.forEach(action => {
                const option = document.createElement('option');
                option.value = action.id;
                option.textContent = action.name;
                option.selected = trigger.action === action.id;
                optgroup.appendChild(option);
            });
            actionSelect.appendChild(optgroup);
        });
        
        actionSelect.addEventListener('change', () => {
            this.audioTriggerSystem.updateTrigger(trigger.id, { action: actionSelect.value });
            this.render();
        });
        
        controls.appendChild(this.createControlRow('When:', typeSelect));
        controls.appendChild(this.createControlRow('Do:', actionSelect));
        
        // Additional controls based on trigger type
        if (trigger.type === 'everyNBeats') {
            const beatInput = document.createElement('input');
            beatInput.type = 'number';
            beatInput.className = 'trigger-number-input';
            beatInput.value = trigger.beatInterval;
            beatInput.min = 1;
            beatInput.max = 32;
            beatInput.addEventListener('change', () => {
                this.audioTriggerSystem.updateTrigger(trigger.id, { 
                    beatInterval: parseInt(beatInput.value) 
                });
                this.render();
            });
            controls.appendChild(this.createControlRow('Every N beats:', beatInput));
        }
        
        if (['thresholdAbove', 'thresholdBelow', 'thresholdCrossUp', 'thresholdCrossDown'].includes(trigger.type)) {
            const varSelect = document.createElement('select');
            varSelect.className = 'trigger-var-select';
            audioVars.forEach(v => {
                const option = document.createElement('option');
                option.value = v;
                option.textContent = v;
                option.selected = trigger.audioVariable === v;
                varSelect.appendChild(option);
            });
            varSelect.addEventListener('change', () => {
                this.audioTriggerSystem.updateTrigger(trigger.id, { 
                    audioVariable: varSelect.value 
                });
                this.render();
            });
            
            const thresholdInput = document.createElement('input');
            thresholdInput.type = 'number';
            thresholdInput.className = 'trigger-number-input';
            thresholdInput.value = trigger.threshold;
            thresholdInput.min = 0;
            thresholdInput.max = 1;
            thresholdInput.step = 0.01;
            thresholdInput.addEventListener('change', () => {
                this.audioTriggerSystem.updateTrigger(trigger.id, { 
                    threshold: parseFloat(thresholdInput.value) 
                });
                this.render();
            });
            
            controls.appendChild(this.createControlRow('Variable:', varSelect));
            controls.appendChild(this.createControlRow('Threshold:', thresholdInput));
        }
        
        if (trigger.type === 'volumePeak') {
            const sensitivityInput = document.createElement('input');
            sensitivityInput.type = 'range';
            sensitivityInput.className = 'trigger-range-input';
            sensitivityInput.value = trigger.peakSensitivity;
            sensitivityInput.min = 0.5;
            sensitivityInput.max = 1;
            sensitivityInput.step = 0.01;
            
            const sensitivityValue = document.createElement('span');
            sensitivityValue.textContent = (trigger.peakSensitivity * 100).toFixed(0) + '%';
            
            sensitivityInput.addEventListener('input', () => {
                sensitivityValue.textContent = (parseFloat(sensitivityInput.value) * 100).toFixed(0) + '%';
                this.audioTriggerSystem.updateTrigger(trigger.id, { 
                    peakSensitivity: parseFloat(sensitivityInput.value) 
                });
            });
            
            const row = this.createControlRow('Sensitivity:', sensitivityInput);
            row.appendChild(sensitivityValue);
            controls.appendChild(row);
        }
        
        // Cooldown
        const cooldownInput = document.createElement('input');
        cooldownInput.type = 'number';
        cooldownInput.className = 'trigger-number-input';
        cooldownInput.value = trigger.cooldown;
        cooldownInput.min = 0;
        cooldownInput.max = 5000;
        cooldownInput.step = 50;
        cooldownInput.addEventListener('change', () => {
            this.audioTriggerSystem.updateTrigger(trigger.id, { 
                cooldown: parseInt(cooldownInput.value) 
            });
        });
        controls.appendChild(this.createControlRow('Cooldown (ms):', cooldownInput));
        
        el.appendChild(header);
        el.appendChild(controls);
        
        return el;
    }

    /**
     * Create a control row
     */
    createControlRow(labelText, input) {
        const row = document.createElement('div');
        row.className = 'trigger-control-row';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        label.className = 'trigger-control-label';
        
        row.appendChild(label);
        row.appendChild(input);
        
        return row;
    }

    /**
     * Get human-readable description of trigger
     */
    getTriggerDescription(trigger) {
        const actionName = this.audioTriggerSystem.getActions().find(a => a.id === trigger.action)?.name || trigger.action;
        
        switch (trigger.type) {
            case 'beat':
                return `On beat → ${actionName}`;
            case 'everyNBeats':
                return `Every ${trigger.beatInterval} beats → ${actionName}`;
            case 'volumePeak':
                return `Volume peak → ${actionName}`;
            case 'thresholdAbove':
                return `${trigger.audioVariable} > ${trigger.threshold} → ${actionName}`;
            case 'thresholdBelow':
                return `${trigger.audioVariable} < ${trigger.threshold} → ${actionName}`;
            case 'thresholdCrossUp':
                return `${trigger.audioVariable} crosses up ${trigger.threshold} → ${actionName}`;
            case 'thresholdCrossDown':
                return `${trigger.audioVariable} crosses down ${trigger.threshold} → ${actionName}`;
            default:
                return `${trigger.type} → ${actionName}`;
        }
    }
}
