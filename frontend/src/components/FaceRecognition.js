import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognition = ({ onVerified, onFailed }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Loading AI models...');

  useEffect(() => {
    loadModelsAndStart();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load AI models from public/models folder
  const loadModelsAndStart = async () => {
    try {
      setMessage('Loading AI models... please wait ⏳');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      setMessage('Models loaded! Starting camera... 📸');
      startCamera();
    } catch (err) {
      console.error('Model load error:', err);
      setMessage('Failed to load AI models!');
      setStatus('error');
    }
  };

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus('ready');
        setMessage('Camera ready! Position your face in the frame 😊');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setMessage('Camera access denied! Please allow camera access.');
      setStatus('error');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  // Register face — save descriptor to localStorage
  const registerFace = async () => {
    try {
      setMessage('Detecting face... 🔍');
      setStatus('processing');

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage('No face detected! Please position your face clearly 😊');
        setStatus('ready');
        return;
      }

      // Save face descriptor to localStorage
      const descriptor = Array.from(detection.descriptor);
      localStorage.setItem('faceDescriptor', JSON.stringify(descriptor));

      setMessage('✅ Face registered successfully!');
      setStatus('success');

    } catch (err) {
      console.error('Register face error:', err);
      setMessage('Error registering face. Try again!');
      setStatus('ready');
    }
  };

  // Verify face — compare with saved descriptor
  const verifyFace = async () => {
    try {
      setMessage('Verifying face... 🔍');
      setStatus('processing');

      // Get saved descriptor
      const savedDescriptor = localStorage.getItem('faceDescriptor');
      if (!savedDescriptor) {
        setMessage('No face registered! Please register first.');
        setStatus('ready');
        onFailed && onFailed();
        return;
      }

      // Detect current face
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage('No face detected! Please position your face clearly 😊');
        setStatus('ready');
        return;
      }

      // Compare descriptors
      const savedArray = new Float32Array(JSON.parse(savedDescriptor));
      const distance = faceapi.euclideanDistance(savedArray, detection.descriptor);

      console.log('Face distance:', distance);

      // Distance < 0.6 means same person
      if (distance < 0.6) {
        setMessage('✅ Face verified! Marking attendance...');
        setStatus('success');
        stopCamera();
        onVerified && onVerified();
      } else {
        setMessage('❌ Face not recognized! Please try again.');
        setStatus('failed');
        onFailed && onFailed();
      }

    } catch (err) {
      console.error('Verify face error:', err);
      setMessage('Error verifying face. Try again!');
      setStatus('ready');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">

      {/* Status Message */}
      <div className={`w-full p-3 rounded-lg text-center font-medium ${
        status === 'success' ? 'bg-green-100 text-green-700' :
        status === 'failed' ? 'bg-red-100 text-red-700' :
        status === 'error' ? 'bg-red-100 text-red-700' :
        status === 'processing' ? 'bg-blue-100 text-blue-700' :
        'bg-yellow-100 text-yellow-700'
      }`}>
        {message}
      </div>

      {/* Video Feed */}
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          width="400"
          height="300"
          className="rounded-xl border-4 border-blue-300"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          width="400"
          height="300"
        />
      </div>

      {/* Buttons */}
      {status === 'ready' || status === 'failed' ? (
        <div className="flex gap-4">
          <button
            onClick={registerFace}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            📸 Register Face
          </button>
          <button
            onClick={verifyFace}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            ✅ Verify Face
          </button>
        </div>
      ) : null}

      {/* Processing indicator */}
      {status === 'processing' && (
        <div className="text-blue-600 font-semibold animate-pulse">
          Processing... please wait
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;