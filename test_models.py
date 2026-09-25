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

print("YuNet loaded successfully!")
print("SFace loaded successfully!")


# ====================
# OPEN CAMERA
# ====================

camera = cv2.VideoCapture(0)

while True:

    ret, frame = camera.read()

    if not ret:
        print("Camera not available")
        break

    # Set image size for YuNet
    height, width = frame.shape[:2]

    yunet.setInputSize((width, height))

    # Detect face
    _, faces = yunet.detect(frame)

    if faces is not None:

        for face in faces:

            x, y, w, h = face[:4].astype(int)

            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                (0, 255, 0),
                2
            )

    cv2.imshow(
        "YuNet Face Detection",
        frame
    )

    # Press Q to close
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


camera.release()
cv2.destroyAllWindows()