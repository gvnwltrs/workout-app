import React, { useEffect, useState} from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { Container, Header, Input, Button, Sheet, MessageItem } from './components/styles/styles';

const App = () => {
  const [exerciseModalIsOpen, setExerciseModalIsOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutModalIsOpen, setWorkoutModalIsOpen] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises] = useState({name: '', sets: '', reps: '', rest: ''});
  const [editingIndex, setEditingIndex] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    const loadWorkouts = async () => {
      const response = await fetch('/api/workouts'); 
      const data = await response.json(); 
      setWorkouts(data);
      setSelectedWorkout(data[data.length -1]); // set the last workouts as the current workouts
    };
    loadWorkouts();
  }, []);

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

  const startTimer = (rest) => {
    setTimer(rest);
    setTimerRunning(true);
  }

  const pauseTimer = () => {
    setTimerRunning(false);
  } 

  const resetTimer = () => {
    setTimer(null);
    setTimerRunning(false);
  };

  const openExerciseModal = () => {
    setExerciseModalIsOpen(true);
  };

  const closeExerciseModal = () => {
    setExerciseModalIsOpen(false);
  }

  const closeWorkoutsModal = () => {
    setWorkoutModalIsOpen(false);
  }

  const loadWorkout = async (workoutsId) => {
    const workoutsResponse = await fetch(`/api/workouts/${workoutsId}`);
    const workoutsData = await workoutsResponse.json();
    setSelectedWorkout(workoutsData);

    const exerciseResponse = await fetch(`/api/workouts/${workoutsId}/exercises`);
    const exercises = await exerciseResponse.json();
    setExercises(exercises);
  };


  const addWorkout = async () => {
    const workoutsData = { title: workoutName , exercises: [] };
    const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutsData),
    });
    const data = await response.json(); 
    setWorkouts(prev => [...prev, data]);
    setSelectedWorkout(data);
    setWorkoutName('');
    setWorkoutModalIsOpen(false);
  };

  const deleteWorkout = () => {}

  const editWorkout = async (newworkoutsData) => {
    const response = await fetch(`/api/workouts/${selectedWorkout.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newworkoutsData),
    });
    const data = await response.json();
    setWorkouts(prev => prev.map(workouts => workouts.id === data.id ? data : workouts));
    setSelectedWorkout(data);
  }

  const addExercise = async () => {
    const response = await fetch(`/api/workouts/${selectedWorkout.id}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exercises),
    });
    const data = await response.json();
    setSelectedWorkout(prev => ({ ...prev, exercises: [...prev.exercises, data] }));
    setExerciseModalIsOpen(false);
  };

  const deleteExercise = () => {}

  const editExercise = (index) => {
    // setEditingIndex(index);
    setExerciseModalIsOpen(true);
  }


  return (
    <Container>
      <Header>
        <p>Simple Workout App</p>
      </Header>
      <Sheet>
        <select onChange={e => loadWorkout(e.target.value)}>
          <option>Select a workout</option>
          {workouts.map((workouts, index) => (
            <option key={index} value={workouts.id}>{workouts.title}</option>
          ))}
        </select>
        <Button onClick={() => setWorkoutModalIsOpen(true)}>Add Workout</Button>
        {selectedWorkout ? (
          <>
            <Button onClick={openExerciseModal}>Add Exercise</Button>
            <Header>{selectedWorkout.title}</Header>
            <table>
              <thead>
                <tr>
                <th></th>
                  <th>Exercise  </th>
                  <th>Sets  </th>
                  <th>Reps  </th>
                  <th>Rest  </th>
                  <th>Timer  </th>
                  <th>Progress </th>
                </tr>
              </thead>
              <tbody>
                {selectedWorkout && selectedWorkout.exercises.map((exercise, index) => ( 
                <tr key={index}>
                  <td>
                      <button onClick={() => editExercise(index)}>Edit</button>
                  </td>
                  <td>{exercise.name}</td>
                  <td>{exercise.sets}</td>
                  <td>{exercise.reps}</td>
                  <td>{exercise.rest}</td>
                  <td>
                    {timer !== null ? timer : '0'}
                    <button onClick={() => startTimer(exercise.rest)}>Start</button>
                    <button onClick={pauseTimer}>Pause</button>
                    <button onClick={resetTimer}>Reset</button>
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

      <Modal isOpen={workoutModalIsOpen} onRequestClose={closeWorkoutsModal}>
              <h2>Add Workout</h2>
              <form onSubmit={addWorkout}>
              <input
                type="text"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                placeholder="Workout Name"
                required
              />
              <button type="submit">Add Workout</button>
            </form>
      </Modal>

      <Modal isOpen={exerciseModalIsOpen} onRequestClose={addExercise}>
                <form onSubmit={addExercise}>
                  <input
                    type="text"
                    value={exercises.name}
                    onChange={(e) => setExercises(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Exercise"
                  />
                  <input
                    type="number"
                    value={exercises.sets}
                    onChange={(e) => setExercises(prev => ({ ...prev, sets: e.target.value }))}
                    placeholder="Sets"
                  />
                  <input
                    type="number"
                    value={exercises.reps}
                    onChange={(e) => setExercises(prev => ({ ...prev, reps: e.target.value }))}
                    placeholder="Reps"
                  />
                  <input
                    type="number"
                    value={exercises.rest}
                    onChange={(e) => setExercises(prev => ({ ...prev, rest: e.target.value }))}
                    placeholder="Rest"
                  />
                  <button type="Submit">Submit</button>
                  <button type="Submit" onClick={closeExerciseModal}>Cancel</button>
                  </form>
      </Modal>

    </Container>
  );
};

export default App;