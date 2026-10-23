from flask import Flask, jsonify, request, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import get_db_connection
import os 
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'change-this-to-a-long-random-secret')
import jwt
from datetime import datetime, timedelta
import pandas as pd
from io import BytesIO
from flask import send_file
import cv2
import numpy as np
import json

app = Flask(__name__)



# =========================
# LOAD FACE AI MODELS
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

print("YuNet loaded successfully!")
print("SFace loaded successfully!")


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logout successful!"}), 200

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/employee")
def employee_page():
    return render_template("employee.html")

@app.route("/attendance-page")
def attendance_page():
    return render_template("attendance.html")

@app.route("/analytics-page")
def analytics_page():
    return render_template("analytics.html")

@app.route("/dashboard/stats")
def dashboard_stats():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Total employees
    cursor.execute("""
        SELECT COUNT(*) AS total_employees
        FROM employees
    """)
    total_employees = cursor.fetchone()["total_employees"]

    # Present today
    cursor.execute("SELECT COUNT(*) AS present_today FROM attendance WHERE date = CURDATE() AND status = 'Present'")
    present_today = cursor.fetchone()["present_today"]

    # Absent today
    absent_today = total_employees - present_today

    if total_employees > 0:
        attendance_rate = (present_today / total_employees) * 100
    else:
        attendance_rate = 0

    cursor.close()
    connection.close()
    return jsonify({
    "total_employees": total_employees,
    "present_today": present_today,
    "absent_today": absent_today,
    "attendance_rate": attendance_rate
}), 200

@app.route('/register', methods=['GET'])
def register_page():
    return render_template('register.html')

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
    hashed_password = generate_password_hash(password)

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT id FROM users WHERE email = %s",(email,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        connection.close()
        return jsonify({"error": "Email already registered"}), 409
        
    query = "INSERT INTO users (username, email, password, role) VALUES (%s,%s, %s, %s)"
    values = (username, email, hashed_password, "admin")

    cursor.execute(query, values)
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": "User registered successfully!"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    query = "SELECT * FROM users WHERE email = %s"
    cursor.execute(query, (email,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user:
        print("LOGIN USER FOUND:", bool(user))
        return jsonify({"error": "Invalid email or password"}), 401
    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode(
        {
            "user_id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "exp": datetime.utcnow() + timedelta(hours=2)
        },
        JWT_SECRET_KEY,
        algorithm="HS256"
    )
    return jsonify({"message": "Login successful!", 
                    "token": token,
                    "user": {
                        "id": user["id"], 
                        "username": user["username"],
                        "email": user["email"], 
                        "role": user["role"]}}), 200
@app.route("/users")
def get_users():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(users)

@app.route("/profile")
def profile():

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({
            "message": "Token is required"
        }), 401

    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({
            "message": "Invalid Authorization header format"
        }), 401

    token = parts[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

        # MySQL connection
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # JWT mathi user_id lai ne database ma user search
        query = """
            SELECT id, username, email, role, created_at
            FROM users
            WHERE id = %s
        """

        cursor.execute(query, (decoded["user_id"],))

        user = cursor.fetchone()

        cursor.close()
        connection.close()


        if not user:
            return jsonify({"message": "User not found"}), 404

        # User profile return
        return jsonify({"message": "Profile fetched successfully","user": user}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401


@app.route("/employees", methods=["POST"])
def add_employee():

    # 1. Authorization header check
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({
            "message": "Token is required"
        }), 401

    # 2. Bearer token check
    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({
            "message": "Invalid Authorization header format"
        }), 401
    token = parts[1]
    try:
        # 3. JWT verify
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )
        # 4. Admin check
        if decoded["role"] != "admin":
            return jsonify({
                "message": "Admin access required"
            }), 403
        # 5. Employee data
        data = request.get_json()
        employee_code = data.get("employee_code")
        name = data.get("name")
        email = data.get("email")
        if not employee_code or not name or not email:
            return jsonify({
                "message": "All fields are required"
            }), 400
        # 6. Database connection
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
            INSERT INTO employees (employee_code, name, email)
            VALUES (%s, %s, %s)
        """

        values = (employee_code, name, email)

        cursor.execute(query, values)
        employee_id = cursor.lastrowid
        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({
            "message": "Employee added successfully",
            "employee_id": employee_id
                }), 201

    except jwt.ExpiredSignatureError:
        return jsonify({
            "message": "Token has expired"
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            "message": "Invalid token"
        }), 401

@app.route("/employees", methods=["GET"])
def get_employees():

    # 1. Authorization header check
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({
            "message": "Token is required"
        }), 401

    # 2. Bearer token check
    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({
            "message": "Invalid Authorization header format"
        }), 401

    token = parts[1]

    try:
        # 3. JWT verify
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )
        # 4. Admin check
        if decoded["role"] != "admin":
            return jsonify({
                "message": "Admin access required"
            }), 403
        # 5. Database connection
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, employee_code, name, email, created_at
            FROM employees
        """)
        employees = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify(employees), 200
    except jwt.ExpiredSignatureError:
        return jsonify({
            "message": "Token has expired"
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            "message": "Invalid token"
        }), 401


@app.route("/attendance", methods=["GET"])
def get_attendance():


    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({"message": "Token is required"}), 401

    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({"message": "Invalid Authorization header format"}), 401

    token = parts[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            attendance.id,
            employees.employee_code,
            employees.name,
            attendance.date,
            attendance.check_in,
            attendance.status
        FROM attendance
        JOIN employees
            ON attendance.employee_id = employees.id
        ORDER BY attendance.date DESC,
                 attendance.check_in DESC
    """)

    attendance = cursor.fetchall()

    cursor.close()
    connection.close()


    # Convert date and time into strings
    for record in attendance:

        record["date"] = record["date"].isoformat()

        record["check_in"] = str(record["check_in"])


    return jsonify(attendance), 200

@app.route("/attendance/export", methods=["GET"])
def export_attendance():

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"message": "Token is required"}), 401
    
    parts = auth_header.split(" ")
        
    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({"message": "Invalid Authorization header format"}), 401
            
    token = parts[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401


    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            employees.employee_code,
            employees.name,
            attendance.date,
            attendance.check_in,
            attendance.status
        FROM attendance
        JOIN employees
            ON attendance.employee_id = employees.id
        ORDER BY attendance.date DESC,
                 attendance.check_in DESC
    """)

    attendance = cursor.fetchall()

    cursor.close()
    connection.close()

    # Convert MySQL date/time values to strings
    for record in attendance:

        record["date"] = record["date"].isoformat()

        record["check_in"] = str(record["check_in"])

    return jsonify(attendance), 200



@app.route("/attendance/export/excel", methods=["GET"])
def export_attendance_excel():

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({"message": "Token is required"}), 401

    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({"message": "Invalid Authorization header format"}), 401

    token = parts[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            employees.employee_code,
            employees.name,
            attendance.date,
            attendance.check_in,
            attendance.status
        FROM attendance
        JOIN employees
            ON attendance.employee_id = employees.id
        ORDER BY attendance.date DESC,
                 attendance.check_in DESC
    """)

    attendance = cursor.fetchall()

    cursor.close()
    connection.close()

    # Convert data into DataFrame
    df = pd.DataFrame(attendance)

    # Convert date/time to strings
    if not df.empty:
        df["date"] = df["date"].astype(str)
        df["check_in"] = df["check_in"].astype(str)

    # Create Excel file in memory
    excel_file = BytesIO()

    with pd.ExcelWriter(excel_file, engine="openpyxl") as writer:
        df.to_excel(
            writer,
            index=False,
            sheet_name="Attendance"
        )

    # Move to beginning of file
    excel_file.seek(0)

    return send_file(
        excel_file,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name="attendance_report.xlsx"
    )


@app.route("/attendance/analytics", methods=["GET"])
def attendance_analytics():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({"message": "Token is required"}), 401

    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({"message": "Invalid Authorization header format"}), 401

    token = parts[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            employees.employee_code,
            employees.name,
            attendance.date,
            attendance.status
        FROM attendance
        JOIN employees
            ON attendance.employee_id = employees.id
    """)

    attendance = cursor.fetchall()

    cursor.close()
    connection.close()

    # Convert database data into DataFrame
    df = pd.DataFrame(attendance)

    # No attendance data
    if df.empty:
        return jsonify([]), 200

    # Total attendance records for each employee
    analytics = (
        df.groupby(["employee_code", "name"])
        .size()
        .reset_index(name="total_days")
    )

    # Present count
    present_count = (
        df[df["status"] == "Present"]
        .groupby(["employee_code", "name"])
        .size()
        .reset_index(name="present_days")
    )

    # Merge both results
    analytics = analytics.merge(
        present_count,
        on=["employee_code", "name"],
        how="left"
    )

    # If no present record, set 0
    analytics["present_days"] = (
        analytics["present_days"]
        .fillna(0)
        .astype(int)
    )

    # Attendance percentage
    analytics["attendance_percentage"] = (
        analytics["present_days"]
        / analytics["total_days"]
        * 100
    ).round(2)

    return jsonify(
        analytics.to_dict(orient="records")
    ), 200


@app.route("/attendance/monthly", methods=["GET"])
def monthly_attendance():

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({"message": "Token is required"}), 401

    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({"message": "Invalid Authorization header format"}), 401

    token = parts[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            employees.employee_code,
            employees.name,
            attendance.date,
            attendance.status
        FROM attendance
        JOIN employees
            ON attendance.employee_id = employees.id
        ORDER BY attendance.date
    """)

    attendance = cursor.fetchall()

    cursor.close()
    connection.close()

    # Convert database data to DataFrame
    df = pd.DataFrame(attendance)

    if df.empty:
        return jsonify([]), 200

    # Convert date column
    df["date"] = pd.to_datetime(df["date"])

    # Create month column
    df["month"] = df["date"].dt.strftime("%Y-%m")

    # Employee + month wise total days
    monthly = (
        df.groupby(
            ["employee_code", "name", "month"]
        )
        .size()
        .reset_index(name="total_days")
    )

    # Employee + month wise present days
    present = (
        df[df["status"] == "Present"]
        .groupby(
            ["employee_code", "name", "month"]
        )
        .size()
        .reset_index(name="present_days")
    )

    # Merge
    monthly = monthly.merge(
        present,
        on=["employee_code", "name", "month"],
        how="left"
    )

    # Missing present values â†’ 0
    monthly["present_days"] = (
        monthly["present_days"]
        .fillna(0)
        .astype(int)
    )

    # Attendance percentage
    monthly["attendance_percentage"] = (
        monthly["present_days"]
        / monthly["total_days"]
        * 100
    ).round(2)

    return jsonify(
        monthly.to_dict(orient="records")
    ), 200




# =========================
# FACE RECOGNITION
# =========================

@app.route("/face-recognition", methods=["POST"])
def face_recognition():

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({"message": "Token is required"}), 401

    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({"message": "Invalid Authorization header format"}), 401

    token = parts[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    if "face" not in request.files:
        return jsonify({
            "message": "Face image is required"
        }), 400

    face_file = request.files["face"]

    # Read image
    image_bytes = face_file.read()

    image_array = np.frombuffer(
        image_bytes,
        np.uint8
    )

    frame = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if frame is None:
        return jsonify({
            "message": "Invalid face image"
        }), 400

    # =========================
    # DETECT FACE
    # =========================

    height, width = frame.shape[:2]

    yunet.setInputSize(
        (width, height)
    )

    _, faces = yunet.detect(frame)

    if faces is None:
        return jsonify({
            "message": "No face detected"
        }), 400

    if len(faces) != 1:
        return jsonify({
            "message": "Please capture exactly one face"
        }), 400

    # =========================
    # CREATE FACE EMBEDDING
    # =========================

    face = faces[0]

    aligned_face = sface.alignCrop(
        frame,
        face
    )

    current_embedding = sface.feature(
        aligned_face
    )

    # =========================
    # LOAD EMPLOYEES
    # =========================

    connection = get_db_connection()

    cursor = connection.cursor(
        dictionary=True
    )

    cursor.execute("""
        SELECT
            id,
            employee_code,
            name,
            face_encoding
        FROM employees
        WHERE face_encoding IS NOT NULL
          AND face_encoding != ''
    """)

    employees = cursor.fetchall()

    cursor.close()
    connection.close()

    # =========================
    # FIND BEST MATCH
    # =========================

    best_similarity = -1

    best_employee = None

    for employee in employees:

        saved_embedding = json.loads(
            employee["face_encoding"]
        )

        saved_embedding = np.array(
            saved_embedding,
            dtype=np.float32
        )

        similarity = sface.match(
            saved_embedding,
            current_embedding,
            cv2.FaceRecognizerSF_FR_COSINE
        )

        if similarity > best_similarity:

            best_similarity = similarity

            best_employee = employee

    # =========================
    # RECOGNITION
    # =========================

    if (
        best_employee is not None
        and best_similarity >= 0.363
    ):

        # =========================
        # CHECK ATTENDANCE
        # =========================

        connection = get_db_connection()

        cursor = connection.cursor()

        cursor.execute("""
            SELECT id
            FROM attendance
            WHERE employee_id = %s
              AND date = CURDATE()
        """, (best_employee["id"],))

        existing_attendance = cursor.fetchone()

        if existing_attendance:

            attendance_message = (
                "Attendance already marked today"
            )

        else:

            cursor.execute("""
                INSERT INTO attendance
                (
                    employee_id,
                    date,
                    check_in,
                    status
                )
                VALUES
                (
                    %s,
                    CURDATE(),
                    CURTIME(),
                    'Present'
                )
            """, (best_employee["id"],))

            connection.commit()

            attendance_message = (
                "Attendance marked successfully"
            )

        cursor.close()
        connection.close()

        return jsonify({
            "message": "Face recognized",
            "employee_id": best_employee["id"],
            "employee_code": best_employee["employee_code"],
            "name": best_employee["name"],
            "similarity": best_similarity,
            "attendance": attendance_message
        }), 200

    # =========================
    # UNKNOWN FACE
    # =========================

    return jsonify({
        "message": "Unknown face",
        "similarity": best_similarity
    }), 401



# ==================== FACE REGISTRATION ====================

@app.route("/employees/<int:employee_id>/face", methods=["POST"])
def register_employee_face(employee_id):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({"message": "Token is required"}), 401

    parts = auth_header.split(" ")

    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({"message": "Invalid Authorization header format"}), 401

    token = parts[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

        if decoded["role"] != "admin":
            return jsonify({"message": "Admin access required"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401
    
    if "face" not in request.files:

        return jsonify({
            "message": "Face image is required"
        }), 400

    face_file = request.files["face"]

    if face_file.filename == "":
        return jsonify({
            "message": "No face image selected"
        }), 400

        # Read uploaded image
    image_bytes = face_file.read()

    image_array = np.frombuffer(
        image_bytes,
        np.uint8
    )

    frame = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if frame is None:
        return jsonify({
            "message": "Invalid face image"
        }), 400



        # Detect face
    height, width = frame.shape[:2]

    yunet.setInputSize(
        (width, height)
    )

    _, faces = yunet.detect(frame)

    if faces is None:
        return jsonify({
            "message": "No face detected"
        }), 400

    if len(faces) != 1:
        return jsonify({
            "message": "Please capture exactly one face"
        }), 400

        # =========================
    # CREATE SFACE EMBEDDING
    # =========================

    face = faces[0]

    # Align face using YuNet landmarks
    aligned_face = sface.alignCrop(
        frame,
        face
    )

    # Generate 128-dimensional embedding
    embedding = sface.feature(
        aligned_face
    )

    print("Embedding shape:", embedding.shape)

        # Convert embedding to JSON string
    embedding_data = json.dumps(
        embedding.tolist()
    )

    # =========================
    # SAVE EMBEDDING IN MYSQL
    # =========================

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        UPDATE employees
        SET face_encoding = %s
        WHERE id = %s
    """

    cursor.execute(
        query,
        (embedding_data, employee_id)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Face embedding saved successfully",
        "employee_id": employee_id
    }), 200



    return jsonify({
        "message": "Face image received successfully",
        "employee_id": employee_id,
        "filename": face_file.filename
    }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
