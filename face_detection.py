import cv2

# YuNet model
model = cv2.FaceDetectorYN.create(
    "models/face_detection_yunet_2023mar.onnx",
    "",
    (320, 320)
)

# Camera open
camera = cv2.VideoCapture(0)

while True:

    ret, frame = camera.read()

    if not ret:
        print("Camera not detected!")
        break

    height, width = frame.shape[:2]

    # Detector ne current frame size batavo
    model.setInputSize((width, height))

    # Face detect
    _, faces = model.detect(frame)

    # Jo face male
    if faces is not None:

        for face in faces:

            x, y, w, h = face[:4].astype(int)

            # Face ni around rectangle
            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                (0, 255, 0),
                2
            )

    cv2.imshow("FaceAttend AI - Face Detection", frame)

    # Q press = exit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()
cv2.destroyAllWindows()