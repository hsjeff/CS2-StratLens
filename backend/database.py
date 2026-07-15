import sqlite3
from pathlib import Path

DATABASE_PATH = Path("stratlens.db")


def get_connection():
    return sqlite3.connect(DATABASE_PATH)


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