import './style.css';

console.log('Init');

interface Vector2 {
  x: number;
  y: number;
}

interface TransfMatrix {
  iHat: Vector2;
  jHat: Vector2;
}

// I want an array of points that describes the dragon curve
// Base case [[0, 0], [1, 0]]
// The next iteration appends the prevously array rotated into an angle (theta) along the last point
//
// Assuming theta = 90 deg (PI / 2)
//
// In the first iteration would be:
// Prev array: [[0, 0], [1, 0]]
// Rotated on the last point: [[1, 1], [1, 0]]

const darkRed = '#52030a';
const darkBlue = '#0f1747';
const lightBlue = '#1538a1';
const lightRed = '#c60c0e';

function rotatePoints(
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

function getDragonPoints(
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

function drawCanvas() {
  const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
  if (!canvas) {
    console.error('Failed to get canvas');
    return;
  }

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const canvasCtx = canvas.getContext('2d');
  if (!canvasCtx) {
    console.error('Canvas ctx failed to get');
    return;
  }

  const depth = 14;
  const theta = Math.PI / 2;
  const lineLength = 3;
  const startingPoint: Vector2 = { x: canvas.width / 2, y: canvas.height / 2 };
  const path = getDragonPoints(depth, theta, startingPoint, lineLength);

  const animDeltaPerMS = 5e-4;
  const segmentDeltaPerMS = 5;

  let animTheta = 0;
  let segmentCount = 0;
  let lastTimestamp = 0;

  const frameDraw = (timestamp: number) => {
    requestAnimationFrame(frameDraw);
    updateResolution(canvas);
    const timeDelta = timestamp - lastTimestamp;
    const animDelta = animDeltaPerMS * timeDelta;
    const segmentDelta = segmentDeltaPerMS * timeDelta;
    animTheta += animDelta;
    segmentCount += segmentDelta;
    const { behind, ahead } = getOffsets(path.length, segmentCount);
    const phaseOffsets = getOffsets(path.length, segmentCount, 1);
    const drawablePath = path.slice(behind, ahead);
    const phaseDrawablePath = path.slice(
      phaseOffsets.behind,
      phaseOffsets.ahead
    );
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawPath(
      canvasCtx,
      rotatePoints(animTheta, drawablePath, startingPoint),
      lightBlue
    );
    drawPath(
      canvasCtx,
      rotatePoints(animTheta, phaseDrawablePath, startingPoint),
      darkRed
    );
    drawPath(
      canvasCtx,
      rotatePoints(animTheta + Math.PI / 2, drawablePath, startingPoint),
      lightRed
    );
    drawPath(
      canvasCtx,
      rotatePoints(animTheta + Math.PI / 2, phaseDrawablePath, startingPoint),
      darkBlue
    );
    drawPath(
      canvasCtx,
      rotatePoints(animTheta + Math.PI, drawablePath, startingPoint),
      lightBlue
    );
    drawPath(
      canvasCtx,
      rotatePoints(animTheta + Math.PI, phaseDrawablePath, startingPoint),
      darkRed
    );
    drawPath(
      canvasCtx,
      rotatePoints(animTheta + (Math.PI * 3) / 2, drawablePath, startingPoint),
      lightRed
    );
    drawPath(
      canvasCtx,
      rotatePoints(
        animTheta + (Math.PI * 3) / 2,
        phaseDrawablePath,
        startingPoint
      ),
      darkBlue
    );

    lastTimestamp = timestamp;
  };

  requestAnimationFrame(frameDraw);
}

const getOffsets = (pathLength: number, step: number, offset: number = 0) => {
  const drawStep = (step + pathLength * offset) % (pathLength * 2);
  const difference = pathLength - 1 - drawStep;
  const behind = -difference >= 0 ? -difference : 0;
  const ahead = difference >= 0 ? difference : 0;

  return {
    behind,
    ahead: pathLength - 1 - ahead,
  };
};

const drawPath = (
  canvasCtx: CanvasRenderingContext2D,
  path: Vector2[],
  strokeStyle?: typeof canvasCtx.strokeStyle
) => {
  canvasCtx.strokeStyle = strokeStyle || 'limegreen';
  canvasCtx.beginPath();
  path.forEach((point, index) => {
    if (index == 0) {
      canvasCtx.moveTo(point.x, point.y);
    } else {
      canvasCtx.lineTo(point.x, point.y);
    }
  });
  canvasCtx.stroke();
};

const updateResolution = (canvas: HTMLCanvasElement) => {
  const { width, height, clientWidth, clientHeight } = canvas;

  if (width != clientWidth || height != clientHeight) {
    canvas.width = clientWidth;
    canvas.height = clientHeight;
  }
};

drawCanvas();
