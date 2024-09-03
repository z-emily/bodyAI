import * as poseDetection from '@tensorflow-models/pose-detection';

/**
 * Draws on the canvas
 */
export const drawCanvas = (
    poses: { keypoints: any }[],
    videoWidth: any,
    videoHeight: any,
    canvas: any,
    eyeHeightBaseline: any,
    eyeDistanceBaseline: any,
    shoulderHeightBaseline: any,
  ) => {
    if (canvas.current == null) return;
    const context = canvas.current.getContext('2d');
  
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;
  
    if (poses[0].keypoints != null) {
      drawKeypoints(poses[0].keypoints, context, eyeHeightBaseline, shoulderHeightBaseline, eyeDistanceBaseline);
      drawEyeHeight(poses[0].keypoints, context, eyeHeightBaseline);
      drawShoulderHeight(poses[0].keypoints, context, shoulderHeightBaseline);
      drawEyeDistance(poses[0].keypoints, context, eyeDistanceBaseline);
    }
  };
  

/**
 * Draw the key body points
 */
export function drawKeypoints(
  keypoints: any,
  context: any,
  currentEyeBaseline: any,
  currentShoulderBaseline: any,
  currentEyeDistanceBaseline: any,
) {
    const leftEyeHeight = keypoints[1].y;
    const rightEyeHeight = keypoints[2].y;
    const currentEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
    const eye_delta = currentEyeHeight - currentEyeBaseline;

    const leftShoulderHeight = keypoints[5].y;
    const rightShoulderHeight = keypoints[6].y;
    const currentShoulderHeight = (leftShoulderHeight + rightShoulderHeight) / 2;
    const shoulder_delta = currentShoulderHeight - currentShoulderBaseline;

    const leftEyeX = keypoints[1].x;
    const rightEyeX = keypoints[2].x;
    const currentEyeDistance = Math.abs(leftEyeX - rightEyeX);
    const distance_delta = currentEyeDistance - currentEyeDistanceBaseline;

    const delta = Math.max(Math.abs(eye_delta), Math.abs(shoulder_delta), Math.abs(distance_delta))

    const keypointInd = poseDetection.util.getKeypointIndexBySide(
        poseDetection.SupportedModels.MoveNet
    );

    context.strokeStyle = 'White';
    context.lineWidth = 1;

    context.fillStyle = Math.abs(delta) > 25 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)';

    for (const i of keypointInd.middle) {
        drawKeypoint(keypoints[i], context);
    }

    for (const i of keypointInd.left) {
        drawKeypoint(keypoints[i], context);
    }

    for (const i of keypointInd.right) {
        drawKeypoint(keypoints[i], context);
    }
}

function drawKeypoint(keypoint: any, context: any) {
  const score = keypoint.score != null ? keypoint.score : 1;
  const scoreThreshold = 0.3;

  if (score >= scoreThreshold) {
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);

    context.fill(circle);
  }
}

/**
 * Draw the difference in eye height to detect slouching
 */
export function drawEyeHeight(
  keypoints: any,
  context: any,
  currentEyeBaseline: number
) {
    const leftEyeHeight = keypoints[1].y;
    const rightEyeHeight = keypoints[2].y;
    const currentEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
    const delta = currentEyeHeight - currentEyeBaseline;

    // Current eye height baseline
    context.strokeStyle = '#fff';
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(0, currentEyeBaseline);
    context.lineTo(600, currentEyeBaseline);
    context.stroke();

    context.beginPath();
    context.moveTo(0, currentEyeHeight);
    context.lineTo(800, currentEyeHeight);
    context.stroke();

    context.fillStyle = Math.abs(delta) > 25 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)';

    context.fillRect(0, currentEyeBaseline, 800, delta);
}

/**
 * Draw the difference in shoulder height to detect shoulder shrugging
 */
export function drawShoulderHeight(
    keypoints: any,
    context: any,
    currentShoulderBaseline: number
  ) {
    const leftShoulderHeight = keypoints[5].y;
    const rightShoulderHeight = keypoints[6].y;
    const currentShoulderHeight = (leftShoulderHeight + rightShoulderHeight) / 2;
    const delta = currentShoulderHeight - currentShoulderBaseline;
  
    // Show current shoulder baseline
    context.strokeStyle = '#fff';
    context.lineWidth = 1;
  
    context.beginPath();
    context.moveTo(0, currentShoulderBaseline);
    context.lineTo(800, currentShoulderBaseline);
    context.stroke();
  
    context.beginPath();
    context.moveTo(0, currentShoulderHeight);
    context.lineTo(800, currentShoulderHeight);
    context.stroke();
  
    context.fillStyle = Math.abs(delta) > 25 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)';
  
    context.fillRect(0, currentShoulderBaseline, 800, delta);
  }  

  
  /**
 * Draw the difference in eye distance to detect if the face is too close to the screen.
 */
  export function drawEyeDistance(
    keypoints: any,
    context: any,
    currentEyeDistanceBaseline: number
  ) {
    const leftEyeX = keypoints[1].x;
    const rightEyeX = keypoints[2].x;
    const currentEyeDistance = Math.abs(leftEyeX - rightEyeX);
    const delta = currentEyeDistance - currentEyeDistanceBaseline;
  
    context.strokeStyle = Math.abs(delta) > 25 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)';
    context.lineWidth = 2;

    context.beginPath();
    context.moveTo(leftEyeX, keypoints[1].y);
    context.lineTo(rightEyeX, keypoints[2].y);
    context.stroke(); 
  }  