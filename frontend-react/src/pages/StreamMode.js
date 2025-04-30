// import React, { useState, useRef, useCallback } from 'react';
// import VideoPlayer from '../components/VideoPlayer';
// import DetectionResults from '../components/DetectionResults';
// import ActionPanel from '../components/ActionPanel';
// import { processFrame, startStream, getStreamStatus } from '../services/api';

// const StreamMode = () => {
//   const [streamUrl, setStreamUrl] = useState('http://127.0.0.1:8000/hls/5714938184635795894/index.m3u8');
//   const [currentStreamUrl, setCurrentStreamUrl] = useState('');
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [streamStatus, setStreamStatus] = useState({ status: 'idle' });
//   const [detectionResult, setDetectionResult] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   const videoPlayerRef = useRef(null);
//   const canvasRef = useRef(null);

//   // Handle video player ready
//   const handlePlayerReady = (player) => {
//     videoPlayerRef.current = player;
    
//     // Add event listeners
//     player.on('error', () => {
//       console.error('Video player error');
//       setError('Failed to load or play the video stream. Please check the URL and try again.');
//     });
    
//     player.on('loadeddata', () => {
//       console.log('Video data loaded');
//     });
//   };

//   // Start streaming
//   const handleStartStream = async () => {
//     try {
//       setError(null);
//       setIsLoading(true);
      
//       if (streamUrl.startsWith('rtmp://')) {
//         // RTMP stream needs conversion to HLS
//         const result = await startStream({ url: streamUrl });
//         console.log('Stream conversion started:', result);
        
//         if (result.status === 'success' && result.hlsUrl) {
//           setCurrentStreamUrl(result.hlsUrl);
//         } else {
//           throw new Error('Failed to start HLS conversion');
//         }
//       } else {
//         // Direct HLS stream
//         setCurrentStreamUrl(streamUrl);
//       }
      
//       setIsStreaming(true);
//     } catch (error) {
//       console.error('Failed to start stream:', error);
//       setError(`Error starting stream: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Stop streaming
//   const handleStopStream = () => {
//     setIsStreaming(false);
//     setCurrentStreamUrl('');
//     setDetectionResult(null);
//   };

//   // Capture and process frame
//   const handleCaptureFrame = async () => {
//     if (!videoPlayerRef.current || !isStreaming || isLoading) return;
    
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       // Get current player
//       const player = videoPlayerRef.current;
      
//       // Create canvas element if it doesn't exist
//       if (!canvasRef.current) {
//         canvasRef.current = document.createElement('canvas');
//       }
      
//       // Set canvas dimensions to match video
//       const videoElement = player.el().querySelector('video');
//       const canvas = canvasRef.current;
//       canvas.width = videoElement.videoWidth;
//       canvas.height = videoElement.videoHeight;
      
//       // Draw video frame to canvas
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
//       // Get image data as base64
//       const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
      
//       // Process frame
//       const result = await processFrame(imageData);
//       setDetectionResult(result);
//     } catch (error) {
//       console.error('Failed to process frame:', error);
//       setError(`Error processing frame: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle vehicle added - refresh detection
//   const handleVehicleAdded = () => {
//     if (detectionResult) {
//       handleCaptureFrame();
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* Video Stream Section */}
//       <div className="lg:col-span-2">
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <h2 className="text-xl font-semibold mb-4">Video Stream</h2>
          
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Stream URL</label>
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 value={streamUrl}
//                 onChange={(e) => setStreamUrl(e.target.value)}
//                 disabled={isStreaming}
//                 placeholder="Enter HLS stream URL (m3u8)"
//                 className="px-4 py-2 border border-gray-300 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             {error && (
//               <div className="mt-2 text-red-500 text-sm">
//                 {error}
//               </div>
//             )}
//           </div>
          
//           <div className="relative rounded-md overflow-hidden bg-black min-h-[480px]">
//             {isStreaming ? (
//               <VideoPlayer 
//                 src={currentStreamUrl} 
//                 onPlayerReady={handlePlayerReady} 
//               />
//             ) : (
//               <div className="w-full h-[480px] bg-gray-900 flex items-center justify-center text-white">
//                 <div className="text-center p-8">
//                   <p className="mb-4">Enter a stream URL and click "Start Stream" to begin</p>
//                   <p className="text-sm text-gray-400">Supports HLS streams (URLs ending with .m3u8)</p>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <div className="flex justify-between items-center mt-4">
//             {isStreaming ? (
//               <>
//                 <button 
//                   onClick={handleStopStream}
//                   className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
//                 >
//                   Stop Stream
//                 </button>
                
//                 <button 
//                   onClick={handleCaptureFrame}
//                   disabled={isLoading}
//                   className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 >
//                   {isLoading ? 'Processing...' : 'Detect Plate'}
//                 </button>
//               </>
//             ) : (
//               <button 
//                 onClick={handleStartStream}
//                 disabled={isLoading || !streamUrl}
//                 className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none ${(isLoading || !streamUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 {isLoading ? 'Starting...' : 'Start Stream'}
//               </button>
//             )}
//           </div>
          
//           <div className="mt-4 text-sm text-gray-500">
//             <p>This mode allows you to use video streams to detect license plates.</p>
//             <p>Enter an HLS stream URL (ending with .m3u8) and click "Start Stream".</p>
//           </div>
//         </div>
//       </div>
      
//       {/* Results and Actions Section */}
//       <div className="space-y-6">
//         <DetectionResults 
//           result={detectionResult} 
//           isLoading={isLoading} 
//         />
        
//         <ActionPanel 
//           result={detectionResult} 
//           onVehicleAdded={handleVehicleAdded} 
//         />
//       </div>
//     </div>
//   );
// };

// export default StreamMode;
import React, { useState, useRef } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import DetectionResults from '../components/DetectionResults';
import ActionPanel from '../components/ActionPanel';
import { processFrame, startStream } from '../services/api';

const StreamMode = () => {
  const [streamUrl, setStreamUrl] = useState('http://127.0.0.1:8000/hls/5714938184635795894/index.m3u8');
  const [currentStreamUrl, setCurrentStreamUrl] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const videoPlayerRef = useRef(null);

  // Handle video player ready
  const handlePlayerReady = (player) => {
    videoPlayerRef.current = player;

    player.on('error', () => {
      console.error('Video player error');
      setError('Failed to load or play the video stream. Please check the URL and try again.');
    });

    player.on('loadeddata', () => {
      console.log('Video data loaded');
    });
  };

  // Poll HLS stream until it's ready (HEAD request)
  const waitForStream = async (hlsUrl, retries = 10, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(hlsUrl, { method: 'HEAD' });
        if (res.ok) return true;
      } catch (err) {
        console.warn('Waiting for stream...', err);
      }
      await new Promise((r) => setTimeout(r, delay));
    }
    return false;
  };

  // Start streaming
  const handleStartStream = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (streamUrl.startsWith('rtmp://')) {
        const result = await startStream({ url: streamUrl });
        console.log('Stream conversion started:', result);

        if (result.status === 'success' && result.hlsUrl) {
          const ready = await waitForStream(result.hlsUrl);
          if (!ready) throw new Error('Stream is not ready after multiple attempts');
          setCurrentStreamUrl(result.hlsUrl);
        } else {
          throw new Error('Failed to start HLS conversion');
        }
      } else {
        setCurrentStreamUrl(streamUrl);
      }

      setIsStreaming(true);
    } catch (error) {
      console.error('Failed to start stream:', error);
      setError(`Error starting stream: ${error?.message || String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop streaming
  const handleStopStream = () => {
    setIsStreaming(false);
    setCurrentStreamUrl('');
    setDetectionResult(null);
  };

  // Capture and process frame
  const handleCaptureFrame = async () => {
    if (!videoPlayerRef.current || !isStreaming || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const player = videoPlayerRef.current;
      const videoElement = player.el().querySelector('video');
      const canvas = document.createElement('canvas');

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
      const result = await processFrame(imageData);
      setDetectionResult(result);
    } catch (error) {
      console.error('Failed to process frame:', error);
      setError(`Error processing frame: ${error?.message || String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh detection after vehicle is added
  const handleVehicleAdded = () => {
    if (detectionResult) {
      handleCaptureFrame();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Stream Section */}
      <div className="lg:col-span-2">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Video Stream</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stream URL</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                disabled={isStreaming}
                placeholder="Enter HLS stream URL (m3u8)"
                className="px-4 py-2 border border-gray-300 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && (
              <div className="mt-2 text-red-500 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="relative rounded-md overflow-hidden bg-black min-h-[480px]">
            {isStreaming ? (
              <VideoPlayer 
                src={currentStreamUrl} 
                onPlayerReady={handlePlayerReady} 
              />
            ) : (
              <div className="w-full h-[480px] bg-gray-900 flex items-center justify-center text-white">
                <div className="text-center p-8">
                  <p className="mb-4">Enter a stream URL and click "Start Stream" to begin</p>
                  <p className="text-sm text-gray-400">Supports HLS streams (URLs ending with .m3u8)</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            {isStreaming ? (
              <>
                <button 
                  onClick={handleStopStream}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                >
                  Stop Stream
                </button>

                <button 
                  onClick={handleCaptureFrame}
                  disabled={isLoading}
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Processing...' : 'Detect Plate'}
                </button>
              </>
            ) : (
              <button 
                onClick={handleStartStream}
                disabled={isLoading || !streamUrl}
                className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none ${(isLoading || !streamUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Starting...' : 'Start Stream'}
              </button>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>This mode allows you to use video streams to detect license plates.</p>
            <p>Enter an HLS stream URL (ending with .m3u8) and click "Start Stream".</p>
          </div>
        </div>
      </div>

      {/* Results and Actions Section */}
      <div className="space-y-6">
        <DetectionResults 
          result={detectionResult} 
          isLoading={isLoading} 
        />

        <ActionPanel 
          result={detectionResult} 
          onVehicleAdded={handleVehicleAdded} 
        />
      </div>
    </div>
  );
};

export default StreamMode;
