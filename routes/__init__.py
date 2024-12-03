from .articles import bp as articles_bp
from .auth import bp as auth_bp
from .users import bp as users_bp


def init_routes(app):
    app.register_blueprint(articles_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
