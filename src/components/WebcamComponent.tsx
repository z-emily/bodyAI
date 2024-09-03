"use client";

import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { drawCanvas } from '../modules/draw_utils';

const WebcamComponent = () => {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const [eyeHeight, setEyeHeight] = useState<number | null>(null);
  const [eyeDistance, setEyeDistance] = useState<number | null>(null); // Track eye distance
  const [shoulderHeight, setShoulderHeight] = useState<number | null>(null); // Track shoulder height
  const goodPostureBaseLineRef = useRef<number | null>(null);
  const distanceThresholdRef = useRef<number | null>(null); // Track the dynamic distance threshold
  const baselineSetRef = useRef<boolean>(false); // Track if the baseline is already set
  const shoulderShrugThresholdRef = useRef<number | null>(null); // Track the dynamic shoulder height threshold

  const runPoseDetection = async () => {
    await tf.ready();
    await tf.setBackend('webgl');

    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    const detect = async () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        const poses = await detector.estimatePoses(video);
        console.log(poses);

        if (poses.length > 0) {
          drawCanvas(poses, video, videoWidth, videoHeight, canvasRef, goodPostureBaseLineRef.current);

          // Extract the eye height, distance, and shoulder height from the detected poses
          const pose = poses[0].keypoints;
          const leftEye = pose.find(point => point.name === 'left_eye');
          const rightEye = pose.find(point => point.name === 'right_eye');
          const leftShoulder = pose.find(point => point.name === 'left_shoulder');
          const rightShoulder = pose.find(point => point.name === 'right_shoulder');

          if (leftEye && rightEye && leftShoulder && rightShoulder) {
            const eyeHeight = (leftEye.y + rightEye.y) / 2;
            setEyeHeight(eyeHeight);

            const eyeDist = Math.sqrt(Math.pow(leftEye.x - rightEye.x, 2) + Math.pow(leftEye.y - rightEye.y, 2));
            setEyeDistance(eyeDist);

            const shoulderHeight = (leftShoulder.y + rightShoulder.y) / 2;
            setShoulderHeight(shoulderHeight);

            // Automatically set the baseline, distance threshold, and shoulder height threshold if they haven't been set yet
            if (!baselineSetRef.current) {
              goodPostureBaseLineRef.current = eyeHeight;
              distanceThresholdRef.current = eyeDist;
              shoulderShrugThresholdRef.current = Math.abs(eyeHeight - shoulderHeight); // Set initial shoulder height difference
              baselineSetRef.current = true; // Mark that the baseline has been set
              console.log("Baseline, distance threshold, and shoulder height threshold automatically set to:", goodPostureBaseLineRef.current, distanceThresholdRef.current, shoulderShrugThresholdRef.current);
            }

            // // Check if the face is too close to the screen
            // if (distanceThresholdRef.current && eyeDist > distanceThresholdRef.current * 1.5) {
            //   console.warn("Your face is too close to the screen!");
            // }

            // // Check if shoulders are shrugged
            // if (shoulderShrugThresholdRef.current && (eyeHeight - shoulderHeight) < shoulderShrugThresholdRef.current * 0.5) {
            //   console.warn("Your shoulders are shrugged!");
            // }
          }
        }
      }

      requestAnimationFrame(detect);
    };

    detect();
  };

  useEffect(() => {
    runPoseDetection();
  }, []);

  const handleResetBaseline = () => {
    if (eyeHeight !== null && eyeDistance !== null && shoulderHeight !== null) {
      goodPostureBaseLineRef.current = eyeHeight;
      distanceThresholdRef.current = eyeDistance;
      shoulderShrugThresholdRef.current = Math.abs(eyeHeight - shoulderHeight);
      console.log("New baseline, distance threshold, and shoulder height threshold set:", goodPostureBaseLineRef.current, distanceThresholdRef.current, shoulderShrugThresholdRef.current);
    }
  };

  return (
    <div>
      <Webcam ref={webcamRef} style={{ display: 'block' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <button onClick={handleResetBaseline}>
        Set Posture Baseline
      </button>
      {eyeDistance !== null && distanceThresholdRef.current !== null && eyeDistance > distanceThresholdRef.current * 1.5 && (
        <div style={{ color: 'red', fontWeight: 'bold' }}>
          Your face is too close to the screen!
        </div>
      )}
      {eyeHeight !== null && shoulderHeight !== null && shoulderShrugThresholdRef.current !== null && Math.abs(eyeHeight - shoulderHeight) < shoulderShrugThresholdRef.current * 0.75 && (
        <div style={{ color: 'orange', fontWeight: 'bold' }}>
          Your shoulders are shrugged!
        </div>
      )}
    </div>
  );
};

export default WebcamComponent;