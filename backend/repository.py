from typing import List, Optional
from db import get_connection
from models import BookCreate, BookUpdate, Book


def _row_to_book(row) -> Book:
    return Book(
        id=row["id"],
        title=row["title"],
        author=row["author"],
        isbn=row["isbn"],
        year=row["year"],
        genre=row["genre"],
        pages=row["pages"],
        available=bool(row["available"]),
    )


class BookRepository:
    def list_all(self) -> List[Book]:
        with get_connection() as conn:
            rows = conn.execute(
                "SELECT id, title, author, isbn, year, genre, pages, available "
                "FROM books ORDER BY id DESC"
            ).fetchall()
        return [_row_to_book(r) for r in rows]

    def get(self, book_id: int) -> Optional[Book]:
        with get_connection() as conn:
            row = conn.execute(
                "SELECT id, title, author, isbn, year, genre, pages, available "
                "FROM books WHERE id = ?",
                (book_id,),
            ).fetchone()
        return _row_to_book(row) if row else None

    def create(self, data: BookCreate) -> Book:
        with get_connection() as conn:
            cur = conn.execute(
                "INSERT INTO books (title, author, isbn, year, genre, pages, available) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    data.title,
                    data.author,
                    data.isbn,
                    data.year,
                    data.genre,
                    data.pages,
                    int(data.available),
                ),
            )
            conn.commit()
            new_id = cur.lastrowid
        return self.get(new_id)  # type: ignore[return-value]

    def update(self, book_id: int, data: BookUpdate) -> Optional[Book]:
        with get_connection() as conn:
            cur = conn.execute(
                "UPDATE books SET title=?, author=?, isbn=?, year=?, "
                "genre=?, pages=?, available=? WHERE id=?",
                (
                    data.title,
                    data.author,
                    data.isbn,
                    data.year,
                    data.genre,
                    data.pages,
                    int(data.available),
                    book_id,
                ),
            )
            conn.commit()
            if cur.rowcount == 0:
                return None
        return self.get(book_id)

    def delete(self, book_id: int) -> bool:
        with get_connection() as conn:
            cur = conn.execute("DELETE FROM books WHERE id = ?", (book_id,))
            conn.commit()
            return cur.rowcount > 0
