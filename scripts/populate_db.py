from werkzeug.security import generate_password_hash

from app import create_app, db
from models import User, Role, Article


def create_roles():
    roles = ["admin", "editor", "viewer"]
    for role_name in roles:
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            role = Role(name=role_name)
            db.session.add(role)
    db.session.commit()
    print("Roles created successfully.")


def create_users():
    roles = {role.name: role for role in Role.query.all()}
    users = [
        {"username": "admin_user", "password": "adminpass", "role": roles["admin"]},
        {"username": "editor_user", "password": "editorpass", "role": roles["editor"]},
        {"username": "viewer1", "password": "viewerpass1", "role": roles["viewer"]},
        {"username": "viewer2", "password": "viewerpass2", "role": roles["viewer"]},
        {"username": "viewer3", "password": "viewerpass3", "role": roles["viewer"]},
    ]

    for user_data in users:
        user = User.query.filter_by(username=user_data["username"]).first()
        if not user:
            user = User(
                username=user_data["username"],
                password=generate_password_hash(user_data["password"]),
                role_id=user_data["role"].id,
            )
            db.session.add(user)
    db.session.commit()
    print("Users created successfully.")


def create_articles():
    users = {user.username: user for user in User.query.all()}
    articles = [
        {
            "title": "Linux Bash Terminal",
            "content": "Introduction to Linux Bash Terminal.",
            "user": users["admin_user"],
        },
        {
            "title": "Python Basics",
            "content": "Learn the basics of Python programming.",
            "user": users["editor_user"],
        },
        {
            "title": "AWS EC2",
            "content": "How to use AWS EC2 for hosting.",
            "user": users["viewer1"],
        },
        {
            "title": "AWS RDS",
            "content": "AWS RDS setup and configuration guide.",
            "user": users["viewer1"],
        },
        {
            "title": "Docker Essentials",
            "content": "Introduction to Docker and containers.",
            "user": users["viewer1"],
        },
        {
            "title": "Git Basics",
            "content": "How to use Git for version control.",
            "user": users["viewer2"],
        },
        {
            "title": "Flask Framework",
            "content": "Getting started with Flask.",
            "user": users["viewer3"],
        },
        {
            "title": "Django Framework",
            "content": "Building applications with Django.",
            "user": users["viewer3"],
        },
    ]

    for article_data in articles:
        article = Article(
            title=article_data["title"],
            content=article_data["content"],
            user_id=article_data["user"].id,
        )
        db.session.add(article)
    db.session.commit()
    print("Articles created successfully.")


if __name__ == "__main__":
    print("Starting database population...")
    app = create_app()
    with app.app_context():
        create_roles()
        create_users()
        create_articles()
    print("Database populated successfully!")
