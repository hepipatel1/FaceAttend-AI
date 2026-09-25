import ast
import cv2
import numpy as np
from datetime import datetime

from database.db import get_db_connection


# ==============================
# 1. Load Pal's saved embedding
# ==============================

connection = get_db_connection()
cursor = connection.cursor(dictionary=True)

cursor.execute("""
    SELECT id, name, face_encoding
    FROM employees
    WHERE id = %s
""", (2,))

employee = cursor.fetchone()

cursor.close()
connection.close()


if not employee or not employee["face_encoding"]:
    print("❌ Face encoding not found!")
    exit()


pal_embedding = ast.literal_eval(employee["face_encoding"])


# ==============================
# 2. Create Face Detector
# ==============================

face_detector = cv2.FaceDetectorYN.create(
    "models/face_detection_yunet_2023mar.onnx",
    "",
    (320, 320)
)


# ==============================
# 3. Create Face Recognizer
# ==============================

face_recognizer = cv2.FaceRecognizerSF.create(
    "models/face_recognition_sface_2021dec.onnx",
    ""
)


# ==============================
# 4. Attendance Function
# ==============================

def mark_attendance(employee_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    today = datetime.now().date()
    current_time = datetime.now().time()

    # Check today's attendance
    cursor.execute("""
        SELECT id
        FROM attendance
        WHERE employee_id = %s
        AND date = %s
    """, (employee_id, today))

    existing_attendance = cursor.fetchone()

    if existing_attendance:

        cursor.close()
        connection.close()

        return False


    # Mark attendance
    cursor.execute("""
        INSERT INTO attendance
        (employee_id, date, check_in, status)
        VALUES (%s, %s, %s, %s)
    """, (
        employee_id,
        today,
        current_time,
        "Present"
    ))

    connection.commit()

    cursor.close()
    connection.close()

    print("✅ Attendance marked successfully!")

    return True


# ==============================
# 5. Open Camera
# ==============================

camera = cv2.VideoCapture(0)


if not camera.isOpened():

    print("❌ Camera open nahi thai!")
    exit()


print("✅ Camera successfully opened!")
print("👤 Camera same face rakho...")
print("❌ Exit mate Q press karo")


# ==============================
# 6. Attendance Status
# ==============================

attendance_marked = False


# ==============================
# 7. Start Recognition
# ==============================

while True:

    ret, frame = camera.read()


    if not ret:

        print("❌ Camera frame nahi mali!")
        break


    height, width = frame.shape[:2]

    face_detector.setInputSize(
        (width, height)
    )


    _, faces = face_detector.detect(frame)


    if faces is not None:

        for face in faces:

            x, y, w, h = face[:4].astype(int)


            # ==============================
            # Align Face
            # ==============================

            aligned_face = face_recognizer.alignCrop(
                frame,
                face
            )


            # ==============================
            # Generate Current Embedding
            # ==============================

            current_embedding = face_recognizer.feature(
                aligned_face
            )


            # ==============================
            # Convert Saved Embedding
            # ==============================

            saved_embedding = np.array(
                pal_embedding,
                dtype=np.float32
            )


            # ==============================
            # Compare Faces
            # ==============================

            score = face_recognizer.match(
                current_embedding,
                saved_embedding,
                cv2.FaceRecognizerSF_FR_COSINE
            )


            # ==============================
            # Recognition
            # ==============================

            if score >= 0.363:

                name = employee["name"]

                text = f"{name} - Recognized"

                rectangle_color = (0, 255, 0)


                # ==============================
                # Mark Attendance
                # ==============================

                if not attendance_marked:

                    new_attendance = mark_attendance(
                        employee["id"]
                    )

                    if new_attendance:

                        attendance_marked = True

                        text = f"{name} - Attendance Marked"

                    else:

                        attendance_marked = True

                        text = f"{name} - Already Present"


            else:

                text = "Unknown Face"

                rectangle_color = (0, 0, 255)


            # ==============================
            # Draw Face Rectangle
            # ==============================

            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                rectangle_color,
                2
            )


            # ==============================
            # Display Result
            # ==============================

            cv2.putText(
                frame,
                text,
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                rectangle_color,
                2
            )


    # ==============================
    # Show Camera
    # ==============================

    cv2.imshow(
        "FaceAttend AI - Face Recognition",
        frame
    )


    # ==============================
    # Press Q to Exit
    # ==============================

    if cv2.waitKey(1) & 0xFF == ord("q"):

        break


# ==============================
# 8. Close Camera
# ==============================

camera.release()

cv2.destroyAllWindows()