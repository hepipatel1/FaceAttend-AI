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


while True:

    ret, frame = camera.read()

    if not ret:
        print("Camera not detected!")
        break


    # Current frame size
    height, width = frame.shape[:2]

    face_detector.setInputSize((width, height))


    # =========================
    # 4. Detect Face
    # =========================

    _, faces = face_detector.detect(frame)


    if faces is not None:

        for face in faces:

            # Face rectangle
            x, y, w, h = face[:4].astype(int)

            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                (0, 255, 0),
                2
            )


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


            print("Face embedding shape:", embedding.shape)


            cv2.putText(
                frame,
                "Face Recognized!",
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )


    cv2.imshow(
        "FaceAttend AI - Face Recognition Test",
        frame
    )


    # Press Q to exit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


camera.release()
cv2.destroyAllWindows()