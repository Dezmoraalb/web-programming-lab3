# Лабораторна робота №3 — «Бібліотека»

Мобільний застосунок для CRUD-операцій над книгами в бібліотеці.

- **Frontend:** React Native + Expo
- **Backend:** Python 3 + FastAPI
- **БД:** SQLite (через стандартний `sqlite3`)

## Структура

```
Lab3/
├── backend/              # REST API
│   ├── main.py           # FastAPI ендпоінти + обробник помилок
│   ├── db.py             # Підключення до SQLite, ініціалізація схеми
│   ├── repository.py     # BookRepository (DAO)
│   ├── models.py         # Pydantic-схеми (валідація)
│   └── requirements.txt
└── mobile/               # React Native (Expo) застосунок
    ├── App.js            # Stack-навігація
    ├── api.js            # fetch-обгортка над REST API
    └── screens/
        ├── BooksListScreen.js   # Вікно зі списком книг
        └── BookDetailScreen.js  # Вікно перегляду / редагування / створення
```

## Сутність `Book`

| Поле | Тип | Примітка |
|---|---|---|
| `id` | INTEGER | PK |
| `title` | TEXT | Назва (обов'язково) |
| `author` | TEXT | Автор (обов'язково) |
| `isbn` | TEXT | ISBN |
| `year` | INTEGER | Рік видання |
| `genre` | TEXT | Жанр |
| `pages` | INTEGER | Кількість сторінок |
| `available` | BOOL | Чи в наявності |

## REST API

| Метод | Шлях | Дія |
|---|---|---|
| `GET` | `/books` | Список усіх книг |
| `GET` | `/books/{id}` | Одна книга |
| `POST` | `/books` | Створити |
| `PUT` | `/books/{id}` | Оновити |
| `DELETE` | `/books/{id}` | Видалити |

Swagger UI доступний на `http://<host>:8000/docs`.

## Запуск backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

База даних створиться автоматично у файлі `backend/library.db`.

## Запуск мобільного застосунку

1. Встановити Node.js (LTS) і Expo CLI:
   ```bash
   npm install -g expo-cli
   ```
2. Встановити залежності:
   ```bash
   cd mobile
   npm install
   ```
3. У файлі `mobile/api.js` вказати `API_BASE_URL`:
   - **Реальний телефон через Expo Go:** IP вашого комп'ютера в локальній мережі (напр. `http://192.168.1.100:8000`).
   - **Android emulator:** `http://10.0.2.2:8000`.
   - **iOS simulator / web:** `http://localhost:8000`.
4. Запустити:
   ```bash
   npm start
   ```
   Відсканувати QR-код у Expo Go (Android / iOS) або натиснути `a` / `i` для емулятора.

## Обробка помилок

- **Backend:** валідація через Pydantic → відповіді `422` з описом поля; `404` для відсутніх записів; глобальний обробник `Exception` → `500` з повідомленням «Помилка в опрацюванні запиту» (без stack trace).
- **Frontend:** усі виклики API в `try/catch`; помилки відображаються через `Alert.alert` або банер у списку.
