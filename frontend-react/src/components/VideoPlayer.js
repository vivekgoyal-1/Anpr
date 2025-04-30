// import React, { useEffect, useRef } from 'react';
// import videojs from 'video.js';
// import 'video.js/dist/video-js.css';
// import '@videojs/http-streaming';

// const VideoPlayer = ({ src, onPlayerReady }) => {
//   const videoRef = useRef(null);
//   const playerRef = useRef(null);

//   useEffect(() => {
//     // Make sure Video.js player is only initialized once
//     if (!playerRef.current) {
//       // Initialize Video.js player
//       const videoElement = videoRef.current;
//       if (!videoElement) return;

//       const player = playerRef.current = videojs(videoElement, {
//         controls: true,
//         autoplay: false,
//         preload: 'auto',
//         fluid: true,
//         responsive: true,
//         html5: {
//           hls: {
//             overrideNative: true
//           }
//         }
//       }, () => {
//         console.log('Player is ready');
//         if (onPlayerReady) {
//           onPlayerReady(player);
//         }
//       });
//     } else {
//       // Update player source if provided
//       const player = playerRef.current;
//       player.src({ src, type: 'application/x-mpegURL' });
//     }
//   }, [onPlayerReady, src]);

//   // Update player source when src changes
//   useEffect(() => {
//     if (playerRef.current && src) {
//       playerRef.current.src({ src, type: 'application/x-mpegURL' });
//     }
//   }, [src]);

//   // Dispose the Video.js player when the component unmounts
//   useEffect(() => {
//     const player = playerRef.current;

//     return () => {
//       if (player && !player.isDisposed()) {
//         player.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, []);

//   return (
//     <div data-vjs-player>
//       <video
//         ref={videoRef}
//         className="video-js vjs-big-play-centered vjs-fluid"
//       />
//     </div>
//   );
// };

// export default VideoPlayer;
import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming';

const VideoPlayer = ({ src, onPlayerReady }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;
  
      setTimeout(() => {
        const player = playerRef.current = videojs(videoElement, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          fluid: true,
          responsive: true,
          html5: {
            hls: {
              overrideNative: true
            }
          }
        }, () => {
          console.log('Player is ready');
          if (onPlayerReady) {
            onPlayerReady(player);
          }
        });
      }, 0); // Delay 1 tick to let DOM render
    } else {
      const player = playerRef.current;
      player.src({ src, type: 'application/x-mpegURL' });
    }
  }, [onPlayerReady, src]);
  

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered vjs-fluid"
      />
    </div>
  );
};

export default VideoPlayer;
