
import re

# Mapping dictionaries for character conversion (common confusion)
dict_char_to_int = {'O': '0', 'I': '1', 'J': '3', 'A': '4', 'G': '6', 'S': '5', 'B': '8', 'Z': '2'}
dict_int_to_char = {'0': 'O', '1': 'I', '3': 'J', '4': 'A', '6': 'G', '5': 'S', '8': 'B', '2': 'Z'}


# def write_csv(results, output_path):
#     with open(output_path, 'w') as f:
#         f.write('{},{},{},{},{},{},{}\n'.format('frame_nmr', 'car_id', 'car_bbox',
#                                                 'license_plate_bbox', 'license_plate_bbox_score', 'license_number',
#                                                 'license_number_score'))

#         for frame_nmr in results.keys():
#             for car_id in results[frame_nmr].keys():
#                 if 'car' in results[frame_nmr][car_id].keys() and \
#                    'license_plate' in results[frame_nmr][car_id].keys() and \
#                    'text' in results[frame_nmr][car_id]['license_plate'].keys():
#                     f.write('{},{},{},{},{},{},{}\n'.format(frame_nmr,
#                                                             car_id,
#                                                             '[{} {} {} {}]'.format(
#                                                                 *results[frame_nmr][car_id]['car']['bbox']),
#                                                             '[{} {} {} {}]'.format(
#                                                                 *results[frame_nmr][car_id]['license_plate']['bbox']),
#                                                             results[frame_nmr][car_id]['license_plate']['bbox_score'],
#                                                             results[frame_nmr][car_id]['license_plate']['text'],
#                                                             results[frame_nmr][car_id]['license_plate']['text_score']))
#         f.close()


def license_complies_format(text):
    """
    Check if the license plate text complies with Indian number plate format:
    Two letters, two digits, one to three letters, four digits (e.g., KA01AB1234)
    """
    pattern = r'^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$'
    #print("after format",text)
    #print("true or false",re.match(pattern,text))
    return re.match(pattern, text) is not None


def format_license(text):
    """
    Format and correct common misread characters in license plate text.
    """
    #print("before format",text)
    # if len(text) < 9 or len(text) > 11:
    #     return None  # Invalid length

    # Step 3: Positional correction based on expected license format
    length = len(text)
    corrected = ''
    for i, ch in enumerate(text):
        if i in [0, 1]:  # Should be letter (state code)
            if ch in dict_int_to_char:
                corrected += dict_int_to_char[ch]
            else:
                corrected += ch
        elif i in [2, 3]:  # Should be digit (district code)
            if ch in dict_char_to_int:
                corrected += dict_char_to_int[ch]
            else:
                corrected += ch
        elif 4 <= i <= 6 and i+4<length:  # Series (1–3 letters, usually)
            if ch in dict_int_to_char:
                corrected += dict_int_to_char[ch]
            else:
                corrected += ch
        else:  # Last 4 digits
            if ch in dict_char_to_int:
                corrected += dict_char_to_int[ch]
            else:
                corrected += ch
    
    return corrected  # or None if you want to strictly filter



def get_car(license_plate, vehicle_track_ids):
    """
    Link license plate to the corresponding car based on bounding box containment.
    """
    x1, y1, x2, y2, score, class_id = license_plate
    # print("Trying to match LP:", license_plate, "with cars:", vehicle_track_ids)

    for xcar1, ycar1, xcar2, ycar2, car_id in vehicle_track_ids:
        if x1 > xcar1 and y1 > ycar1 and x2 < xcar2 and y2 < ycar2:
            return xcar1, ycar1, xcar2, ycar2, car_id

    return -1, -1, -1, -1, -1
