FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install fastapi uvicorn python-multipart jinja2 aiofiles sqlalchemy
EXPOSE 8000
VOLUME ["/app/uploads"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
