from flask import Flask
from flask_cors import CORS
from flasgger import Swagger

from models import db
from routes import init_routes
from config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    CORS(app)
    Swagger(app, template_file="docs/swagger.yml")
    init_routes(app)
    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
