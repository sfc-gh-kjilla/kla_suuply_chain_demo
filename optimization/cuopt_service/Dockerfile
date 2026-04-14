FROM nvcr.io/nvidia/cuopt/cuopt:24.12-cuda12.6

RUN pip install --no-cache-dir fastapi uvicorn pydantic

WORKDIR /app
COPY cuopt_server.py .

EXPOSE 8080
CMD ["uvicorn", "cuopt_server:app", "--host", "0.0.0.0", "--port", "8080"]
