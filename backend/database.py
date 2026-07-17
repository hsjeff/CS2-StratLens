import sqlite3
from pathlib import Path

DATABASE_PATH = Path("stratlens.db")


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS utilities (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            thrower_id TEXT NOT NULL,
            throw_time REAL NOT NULL,
            land_time REAL NOT NULL,
            expire_time REAL NOT NULL,
            start_x REAL NOT NULL,
            start_y REAL NOT NULL,
            land_x REAL NOT NULL,
            land_y REAL NOT NULL,
            radius REAL NOT NULL,
            description TEXT
        )
    """)

    connection.commit()
    connection.close()

def row_to_utility(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "type": row["type"],
        "throwerId": row["thrower_id"],
        "throwTime": row["throw_time"],
        "landTime": row["land_time"],
        "expireTime": row["expire_time"],
        "startX": row["start_x"],
        "startY": row["start_y"],
        "landX": row["land_x"],
        "landY": row["land_y"],
        "radius": row["radius"],
        "description": row["description"]
    }


def get_all_utilities():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM utilities ORDER BY id")
    rows = cursor.fetchall()

    utilities = [row_to_utility(row) for row in rows]

    connection.close()
    return utilities

def get_utility_by_id(utility_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT * FROM utilities WHERE id = ?",
        (utility_id,)
    )

    row = cursor.fetchone()
    connection.close()

    if row is None:
        return None

    return row_to_utility(row)

def insert_utility(utility):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO utilities (
            name,
            type,
            thrower_id,
            throw_time,
            land_time,
            expire_time,
            start_x,
            start_y,
            land_x,
            land_y,
            radius,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        utility["name"],
        utility["type"],
        utility["throwerId"],
        utility["throwTime"],
        utility["landTime"],
        utility["expireTime"],
        utility["startX"],
        utility["startY"],
        utility["landX"],
        utility["landY"],
        utility["radius"],
        utility["description"]
    ))

    new_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return new_id