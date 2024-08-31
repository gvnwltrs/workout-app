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

class WorkoutLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=True)
    sets = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    weight_lbs = db.Column(db.Float, nullable=False)
    notes = db.Column(db.String(500), nullable=True)
    workouts_id = db.Column(db.Integer, db.ForeignKey('workouts.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'workouts_id': self.workouts_id,
            'sets': self.sets,
            'reps': self.reps,
            'weight_lbs': self.weight_lbs,
            'notes': self.notes,
            'exercise_id': self.exercise_id
        }