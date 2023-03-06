import { rotatePoints, Vector2 } from './Linear';

/*  I want an array of points that describe the dragon curve
    Base case [[0, 0], [1, 0]]
    The next iteration appends the prevously array rotated into an angle (theta) along the last point, 
    it must be reverted to match the order of each segment for the path draw

    Assuming theta = 90 deg (PI / 2)
    In the first iteration would be:
    Prev array: [[0, 0], [1, 0]]
    Rotated on the last point: [[1, 1], [1, 0]]
*/
export function getDragonPoints(
  depth: number,
  theta: number,
  startingPoint: Vector2,
  lineLength: number
) {
  function buildDragonPath(pathDepth: number): Vector2[] {
    if (pathDepth == 0) {
      return [
        startingPoint,
        {
          x: startingPoint.x + lineLength,
          y: startingPoint.y,
        },
      ];
    }

    const prevDepthPath = buildDragonPath(pathDepth - 1);
    const lastPoint = prevDepthPath[prevDepthPath.length - 1];
    const rotatedPath = rotatePoints(theta, prevDepthPath, lastPoint);
    rotatedPath.pop(); // Remove repeated point
    return prevDepthPath.concat(rotatedPath.reverse()); // Reverse order for the drawable path
  }

  return buildDragonPath(depth);
}
