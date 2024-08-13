from flask import Blueprint, jsonify, request
from .models import db, Workouts, Exercise

main = Blueprint('main', __name__)

@main.route('/api/workouts/<int:id>', methods=['GET']) 
def get_workout(id):
    workout = Workouts.query.get_or_404(id)
    return jsonify(workout.to_dict())

@main.route('/api/workouts', methods=['GET']) 
def get_workouts():
    workouts = Workouts.query.all()
    return jsonify([workout.to_dict() for workout in workouts])


@main.route('/api/workouts', methods=['POST'])
def add_workouts():
    data = request.get_json()
    workouts = Workouts(title=data['title'])
    db.session.add(workouts)
    db.session.commit()
    return jsonify(workouts.to_dict()), 201

@main.route('/api/workouts/<int:id>', methods=['PUT'])
def update_workouts(id):
    data = request.get_json()
    workouts = Workouts.query.get_or_404(id)
    workouts.title = data['title']
    db.session.commit()
    return jsonify(workouts.to_dict())

@main.route('/api/workouts/<int:workouts_id>/exercises', methods=['POST'])
def add_exercise(workouts_id):
    data = request.get_json()
    exercise = Exercise(name=data['name'], sets=data['sets'], reps=data['reps'], rest=data['rest'], workouts_id=workouts_id)
    db.session.add(exercise)
    db.session.commit()
    return jsonify(exercise.to_dict()), 201