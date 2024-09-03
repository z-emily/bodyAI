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
  const [eyeDistance, setEyeDistance] = useState<number | null>(null);
  const [shoulderHeight, setShoulderHeight] = useState<number | null>(null);
  
  const baselineSetRef = useRef<boolean>(false); // Track if the baseline is already set

  const eyeHeightBaselineRef = useRef<number | null>(null);
  const eyeDistanceBaselineRef = useRef<number | null>(null);
  const shoulderHeightBaselineRef = useRef<number | null>(null);

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

        if (poses.length > 0) {
          drawCanvas(
            poses, 
            video, 
            videoWidth, 
            videoHeight, 
            canvasRef, 
            eyeHeightBaselineRef.current, 
            eyeDistanceBaselineRef.current,
            shoulderHeightBaselineRef.current
          );

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
              eyeHeightBaselineRef.current = eyeHeight;
              eyeDistanceBaselineRef.current = eyeDist;
              shoulderHeightBaselineRef.current = shoulderHeight;
              baselineSetRef.current = true; // Mark that the baseline has been set
              console.log("Baseline, distance threshold, and shoulder height threshold automatically set to:", eyeHeightBaselineRef.current, eyeDistanceBaselineRef.current, shoulderHeightBaselineRef.current);
            }
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
      eyeHeightBaselineRef.current = eyeHeight;
      eyeDistanceBaselineRef.current = eyeDistance;
      shoulderHeightBaselineRef.current = shoulderHeight;
      console.log("New baseline, distance threshold, and shoulder height threshold set:", eyeHeightBaselineRef.current, eyeDistanceBaselineRef.current, shoulderHeightBaselineRef.current);
    }
  };

  return (
    <div>
      <Webcam ref={webcamRef} style={{ display: 'block' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <button onClick={handleResetBaseline}
      className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200">
      Set Posture Baseline
    </button>

    </div>
  );
};

export default WebcamComponent;