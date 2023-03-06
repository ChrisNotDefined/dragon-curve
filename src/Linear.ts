export interface Vector2 {
  x: number;
  y: number;
}

export interface TransfMatrix {
  iHat: Vector2;
  jHat: Vector2;
}

export function rotatePoints(
  theta: number,
  points: Vector2[],
  axisPoint: Vector2
): Vector2[] {
  const rotMatrix: TransfMatrix = {
    iHat: { x: Math.cos(theta), y: Math.sin(theta) },
    jHat: { x: -Math.sin(theta), y: Math.cos(theta) },
  };

  return points.map((point) => {
    // Traslate the point based on the axis point as the simulated origin
    const translatedPoint: Vector2 = {
      x: point.x - axisPoint.x,
      y: point.y - axisPoint.y,
    };

    const { iHat, jHat } = rotMatrix;

    // Apply the rotation through matrix multiplication: RotMatrix X TranslatedPoint
    const rotatedOnOrigin: Vector2 = {
      x: iHat.x * translatedPoint.x + jHat.x * translatedPoint.y,
      y: iHat.y * translatedPoint.x + jHat.y * translatedPoint.y,
    };

    return {
      x: rotatedOnOrigin.x + axisPoint.x,
      y: rotatedOnOrigin.y + axisPoint.y,
    };
  });
}
