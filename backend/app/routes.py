import pandas as pd
from flask import Blueprint, jsonify, request, send_file, Response
from io import StringIO, BytesIO
from .models import db, Workouts, Exercise, WorkoutLog
from urllib.parse import unquote
from datetime import datetime

main = Blueprint('main', __name__)

def get_from_database():
    ...

def add_to_database():
    ...

def update_database():
    ...

def delete_from_database():
    ...

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
    
    # Extract Start: add_to_database()
    workouts = Workouts(title=data['title'])
    db.session.add(workouts) # stage the data to be added to the database
    db.session.commit() # apply the changes to the database
    # Extract End
    
    return jsonify(workouts.to_dict()), 201 # returns the newly created workout with the ID assigned to it by the database 

@main.route('/api/workouts/<int:id>', methods=['PUT'])
def update_workouts(id):
    data = request.get_json()
    
    # Extract Start: update_database()
    workouts = Workouts.query.get_or_404(id) # get the workout with the specified id or return a 404 error
    workouts.title = data['title'] # get the title from the request data and update the workout (essentially change the current title)
    db.session.commit()
    # Extract End

    return jsonify(workouts.to_dict())

@main.route('/api/workouts/<int:id>', methods=['DELETE'])
def delete_workout(id):
    workout = Workouts.query.get_or_404(id)  # get the workout with the specified id or return a 404 error

    # Extract Start: delete_from_database()
    db.session.delete(workout)
    db.session.commit()
    # Extract End

    return jsonify({'message': 'Workout deleted successfully'}), 200

@main.route('/api/exercises/<int:id>', methods=['GET'])
def get_exercises(id):

    # Extract Start: get_from_database()
    workout = Workouts.query.get_or_404(id)
    exercises = Exercise.query.filter_by(workouts_id=workout.id).all()
    # Extract End

    return jsonify([exercise.to_dict() for exercise in exercises])

@main.route('/api/exercises/<int:workouts_id>', methods=['POST'])
def add_exercises(workouts_id):
    data = request.get_json()

    # Extract Start: add_to_database()
    exercise = Exercise(name=data['name'], sets=data['sets'], reps=data['reps'], rest=data['rest'], workouts_id=workouts_id)
    db.session.add(exercise)
    db.session.commit()
    # Extract End
    
    return jsonify(exercise.to_dict()), 201

@main.route('/api/exercises/<int:id>', methods=['PUT'])
def update_exercises(id):
    data = request.get_json()

    # Extract Start: update_database()
    exercise = Exercise.query.get_or_404(id) # get the exercise with the specified id or return a 404 error
    exercise.name = data['name'] # get the name from the request data and update the exercise
    exercise.sets = data['sets'] # get the description from the request data and update the exercise
    exercise.reps = data['reps'] # get the description from the request data and update the exercise
    exercise.rest = data['rest'] # get the description from the request data and update the exercise
    db.session.commit()
    # Extract End
    
    return jsonify(exercise.to_dict())

@main.route('/api/exercises/<int:id>', methods=['DELETE'])
def delete_exercises(id):

    # Extract Start: delete_from_database()
    exercise = Exercise.query.get_or_404(id)  # get the exercise with the specified id or return a 404 error
    db.session.delete(exercise)
    db.session.commit()
    # Extract End
    #
    return jsonify({'message': 'Exercise deleted successfully'}), 200

# TODO: Update function name to reflect the action(s) to be taken
def check_if_log_exists(data):
    print("Checking if log exists...")
    # existing_logs = WorkoutLog.query.filter_by(workout_id=workout_id, exercise_id=exercise_id, date=log_date).all()
    existing_logs = WorkoutLog.query.filter_by(workouts_id=data['workout_id'], exercise_id=data['exercise_id'], date=data['date']).all()
    
    ''' TODO: 

    1. If there is a log that does not exist in the current data when comparing to the existing logs, 
    then remove the log from the database and modify the already existing logs if the data is different. 

    2. If there is a log that exists in the current data when comparing to the existing logs, 
    then add the log to the database and modify the already existing logs if the data is different.

    3. If no logs exist, then add the log to the database.

    4. Make data structure to describe what actions to take based on the conditions 
    between the existing logs and the current data and return it to the caller.


    '''
    if (existing_logs):
        return True
    print("Log does not exist...")
    return False

def modify_date_for_table(date):
    return datetime.strptime(date, '%m/%d/%Y').date()

# TODO: implement
def add_log(data):
    workout_id = data['workout_id']
    exercise_id = data['exercise_id']
    date = modify_date_for_table(data['date'])
    logs_request = data['log']

    workout_logs = WorkoutLog.query.all()
    logs_dict = [
        {**log.to_dict(), 'date': log.date.strftime('%m/%d/%Y')}  # Reformat date here
        for log in workout_logs
    ]
    # FIXME: Delete after implementation
    # Recevied:
    # {'workout_id': 1, 'exercise_id': 7, 'date': '12/2/2024', 'log': [{'reps': '1', 'weight': '180'}, {'reps': '1', 'weight': '180'}, {'reps': '1', 'weight': '180'}]}
    # In DB:
    # {'id': 1, 'date': '10/07/2024', 'workouts_id': 1, 'sets': 1, 'reps': 2, 'weight_lbs': 170.0, 'notes': None, 'exercise_id': 7}
    workout_log = WorkoutLog(workouts_id=workout_id, exercise_id=exercise_id, date=date)
    print("Adding log...")
    print(f"Current workout logs: {logs_dict}")
    for idx, log in enumerate(data['log']):
        print(f"Logging: workout_id[{workout_id}] | exercise_id[{exercise_id}] on date -> {date}: {log}")
        workout_log = WorkoutLog(workouts_id=workout_id, exercise_id=exercise_id, date=date, sets=idx, reps=log['reps'], weight_lbs=log['weight'])
        db.session.add(workout_log)
    db.session.commit()
    return jsonify({'message': 'workout exercise entry logged for sets and reps'}), 200 

# TODO: implement
def delete_log(data):
    print("Removing existing log...")
    return jsonify({'message': 'workout exercise entry logged for sets and reps'}), 200 

# TODO: implement
def modify_log(data):
    print("Modifying existing log...")
    return jsonify({'message': 'workout exercise entry logged for sets and reps'}), 200 

log_subroutines = {
    'check_if_log_exists': check_if_log_exists,
    'add_log': add_log,
    'delete_log': delete_log,
    'modify_log': modify_log
}

# TODO: implement
def decide_log_action(subroutine, data):
    if (subroutine['check_if_log_exists'](data)):
        subroutine['modify_log'](data)
    else:
        subroutine['add_log'](data)
    return jsonify({'message': 'workout exercise entry logged for sets and reps'}), 200

# ACTION 
@main.route('/api/workoutlogs/handler', methods=['POST'])
def handle_workout_logs_submit_request():
    data = request.get_json()
    print(data)

    result = decide_log_action(log_subroutines, data)

    print (result)

    return jsonify({'message': 'workout exercise entry logged for sets and reps'}), 200

@main.route('/api/logs/get', methods=['GET'])
def get_workout_logs():

    # Get the workout logs for the exercise
    logs = WorkoutLog.query.all()

    if not logs:
        return jsonify({'message': 'No logs found'}), 404 
    
    # Convert logs and reformat the date to the format the frontend expects
    logs_dict = [
        {**log.to_dict(), 'date': log.date.strftime('%m/%d/%Y')}  # Reformat date here
        for log in logs
    ]

    # Convert the logs to dictionaries and return them
    return jsonify(logs_dict), 200
    # return jsonify([log.to_dict() for log in logs]), 200

@main.route('/api/workoutlogs/add/<int:workout_id>/<int:exercise_id>', methods=['POST'])
def add_workout_logs(workout_id, exercise_id):
    # Get the workout and exercise with the specified ids or return a 404 error
    workout = Workouts.query.get_or_404(workout_id)
    exercise = Exercise.query.get_or_404(exercise_id)

    # Get the workout log from the request body
    log_data = request.get_json()

    # Convert Date to format for database
    date_for_table = datetime.strptime(log_data['date'], '%m/%d/%Y').date()

    # print(f"workout_id: {workout_id} | exercise_id: {exercise_id} | date: {date}")
    print(f"workout_id: {workout_id} | exercise_id: {exercise_id}")
    print(f"log_data: {log_data}")
    # print(f"exercise log entry: {log_data['log']['reps']} reps @ {log_data['log']['weight']} lbs")
    print(f"exercise log entry date: {log_data['date']}")
    for i, log in enumerate(log_data['log']):
        print(f"exercise set {i+1}: {log['reps']} reps @ {log['weight']} lbs")

    # Create and add the workout log
    # Multiple log entries for each set
    for index, log in enumerate(log_data['log']):
        print(f"index: {index} | log: {log}")
        log = WorkoutLog(workouts_id=workout_id, sets=index+1, reps=log['reps'], weight_lbs=log['weight'], exercise_id=exercise_id, date=date_for_table)
        db.session.add(log)
        db.session.commit()

    return jsonify({'message': 'workout exercise entry logged for sets and reps'}), 200

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

