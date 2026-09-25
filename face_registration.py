import cv2


# =========================
# 1. Load YuNet
# =========================

face_detector = cv2.FaceDetectorYN.create(
    "models/face_detection_yunet_2023mar.onnx",
    "",
    (320, 320)
)


# =========================
# 2. Load SFace
# =========================

face_recognizer = cv2.FaceRecognizerSF.create(
    "models/face_recognition_sface_2021dec.onnx",
    ""
)


# =========================
# 3. Open Camera
# =========================

camera = cv2.VideoCapture(0)
if not camera.isOpened():
    print("❌ Camera open nahi thai!")
    exit()

print("✅ Camera successfully opened!")


while True:

    ret, frame = camera.read()

    if not ret:
        print("Camera not detected!")
        break

    height, width = frame.shape[:2]

    face_detector.setInputSize((width, height))


    # =========================
    # 4. Detect Face
    # =========================

    _, faces = face_detector.detect(frame)


    if faces is not None:

        # First detected face
        face = faces[0]

        # =========================
        # 5. Align Face
        # =========================

        aligned_face = face_recognizer.alignCrop(
            frame,
            face
        )


        # =========================
        # 6. Generate Embedding
        # =========================

        embedding = face_recognizer.feature(
            aligned_face
        )


        # =========================
        # 7. Show Face
        # =========================

        x, y, w, h = face[:4].astype(int)

        cv2.rectangle(
            frame,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )


        cv2.putText(
            frame,
            "Face detected - Press S to save",
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )


    cv2.imshow(
        "FaceAttend AI - Face Registration",
        frame
    )


    # =========================
    # 8. Save Embedding
    # =========================

    key = cv2.waitKey(1) & 0xFF

    if key == ord("s"):

        if faces is not None:

            print("Face embedding generated!")
            print("Embedding shape:", embedding.shape)

            # Temporary save
            with open("face_embedding.txt", "w") as file:
                file.write(str(embedding.tolist()))

            print("Embedding saved successfully!")

            break

        else:

            print("No face detected!")


    # Q = Quit
    if key == ord("q"):
        break


camera.release()
cv2.destroyAllWindows()