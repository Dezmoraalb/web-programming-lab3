from typing import Optional
from pydantic import BaseModel, Field


class BookBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=200)
    isbn: Optional[str] = Field(default=None, max_length=20)
    year: Optional[int] = Field(default=None, ge=0, le=2100)
    genre: Optional[str] = Field(default=None, max_length=100)
    pages: Optional[int] = Field(default=None, ge=1, le=100000)
    available: bool = True


class BookCreate(BookBase):
    pass


class BookUpdate(BookBase):
    pass


class Book(BookBase):
    id: int
