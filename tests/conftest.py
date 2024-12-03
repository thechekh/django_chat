import pytest

from flask.testing import FlaskClient
from werkzeug.security import generate_password_hash

from app import create_app, db
from models import User, Role, Article


@pytest.fixture(scope="module")
def test_client() -> FlaskClient:
    app = create_app()
    yield app.test_client()


@pytest.fixture(scope="module")
def add_user(test_client):
    with test_client.application.app_context():
        role = Role.query.filter_by(name="admin").first()
        if not role:
            role = Role(name="admin")
            db.session.add(role)
            db.session.commit()
        user = User.query.filter_by(username="test_admin").first()
        if not user:
            user = User(
                username="test_admin",
                password=generate_password_hash("adminpass"),
                role_id=role.id,
            )
            db.session.add(user)
            db.session.commit()
            db.session.refresh(user)
        return user


@pytest.fixture
def add_article(test_client, add_user):
    with test_client.application.app_context():
        user = add_user
        article = Article.query.filter_by(title="Test Article").first()
        if not article:
            article = Article(
                title="Test Article", content="Test Content", user_id=user.id
            )
            db.session.add(article)
            db.session.commit()
            db.session.refresh(article)
        return article
