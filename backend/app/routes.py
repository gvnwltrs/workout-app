import pandas as pd
from flask import Blueprint, jsonify, request, send_file, Response
from io import StringIO, BytesIO
from .models import db, Workouts, Exercise, WorkoutLog

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
def add_exercises(workouts_id):
    data = request.get_json()
    exercise = Exercise(name=data['name'], sets=data['sets'], reps=data['reps'], rest=data['rest'], workouts_id=workouts_id)
    db.session.add(exercise)
    db.session.commit()
    return jsonify(exercise.to_dict()), 201

@main.route('/api/exercises/<int:id>', methods=['PUT'])
def update_exercises(id):
    data = request.get_json()
    exercise = Exercise.query.get_or_404(id) # get the exercise with the specified id or return a 404 error
    exercise.name = data['name'] # get the name from the request data and update the exercise
    exercise.sets = data['sets'] # get the description from the request data and update the exercise
    exercise.reps = data['reps'] # get the description from the request data and update the exercise
    exercise.rest = data['rest'] # get the description from the request data and update the exercise
    db.session.commit()
    return jsonify(exercise.to_dict())

@main.route('/api/exercises/<int:id>', methods=['DELETE'])
def delete_exercises(id):
    exercise = Exercise.query.get_or_404(id)  # get the exercise with the specified id or return a 404 error
    db.session.delete(exercise)
    db.session.commit()
    return jsonify({'message': 'Exercise deleted successfully'}), 200

@main.route('/api/logs/<int:workout_id>/<int:exercise_id>', methods=['GET'])
def get_workout_logs(workout_id, exercise_id):
    # Get the workout and exercise with the specified ids or return a 404 error
    workout = Workouts.query.get_or_404(workout_id)
    exercise = Exercise.query.get_or_404(exercise_id)

    # Get the workout logs for the exercise
    logs = WorkoutLog.query.filter_by(workouts_id=workout_id, exercise_id=exercise_id).all()

    # Convert the logs to dictionaries and return them
    return jsonify([log.to_dict() for log in logs])

@main.route('/api/logs/<int:workout_id>/<int:exercise_id>', methods=['POST'])
def add_workout_logs(workout_id, exercise_id):
    # Get the workout and exercise with the specified ids or return a 404 error
    workout = Workouts.query.get_or_404(workout_id)
    exercise = Exercise.query.get_or_404(exercise_id)

    # Get the workout log from the request body
    log_data = request.get_json()

    # Create and add the workout log
    log = WorkoutLog(workouts_id=workout_id, sets=log_data['sets'], reps=log_data['reps'], weight_lbs=log_data['weight_lbs'], notes=log_data['notes'], exercise_id=exercise_id)
    db.session.add(log)
    db.session.commit()

    # Return the workout log
    return jsonify(log.to_dict())

@main.route('/api/logs/<int:workout_id>/<int:exercise_id>/<int:log_id>', methods=['PUT'])
def update_workout_log(workout_id, exercise_id, log_id):
    # Get the workout, exercise, and log with the specified ids or return a 404 error
    workout = Workouts.query.get_or_404(workout_id)
    exercise = Exercise.query.get_or_404(exercise_id)
    log = WorkoutLog.query.get_or_404(log_id)

    # Ensure the log is for the specified workout and exercise
    if log.workouts_id != workout_id or log.exercise_id != exercise_id:
        abort(400)

    # Get the updated log data from the request body
    log_data = request.get_json()

    # Update the log
    log.sets = log_data['sets']
    log.reps = log_data['reps']
    log.weight_lbs = log_data['weight_lbs']
    log.notes = log_data['notes']

    db.session.commit()

    # Return the updated log
    return jsonify(log.to_dict())

@main.route('/api/logs/<int:workout_id>/<int:exercise_id>/<int:log_id>', methods=['DELETE'])
def delete_workout_log(workout_id, exercise_id, log_id):
    # Get the workout, exercise, and log with the specified ids or return a 404 error
    workout = Workouts.query.get_or_404(workout_id)
    exercise = Exercise.query.get_or_404(exercise_id)
    log = WorkoutLog.query.get_or_404(log_id)

    # Ensure the log is for the specified workout and exercise
    if log.workouts_id != workout_id or log.exercise_id != exercise_id:
        abort(400)

    # Delete the log
    db.session.delete(log)
    db.session.commit()

    # Return a success message
    return jsonify({'message': 'Log deleted successfully'})

@main.route('/api/workouts/<int:workout_id>/exercises/<int:exercise_id>/logs', methods=['DELETE'])
def delete_workout_logs(workout_id, exercise_id):
    # Get the workout and exercise with the specified ids or return a 404 error
    workout = Workouts.query.get_or_404(workout_id)
    exercise = Exercise.query.get_or_404(exercise_id)

    # Get the logs for the specified workout and exercise
    logs = WorkoutLog.query.filter_by(workouts_id=workout_id, exercise_id=exercise_id).all()

    # Delete the logs
    for log in logs:
        db.session.delete(log)
    db.session.commit()

    # Return a success message
    return jsonify({'message': 'Logs deleted successfully'})

@main.route('/api/exportWorkouts/<int:id>', methods=['GET'])
def export_workout(id):
    # Get the workout with the specified id or return a 404 error
    workout = Workouts.query.get_or_404(id)

    # Get the exercises for the workout
    exercises = Exercise.query.filter_by(workouts_id=id).all()

    # Get the logs for each exercise
    logs_data = []
    for exercise in exercises:
        logs = WorkoutLog.query.filter_by(exercise_id=exercise.id).all()
        for log in logs:
            try: 
                date = log.date
            except OperationalError:
                date = "N/A"
            logs_data.append({
                'workout_id': id,
                'date': date,
                'exercise_id': exercise.id,
                'log_id': log.id,
                'sets': log.sets,
                'reps': log.reps,
                'weight_lbs': log.weight_lbs,
                'notes': log.notes
            })
    output = BytesIO()
    writer = pd.ExcelWriter(output, engine='xlsxwriter')
    pd.DataFrame(logs_data).to_excel(writer, sheet_name=workout.title, index=False)
    writer.book.close()
    excel_data = output.getvalue() 
    response = Response(
        excel_data,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-disposition":
                 f"attachment; filename={workout.title}_logs.xlsx"}
    )

    return response 
