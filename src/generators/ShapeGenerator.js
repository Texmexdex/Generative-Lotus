// ShapeGenerator.js
// Generate built-in shapes using Path2D, normalized to 100x100 bounding box

export class ShapeGenerator {
    constructor() {
        // Cache for generated shapes
        this.shapeCache = new Map();
    }

    /**
     * Get a shape path for the specified type
     * @param {string} shapeType - Type of shape to generate
     * @param {number} size - Size of the shape (default 100)
     * @param {object} customData - Custom SVG data for 'custom' type
     * @returns {Path2D} Path2D object for the shape
     */
    getShapePath(shapeType, size = 100, customData = null) {
        // Check cache first
        const cacheKey = `${shapeType}_${size}`;
        if (this.shapeCache.has(cacheKey) && shapeType !== 'custom') {
            return this.shapeCache.get(cacheKey);
        }

        let path;
        switch (shapeType) {
            case 'circle':
                path = this.generateCircle(size);
                break;
            case 'square':
                path = this.generateSquare(size);
                break;
            case 'triangle':
                path = this.generateTriangle(size);
                break;
            case 'star':
                path = this.generateStar(size, 5);
                break;
            case 'pentagon':
                path = this.generatePentagon(size);
                break;
            case 'hexagon':
                path = this.generateHexagon(size);
                break;
            case 'octagon':
                path = this.generateOctagon(size);
                break;
            case 'tetrahedron':
                path = this.generateTetrahedron(size);
                break;
            case 'diamond':
                path = this.generateDiamond(size);
                break;
            case 'heart':
                path = this.generateHeart(size);
                break;
            case 'crescent':
                path = this.generateCrescent(size);
                break;
            case 'cross':
                path = this.generateCross(size);
                break;
            case 'ring':
                path = this.generateRing(size);
                break;
            case 'cube':
                path = this.generateCube(size);
                break;
            case 'icosahedron':
                path = this.generateIcosahedron(size);
                break;
            case 'octahedron':
                path = this.generateOctahedron(size);
                break;
            case 'dodecahedron':
                path = this.generateDodecahedron(size);
                break;
            case 'pyramid':
                path = this.generatePyramid(size);
                break;
            case 'torus':
                path = this.generateTorus(size);
                break;
            case 'doublehelix':
                path = this.generateDoubleHelix(size);
                break;
            case 'custom':
                if (customData && customData.path) {
                    return customData.path;
                }
                // Fallback to circle if no custom data
                path = this.generateCircle(size);
                break;
            default:
                console.warn(`Unknown shape type: ${shapeType}, using circle`);
                path = this.generateCircle(size);
        }

        // Cache the generated path
        if (shapeType !== 'custom') {
            this.shapeCache.set(cacheKey, path);
        }

        return path;
    }

    /**
     * Generate a circle centered at origin
     * @param {number} size - Diameter of the circle
     * @returns {Path2D} Circle path
     */
    generateCircle(size) {
        const path = new Path2D();
        const radius = size / 2;
        path.arc(0, 0, radius, 0, Math.PI * 2);
        return path;
    }

    /**
     * Generate a square centered at origin
     * @param {number} size - Side length of the square
     * @returns {Path2D} Square path
     */
    generateSquare(size) {
        const path = new Path2D();
        const half = size / 2;
        path.rect(-half, -half, size, size);
        return path;
    }

    /**
     * Generate an equilateral triangle centered at origin
     * @param {number} size - Height of the triangle
     * @returns {Path2D} Triangle path
     */
    generateTriangle(size) {
        const path = new Path2D();
        const height = size;
        const width = (size * 2) / Math.sqrt(3); // Equilateral triangle
        
        // Center the triangle vertically
        const top = -height / 2;
        const bottom = height / 2;
        const halfWidth = width / 2;
        
        path.moveTo(0, top);
        path.lineTo(halfWidth, bottom);
        path.lineTo(-halfWidth, bottom);
        path.closePath();
        
        return path;
    }

    /**
     * Generate a star shape centered at origin
     * @param {number} size - Outer radius of the star
     * @param {number} points - Number of points (default 5)
     * @returns {Path2D} Star path
     */
    generateStar(size, points = 5) {
        const path = new Path2D();
        const outerRadius = size / 2;
        const innerRadius = outerRadius * 0.4; // Inner radius is 40% of outer
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (Math.PI * i) / points - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }
        
        path.closePath();
        return path;
    }

    /**
     * Generate a regular pentagon centered at origin
     * @param {number} size - Diameter of circumscribed circle
     * @returns {Path2D} Pentagon path
     */
    generatePentagon(size) {
        return this.generateRegularPolygon(size, 5);
    }

    /**
     * Generate a regular hexagon centered at origin
     * @param {number} size - Diameter of circumscribed circle
     * @returns {Path2D} Hexagon path
     */
    generateHexagon(size) {
        return this.generateRegularPolygon(size, 6);
    }

    /**
     * Generate a regular octagon centered at origin
     * @param {number} size - Diameter of circumscribed circle
     * @returns {Path2D} Octagon path
     */
    generateOctagon(size) {
        return this.generateRegularPolygon(size, 8);
    }

    /**
     * Generate a regular polygon centered at origin
     * @param {number} size - Diameter of circumscribed circle
     * @param {number} sides - Number of sides
     * @returns {Path2D} Polygon path
     */
    generateRegularPolygon(size, sides) {
        const path = new Path2D();
        const radius = size / 2;
        
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }
        
        path.closePath();
        return path;
    }

    /**
     * Generate a 2D projection of a tetrahedron
     * @param {number} size - Size of the tetrahedron
     * @returns {Path2D} Tetrahedron path
     */
    generateTetrahedron(size) {
        const path = new Path2D();
        const scale = size / 100;
        
        // 2D projection of a tetrahedron (3D wireframe)
        // Using orthographic projection of vertices
        const vertices = [
            { x: 0, y: -40 * scale },      // Top vertex
            { x: -35 * scale, y: 20 * scale },  // Bottom left
            { x: 35 * scale, y: 20 * scale },   // Bottom right
            { x: 0, y: 5 * scale }         // Center (back vertex projected)
        ];
        
        // Draw the visible edges
        // Front face
        path.moveTo(vertices[0].x, vertices[0].y);
        path.lineTo(vertices[1].x, vertices[1].y);
        path.lineTo(vertices[2].x, vertices[2].y);
        path.closePath();
        
        // Back edges
        path.moveTo(vertices[0].x, vertices[0].y);
        path.lineTo(vertices[3].x, vertices[3].y);
        
        path.moveTo(vertices[1].x, vertices[1].y);
        path.lineTo(vertices[3].x, vertices[3].y);
        
        path.moveTo(vertices[2].x, vertices[2].y);
        path.lineTo(vertices[3].x, vertices[3].y);
        
        return path;
    }

    /**
     * Generate a diamond shape centered at origin
     * @param {number} size - Size of the diamond
     * @returns {Path2D} Diamond path
     */
    generateDiamond(size) {
        const path = new Path2D();
        const half = size / 2;
        
        path.moveTo(0, -half);
        path.lineTo(half, 0);
        path.lineTo(0, half);
        path.lineTo(-half, 0);
        path.closePath();
        
        return path;
    }

    /**
     * Generate a heart shape centered at origin
     * @param {number} size - Size of the heart
     * @returns {Path2D} Heart path
     */
    generateHeart(size) {
        const path = new Path2D();
        const scale = size / 100;
        
        // Heart shape using bezier curves
        path.moveTo(0, 15 * scale);
        path.bezierCurveTo(-25 * scale, -10 * scale, -50 * scale, 5 * scale, -50 * scale, 30 * scale);
        path.bezierCurveTo(-50 * scale, 45 * scale, -30 * scale, 55 * scale, 0, 70 * scale);
        path.bezierCurveTo(30 * scale, 55 * scale, 50 * scale, 45 * scale, 50 * scale, 30 * scale);
        path.bezierCurveTo(50 * scale, 5 * scale, 25 * scale, -10 * scale, 0, 15 * scale);
        
        // Center the heart
        const ctx = new OffscreenCanvas(1, 1).getContext('2d');
        const transform = new DOMMatrix();
        transform.translateSelf(0, -20 * scale);
        
        return path;
    }

    /**
     * Generate a crescent moon shape centered at origin
     * @param {number} size - Size of the crescent
     * @returns {Path2D} Crescent path
     */
    generateCrescent(size) {
        const path = new Path2D();
        const radius = size / 2;
        const offset = radius * 0.4;
        
        // Outer arc (right side)
        path.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, false);
        
        // Inner arc (left side, creating the crescent)
        path.arc(offset, 0, radius * 0.8, Math.PI / 2, -Math.PI / 2, true);
        
        path.closePath();
        return path;
    }

    /**
     * Generate a cross shape centered at origin
     * @param {number} size - Size of the cross
     * @returns {Path2D} Cross path
     */
    generateCross(size) {
        const path = new Path2D();
        const half = size / 2;
        const thickness = size / 6;
        
        // Vertical bar
        path.rect(-thickness, -half, thickness * 2, size);
        
        // Horizontal bar
        path.rect(-half, -thickness, size, thickness * 2);
        
        return path;
    }

    /**
     * Generate a ring (donut) shape centered at origin
     * @param {number} size - Outer diameter of the ring
     * @returns {Path2D} Ring path
     */
    generateRing(size) {
        const path = new Path2D();
        const outerRadius = size / 2;
        const innerRadius = outerRadius * 0.6;
        
        // Outer circle
        path.arc(0, 0, outerRadius, 0, Math.PI * 2, false);
        
        // Inner circle (counter-clockwise to create hole)
        path.arc(0, 0, innerRadius, 0, Math.PI * 2, true);
        
        return path;
    }

    /**
     * Generate a cube wireframe (3D projection)
     * @param {number} size - Size of the cube
     * @returns {Path2D} Cube wireframe path
     */
    generateCube(size) {
        const path = new Path2D();
        const scale = size / 100;
        
        // Define cube vertices in 3D space with isometric projection
        const vertices = [
            // Front face
            { x: -30 * scale, y: -20 * scale },
            { x: 30 * scale, y: -20 * scale },
            { x: 30 * scale, y: 40 * scale },
            { x: -30 * scale, y: 40 * scale },
            // Back face (offset for depth)
            { x: -10 * scale, y: -35 * scale },
            { x: 50 * scale, y: -35 * scale },
            { x: 50 * scale, y: 25 * scale },
            { x: -10 * scale, y: 25 * scale }
        ];
        
        // Draw front face
        path.moveTo(vertices[0].x, vertices[0].y);
        path.lineTo(vertices[1].x, vertices[1].y);
        path.lineTo(vertices[2].x, vertices[2].y);
        path.lineTo(vertices[3].x, vertices[3].y);
        path.closePath();
        
        // Draw back face
        path.moveTo(vertices[4].x, vertices[4].y);
        path.lineTo(vertices[5].x, vertices[5].y);
        path.lineTo(vertices[6].x, vertices[6].y);
        path.lineTo(vertices[7].x, vertices[7].y);
        path.closePath();
        
        // Draw connecting edges
        for (let i = 0; i < 4; i++) {
            path.moveTo(vertices[i].x, vertices[i].y);
            path.lineTo(vertices[i + 4].x, vertices[i + 4].y);
        }
        
        return path;
    }

    /**
     * Generate an icosahedron wireframe (20-sided 3D shape)
     * @param {number} size - Size of the icosahedron
     * @returns {Path2D} Icosahedron wireframe path
     */
    generateIcosahedron(size) {
        const path = new Path2D();
        const scale = size / 100;
        const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
        
        // Icosahedron vertices (normalized and scaled)
        const vertices = [
            { x: 0, y: -45 * scale },
            { x: -40 * scale, y: -20 * scale },
            { x: -25 * scale, y: -20 * scale },
            { x: 25 * scale, y: -20 * scale },
            { x: 40 * scale, y: -20 * scale },
            { x: -35 * scale, y: 10 * scale },
            { x: -10 * scale, y: 10 * scale },
            { x: 10 * scale, y: 10 * scale },
            { x: 35 * scale, y: 10 * scale },
            { x: -20 * scale, y: 35 * scale },
            { x: 20 * scale, y: 35 * scale },
            { x: 0, y: 45 * scale }
        ];
        
        // Draw edges (simplified icosahedron structure)
        const edges = [
            [0, 1], [0, 2], [0, 3], [0, 4],
            [1, 2], [2, 3], [3, 4], [4, 1],
            [1, 5], [2, 6], [3, 7], [4, 8],
            [5, 6], [6, 7], [7, 8], [8, 5],
            [5, 9], [6, 9], [7, 10], [8, 10],
            [9, 10], [9, 11], [10, 11]
        ];
        
        edges.forEach(([start, end]) => {
            path.moveTo(vertices[start].x, vertices[start].y);
            path.lineTo(vertices[end].x, vertices[end].y);
        });
        
        return path;
    }

    /**
     * Generate an octahedron wireframe (8-sided 3D shape)
     * @param {number} size - Size of the octahedron
     * @returns {Path2D} Octahedron wireframe path
     */
    generateOctahedron(size) {
        const path = new Path2D();
        const scale = size / 100;
        
        // Octahedron vertices
        const vertices = [
            { x: 0, y: -45 * scale },           // Top
            { x: -35 * scale, y: 0 },           // Left
            { x: 0, y: -10 * scale },           // Front
            { x: 35 * scale, y: 0 },            // Right
            { x: 0, y: 10 * scale },            // Back
            { x: 0, y: 45 * scale }             // Bottom
        ];
        
        // Draw edges
        const edges = [
            [0, 1], [0, 2], [0, 3], [0, 4],     // Top pyramid
            [5, 1], [5, 2], [5, 3], [5, 4],     // Bottom pyramid
            [1, 2], [2, 3], [3, 4], [4, 1]      // Middle square
        ];
        
        edges.forEach(([start, end]) => {
            path.moveTo(vertices[start].x, vertices[start].y);
            path.lineTo(vertices[end].x, vertices[end].y);
        });
        
        return path;
    }

    /**
     * Generate a dodecahedron wireframe (12-sided 3D shape)
     * @param {number} size - Size of the dodecahedron
     * @returns {Path2D} Dodecahedron wireframe path
     */
    generateDodecahedron(size) {
        const path = new Path2D();
        const scale = size / 100;
        
        // Simplified dodecahedron projection
        const vertices = [
            // Top pentagon
            { x: 0, y: -40 * scale },
            { x: -25 * scale, y: -30 * scale },
            { x: -30 * scale, y: -10 * scale },
            { x: 30 * scale, y: -10 * scale },
            { x: 25 * scale, y: -30 * scale },
            // Middle ring
            { x: -40 * scale, y: 5 * scale },
            { x: -20 * scale, y: 15 * scale },
            { x: 20 * scale, y: 15 * scale },
            { x: 40 * scale, y: 5 * scale },
            { x: 35 * scale, y: -15 * scale },
            // Bottom pentagon
            { x: -15 * scale, y: 35 * scale },
            { x: 15 * scale, y: 35 * scale },
            { x: 0, y: 45 * scale }
        ];
        
        // Draw edges
        const edges = [
            // Top pentagon
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
            // Connections to middle
            [1, 5], [2, 5], [2, 6], [3, 7], [3, 9], [4, 9],
            // Middle ring
            [5, 6], [6, 7], [7, 8], [8, 9],
            // Connections to bottom
            [5, 10], [6, 10], [6, 11], [7, 11], [8, 11],
            // Bottom
            [10, 12], [11, 12]
        ];
        
        edges.forEach(([start, end]) => {
            path.moveTo(vertices[start].x, vertices[start].y);
            path.lineTo(vertices[end].x, vertices[end].y);
        });
        
        return path;
    }

    /**
     * Generate a pyramid wireframe (square base)
     * @param {number} size - Size of the pyramid
     * @returns {Path2D} Pyramid wireframe path
     */
    generatePyramid(size) {
        const path = new Path2D();
        const scale = size / 100;
        
        // Pyramid vertices
        const vertices = [
            { x: 0, y: -40 * scale },           // Apex
            { x: -35 * scale, y: 30 * scale },  // Base corners
            { x: 35 * scale, y: 30 * scale },
            { x: 30 * scale, y: 40 * scale },
            { x: -30 * scale, y: 40 * scale }
        ];
        
        // Draw base
        path.moveTo(vertices[1].x, vertices[1].y);
        path.lineTo(vertices[2].x, vertices[2].y);
        path.lineTo(vertices[3].x, vertices[3].y);
        path.lineTo(vertices[4].x, vertices[4].y);
        path.closePath();
        
        // Draw edges to apex
        for (let i = 1; i <= 4; i++) {
            path.moveTo(vertices[0].x, vertices[0].y);
            path.lineTo(vertices[i].x, vertices[i].y);
        }
        
        return path;
    }

    /**
     * Generate a torus wireframe (donut shape)
     * @param {number} size - Size of the torus
     * @returns {Path2D} Torus wireframe path
     */
    generateTorus(size) {
        const path = new Path2D();
        const scale = size / 100;
        const segments = 16;
        
        // Draw outer circle
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * 40 * scale;
            const y = Math.sin(angle) * 40 * scale;
            
            if (i === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }
        
        // Draw inner circle
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * 20 * scale;
            const y = Math.sin(angle) * 20 * scale;
            
            if (i === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }
        
        // Draw connecting lines
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = Math.cos(angle) * 20 * scale;
            const y1 = Math.sin(angle) * 20 * scale;
            const x2 = Math.cos(angle) * 40 * scale;
            const y2 = Math.sin(angle) * 40 * scale;
            
            path.moveTo(x1, y1);
            path.lineTo(x2, y2);
        }
        
        return path;
    }

    /**
     * Generate a double helix wireframe
     * @param {number} size - Size of the helix
     * @returns {Path2D} Double helix path
     */
    generateDoubleHelix(size) {
        const path = new Path2D();
        const scale = size / 100;
        const segments = 20;
        
        // Draw first helix
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const angle = t * Math.PI * 4;
            const x = Math.cos(angle) * 30 * scale;
            const y = (t - 0.5) * 80 * scale;
            
            if (i === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }
        
        // Draw second helix (offset by 180 degrees)
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const angle = t * Math.PI * 4 + Math.PI;
            const x = Math.cos(angle) * 30 * scale;
            const y = (t - 0.5) * 80 * scale;
            
            if (i === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }
        
        // Draw connecting rungs
        for (let i = 0; i < segments; i += 2) {
            const t = i / segments;
            const angle1 = t * Math.PI * 4;
            const angle2 = angle1 + Math.PI;
            const x1 = Math.cos(angle1) * 30 * scale;
            const x2 = Math.cos(angle2) * 30 * scale;
            const y = (t - 0.5) * 80 * scale;
            
            path.moveTo(x1, y);
            path.lineTo(x2, y);
        }
        
        return path;
    }

    /**
     * Clear the shape cache
     */
    clearCache() {
        this.shapeCache.clear();
    }

    /**
     * Get bounds information for a shape type
     * @param {string} shapeType - Type of shape
     * @param {number} size - Size of the shape
     * @returns {object} Bounds object with width and height
     */
    getShapeBounds(shapeType, size = 100) {
        // All shapes are normalized to fit within the specified size
        return {
            width: size,
            height: size
        };
    }
}
