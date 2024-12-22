# Build Stage
FROM python:slim AS builder
WORKDIR /app

## Dependencies
RUN apt-get update && apt-get install -y coreutils python3 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python3", "src/calculator.py"]


