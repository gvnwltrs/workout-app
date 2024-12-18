import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';

import { Header, Button, Sheet, AddEditWorkout } from '../styles/styles';

// import { Timer, TimerContext } from '../TimerComponent/Timer';
import { AppContext } from '../../App';

export const UI = () => {
    // DATA
    const { selectedWorkout, setSelectedWorkout, setExercises, timerRunning, setTime, timer, setTimer, setTimerRunning, time,
        workouts, exportWorkout, setSelectedExercise, setLogModalIsOpen,
    exerciseLogs, selectedExercise, exercises, setDatesForCurrentLogs, setWorkoutModalIsOpen, setEditWorkout, 
setWorkoutName } = useContext(AppContext);

    // ACTIONS
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
        console.log(`load workout data: ${JSON.stringify(workouts)}`);
        setSelectedWorkout(workouts[workoutsId]);

        console.log(`load exercise data for workouts: ${JSON.stringify(exercises)}`);
        setExercises(exercises[workoutsId]);
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
