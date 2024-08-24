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

@main.route('/api/workouts/<int:id>', methods=['DELETE'])
def delete_workout(id):
    workout = Workouts.query.get_or_404(id)  # get the workout with the specified id or return a 404 error
    db.session.delete(workout)
    db.session.commit()
    return jsonify({'message': 'Workout deleted successfully'}), 200

@main.route('/api/exercises/<int:id>', methods=['GET'])
def get_exercises(id):
    workout = Workouts.query.get_or_404(id)
    exercises = Exercise.query.filter_by(workouts_id=workout.id).all()
    return jsonify([exercise.to_dict() for exercise in exercises])

@main.route('/api/exercises/<int:workouts_id>', methods=['POST'])
def add_exercise(workouts_id):
    data = request.get_json()
    exercise = Exercise(name=data['name'], sets=data['sets'], reps=data['reps'], rest=data['rest'], workouts_id=workouts_id)
    db.session.add(exercise)
    db.session.commit()
    return jsonify(exercise.to_dict()), 201

@main.route('/api/exercises/<int:id>', methods=['PUT'])
def update_exercise(id):
    data = request.get_json()
    exercise = Exercise.query.get_or_404(id) # get the exercise with the specified id or return a 404 error
    exercise.name = data['name'] # get the name from the request data and update the exercise
    exercise.sets = data['sets'] # get the description from the request data and update the exercise
    exercise.reps = data['reps'] # get the description from the request data and update the exercise
    exercise.rest = data['rest'] # get the description from the request data and update the exercise
    db.session.commit()
    return jsonify(exercise.to_dict())

@main.route('/api/exercises/<int:id>', methods=['DELETE'])
def delete_exercise(id):
    exercise = Exercise.query.get_or_404(id)  # get the exercise with the specified id or return a 404 error
    db.session.delete(exercise)
    db.session.commit()
    return jsonify({'message': 'Exercise deleted successfully'}), 200