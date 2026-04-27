// src/utils/drawingUtils.ts

/**
 * Normalizes a point to the range of [0, 1].
 * @param point {number} The point to normalize.
 * @returns {number} The normalized point.
 */
function normalizePoint(point) {
    return Math.max(0, Math.min(1, point));
}

/**
 * Simplifies a path using the Ramer-Douglas-Peucker algorithm.
 * @param path {Array<{x: number, y: number}>} Array of points representing the path.
 * @param tolerance {number} Tolerance for simplification.
 * @returns {Array<{x: number, y: number}>} Simplified path.
 */
function simplifyPath(path, tolerance) {
    // Implementation of the Ramer-Douglas-Peucker algorithm
    // ... (pseudo code)
    return simplifiedPath;
}

/**
 * Interpolates between two points.
 * @param start {number} Start point.
 * @param end {number} End point.
 * @param factor {number} Interpolation factor (0 - 1).
 * @returns {number} Interpolated point.
 */
function interpolate(start, end, factor) {
    return start + factor * (end - start);
}

/**
 * Processes drawing coordinates for the robot workspace.
 * @param coords {Array<{x: number, y: number}>} Array of coordinates to process.
 * @returns {Array<{x: number, y: number}>} Processed coordinates.
 */
function processDrawingCoordinates(coords) {
    return coords.map(coord => ({
        x: normalizePoint(coord.x),
        y: normalizePoint(coord.y)
    }));
}

export { normalizePoint, simplifyPath, interpolate, processDrawingCoordinates };