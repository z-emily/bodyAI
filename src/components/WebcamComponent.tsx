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
  const [goodPostureBaseLine, setGoodPostureBaseLine] = useState<number>(0);

  const runPoseDetection = async () => {
    // Wait for the backend to be ready
    await tf.ready();

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
          drawCanvas(poses, video, videoWidth, videoHeight, canvasRef, goodPostureBaseLine ?? 0);
        }
      }

      requestAnimationFrame(detect);
    };

    detect();
  };

  useEffect(() => {
    runPoseDetection();
  }, []);

  return (
    <div>
      <Webcam ref={webcamRef} style={{ display: 'block' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
};

export default WebcamComponent;