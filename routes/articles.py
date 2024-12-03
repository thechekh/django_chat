from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session

from models import db, Article
from helpers import token_required


bp = Blueprint("articles", __name__)


def has_permission_to_edit(article):
    return g.current_role in ["admin", "editor"] or article.user_id == g.current_user.id


def error_response(message, status_code=403):
    return jsonify({"error": message}), status_code


def success_response(message, status_code=200):
    return jsonify({"message": message}), status_code


@bp.route("/articles", methods=["GET"])
@token_required
def get_articles():
    search_term = request.args.get("q", "")
    if not search_term:
        articles = db.session.query(Article).all()
    else:
        articles = (
            db.session.query(Article)
            .filter(
                (Article.title.ilike(f"%{search_term}%"))
                | (Article.content.ilike(f"%{search_term}%"))
            )
            .all()
        )

    return jsonify(
        [
            {
                "id": a.id,
                "title": a.title,
                "content": a.content,
                "author": a.user.username,
            }
            for a in articles
        ]
    ), 200


@bp.route("/articles", methods=["POST"])
@token_required
def create_article():
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")

    if not title or not content:
        return error_response("Title and content are required.", 400)

    new_article = Article(title=title, content=content, user_id=g.current_user.id)
    db.session.add(new_article)
    db.session.commit()

    return jsonify(
        {"message": "Article created successfully", "id": new_article.id}
    ), 201


@bp.route("/articles/<int:id>", methods=["GET"])
@token_required
def get_article_by_id(id):
    article = db.session.get(Article, id)
    if not article:
        return error_response("Article not found.", 404)

    return jsonify(
        {
            "id": article.id,
            "title": article.title,
            "content": article.content,
            "author": article.user.username,
        }
    ), 200


@bp.route("/articles/<int:id>", methods=["PUT"])
@token_required
def update_article(id):
    article = db.session.get(Article, id)
    if not article:
        return error_response("Article not found.", 404)

    if not has_permission_to_edit(article):
        return error_response("Permission denied.")

    article.title = request.json.get("title", article.title)
    article.content = request.json.get("content", article.content)

    db.session.commit()
    return success_response("Article updated successfully")


@bp.route("/articles/<int:id>", methods=["DELETE"])
@token_required
def delete_article(id):
    article = db.session.get(Article, id)
    if not article:
        return error_response("Article not found.", 404)

    if not has_permission_to_edit(article):
        return error_response("Permission denied.")

    db.session.delete(article)
    db.session.commit()
    return success_response("Article deleted successfully")
