import cv2

# ====================
# LOAD MODELS
# ====================

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


# ====================
# OPEN CAMERA
# ====================

camera = cv2.VideoCapture(0)

while True:

    ret, frame = camera.read()

    if not ret:
        print("Camera not available")
        break

    height, width = frame.shape[:2]

    yunet.setInputSize((width, height))

    # Face detection
    _, faces = yunet.detect(frame)

    if faces is not None:

        for face in faces:

            x, y, w, h = face[:4].astype(int)

            # Crop face
            face_image = frame[y:y+h, x:x+w]

            if face_image.size == 0:
                continue

            # Resize face
            face_image = cv2.resize(
                face_image,
                (112, 112)
            )

            # Get face embedding
            embedding = sface.feature(
                face_image
            )

            print(
                "Embedding shape:",
                embedding.shape
            )

            cv2.rectangle(
                frame,
                (x, y),
                (x+w, y+h),
                (0, 255, 0),
                2
            )

    cv2.imshow(
        "SFace Recognition Test",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


camera.release()
cv2.destroyAllWindows()