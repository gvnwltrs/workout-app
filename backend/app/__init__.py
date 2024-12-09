from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from flask import Flask 
from flask_cors import CORS

from .models import Workouts, Exercise, WorkoutLog 
#from .routes import *

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///workouts_database.db'
    db.init_app(app)

    from .routes import main
    app.register_blueprint(main)

    with app.app_context():
        from . import models
        db.create_all()

    return app
