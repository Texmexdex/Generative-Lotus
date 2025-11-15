// SVGParser.js
// Parse custom SVG files and convert to Path2D objects

export class SVGParser {
    constructor() {
        this.parser = new DOMParser();
    }

    /**
     * Parse an SVG string and extract path data
     * @param {string} svgString - SVG file content as string
     * @returns {object} Object containing Path2D and bounds, or null if invalid
     */
    parseSVG(svgString) {
        try {
            // Parse the SVG string
            const doc = this.parser.parseFromString(svgString, 'image/svg+xml');
            
            // Check for parsing errors
            const parserError = doc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Invalid SVG format');
            }
            
            // Get the SVG element
            const svgElement = doc.querySelector('svg');
            if (!svgElement) {
                throw new Error('No SVG element found');
            }
            
            // Extract all path elements
            const paths = svgElement.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon');
            
            if (paths.length === 0) {
                throw new Error('No drawable elements found in SVG');
            }
            
            // Get the viewBox or use width/height
            let viewBox = this.getViewBox(svgElement);
            
            // Convert all elements to a single path
            const combinedPath = this.combineElements(paths, viewBox);
            
            // Normalize the path to 100x100 bounding box
            const normalized = this.normalizePath(combinedPath, viewBox);
            
            return normalized;
            
        } catch (error) {
            console.error('SVG parsing error:', error);
            return null;
        }
    }

    /**
     * Get the viewBox from SVG element
     * @param {SVGElement} svgElement - The SVG element
     * @returns {object} ViewBox object with x, y, width, height
     */
    getViewBox(svgElement) {
        const viewBoxAttr = svgElement.getAttribute('viewBox');
        
        if (viewBoxAttr) {
            const values = viewBoxAttr.split(/\s+|,/).map(v => parseFloat(v));
            if (values.length === 4) {
                return {
                    x: values[0],
                    y: values[1],
                    width: values[2],
                    height: values[3]
                };
            }
        }
        
        // Fallback to width and height attributes
        const width = parseFloat(svgElement.getAttribute('width')) || 100;
        const height = parseFloat(svgElement.getAttribute('height')) || 100;
        
        return {
            x: 0,
            y: 0,
            width: width,
            height: height
        };
    }

    /**
     * Combine multiple SVG elements into a single path string
     * @param {NodeList} elements - SVG elements to combine
     * @param {object} viewBox - ViewBox information
     * @returns {string} Combined path data string
     */
    combineElements(elements, viewBox) {
        let pathData = '';
        
        elements.forEach(element => {
            const tagName = element.tagName.toLowerCase();
            
            switch (tagName) {
                case 'path':
                    pathData += ' ' + (element.getAttribute('d') || '');
                    break;
                    
                case 'circle':
                    pathData += ' ' + this.circleToPath(element);
                    break;
                    
                case 'rect':
                    pathData += ' ' + this.rectToPath(element);
                    break;
                    
                case 'ellipse':
                    pathData += ' ' + this.ellipseToPath(element);
                    break;
                    
                case 'line':
                    pathData += ' ' + this.lineToPath(element);
                    break;
                    
                case 'polyline':
                case 'polygon':
                    pathData += ' ' + this.polyToPath(element);
                    break;
            }
        });
        
        return pathData.trim();
    }

    /**
     * Convert circle element to path data
     */
    circleToPath(circle) {
        const cx = parseFloat(circle.getAttribute('cx')) || 0;
        const cy = parseFloat(circle.getAttribute('cy')) || 0;
        const r = parseFloat(circle.getAttribute('r')) || 0;
        
        // Use arc commands to draw a circle
        return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy}`;
    }

    /**
     * Convert rect element to path data
     */
    rectToPath(rect) {
        const x = parseFloat(rect.getAttribute('x')) || 0;
        const y = parseFloat(rect.getAttribute('y')) || 0;
        const width = parseFloat(rect.getAttribute('width')) || 0;
        const height = parseFloat(rect.getAttribute('height')) || 0;
        
        return `M ${x},${y} L ${x + width},${y} L ${x + width},${y + height} L ${x},${y + height} Z`;
    }

    /**
     * Convert ellipse element to path data
     */
    ellipseToPath(ellipse) {
        const cx = parseFloat(ellipse.getAttribute('cx')) || 0;
        const cy = parseFloat(ellipse.getAttribute('cy')) || 0;
        const rx = parseFloat(ellipse.getAttribute('rx')) || 0;
        const ry = parseFloat(ellipse.getAttribute('ry')) || 0;
        
        return `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy}`;
    }

    /**
     * Convert line element to path data
     */
    lineToPath(line) {
        const x1 = parseFloat(line.getAttribute('x1')) || 0;
        const y1 = parseFloat(line.getAttribute('y1')) || 0;
        const x2 = parseFloat(line.getAttribute('x2')) || 0;
        const y2 = parseFloat(line.getAttribute('y2')) || 0;
        
        return `M ${x1},${y1} L ${x2},${y2}`;
    }

    /**
     * Convert polyline or polygon element to path data
     */
    polyToPath(poly) {
        const points = poly.getAttribute('points') || '';
        const coords = points.trim().split(/\s+|,/).map(v => parseFloat(v));
        
        if (coords.length < 2) {
            return '';
        }
        
        let pathData = `M ${coords[0]},${coords[1]}`;
        
        for (let i = 2; i < coords.length; i += 2) {
            pathData += ` L ${coords[i]},${coords[i + 1]}`;
        }
        
        // Close path for polygon
        if (poly.tagName.toLowerCase() === 'polygon') {
            pathData += ' Z';
        }
        
        return pathData;
    }

    /**
     * Normalize path to 100x100 bounding box centered at origin
     * @param {string} pathData - SVG path data string
     * @param {object} viewBox - Original viewBox
     * @returns {object} Object with normalized Path2D and bounds
     */
    normalizePath(pathData, viewBox) {
        try {
            // Create a Path2D from the path data
            const originalPath = new Path2D(pathData);
            
            // Calculate the scale to fit in 100x100 box
            const maxDimension = Math.max(viewBox.width, viewBox.height);
            const scale = 100 / maxDimension;
            
            // Calculate centering offsets
            const scaledWidth = viewBox.width * scale;
            const scaledHeight = viewBox.height * scale;
            const offsetX = -viewBox.x * scale - scaledWidth / 2;
            const offsetY = -viewBox.y * scale - scaledHeight / 2;
            
            // Create a new path with transformations applied
            const normalizedPath = new Path2D();
            
            // We need to manually transform the path since Path2D doesn't have a transform method
            // We'll create a temporary canvas to apply transformations
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // Apply transformations to context
            tempCtx.translate(offsetX, offsetY);
            tempCtx.scale(scale, scale);
            
            // Unfortunately, we can't extract the transformed path directly
            // So we'll store the path data and transformation info
            return {
                path: originalPath,
                pathData: pathData,
                transform: {
                    scale: scale,
                    offsetX: offsetX,
                    offsetY: offsetY,
                    originalViewBox: viewBox
                },
                bounds: {
                    width: 100,
                    height: 100
                }
            };
            
        } catch (error) {
            console.error('Path normalization error:', error);
            throw new Error('Failed to normalize SVG path');
        }
    }

    /**
     * Create a normalized Path2D that can be rendered
     * This applies the transformation to create a properly centered path
     * @param {object} normalizedData - Data from normalizePath
     * @returns {Path2D} Transformed Path2D object
     */
    createTransformedPath(normalizedData) {
        // Since we can't directly transform Path2D, we return the original
        // and expect the renderer to apply the transform
        return normalizedData.path;
    }

    /**
     * Validate SVG file size
     * @param {string} svgString - SVG content
     * @returns {boolean} True if size is acceptable
     */
    validateSize(svgString) {
        const sizeInBytes = new Blob([svgString]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 1) {
            console.warn(`SVG file is large: ${sizeInMB.toFixed(2)}MB`);
            return false;
        }
        
        return true;
    }

    /**
     * Parse SVG from a File object
     * @param {File} file - SVG file
     * @returns {Promise<object>} Promise resolving to parsed SVG data
     */
    async parseSVGFile(file) {
        return new Promise((resolve, reject) => {
            // Validate file type
            if (!file.type.includes('svg')) {
                reject(new Error('File is not an SVG'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const svgString = e.target.result;
                    
                    // Validate size
                    if (!this.validateSize(svgString)) {
                        console.warn('SVG file is large, parsing anyway...');
                    }
                    
                    const parsed = this.parseSVG(svgString);
                    
                    if (parsed) {
                        resolve(parsed);
                    } else {
                        reject(new Error('Failed to parse SVG'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }
}
