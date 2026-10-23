import os
import mysql.connector

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "faceattend_ai")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

def get_db_connection():
    connection = mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        ssl_disabled=False
    )
    return connection

if __name__ == "__main__":
    connection = get_db_connection()
    if connection.is_connected():
        print("MySQL connected successfully!")
    connection.close()
