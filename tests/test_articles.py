from models import db, Article
from helpers import get_token


def test_get_articles_from_admin(test_client, add_user, add_article):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)

        response = test_client.get(
            "/articles",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert isinstance(response.json, list)
        assert len(response.json) > 0
        assert "id" in response.json[0]
        assert "title" in response.json[0]
        assert "content" in response.json[0]
        assert "author" in response.json[0]

        for article in response.json:
            assert isinstance(article["author"], str)


def test_get_article_by_id_from_admin(test_client, add_user, add_article):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)
        article = add_article

        response = test_client.get(
            f"/articles/{article.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json["id"] == article.id
        assert response.json["title"] == article.title
        assert response.json["content"] == article.content
        assert response.json["author"] == admin_user.username


def test_create_article_from_admin(test_client, add_user):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)

        response = test_client.post(
            "/articles",
            json={"title": "New Article", "content": "New Content"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        assert response.json["message"] == "Article created successfully"

        new_article = db.session.get(Article, response.json["id"])
        if new_article:
            db.session.delete(new_article)
            db.session.commit()


def test_update_article_from_admin(test_client, add_user, add_article):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)
        article = add_article

        response = test_client.put(
            f"/articles/{article.id}",
            json={"title": "Updated Title", "content": "Updated Content"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json["message"] == "Article updated successfully"

        with db.session.begin():
            updated_article = db.session.get(Article, article.id)
            assert updated_article.title == "Updated Title"
            assert updated_article.content == "Updated Content"
            updated_article.title = article.title
            updated_article.content = article.content
            db.session.add(updated_article)


def test_delete_article_from_admin(test_client, add_user, add_article):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)
        article = add_article

        response = test_client.delete(
            f"/articles/{article.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json["message"] == "Article deleted successfully"

        with db.session.begin():
            deleted_article = db.session.get(Article, article.id)
            assert deleted_article is None


def test_delete_own_article(test_client, add_user, add_article):
    with test_client.application.app_context():
        user = add_user
        token = get_token(test_client, user)
        article = add_article

        response = test_client.delete(
            f"/articles/{article.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json["message"] == "Article deleted successfully"

        with db.session.begin():
            deleted_article = db.session.get(Article, article.id)
            assert deleted_article is None
