import { getDragonPoints } from './dragon';
import { rotatePoints, Vector2 } from './Linear';
import './style.css';

console.log('Init');

const darkRed = '#52030a';
const darkBlue = '#0f1747';
const lightBlue = '#1538a1';
const lightRed = '#c60c0e';

function initCanvas(): void {
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
  const cycleLength = path.length * 2;

  const durationCycleMS = 15000;
  const animDeltaPerMS = (Math.PI * 2) / durationCycleMS;
  const segmentDeltaPerMS = cycleLength / durationCycleMS;

  let isFirstFrame = true;
  let animTheta = 0;
  let segmentCount = 0;
  let lastTimestamp = 0;
  let lastTimePoint = 0;
  let startTimestamp = 0;

  const frameDraw = (timestamp: number) => {
    requestAnimationFrame(frameDraw);
    checkResoulution(canvas);

    if (isFirstFrame) {
      startTimestamp = timestamp;
      isFirstFrame = false;
    }

    const timePoint = segmentCount % cycleLength;
    if (timePoint <= lastTimePoint) {
      console.log('CICLE START');
      console.log('Duration from last', timestamp - startTimestamp);
      startTimestamp = timestamp;
    }
    lastTimePoint = timePoint;

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

const checkResoulution = (canvas: HTMLCanvasElement) => {
  const { width, height, clientWidth, clientHeight } = canvas;

  if (width != clientWidth || height != clientHeight) {
    canvas.width = clientWidth;
    canvas.height = clientHeight;
  }
};

initCanvas();
