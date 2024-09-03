// https://github.com/tensorflow/tfjs-models/blob/9b5d3b663638752b692080145cfb123fa324ff11/pose-detection/demos/live_video/src/camera.js
import * as poseDetection from '@tensorflow-models/pose-detection';

/**
 * Draws the keypoints and skeleton on the canvas
 *
 * @param {(obj[])} Array of objects
 * @param {(obj)} video object
 * @param {(int)} video width
 * @param {(int)} video height
 * @param {(obj)} canvas object
 * @returns void
 */
export const drawCanvas = (
    poses: { keypoints: any }[],
    video: any,
    videoWidth: any,
    videoHeight: any,
    canvas: any,
    goodPostureBaseLine: any,
    baselineEyeDistance: any,
    baselineShoulderHeight: any,
  ) => {
    if (canvas.current == null) return;
    const ctx = canvas.current.getContext('2d');
  
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;
  
    if (poses[0].keypoints != null) {
      drawKeypoints(poses[0].keypoints, ctx, goodPostureBaseLine);
      drawGoodPostureHeight(poses[0].keypoints, ctx, goodPostureBaseLine);
      drawShoulderShrug(poses[0].keypoints, ctx, baselineShoulderHeight);
      drawEyeDistance(poses[0].keypoints, ctx, baselineEyeDistance);
    }
  };
  

/**
 * Draw the keypoints on the video.
 * @param keypoints A list of keypoints.
 */
export function drawKeypoints(
  keypoints: any,
  ctx: any,
  currentGoodPostureHeight: any
) {
  const currentPostureHeight = keypoints[2].y;
  const delta = currentPostureHeight - currentGoodPostureHeight;

  const keypointInd = poseDetection.util.getKeypointIndexBySide(
    poseDetection.SupportedModels.MoveNet
  );
  ctx.fillStyle = 'Red';
  ctx.strokeStyle = 'White';
  ctx.lineWidth = 1;

  ctx.fillStyle = 'rgba(0, 255, 0, 0.9)'; // green if delta is positive
  if (delta > 25 || delta < -25) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
  }

  for (const i of keypointInd.middle) {
    drawKeypoint(keypoints[i], ctx);
  }

  // ctx.fillStyle = "Green";
  for (const i of keypointInd.left) {
    drawKeypoint(keypoints[i], ctx);
  }

  // ctx.fillStyle = "Orange";
  for (const i of keypointInd.right) {
    drawKeypoint(keypoints[i], ctx);
  }
}

function drawKeypoint(keypoint: any, ctx: any) {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1;
  const scoreThreshold = 0.3;

  if (score >= scoreThreshold) {
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);

    ctx.fill(circle);
  }
}

/**
 * Draw the bounding box of good posture on the video.
 * @param keypoints A list of keypoints.
 * @param ctx current context of the canvas.
 * @param currentGoodPostureHeight current context of the canvas.
 */
export function drawGoodPostureHeight(
  keypoints: any,
  ctx: any,
  currentGoodPostureHeight: number
) {
  const currentPostureHeight = keypoints[2].y;
  const delta = currentPostureHeight - currentGoodPostureHeight;

  // show current good posture baseline
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, currentGoodPostureHeight);
  ctx.lineTo(600, currentGoodPostureHeight);
  ctx.stroke();

  ctx.beginPath(); // Start a new path
  ctx.moveTo(0, currentPostureHeight); // Move the pen to (30, 50)
  ctx.lineTo(800, currentPostureHeight); // Draw a line to (150, 100)
  ctx.stroke(); // Render the path

  // draw difference between current posture height and good posture height
  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // green if delta is positive
  if (delta > 25 || delta < -25) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  }

  ctx.fillRect(0, currentGoodPostureHeight, 800, delta);
}

/**
 * Draw the difference in shoulder height to detect shoulder shrugging.
 * @param keypoints A list of keypoints.
 * @param ctx current context of the canvas.
 * @param baselineShoulderHeight Difference in shoulder height considered as baseline.
 */
export function drawShoulderShrug(
    keypoints: any,
    ctx: any,
    baselineShoulderHeight: number
  ) {
    const leftShoulderHeight = keypoints[5].y;
    const rightShoulderHeight = keypoints[6].y;
    const deltaShoulderHeight = Math.abs(leftShoulderHeight - rightShoulderHeight);
  
    // Draw line between shoulders
    ctx.strokeStyle = '#00f'; // blue
    ctx.lineWidth = 2;
  
    ctx.beginPath();
    ctx.moveTo(keypoints[5].x, leftShoulderHeight);
    ctx.lineTo(keypoints[6].x, rightShoulderHeight);
    ctx.stroke();
  
    // Draw difference between shoulder heights
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // green if within baseline
    if (deltaShoulderHeight > baselineShoulderHeight) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // red if exceeds baseline
    }
  
    ctx.fillRect(
      0,
      Math.min(leftShoulderHeight, rightShoulderHeight),
      800,
      deltaShoulderHeight
    );
  }

  
  /**
 * Draw the difference in eye distance to detect if the face is too close to the screen.
 * @param keypoints A list of keypoints.
 * @param ctx current context of the canvas.
 * @param baselineEyeDistance Baseline distance between eyes.
 */
export function drawEyeDistance(
    keypoints: any,
    ctx: any,
    baselineEyeDistance: number
  ) {
    const leftEye = keypoints[1];
    const rightEye = keypoints[2];
    const currentEyeDistance = Math.hypot(
      rightEye.x - leftEye.x,
      rightEye.y - leftEye.y
    );
    const deltaEyeDistance = currentEyeDistance - baselineEyeDistance;
  
    // Draw line between eyes
    ctx.strokeStyle = '#ff0'; // yellow
    ctx.lineWidth = 2;
  
    ctx.beginPath();
    ctx.moveTo(leftEye.x, leftEye.y);
    ctx.lineTo(rightEye.x, rightEye.y);
    ctx.stroke();
  
    // Draw eye distance difference
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // green if within baseline
    if (Math.abs(deltaEyeDistance) > baselineEyeDistance * 0.2) { // 20% threshold
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // red if exceeds threshold
    }
  
    ctx.fillRect(
      0,
      Math.min(leftEye.y, rightEye.y),
      800,
      Math.abs(deltaEyeDistance)
    );
  }  