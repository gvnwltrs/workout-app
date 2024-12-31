import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';

import { Header, Button, Sheet, AddEditWorkout } from '../styles/styles';

// import { Timer, TimerContext } from '../TimerComponent/Timer';
import { AppContext } from '../../App';

export const UI = () => {
    // DATA
    const { 
      selectedWorkout, 
      setSelectedWorkout, 
      setExercises, 
      timerRunning, 
      setTime, 
      timer, 
      setTimer, 
      setTimerRunning, 
      time,
      workouts, 
      exportWorkout, 
      setSelectedExercise, 
      setLogModalIsOpen,
      exerciseLogs, 
      selectedExercise, 
      exercises, 
      setDatesForCurrentLogs, 
      setWorkoutModalIsOpen, 
      setEditWorkout, 
      setWorkoutName,
      setCurrentLogs
  } = useContext(AppContext);

    // ACTIONS
    const today = new Date();
    const date = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const dateMMDDYYY = today.toLocaleDateString('en-US');

    // Clock
    useEffect(() => {
        const interval = setInterval(() => {
        setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);


    // Timer logic
    useEffect(() => {
        let interval = null;
        if (timerRunning && timer > 0) {
        interval = setInterval(() => {
            setTimer(timer => timer - 1);
        }, 1000);
        } else if (!timerRunning && timer !== 0) {
        clearInterval(interval);
        }
        if (timer == 1)
          alert('Rest Time Complete.');
        return () => clearInterval(interval);
    }, [timerRunning, timer]);

     // Timer functions
    const startTimer = (rest) => {
        setTimer(rest);
        setTimerRunning(true);
    }

    const pauseTimer = () => {
        setTimerRunning(false);
    } 

    const resetTimer = () => {
        setTimer(0);
        setTimerRunning(false);
    };

    const resumeTimer = () => {
        setTimerRunning(true);
    }

    const handleAddWorkout = () => {
        setWorkoutModalIsOpen(true);
        setEditWorkout(false);
        setExercises([{name: '', sets: '', reps: '', rest: ''}]);
    }

    const handleEditWorkout = async () => {
        const emptyWorkout = {title: '', exercises: []};
        if (selectedWorkout.title === emptyWorkout.title) {
          alert('No workouts to edit yet...');
          return;
        }
        setWorkoutModalIsOpen(true);
        setEditWorkout(true);
        setWorkoutName(selectedWorkout.title);

        console.log('selectedWorkout: ', selectedWorkout);
        const response = await fetch(`/api/exercises/${selectedWorkout.id}`);
        const data = await response.json();

        setExercises(data);
    }
    
    const handleOpenLogModal = (exercise) => {
        console.log('Exercise is: ', exercise);
        let logToSet = null;
        exerciseLogs.forEach(log => {
          if (log['date'] == dateMMDDYYY && log['exercise_id'] == exercise['id']) {
            logToSet = JSON.parse(log['log']); // have to covert JSON to real type
          }
        })

        // Add any additional logic or checks here if necessary
        if (logToSet != null) {
          setCurrentLogs(logToSet);
        }
        setSelectedExercise(exercise);
        loadDatesForExercise();
        setLogModalIsOpen(true);
    };

    const loadDatesForExercise= () => {
        console.log('Selected Exercise to Extract Dates: ', selectedExercise);
        console.log('ExerciseLogs to Extract Dates: ', exerciseLogs);
        const logsForExercise = Object.values(exerciseLogs).filter(log => log.exercise_id === selectedExercise.id);
        logsForExercise.forEach(log => {
        console.log('Log: ', log);
        });
        console.log('Logs for Exercise: ', logsForExercise);
        Object.values(exerciseLogs).forEach(log => {
        console.log('Log: ', log.date);
        });

        const dates = new Set()
        Object.values(exerciseLogs).forEach(log => {
        dates.add(log.date);
        });
        // console.log('Dates for current logs: ', dates);
        if (dates.size === 0) {
        } else {
        setDatesForCurrentLogs(dates);
        }
    }

    const loadWorkout = async (workoutsId) => {
        workouts.forEach((workout, index) => {
            if (workout["id"] == workoutsId) {
               setSelectedWorkout(workout);
          }
        });
    };

    return(
        <div>
        <Header>
            <h1>Simple Workout App</h1>
            <p>Date: {date}</p>
            <p>Time: {time}</p>
            <p>Rest Timer: {timer}</p>
        </Header>
        <Sheet>
            {/* as soon as we click on a workout we retrieve the available workouts/exercises from our backend */}
            <AddEditWorkout>
            <select onChange={e => loadWorkout(e.target.value)}> 
              <option>Select a workout</option>
              {workouts.map((workouts, index) => (
                  <option key={index} value={workouts.id}>{workouts.title}</option>
              ))}
            </select>
            <Button onClick={handleAddWorkout}>Add Workout</Button>
            <Button onClick={handleEditWorkout}>Edit Workout</Button>
            {/*TODO: Disabled for now. Implement next iteration.*/}
            {/* <Button onClick={exportWorkout}>Export Workout</Button> */}
            </AddEditWorkout>
            {selectedWorkout ? (
            <>
                <Header>{selectedWorkout.title}</Header>
                <table>
                <thead>
                    <tr>
                    <th>Exercise</th>
                    <th>Sets  </th>
                    <th>Reps  </th>
                    <th>Rest  </th>
                    <th>Progress </th>
                    </tr>
                </thead>
                <tbody>
                    {selectedWorkout && selectedWorkout.exercises.map((exercise, index) => ( 
                    <tr key={index}>
                    <td>{exercise.name}</td>
                    <td>{exercise.sets}</td>
                    <td>{exercise.reps}</td>
                    <td>{exercise.rest}</td>
                    <td>
                        {/* {timer !== null ? timer : '0'} */}
                        <button onClick={() => startTimer(exercise.rest)}>Start</button>
                        <button onClick={pauseTimer}>Pause</button>
                        <button onClick={resumeTimer}>Resume</button>
                        <button onClick={resetTimer}>Reset</button>
                    </td>
                    <td>
                        <button onClick={() => handleOpenLogModal(exercise, index)}>Log</button>
                    </td>
                    {/* TODO: <td></td> add progress bar here with new date, set number, and reps performed storage */}
                    </tr>
                    ))}
                </tbody>
                </table>
            </>
            ) : (
            <p>No workouts yet. Click "Add workouts" to create a new workouts.</p>
            )}
        </Sheet>
        </div>
    )
}
