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
  const goodPostureBaseLineRef = useRef<number>(200);

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
          drawCanvas(poses, video, videoWidth, videoHeight, canvasRef, goodPostureBaseLineRef.current);

          // Extract the eye height from the detected poses
          const pose = poses[0].keypoints;
          const leftEye = pose.find(point => point.name === 'left_eye');
          const rightEye = pose.find(point => point.name === 'right_eye');

          if (leftEye && rightEye) {
            const eyeHeight = (leftEye.y + rightEye.y) / 2;
            setEyeHeight(eyeHeight);
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
    if (eyeHeight !== null) {
      goodPostureBaseLineRef.current = eyeHeight;
      console.log("New baseline set:", goodPostureBaseLineRef.current);
    }
  };

  return (
    <div>
      <Webcam ref={webcamRef} style={{ display: 'block' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <button onClick={handleResetBaseline}>
        Set Posture Baseline
      </button>
    </div>
  );
};

export default WebcamComponent;