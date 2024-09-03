// https://github.com/tensorflow/tfjs-models/blob/9b5d3b663638752b692080145cfb123fa324ff11/pose-detection/demos/live_video/src/camera.js
import * as poseDetection from '@tensorflow-models/pose-detection';
import { eye } from '@tensorflow/tfjs';

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
    eyeHeightBaseline: any,
    eyeDistanceBaseline: any,
    shoulderHeightBaseline: any,
  ) => {
    if (canvas.current == null) return;
    const ctx = canvas.current.getContext('2d');
  
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;
  
    if (poses[0].keypoints != null) {
      drawKeypoints(poses[0].keypoints, ctx, eyeHeightBaseline, shoulderHeightBaseline, eyeDistanceBaseline);
      drawEyeHeight(poses[0].keypoints, ctx, eyeHeightBaseline);
      drawShoulderHeight(poses[0].keypoints, ctx, shoulderHeightBaseline);
      drawEyeDistance(poses[0].keypoints, ctx, eyeDistanceBaseline);
    }
  };
  

/**
 * Draw the keypoints on the video.
 * @param keypoints A list of keypoints.
 */
export function drawKeypoints(
  keypoints: any,
  ctx: any,
  currentEyeBaseline: any,
  currentShoulderBaseline: any,
  currentEyeDistanceBaseline: any,
) {
    const leftEyeHeight = keypoints[1].y;
    const rightEyeHeight = keypoints[2].y;
 
    // Calculate average eye height
    const currentEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
   const eye_delta = currentEyeHeight - currentEyeBaseline;

   const leftShoulderHeight = keypoints[5].y;
    const rightShoulderHeight = keypoints[6].y;
    
    // Calculate average shoulder height
    const currentShoulderHeight = (leftShoulderHeight + rightShoulderHeight) / 2;
    const shoulder_delta = currentShoulderHeight - currentShoulderBaseline;

    const leftEyeX = keypoints[1].x;
    const rightEyeX = keypoints[2].x;
  
    // Calculate the current distance between the eyes
    const currentEyeDistance = Math.abs(leftEyeX - rightEyeX);
    const distance_delta = currentEyeDistance - currentEyeDistanceBaseline;

    const delta = Math.max(Math.abs(eye_delta), Math.abs(shoulder_delta), Math.abs(distance_delta))

  const keypointInd = poseDetection.util.getKeypointIndexBySide(
    poseDetection.SupportedModels.MoveNet
  );
  ctx.fillStyle = 'Red';
  ctx.strokeStyle = 'White';
  ctx.lineWidth = 1;

  ctx.fillStyle = 'rgba(0, 255, 0, 0.9)'; // green if delta is positive
  if (Math.abs(delta)>25) {
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
 * @param currentEyeBaseline current context of the canvas.
 */
export function drawEyeHeight(
  keypoints: any,
  ctx: any,
  currentEyeBaseline: number
) {
   const leftEyeHeight = keypoints[1].y;
   const rightEyeHeight = keypoints[2].y;

   // Calculate average eye height
   const currentEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
  const delta = currentEyeHeight - currentEyeBaseline;

  // show current good posture baseline
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, currentEyeBaseline);
  ctx.lineTo(600, currentEyeBaseline);
  ctx.stroke();

  ctx.beginPath(); // Start a new path
  ctx.moveTo(0, currentEyeHeight); // Move the pen to (30, 50)
  ctx.lineTo(800, currentEyeHeight); // Draw a line to (150, 100)
  ctx.stroke(); // Render the path

  // draw difference between current posture height and good posture height
  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // green if delta is positive
  if (Math.abs(delta) > 25) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  }

  ctx.fillRect(0, currentEyeBaseline, 800, delta);
}

/**
 * Draw the difference in shoulder height to detect shoulder shrugging.
 * @param keypoints A list of keypoints.
 * @param ctx current context of the canvas.
 * @param currentShoulderBaseline Difference in shoulder height considered as baseline.
 */
export function drawShoulderHeight(
    keypoints: any,
    ctx: any,
    currentShoulderBaseline: number
  ) {
    const leftShoulderHeight = keypoints[5].y;
    const rightShoulderHeight = keypoints[6].y;
    
    // Calculate average shoulder height
    const currentShoulderHeight = (leftShoulderHeight + rightShoulderHeight) / 2;
    const delta = currentShoulderHeight - currentShoulderBaseline;
  
    // Show current shoulder baseline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
  
    ctx.beginPath();
    ctx.moveTo(0, currentShoulderBaseline);
    ctx.lineTo(800, currentShoulderBaseline);
    ctx.stroke();
  
    // Show current average shoulder height
    ctx.beginPath(); // Start a new path
    ctx.moveTo(0, currentShoulderHeight); // Move the pen to the shoulder height
    ctx.lineTo(800, currentShoulderHeight); // Draw a line
    ctx.stroke(); // Render the path
  
    // Draw difference between current average shoulder height and baseline
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // green if delta is positive
    if (Math.abs(delta) > 25) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    }
  
    ctx.fillRect(0, currentShoulderBaseline, 800, delta);
  }  

  
  /**
 * Draw the difference in eye distance to detect if the face is too close to the screen.
 * @param keypoints A list of keypoints.
 * @param ctx current context of the canvas.
 * @param eyeDistanceBaseline Baseline distance between eyes.
 */
  export function drawEyeDistance(
    keypoints: any,
    ctx: any,
    currentEyeDistanceBaseline: number
  ) {
    // Assuming eye keypoints are at index 1 and 2 (typically these might be different based on the model used)
    const leftEyeX = keypoints[1].x;
    const rightEyeX = keypoints[2].x;
  
    // Calculate the current distance between the eyes
    const currentEyeDistance = Math.abs(leftEyeX - rightEyeX);
    const delta = currentEyeDistance - currentEyeDistanceBaseline;
  
    ctx.strokeStyle = Math.abs(delta) > 25 ? 'red' : 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 2;

    // Draw the line representing the eye distance
    ctx.beginPath();
    ctx.moveTo(leftEyeX, keypoints[1].y); // Move to the left eye position
    ctx.lineTo(rightEyeX, keypoints[2].y); // Draw a line to the right eye position
    ctx.stroke(); 
  }  