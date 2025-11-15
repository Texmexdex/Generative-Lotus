// SequenceGenerator.js
// Manage shape sequence generation and caching

export class SequenceGenerator {
    constructor(shapeGenerator, svgParser) {
        this.shapeGenerator = shapeGenerator;
        this.svgParser = svgParser;
        
        // Cache for generated sequences
        this.sequenceCache = {
            shapeType: null,
            shapeSize: null,
            customData: null,
            count: 0,
            shapePath: null
        };
    }

    /**
     * Generate a sequence of shapes
     * @param {string} shapeType - Type of shape to generate
     * @param {number} count - Number of shapes in sequence (0-2000)
     * @param {number} size - Size of each shape
     * @param {object} customData - Custom SVG data if shapeType is 'custom'
     * @returns {object} Sequence data with shape path and count
     */
    generateSequence(shapeType, count, size = 100, customData = null) {
        // Validate count
        count = Math.max(0, Math.min(2000, Math.floor(count)));
        
        // Check if we can use cached sequence
        if (this.canUseCache(shapeType, size, customData, count)) {
            return {
                shapePath: this.sequenceCache.shapePath,
                count: count,
                size: size,
                cached: true
            };
        }
        
        // Generate new shape path
        let shapePath;
        
        if (shapeType === 'custom' && customData) {
            // Use custom SVG data
            shapePath = customData.path;
        } else {
            // Generate built-in shape
            shapePath = this.shapeGenerator.getShapePath(shapeType, size, customData);
        }
        
        // Update cache
        this.updateCache(shapeType, size, customData, count, shapePath);
        
        return {
            shapePath: shapePath,
            count: count,
            size: size,
            cached: false
        };
    }

    /**
     * Check if cached sequence can be used
     * @param {string} shapeType - Shape type
     * @param {number} size - Shape size
     * @param {object} customData - Custom data
     * @param {number} count - Sequence count
     * @returns {boolean} True if cache can be used
     */
    canUseCache(shapeType, size, customData, count) {
        // Cache is valid if shape type and size haven't changed
        // Count doesn't matter for caching since we just reuse the same shape
        
        if (this.sequenceCache.shapePath === null) {
            return false;
        }
        
        if (this.sequenceCache.shapeType !== shapeType) {
            return false;
        }
        
        if (this.sequenceCache.shapeSize !== size) {
            return false;
        }
        
        // For custom shapes, we can't reliably cache since the data might change
        if (shapeType === 'custom') {
            return false;
        }
        
        return true;
    }

    /**
     * Update the sequence cache
     * @param {string} shapeType - Shape type
     * @param {number} size - Shape size
     * @param {object} customData - Custom data
     * @param {number} count - Sequence count
     * @param {Path2D} shapePath - Generated shape path
     */
    updateCache(shapeType, size, customData, count, shapePath) {
        this.sequenceCache = {
            shapeType: shapeType,
            shapeSize: size,
            customData: customData,
            count: count,
            shapePath: shapePath
        };
    }

    /**
     * Invalidate the cache (force regeneration on next call)
     */
    invalidateCache() {
        this.sequenceCache = {
            shapeType: null,
            shapeSize: null,
            customData: null,
            count: 0,
            shapePath: null
        };
    }

    /**
     * Get the current cached shape path
     * @returns {Path2D|null} Cached shape path or null
     */
    getCachedShapePath() {
        return this.sequenceCache.shapePath;
    }

    /**
     * Check if cache is valid
     * @returns {boolean} True if cache contains valid data
     */
    isCacheValid() {
        return this.sequenceCache.shapePath !== null;
    }

    /**
     * Get cache statistics for debugging
     * @returns {object} Cache statistics
     */
    getCacheStats() {
        return {
            isValid: this.isCacheValid(),
            shapeType: this.sequenceCache.shapeType,
            shapeSize: this.sequenceCache.shapeSize,
            count: this.sequenceCache.count
        };
    }

    /**
     * Load custom SVG and prepare for sequence generation
     * @param {string} svgString - SVG file content
     * @returns {object|null} Custom shape data or null if parsing failed
     */
    loadCustomSVG(svgString) {
        try {
            const parsed = this.svgParser.parseSVG(svgString);
            
            if (!parsed) {
                throw new Error('Failed to parse SVG');
            }
            
            // Invalidate cache since we're loading new custom shape
            this.invalidateCache();
            
            return parsed;
            
        } catch (error) {
            console.error('Error loading custom SVG:', error);
            return null;
        }
    }

    /**
     * Load custom SVG from file
     * @param {File} file - SVG file
     * @returns {Promise<object>} Promise resolving to custom shape data
     */
    async loadCustomSVGFile(file) {
        try {
            const parsed = await this.svgParser.parseSVGFile(file);
            
            // Invalidate cache since we're loading new custom shape
            this.invalidateCache();
            
            return parsed;
            
        } catch (error) {
            console.error('Error loading custom SVG file:', error);
            throw error;
        }
    }

    /**
     * Validate sequence count
     * @param {number} count - Requested count
     * @returns {number} Valid count (0-2000)
     */
    validateCount(count) {
        return Math.max(0, Math.min(2000, Math.floor(count)));
    }

    /**
     * Get sequence generation info
     * @param {number} count - Sequence count
     * @returns {object} Information about the sequence
     */
    getSequenceInfo(count) {
        const validCount = this.validateCount(count);
        
        return {
            requestedCount: count,
            actualCount: validCount,
            isValid: count === validCount,
            maxCount: 2000,
            minCount: 0
        };
    }
}
