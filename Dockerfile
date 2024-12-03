# Use Python base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy only the dependency files first
COPY pyproject.toml poetry.lock ./

# Install Poetry
RUN pip install poetry

# Install dependencies
RUN poetry config virtualenvs.create false && poetry install

# Copy the rest of the application files
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD ["poetry", "run", "gunicorn", "-b", "0.0.0.0:5000", "app:app"]
