from flask import Blueprint, jsonify, request
from .models import db, Workouts, Exercise

main = Blueprint('main', __name__)

@main.route('/api/workouts', methods=['GET']) # used when initially loading the page
def get_workouts():
    workouts = Workouts.query.all()
    return jsonify([workout.to_dict() for workout in workouts])

@main.route('/api/workouts/<int:id>', methods=['GET']) 
def get_workout(id):
    workout = Workouts.query.get_or_404(id)
    return jsonify(workout.to_dict())

@main.route('/api/workouts', methods=['POST'])
def add_workouts():
    data = request.get_json() # convert the request data to a dictionary
    workouts = Workouts(title=data['title'])
    db.session.add(workouts) # stage the data to be added to the database
    db.session.commit() # apply the changes to the database
    return jsonify(workouts.to_dict()), 201 # returns the newly created workout with the ID assigned to it by the database 

@main.route('/api/workouts/<int:id>', methods=['PUT'])
def update_workouts(id):
    data = request.get_json()
    workouts = Workouts.query.get_or_404(id) # get the workout with the specified id or return a 404 error
    workouts.title = data['title'] # get the title from the request data and update the workout (essentially change the current title)
    db.session.commit()
    return jsonify(workouts.to_dict())

@main.route('/api/workouts/<int:id>/exercises', methods=['GET'])
def get_exercises(id):
    workout = Workouts.query.get_or_404(id)
    exercises = Exercise.query.filter_by(workouts_id=workout.id).all()
    return jsonify([exercise.to_dict() for exercise in exercises])

@main.route('/api/workouts/<int:workouts_id>/exercises', methods=['POST'])
def add_exercise(workouts_id):
    data = request.get_json()
    exercise = Exercise(name=data['name'], sets=data['sets'], reps=data['reps'], rest=data['rest'], workouts_id=workouts_id)
    db.session.add(exercise)
    db.session.commit()
    return jsonify(exercise.to_dict()), 201