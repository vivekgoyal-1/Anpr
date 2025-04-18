import cv2
import easyocr
from database import initialize_mongo_connection,save_number_plate_to_db,fetch_all_number_plates , check_in_db
from utils import license_complies_format,format_license
reader = easyocr.Reader(['en'], gpu=False)
collection = initialize_mongo_connection()

def ocr_reader(img,box) :
    x_min, y_min, x_max, y_max = map(int, box[:4])  # Adjust depending on the box format
                
    # Crop the region of interest from the image (ensure `image` is available)
    cropped_img = img[y_min:y_max, x_min:x_max]
    gray_img = cv2.cvtColor(cropped_img, cv2.COLOR_RGB2GRAY)
    detections = reader.readtext(gray_img)
    # print(detections)
    #detect = detections[0]
    #print("detect",detect)
    for detection in detections:
        
        bbox, text, score = detection
        text = text.upper().replace(' ', '').replace('.','').replace(',','')
        formatted = format_license(text)
        # print("printing detecttion",formatted)
        if license_complies_format(formatted):
            #save_to_db(formatted)
            return formatted
            
    
    # bbox, text, score = detect
    # #print(text)
    # text = text.upper().replace(' ', '').replace('.','').replace(',','')
    # formatted = format_license(text)
    # if license_complies_format(formatted):
    #     return formatted
        str=""
        if text is not None :
            str=str+"none" +text
            return str
        else: 
            return "none"
    # results = reader.readtext(gray_img)

    # text = ""
    # for res in results:
    #     if len(results) == 1 or (len(res[1]) > 6 and res[2] > 0.2):
    #         text = res[1] 
    # if check_in_db(collection,text):
    #     #code if number is already found in db
    #     print("entry found") 
    # else :
    #     #if not in db then what to do
    #     print("no entry found")
    #     print("saving to database now")  
    #     save_to_db(text)
    # return text


def save_to_db(formatted) :
    save_number_plate_to_db(collection,formatted)

# print(fetch_all_number_plates(collection))


    


