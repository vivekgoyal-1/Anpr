from flask import Flask, render_template, request, jsonify, send_from_directory, Response
import base64
import numpy as np
import cv2
import json
import os
import random
import threading
import subprocess
import time
import signal
import atexit
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

# Global variables for HLS server process management
hls_process = None
hls_output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'hls')
hls_segments_dir = os.path.join(hls_output_dir, 'segments')

# Create HLS directories if they don't exist
os.makedirs(hls_output_dir, exist_ok=True)
os.makedirs(hls_segments_dir, exist_ok=True)

# Simulated vehicle database
import easyocr
from ultralytics import YOLO
model = YOLO('yolo_weight/best.pt')
reader = easyocr.Reader(['en'], gpu=False)
from utils import license_complies_format,format_license


VEHICLES = {
    "UP50AS4535": {
        "ownerName": "xyz",
        "contactInfo": "1234567890",
        "additionalInfo": "faculty member",
        "registrationDate": "2024-10-15",
        "lastDetected": None
    },
    "MP33C3370": {
        "ownerName": "Jane Smith",
        "contactInfo": "555-987-6543",
        "additionalInfo": "VIP customer",
        "registrationDate": "2024-11-02",
        "lastDetected": None
    }
}

def detect_license_plate(image, demo_plate=None):
    """
    Detects license plates in an image using YOLO and EasyOCR.

    Args:
        image: The image data to process
        demo_plate: Optional parameter to force a specific plate number (for demo mode)

    Returns:
        A dictionary with plate info or a 'not found' response.
    """
    results = model.predict(image, save=True, conf=0.2)

    for result in results:
        boxes = result.boxes
        if boxes is None or len(boxes) == 0:
            # No detections found
            return {
                "plateNumber": None,
                "confidence": 0,
                "isRegistered": False,
                "timestamp": datetime.now().isoformat(),
                "vehicleInfo": None,
                "message": "No license plate detected"
            }

        for box_tensor in boxes.xyxy:
            x1, y1, x2, y2 = map(int, box_tensor)
            cropped_plate = image[y1:y2, x1:x2]
            gray_img = cv2.cvtColor(cropped_plate, cv2.COLOR_RGB2GRAY)
            detections = reader.readtext(gray_img)

            for detection in detections:
                bbox, text, score = detection
                text = text.upper().replace(' ', '').replace('.', '').replace(',', '')
                formatted = format_license(text)

                if license_complies_format(formatted):
                    return {
                        "plateNumber": formatted,
                        "confidence": score,
                        "isRegistered": formatted in VEHICLES,
                        "timestamp": datetime.now().isoformat(),
                        "vehicleInfo": VEHICLES.get(formatted)
                    }

                else:
                    fallback_plate = f"none_{text}" if text else "none"
                    return {
                        "plateNumber": fallback_plate,
                        "confidence": score,
                        "isRegistered": False,
                        "timestamp": datetime.now().isoformat(),
                        "vehicleInfo": None,
                        "message": "Detected plate format invalid"
                    }

    # Just in case all boxes are skipped or no OCR worked
    return {
        "plateNumber": None,
        "confidence": 0,
        "isRegistered": False,
        "timestamp": datetime.now().isoformat(),
        "vehicleInfo": None,
        "message": "No readable text found"
    }

@app.route('/')
def index():
    # Return HTML with our frontend code
    return """
    <!DOCTYPE html>
    <html>
      <h1> hi this is python backend </h1>
    </html>
    """

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

# Add vehicle lookup endpoint
@app.route('/api/vehicles/<plate_number>', methods=['GET'])
def get_vehicle(plate_number):
    """Get vehicle details by plate number"""
    if plate_number in VEHICLES:
        return jsonify({
            "plateNumber": plate_number,
            "isRegistered": True,
            "vehicleInfo": VEHICLES[plate_number]
        })
    else:
        return jsonify({
            "plateNumber": plate_number,
            "isRegistered": False,
            "vehicleInfo": None
        })

@app.route('/api/process-frame', methods=['POST'])
def process_frame():
    """Process an image to detect license plates and extract text."""
    try:
        data = request.get_json()
        
        # Check for demo mode
        demo_plate = data.get('demo_plate')
        
        # If we have image data, decode it
        if 'image' in data:
            # Decode base64 image
            image_data = base64.b64decode(data['image'])
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image data"}), 400
        else:
            # For demo mode without image
            image = np.zeros((300, 300, 3), dtype=np.uint8)
        
        # Detect license plate
        result = detect_license_plate(image, demo_plate)
        
        # Update last detection time if registered
        plate_number = result["plateNumber"]
        if plate_number in VEHICLES:
            VEHICLES[plate_number]["lastDetected"] = datetime.now().isoformat()
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Error processing image: {str(e)}")
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500

@app.route('/api/health')
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"})

@app.route('/api/vehicles', methods=['POST'])
def add_vehicle():
    """Add a new vehicle to the database"""
    try:
        data = request.get_json()
        
        if not data or 'plateNumber' not in data:
            return jsonify({"error": "Missing required vehicle information"}), 400
        
        plate_number = data['plateNumber']
        owner_name = data.get('ownerName')
        contact_info = data.get('contactInfo')
        additional_info = data.get('additionalInfo', '')
        registration_date = data.get('registrationDate', datetime.now().isoformat())
        
        if not owner_name or not contact_info:
            return jsonify({"error": "Owner name and contact info are required"}), 400
        
        # Add to database
        VEHICLES[plate_number] = {
            "ownerName": owner_name,
            "contactInfo": contact_info,
            "additionalInfo": additional_info,
            "registrationDate": registration_date,
            "lastDetected": None
        }
        
        return jsonify({
            "success": True,
            "message": f"Vehicle with plate {plate_number} added successfully"
        })
        
    except Exception as e:
        app.logger.error(f"Error adding vehicle: {str(e)}")
        return jsonify({"error": f"Failed to add vehicle: {str(e)}"}), 500

def start_rtmp_to_hls_stream(rtmp_url):
    """
    Start a new FFmpeg process to convert RTMP stream to HLS format
    
    Args:
        rtmp_url: The RTMP stream URL to convert
    """
    global hls_process
    
    # If a process is already running, terminate it
    if hls_process is not None:
        try:
            hls_process.terminate()
            hls_process.wait(timeout=5)
        except Exception as e:
            app.logger.error(f"Error terminating previous HLS process: {str(e)}")
            try:
                hls_process.kill()
            except:
                pass
    
    # Clean up previous HLS files
    for file in os.listdir(hls_segments_dir):
        try:
            os.remove(os.path.join(hls_segments_dir, file))
        except:
            pass
    
    # FFmpeg command to convert RTMP to HLS
    # -c copy: Copy the stream without re-encoding for better performance
    # -hls_time 2: Each segment will be 2 seconds
    # -hls_list_size 10: Keep 10 segments in the playlist
    # -hls_flags delete_segments: Delete old segments
    # -hls_segment_filename: Where to store the segments
    # -y: Overwrite output files without asking
    
    playlist_path = os.path.join(hls_output_dir, 'playlist.m3u8')
    segments_path = os.path.join(hls_segments_dir, 'segment_%03d.ts')
    
    command = [
        'ffmpeg',
        '-y',  # Overwrite output files
        '-i', rtmp_url,  # Input URL
        '-c', 'copy',  # Copy without re-encoding
        '-hls_time', '2',  # 2-second segments
        '-hls_list_size', '10',  # Keep 10 segments in playlist
        '-hls_flags', 'delete_segments',  # Delete old segments
        '-hls_segment_filename', segments_path,  # Segment file pattern
        playlist_path  # Output playlist
    ]
    
    try:
        # Start FFmpeg process
        app.logger.info(f"Starting RTMP to HLS conversion for URL: {rtmp_url}")
        hls_process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Start a monitoring thread for the FFmpeg process
        def monitor_process():
            while hls_process.poll() is None:
                line = hls_process.stderr.readline().strip()
                if line:
                    app.logger.info(f"FFmpeg: {line}")
                time.sleep(0.1)
            
            app.logger.warning(f"FFmpeg process ended with returncode {hls_process.returncode}")
        
        threading.Thread(target=monitor_process, daemon=True).start()
        
        return True
        
    except Exception as e:
        app.logger.error(f"Error starting RTMP to HLS conversion: {str(e)}")
        return False

@app.route('/api/start-stream', methods=['POST'])
def start_stream():
    """API endpoint to start RTMP to HLS conversion or use direct HLS stream"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({"error": "No stream URL provided"}), 400
        
        stream_url = data['url']
        
        # For RTMP URLs, convert to HLS
        if stream_url.startswith('rtmp://'):
            success = start_rtmp_to_hls_stream(stream_url)
            
            if success:
                return jsonify({
                    "status": "success",
                    "message": "RTMP to HLS conversion started",
                    "hlsUrl": "/static/hls/playlist.m3u8"
                })
            else:
                return jsonify({"error": "Failed to start stream conversion"}), 500
        
        # For HLS URLs (or other formats that don't need conversion), just return them
        elif stream_url.endswith('.m3u8'):
            return jsonify({
                "status": "success",
                "message": "Direct HLS stream URL provided",
                "hlsUrl": stream_url
            })
        else:
            return jsonify({"error": "Unsupported stream URL format. Only RTMP and HLS (m3u8) are supported."}), 400
        
    except Exception as e:
        app.logger.error(f"Error starting stream: {str(e)}")
        return jsonify({"error": f"Failed to start stream: {str(e)}"}), 500

@app.route('/api/stream-status')
def stream_status():
    """Check the status of the HLS stream conversion"""
    if hls_process is None:
        return jsonify({"status": "inactive"})
    
    if hls_process.poll() is None:
        # Process is still running
        # Check if playlist file exists and has content
        playlist_path = os.path.join(hls_output_dir, 'playlist.m3u8')
        
        if os.path.exists(playlist_path) and os.path.getsize(playlist_path) > 0:
            # Count the number of segments files
            segment_count = len([f for f in os.listdir(hls_segments_dir) if f.endswith('.ts')])
            
            return jsonify({
                "status": "active",
                "segmentCount": segment_count,
                "hlsUrl": "/static/hls/playlist.m3u8"
            })
        else:
            return jsonify({"status": "starting"})
    else:
        # Process has ended
        return jsonify({
            "status": "ended",
            "exitCode": hls_process.returncode
        })

def cleanup_hls_process():
    """Cleanup function to terminate FFmpeg process on application exit"""
    global hls_process
    if hls_process is not None:
        try:
            hls_process.terminate()
            hls_process.wait(timeout=5)
        except:
            try:
                hls_process.kill()
            except:
                pass

# Register cleanup function to run on exit
atexit.register(cleanup_hls_process)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)