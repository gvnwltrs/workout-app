import pandas as pd
from flask import Blueprint, jsonify, request, send_file, Response
from io import StringIO, BytesIO
from .models import db, Workouts, Exercise, WorkoutLog
from urllib.parse import unquote
from datetime import datetime

main = Blueprint('main', __name__)

# FIXME: Delete after implementation (WorkoutLog received and current state)
# Recevied:
# {'workout_id': 1, 'exercise_id': 7, 'date': '12/2/2024', 'log': [{'reps': '1', 'weight': '180'}, {'reps': '1', 'weight': '180'}, {'reps': '1', 'weight': '180'}]}
# In DB:
# {'id': 1, 'date': '10/07/2024', 'workouts_id': 1, 'sets': 1, 'reps': 2, 'weight_lbs': 170.0, 'notes': None, 'exercise_id': 7}

# UTILS
def get_from_database():
    ...

def add_to_database():
    ...

def update_database():
    ...

def delete_from_database():
    ...

# TODO: Update function name to reflect the action(s) to be taken
def check_if_log_exists(data):
    print("Checking if log exists...")
    existing_logs = WorkoutLog.query.filter_by(workouts_id=data['workout_id'], exercise_id=data['exercise_id'], date=data['date']).all()

    remove_candidates = data
    update_candidates = data
    add_candidates = data

    if (existing_logs):
        return True, existing_logs

    print("Logs do not exist...")
    return False, None

def format_date_for_table(date):
    return datetime.strptime(date, '%m/%d/%Y').date()

def format_date_for_frontend(log_date):
    return log_date.strftime('%m/%d/%Y')  # Reformat date here

# FIXME: tie to add button (+)
def add_log(data):
    workout_id = data['workout_id']
    exercise_id = data['exercise_id']
    date = format_date_for_table(data['date'])
    logs = data['log']
    # TODO: convert logs to json
    formatted_logs = json.dumps(logs)
    print(f"workout_id: {workout_id}, exercise_id: {exercise_id}, logs: {formatted_logs}")

    workout_log = WorkoutLog(workouts_id=workout_id, exercise_id=exercise_id, date=date)
    print("Adding log...")
    #print(f"Current workout logs: {logs_dict}")
    for idx, log in enumerate(data['log']):
        print(f"Logging: workout_id[{workout_id}] | exercise_id[{exercise_id}] on date -> {date}: {log}")
        workout_log = WorkoutLog(workouts_id=workout_id, exercise_id=exercise_id, date=date, log=formatted_logs)
        db.session.add(workout_log)
    # db.session.commit()
    return jsonify({'message': 'workout exercise entry logged for sets and reps'}), 200 

# TODO: implement -- tie to remove button (-)
def delete_all_logs(data):
    print("Removing existing log...")
    return jsonify({'message': 'workout exercise entry logged for sets and reps'}), 200 

@main.route('/api/workouts', methods=['GET']) # used when initially loading the page
def get_workouts():
    workouts = Workouts.query.all()
    print(f"Workouts: {workouts}")
    if not workouts:
        print("not sending workouts")
        return jsonify("404")
    return jsonify([workout.to_dict() for workout in workouts]), 200 

@main.route('/api/workouts/<int:id>', methods=['GET']) 
def get_workout(id):
    workout = Workouts.query.get_or_404(id)
    return jsonify(workout.to_dict())

@main.route('/api/workouts', methods=['POST'])
def add_workouts():
    data = request.get_json()
    
    # TODO: Extract Start: add_to_database()
    workouts = Workouts(title=data['title'])
    db.session.add(workouts)
    db.session.commit()
    # TODO: Extract End
    
    return jsonify(workouts.to_dict()), 201

@main.route('/api/workouts/<int:id>', methods=['PUT'])
def update_workouts(id):
    data = request.get_json()
    
    # TODO: Extract Start: update_database()
    workouts = Workouts.query.get_or_404(id) # get the workout with the specified id or return a 404 error
    workouts.title = data['title'] # get the title from the request data and update the workout (essentially change the current title)
    db.session.commit()
    # TODO: Extract End

    return jsonify(workouts.to_dict())

@main.route('/api/workouts/<int:id>', methods=['DELETE'])
def delete_workout(id):
    workout = Workouts.query.get_or_404(id)

    # TODO: Extract Start: delete_from_database()
    db.session.delete(workout)
    db.session.commit()
    # TODO: Extract End

    return jsonify({'message': 'Workout deleted successfully'}), 200

@main.route('/api/exercises/<int:id>', methods=['GET'])
def get_exercises(id):

    # TODO: Extract Start: get_from_database()
    workout = Workouts.query.get_or_404(id)
    exercises = Exercise.query.filter_by(workouts_id=workout.id).all()
    # TODO: Extract End

    return jsonify([exercise.to_dict() for exercise in exercises])

@main.route('/api/exercises/<int:workouts_id>', methods=['POST'])
def add_exercises(workouts_id):
    data = request.get_json()

    # TODO: Extract Start: add_to_database()
    exercise = Exercise(name=data['name'], sets=data['sets'], reps=data['reps'], rest=data['rest'], workouts_id=workouts_id)
    db.session.add(exercise)
    db.session.commit()
    # TODO: Extract End
    
    return jsonify(exercise.to_dict()), 201

@main.route('/api/exercises/<int:id>', methods=['PUT'])
def update_exercises(id):
    data = request.get_json()

    # TODO: Extract Start: update_database()
    exercise.sets = data['sets'] # get the description from the request data and update the exercise
    exercise.reps = data['reps'] # get the description from the request data and update the exercise
    exercise.rest = data['rest'] # get the description from the request data and update the exercise
    db.session.commit()
    # TODO: Extract End
    
    return jsonify(exercise.to_dict())

@main.route('/api/exercises/<int:id>', methods=['DELETE'])
def delete_exercises(id):

    # TODO: Extract Start: delete_from_database()
    exercise = Exercise.query.get_or_404(id)  # get the exercise with the specified id or return a 404 error
    db.session.delete(exercise)
    db.session.commit()
    # TODO: Extract End
    
    return jsonify({'message': 'Exercise deleted successfully'}), 200

@main.route('/api/logs/get', methods=['GET'])
def get_workout_logs():
    logs = WorkoutLog.query.all()

    if not logs:
        return jsonify({'message': 'No logs found'}), 404 
    
    logs_dict = [
        {**log.to_dict(), 'date': log.date.strftime('%m/%d/%Y')}  # Reformat date here
        for log in logs
    ]

    return jsonify(logs_dict), 200
    # return jsonify([log.to_dict() for log in logs]), 200

@main.route('/api/workoutlogs/handler', methods=['POST'])
def update_workout_logs():
    data = request.get_json()
    print(data)

    return jsonify({'message': 'workout exercise entry logged for sets and reps'}), 200

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

