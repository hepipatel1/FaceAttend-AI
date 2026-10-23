import mysql.connector
# from config import DB_HOST,DB_USER,DB_PASSWORD,DB_NAME
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT

def get_db_connection():
    connection = mysql.connector.connect(
        port=DB_PORT,
        host=DB_HOST,
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