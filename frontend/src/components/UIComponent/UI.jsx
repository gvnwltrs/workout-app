import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';

import { Header, Button, Sheet, AddEditWorkout } from '../styles/styles';

// import { Timer, TimerContext } from '../TimerComponent/Timer';
import { AppContext } from '../../App';

export const UI = () => {
    // DATA
    const { selectedWorkout, setSelectedWorkout, setExercises, timerRunning, setTime, timer, setTimer, setTimerRunning, time,
        workouts, exportWorkout, setSelectedExercise, setLogModalIsOpen,
    exerciseLogs, selectedExercise, setDatesForCurrentLogs, setWorkoutModalIsOpen, setEditWorkout, 
setWorkoutName } = useContext(AppContext);

    // ACTIONS
    const today = new Date();
    const date = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // ACTION 
    // Clock
    useEffect(() => {
        const interval = setInterval(() => {
        setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);


    // ACTION 
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

    // ACTION 
     // Timer functions
    const startTimer = (rest) => {
        setTimer(rest);
        setTimerRunning(true);
    }

    // ACTION
    const pauseTimer = () => {
        setTimerRunning(false);
    } 

    // ACTION
    const resetTimer = () => {
        setTimer(0);
        setTimerRunning(false);
    };

    // ACTION
    const resumeTimer = () => {
        setTimerRunning(true);
    }

    // ACTION
    const handleAddWorkout = () => {
        setWorkoutModalIsOpen(true);
        setEditWorkout(false);
        setExercises([{name: '', sets: '', reps: '', rest: ''}]);
    }

    // ACTION
    const handleEditWorkout = async () => {
        setWorkoutModalIsOpen(true);
        setEditWorkout(true);
        setWorkoutName(selectedWorkout.title);
        
        console.log('selectedWorkout: ', selectedWorkout);
        const response = await fetch(`/api/exercises/${selectedWorkout.id}`);
        const data = await response.json();

        setExercises(data);
    }
    
    // ACTION
    const handleOpenLogModal = (exercise) => {
        setSelectedExercise(exercise);
        loadDatesForExercise();
        setLogModalIsOpen(true);
    };

    // ACTION
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

    // ACTION
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

    // ACTION 
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