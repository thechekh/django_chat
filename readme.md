
# Articles API
The [application](http://ec2-52-91-150-176.compute-1.amazonaws.com/apidocs) has been successfully deployed on an EC2 instance and is now accessible via the following link:

[ec2-52-91-150-176.compute-1.amazonaws.com/apidocs](http://ec2-52-91-150-176.compute-1.amazonaws.com/apidocs).

You can interact with the API documentation and test the endpoints directly through the Swagger UI hosted on the server.

This Flask-based application provides a RESTful API for managing articles, users, and roles. It uses PostgreSQL as the relational database, with SQLAlchemy as the ORM for interacting with the database. Alembic is employed for handling database migrations. The API supports basic authentication with a login/password flow, and JWT-based authorization is used to secure access. Users are created via docker-compose command, and roles are assigned at creation.

The application includes various user roles with specific permissions:
- **Admin**: Can perform CRUD operations on all articles and users.
- **Editor**: Has the same permissions as a Viewer, but can also modify articles created by other users.
- **Viewer**: Can manage only his own articles.

Endpoints are available for CRUD operations on articles (GET, POST, DELETE, PUT), as well as for managing users (GET, POST, DELETE, PUT). Users can search articles and users by text. The system supports unit testing using pytest and is ready for containerized deployment with Docker and Docker Compose.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Dependencies](#dependencies)
- [Project Structure](#project-structure)
- [Usage](#usage)
  - [API Documentation](#api-documentation)
  - [Build and run the Application](#build-and-run-the-application)
  - [Load Initial Data](#load-initial-data)
  - [Run the Tests](#run-the-tests)
  - [CI/CD Setup](#ci-cd-setup)
- [Deployment](#deployment)


---

## Features

- JWT-based authentication and role-based authorization.
- SQLAlchemy for ORM and PostgreSQL as the database.
- Alembic for database migrations.
- API for managing articles, users, and roles.
- Docker for easy deployment.
- Swagger API documentation.
- Postman API Collection.
- Unit testing with `pytest`.
- CI/CD Setup with Github Actions for tests.

---

## Prerequisites

Before you begin, ensure the following tools are installed on your system:
- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)

---
## Dependencies

### Project Dependencies (essential for running the project in production)
- **flask**: Core framework for your app.
- **flask-sqlalchemy**: Database ORM for SQL operations.
- **psycopg2-binary**: PostgreSQL database adapter.
- **flask-jwt-extended**: JWT-based authentication and authorization.
- **flask-cors**: Handling Cross-Origin Resource Sharing (CORS).
- **flasgger**: API documentation (Swagger integration).
- **alembic**: Database migrations.

---

### Dev Dependencies (used for development, testing, and debugging)
- **pytest**: Testing framework.
- **coverage**: Code coverage reporting.
- **python-dotenv**: Managing environment variables in development.


## Project Structure

```bash
├── app.py               # Main Flask application entry point
├── config.py            # Configuration for the app
├── routes/              # API route files
│   ├── articles.py      # Routes for articles
│   ├── auth.py          # Routes for authentication
│   └── users.py         # Routes for users
├── models/              # Database models
│   ├── article.py       # Article model
│   ├── user.py          # User model
│   └── role.py          # Role model
├── migrations/          # Alembic migration scripts
├── tests/               # Test cases for the application
├── docker-compose.yml   # Docker Compose file for multi-container setup
├── Dockerfile           # Dockerfile for building the app image
├── docs/                # Documentation files (Swagger, Postman)
│   ├── postman_collection.json  # Postman collection file
│   └── swagger.yml             # Swagger YAML documentation
├── .env                 # Environment variables
├── poetry.lock          # Poetry lock file
├── pyproject.toml       # Poetry configuration file
├── .github/             # GitHub Actions settings
│   └── workflows/
│       └── tests.yml    # GitHub Actions workflow file for tests
├── helpers/             # Helper functions
├── scripts/             # Utility scripts
│   ├── create_user.py   # Script for creating a user
│   └── populate_db.py   # Script for loading initial data

```
### Directory Breakdown
- `app.py`: The main entry point for the application where the Flask app is initialized and routes are configured.
- `config.py`: Holds all configuration variables for the app (e.g., database URLs, JWT settings).
- `routes/`: Contains route files for articles, users, and authentication logic.
- `models/`: Contains the SQLAlchemy database models (e.g., Article, User, Role).
- `migrations/`: Contains Alembic migration scripts to handle database schema changes.
- `tests/`: Holds test files for ensuring proper functionality of the API.
- `docker-compose.yml`: Defines services (app, database, etc.) in a Docker environment.
- `Dockerfile`: Used to build the app’s Docker image.
- `docs/`: Contains Swagger API documentation and Postman collection.
- `.env`: Configuration file for environment variables (used in local development).
- `poetry.lock` & `pyproject.toml`: Used by Poetry for managing dependencies.

---

### Project Routes
| HTTP Method | Route                 | Description                     | Accessible By           |
|-------------|-----------------------|---------------------------------|-------------------------|
| POST        | /login                | Log in to the system.          | All users              |
| GET         | /articles             | Retrieve all articles.         | All users              |
| POST        | /articles             | Create a new article.          | All users              |
| GET         | /articles/<int:id>    | Retrieve a specific article.   | All users              |
| PUT         | /articles/<int:id>    | Update an article.             | Owners, Editors, Admin |
| DELETE      | /articles/<int:id>    | Delete an article.             | Owners, Editors, Admin |
| GET         | /users                | Retrieve all users.            | Admin                  |
| POST        | /users                | Create a new user.             | Admin                  |
| GET         | /users/<int:id>       | Retrieve a specific user.      | Admin                  |
| PUT         | /users/<int:id>       | Update a user's details.       | Admin                  |
| DELETE      | /users/<int:id>       | Delete a user.                 | Admin                  |

---

## Usage

### API Documentation
 #### Swagger
 Swagger template file path:
```bash
/docs/swagger.yml
```
![Swagger](utils/readme_files/i1_swagger.png)

Credentials for test the **API**:

**Admin**
{
  "password": "adminpass",
  "username": "admin_user"
}

**Editor**
{
  "password": "editorpass",
  "username": "editor_user"
}

**Viewer**
{
  "password": "viewerpass1",
  "username": "viewer1"
}

#### Postman
For this project also available fully completed postman collection.
Postman collection file path:
```bash
/docs/postman_collection.json
```
![Postman](utils/readme_files/i2_postman.png)

### Build and Run the Application

1. **How to Run on VM (EC2)**:

Connect to VM

```bash
ssh -i vm_key.pem ubuntu@<EC2-PUBLIC-IP>
```
Install Docker
```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker
```
Install Docker-compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
Check if docker and docker-compose installed correctly:
```bash
docker --version
docker-compose --version
```
Clone the repository:
```bash
git clone https://github.com/thechekh/flask_api.git
cd flask_api
```

Create .env file in root directory with your settings:

Example of .env file
```bash
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=yoursecret
DATABASE_URL=postgresql://flask_api_user:yourpass@localhost:5432/flask_api_db
POSTGRES_USER=flask_api_user
POSTGRES_PASSWORD=yourpass
POSTGRES_DB=flask_api_db
```
Start containers:
```bash
sudo docker-compose up --build -d
```
![VM](utils/readme_files/i4_built_in_vm.png)

Now app is available on address <EC2_PUBLIC_IP>:5000/

Initiate migrations:
```bash
sudo docker-compose exec flask_app poetry run alembic upgrade head
```
![VM](utils/readme_files/i5_vm_alembic.png)

## Load initial data

Populate database with initial data:
```bash
sudo docker-compose exec flask_app poetry run python -m scripts.populate_db
```
![VM](utils/readme_files/i6_vm_populate.png)
Users in database
![VM](utils/readme_files/i7_populate_users.png)
Articles in database
![VM](utils/readme_files/i8_populate_articles.png)
Now app is available on address <EC2-PUBLIC-IP>:5000/

```bash
sudo docker-compose exec flask_app poetry run python -m scripts.create_user --username <username> --password <password> --role <role>
```
Where:

**username** - User name

**password** - User password

**role** - User role (admin, editor, viewer)

Example:
```bash
sudo docker-compose exec flask_app poetry run python -m scripts.create_user --username user_created_by_script --password test123 --role viewer
```


![VM](utils/readme_files/i10_vm_create_user.png)

## Run Tests
Run tests in container:
```bash
sudo docker-compose exec flask_app poetry run pytest
```
![VM](utils/readme_files/i9_vm_tests.png)
Steps to set up Nginx as a reverse proxy:

On your EC2 instance, install Nginx if it isn't already installed.


```bash
sudo apt update
sudo apt install nginx
```
Configure Nginx to reverse proxy to Flask: Create or modify an Nginx configuration file to forward requests from port 80 (the default HTTP port) to Flask's port 5000.

Open the default Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/default
```
Modify the file:

```nginx
server {
    listen 80;
    server_name ec2-52-91-150-176.compute-1.amazonaws.com;  # Replace with your EC2 public IP or domain

    location / {
        proxy_pass http://localhost:5000;  # Forward requests to your Flask app
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Restart Nginx: After saving the configuration file, restart Nginx to apply the changes.

```bash
sudo systemctl restart nginx
```
Now app is also available on address <EC2_PUBLIC_IP>/apidocs

### Run the Tests


Run tests with `pytest`:

   ```bash
   sudo docker-compose exec flask_app poetry run pytest
   ```
tests settings set in pyproject.toml section

```bash
[tool.pytest.ini_options]
# Coverage settings
addopts = "--cov=app --cov=config --cov=models --cov=routes"
```

Coverage of project

![Coverage](utils/readme_files/i3_coverage.png)

This will add initial users, roles, and articles to your database.
## Setup CI/CD
Project has settings for GitHub actions to run tests for every commit.

Github Actions file path:
```bash
.github/workflows/tests.yml
```
![Github Actions](utils/readme_files/i11_github_actions_tests.png)

## Deployment

The [application](http://ec2-52-91-150-176.compute-1.amazonaws.com/apidocs) has been successfully deployed on an EC2 instance and is now accessible via the following link:

[ec2-52-91-150-176.compute-1.amazonaws.com/apidocs](http://ec2-52-91-150-176.compute-1.amazonaws.com/apidocs).

You can interact with the API documentation and test the endpoints directly through the Swagger UI hosted on the server.

