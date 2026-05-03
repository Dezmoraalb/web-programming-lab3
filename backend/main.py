import logging
from typing import List

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db import init_db
from models import Book, BookCreate, BookUpdate
from repository import BookRepository

logger = logging.getLogger("library")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Library API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = BookRepository()


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Помилка в опрацюванні запиту"},
    )


@app.get("/books", response_model=List[Book])
def list_books():
    return repo.list_all()


@app.get("/books/{book_id}", response_model=Book)
def get_book(book_id: int):
    book = repo.get(book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Книгу не знайдено")
    return book


@app.post("/books", response_model=Book, status_code=201)
def create_book(data: BookCreate):
    return repo.create(data)


@app.put("/books/{book_id}", response_model=Book)
def update_book(book_id: int, data: BookUpdate):
    book = repo.update(book_id, data)
    if book is None:
        raise HTTPException(status_code=404, detail="Книгу не знайдено")
    return book


@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: int):
    if not repo.delete(book_id):
        raise HTTPException(status_code=404, detail="Книгу не знайдено")
    return None
