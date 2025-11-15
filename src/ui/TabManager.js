// TabManager.js
// Manages tab switching for animation control panels

export class TabManager {
    constructor() {
        this.currentTab = 'scale';
        this.tabs = ['scale', 'xmove', 'ymove', 'rotate'];
        this.tabButtons = [];
        this.tabContents = [];
        
        this.initializeTabs();
        this.bindEventListeners();
    }

    /**
     * Initialize tab elements
     */
    initializeTabs() {
        // Get all tab buttons
        this.tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
        
        // Get all tab content panels
        this.tabContents = [
            { id: 'scale', element: document.getElementById('scale-tab') },
            { id: 'xmove', element: document.getElementById('xmove-tab') },
            { id: 'ymove', element: document.getElementById('ymove-tab') },
            { id: 'rotate', element: document.getElementById('rotate-tab') }
        ];
    }

    /**
     * Bind event listeners to tab buttons
     */
    bindEventListeners() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                if (tabId) {
                    this.switchTab(tabId);
                }
            });
        });
    }

    /**
     * Switch to a specific tab
     * @param {string} tabId - The tab identifier (scale, xmove, ymove, rotate)
     */
    switchTab(tabId) {
        if (!this.tabs.includes(tabId)) {
            console.warn(`Invalid tab ID: ${tabId}`);
            return;
        }

        // Update current tab
        this.currentTab = tabId;

        // Update tab button states
        this.tabButtons.forEach(button => {
            if (button.dataset.tab === tabId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Update tab content visibility
        this.tabContents.forEach(tab => {
            if (tab.id === tabId && tab.element) {
                tab.element.classList.add('active');
            } else if (tab.element) {
                tab.element.classList.remove('active');
            }
        });
    }

    /**
     * Get the currently active tab
     * @returns {string} Current tab ID
     */
    getCurrentTab() {
        return this.currentTab;
    }

    /**
     * Get all available tabs
     * @returns {Array<string>} Array of tab IDs
     */
    getTabs() {
        return [...this.tabs];
    }
}
