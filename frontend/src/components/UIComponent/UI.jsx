import React, { useEffect, useState} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, DeleteButton, Sheet, AddEditWorkout, MessageItem, RestTimer } from './components/styles/styles';
import { saveAs } from 'file-saver';

export const UI = () => {
    const today = new Date();
    const date = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    // Clock
    useEffect(() => {
        const interval = setInterval(() => {
        setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return(
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
    )
}