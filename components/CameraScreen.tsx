import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CameraIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

export const CameraScreen: React.FC = () => {
  const { setCapturedImage, setIsLoading, setError } = useAppContext();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const t = useTranslation();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
      navigate('/welcome');
    }
  }, [navigate, setError]);
  
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl.split(',')[1]);
        setIsLoading(true);
        setError(null);
        stopCamera();
        navigate('/processing');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
        <h1 className="text-xl font-bold text-white mx-auto">{t('takePictureHeader')}</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center relative">
        <div className="w-full h-full">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
      </main>
       <footer className="absolute bottom-0 left-0 right-0 z-10 p-6 flex flex-col items-center bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white font-semibold mb-4">{t('pointAtObject')}</p>
        <button
            onClick={takePicture}
            className="w-24 h-24 bg-[color:var(--c-secondary)] rounded-full flex items-center justify-center shadow-2xl transform transition active:scale-90 ring-4 ring-white/50"
            aria-label={t('takePictureBtn')}
        >
            <CameraIcon className="w-12 h-12 text-white"/>
        </button>
      </footer>
    </div>
  );
};