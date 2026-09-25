import ast
from database.db import get_db_connection


# Step 1: Read face embedding
with open("face_embedding.txt", "r") as file:
    embedding_text = file.read()


# Step 2: Convert text into Python list
embedding = ast.literal_eval(embedding_text)


# Step 3: Connect to MySQL
connection = get_db_connection()
cursor = connection.cursor()


# Step 4: Save embedding for pal (employee id = 2)
query = """
    UPDATE employees
    SET face_encoding = %s
    WHERE id = %s
"""

cursor.execute(
    query,
    (str(embedding), 2)
)


# Step 5: Save changes
connection.commit()


print("✅ Face embedding saved for pal!")


cursor.close()
connection.close()