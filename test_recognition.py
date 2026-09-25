import cv2
import numpy as np
import json

from database.db import get_db_connection


# =========================
# LOAD MODELS
# =========================

yunet = cv2.FaceDetectorYN.create(
    "models/face_detection_yunet_2023mar.onnx",
    "",
    (320, 320)
)

sface = cv2.FaceRecognizerSF.create(
    "models/face_recognition_sface_2021dec.onnx",
    ""
)

print("Models loaded successfully!")


# =========================
# MARK ATTENDANCE
# =========================

def mark_attendance(employee_id):

    connection = get_db_connection()

    cursor = connection.cursor()

    try:

        # Check today's attendance
        cursor.execute("""
            SELECT id
            FROM attendance
            WHERE employee_id = %s
              AND date = CURDATE()
        """, (employee_id,))

        existing_attendance = cursor.fetchone()

        if existing_attendance:

            print("Attendance already marked today!")

        else:

            # Mark attendance
            cursor.execute("""
                INSERT INTO attendance
                (employee_id, date, check_in, status)
                VALUES
                (%s, CURDATE(), CURTIME(), 'Present')
            """, (employee_id,))

            connection.commit()

            print("Attendance marked successfully!")

    except Exception as e:

        print("Attendance error:", e)

    finally:

        cursor.close()
        connection.close()
# =========================
# LOAD EMPLOYEES FROM MYSQL
# =========================

connection = get_db_connection()

cursor = connection.cursor(dictionary=True)

cursor.execute("""
    SELECT id, employee_code, name, face_encoding
    FROM employees
    WHERE face_encoding IS NOT NULL
      AND face_encoding != ''
""")

employees = cursor.fetchall()

cursor.close()
connection.close()


# =========================
# CREATE KNOWN FACES LIST
# =========================

known_faces = []

for employee in employees:

    embedding = json.loads(
        employee["face_encoding"]
    )

    embedding = np.array(
        embedding,
        dtype=np.float32
    )

    known_faces.append({
        "id": employee["id"],
        "employee_code": employee["employee_code"],
        "name": employee["name"],
        "embedding": embedding
    })


print("Employees loaded:", len(known_faces))

for employee in known_faces:
    print(
        employee["employee_code"],
        "->",
        employee["name"],
        "Embedding shape:",
        employee["embedding"].shape
    )


# =========================
# OPEN CAMERA
# =========================

camera = cv2.VideoCapture(0)


while True:

    ret, frame = camera.read()

    if not ret:

        print("Camera not available")

        break


    # =========================
    # DETECT FACE
    # =========================

    height, width = frame.shape[:2]

    yunet.setInputSize(
        (width, height)
    )

    _, faces = yunet.detect(frame)


    if faces is not None:

        for face in faces:

            x, y, w, h = face[:4].astype(int)


            # Make coordinates valid

            x = max(0, x)
            y = max(0, y)

            w = min(
                w,
                width - x
            )

            h = min(
                h,
                height - y
            )


            if w <= 0 or h <= 0:

                continue


            # =========================
            # ALIGN FACE
            # =========================

            aligned_face = sface.alignCrop(
                frame,
                face
            )


            # =========================
            # CREATE CURRENT EMBEDDING
            # =========================

            current_embedding = sface.feature(
                aligned_face
            )


            # =========================
            # FIND BEST EMPLOYEE
            # =========================

            best_similarity = -1

            best_employee = None


            for employee in known_faces:

                similarity = sface.match(
                    employee["embedding"],
                    current_embedding,
                    cv2.FaceRecognizerSF_FR_COSINE
                )


                if similarity > best_similarity:

                    best_similarity = similarity

                    best_employee = employee


            # =========================
            # RECOGNITION THRESHOLD
            # =========================

            if (
                best_employee is not None
                and best_similarity >= 0.363
            ):

                label = (
                    best_employee["name"]
                    + " - Recognized"
                )

                print(
                    "Recognized:",
                    best_employee["name"],
                    "Similarity:",
                    best_similarity
                )

                mark_attendance(best_employee["id"])

            else:

                label = "Unknown"

                print(
                    "Unknown",
                    "Similarity:",
                    best_similarity
                )


            # =========================
            # DRAW FACE BOX
            # =========================

            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                (0, 255, 0),
                2
            )


            # =========================
            # SHOW NAME
            # =========================

            cv2.putText(
                frame,
                label,
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )


    # =========================
    # SHOW CAMERA
    # =========================

    cv2.imshow(
        "Face Recognition",
        frame
    )


    # =========================
    # PRESS Q TO EXIT
    # =========================

    if cv2.waitKey(1) & 0xFF == ord("q"):

        break


# =========================
# RELEASE CAMERA
# =========================

camera.release()

cv2.destroyAllWindows()