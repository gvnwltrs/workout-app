import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';

import { Header, Button, Sheet, AddEditWorkout } from '../styles/styles';

// import { Timer, TimerContext } from '../TimerComponent/Timer';
import { AppContext } from '../../App';

export const UI = () => {
    const { selectedWorkout, setSelectedWorkout, setExercises, timerRunning, setTime, timer, setTimer, setTimerRunning, time,
        workouts, exportWorkout, setSelectedExercise, setLogModalIsOpen,
    exerciseLogs, selectedExercise, setDatesForCurrentLogs, setWorkoutModalIsOpen, setEditWorkout, 
setWorkoutName, setWorkouts, exercises, openCloseWorkoutModal} = useContext(AppContext);

    const today = new Date();
    const date = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
        setWorkoutModalIsOpen(true);
        setEditWorkout(true);
        setWorkoutName(selectedWorkout.title);
        
        console.log('selectedWorkout: ', selectedWorkout);
        const response = await fetch(`/api/exercises/${selectedWorkout.id}`);
        const data = await response.json();

        setExercises(data);
    }

    const deleteWorkout = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this workout?');
        if (!confirmDelete) {
        return;
        }
        await fetch(`/api/workouts/${selectedWorkout.id}`, {
        method: 'DELETE',
        });
    
        // Update the workouts state
        const newWorkouts = workouts.filter(workout => workout.id !== selectedWorkout.id);
        setWorkouts(newWorkouts);
    
        // Set the selectedWorkout state to the first workout in the workouts array
        if (newWorkouts.length > 0) {
        setSelectedWorkout(newWorkouts[0]);
        } else {
        setSelectedWorkout(null); // or set to an empty workout object if it makes more sense in your context
        }
    
        // Close the modal
        setWorkoutModalIsOpen(false);
    };

    const updateWorkout = async (newWorkoutsData) => { // newWorkoutsData is the new data we want to update coming from the form
        console.log('newWorkoutsData', newWorkoutsData);
        let response = await fetch(`/api/workouts/${selectedWorkout.id}`, { 
        method: 'PUT', // use PUT to update the data instead of POST
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkoutsData),
        });
        let data = await response.json(); // check if the response is ok
        setSelectedWorkout(data); // set the new workout as the selected workout
        setWorkouts(prev => prev.map(workout => workout.id === data.id ? data : workout));

        // Update the exercises
        const updatedExercises = [];
        for (const exercise of exercises) {
        if (exercise.id) {
            const response = await fetch(`/api/exercises/${exercise.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(exercise),
            });
            const updatedExercise = await response.json();
            updatedExercises.push(updatedExercise);
        } else {
            const response = await fetch(`/api/exercises/${selectedWorkout.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(exercise),
            });
            const newExercise = await response.json();
            updatedExercises.push(newExercise);
        }
        }

        // Fetch the updated workout
        response = await fetch(`/api/exercises/${selectedWorkout.id}`);
        data = await response.json();

        if (Array.isArray(workouts)) {
        setWorkouts(prev => prev.map(workouts => workouts.id === data.id ? data : workouts)); // should update the workouts array with the new workout name 
        }

        setSelectedWorkout(prev => ({ ...prev, exercises: updatedExercises })); // update the selected workout with the new exercises
        setWorkoutModalIsOpen(false);
    }

    const handleInput = (index, event) => {
        const values = [...exercises];
        values[index][event.target.name] = event.target.value;
        setExercises(values);
    };

    const handleCancelEditWorkout = () => {
        openCloseWorkoutModal(false);
        setExercises([{name: '', sets: '', reps: '', rest: ''}]);
    }

    
    const handleOpenLogModal = (exercise) => {
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
        console.log('Dates for current logs: ', dates);
        if (dates.size === 0) {
        } else {
        setDatesForCurrentLogs(dates);
        }
    }

    const loadWorkout = async (workoutsId) => {
        const workoutsResponse = await fetch(`/api/workouts/${workoutsId}`); // transmits data incrementally from HTTP server: GET by default
        const workoutsData = await workoutsResponse.json(); // using another await to make sure we process the whole response
        setSelectedWorkout(workoutsData);

        const exercisesResponse = await fetch(`/api/exercises/${workoutsId}`);
        const exercisesData = await exercisesResponse.json();
        setExercises(exercisesData);

        // const logsResponse = await fetch(`/api/logs/${workoutsId}`);
        // const logsData = await logsResponse.json();
        // setExerciseLogs(logsData);
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
            <Button onClick={exportWorkout}>Export Workout</Button>
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