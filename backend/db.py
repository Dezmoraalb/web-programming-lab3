import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "library.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS books (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                title     TEXT    NOT NULL,
                author    TEXT    NOT NULL,
                isbn      TEXT,
                year      INTEGER,
                genre     TEXT,
                pages     INTEGER,
                available INTEGER NOT NULL DEFAULT 1
            )
            """
        )
        conn.commit()
