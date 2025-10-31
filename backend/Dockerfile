FROM python:3.11-slim
# Copy only backend into /app/backend and run from there so `main.py` is importable
WORKDIR /app/backend
COPY backend /app/backend
RUN pip install fastapi uvicorn python-multipart jinja2 aiofiles sqlalchemy
EXPOSE 8000
VOLUME ["/app/backend/uploads"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
