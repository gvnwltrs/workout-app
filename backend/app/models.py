from flask_sqlalchemy import SQLAlchemy
from . import db

class Workouts(db.Model):
    id = db.Column(db.Integer, primary_key=True) # creates a unique id for each workout upon each new entry
    title = db.Column(db.String(100), nullable=False)
    exercises = db.relationship('Exercise', backref='workouts', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'exercises': [exercise.to_dict() for exercise in self.exercises]
        }

class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sets = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    rest = db.Column(db.Integer, nullable=False)
    workouts_id = db.Column(db.Integer, db.ForeignKey('workouts.id'), nullable=False) # associates the exercise with a specific workout 

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'sets': self.sets,
            'reps': self.reps,
            'rest': self.rest,
            'workouts_id': self.workouts_id
        }