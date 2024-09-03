
# BodyAI

## Overview

**BodyAI** is an ultra-lightweight web application designed to run alongside online interviews or large applications. It leverages TensorFlow.js and the MoveNet pose detection model to provide real-time feedback on posture and eye distance. The project is intentionally bare to ensure minimal resource usage and optimal performance during live interactions.

## Features

- **Real-time Pose Detection:** Utilizes TensorFlow.js and the MoveNet model to detect and analyze human poses.
- **Eye Height Monitoring:** Tracks the height of the eyes and compares it to a baseline to ensure correct neck posture.
- **Eye Distance Measurement:** Measures the distance between the eyes and compares it to a baseline to prevent sitting too close to the screen.
- **Shoulder Height Tracking:** Monitors shoulder height and compares it to a baseline to provide feedback on shoulder posture.

## Notes

- This project is designed to be ultra-lightweight and minimal to run efficiently alongside an online interview or any real-time application.
- The simplicity of the design ensures that it does not consume excessive resources, making it ideal for live use.

## Installation

1. Clone the repository:

    ```bash
    git clone git@github.com:z-emily/bodyAI.git
    ```

2. Navigate to the project directory:

    ```bash
    cd bodyAI
    ```

3. Install the required dependencies:

    ```bash
    npm install
    ```

## Usage

1. Start the development server:

    ```bash
    npm run dev
    ```

2. Open your browser and navigate to `http://localhost:3000` to view the application.

3. Position your webcam to capture yourself, and the application will start detecting and analyzing your posture.

4. Click the **Set Posture Baseline** button to establish a baseline for eye height, eye distance, and shoulder height.