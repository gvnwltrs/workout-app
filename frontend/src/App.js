import React, { useEffect, useState} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, Sheet, AddEditWorkout, MessageItem } from './components/styles/styles';

const App = () => {
  const [workoutModalIsOpen, setWorkoutModalIsOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState({title: '', exercises: []});
  const [editWorkout, setEditWorkout] = useState(false);
  const [exercises, setExercises] = useState([{name: '', sets: '', reps: '', rest: ''}]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Initialize workouts for the app by fetching data from the backend
  useEffect(() => {
    const loadWorkouts = async () => {
      const response = await fetch('/api/workouts'); 
      const data = await response.json(); // returns the workouts from the database with the id (generated by database), title, and exercises
      setWorkouts(data);
      setSelectedWorkout(data[data.length -1]); // set the last workouts as the current workouts
    };
    loadWorkouts();
    console.log('workouts', workouts);
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

  // Modal functions
  const openCloseWorkoutModal = (change) => {
    setWorkoutModalIsOpen(change); // true open, false close
  }

  const pauseTimer = () => {
    setTimerRunning(false);
  } 

  const resetTimer = () => {
    setTimer(null);
    setTimerRunning(false);
  };

  const resumeTimer = () => {
    setTimerRunning(true);
  }

  // CRUD functions
  const loadWorkout = async (workoutsId) => {
    const workoutsResponse = await fetch(`/api/workouts/${workoutsId}`); // transmits data incrementally from HTTP server: GET by default
    const workoutsData = await workoutsResponse.json(); // using another await to make sure we process the whole response
    setSelectedWorkout(workoutsData);

    const exercisesResponse = await fetch(`/api/exercises/${workoutsId}`);
    const exercisesData = await exercisesResponse.json();
    setExercises(exercisesData);
  };


  const addWorkout = async () => {
    if (workouts.some(workout => workout.title === workoutName)) {
      alert('Workout already exists');
      return;
    }
    const workoutsData = { title: workoutName , exercises: exercises }; // we send an empty array of exercises to add to the workouts later
    const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutsData),
    });
    const data = await response.json(); // checking to see if the response is ok
    setWorkouts(prev => [...prev, data]); // add the new workouts to the workouts array
    setSelectedWorkout(data); // set the new workout as the selected workout
    setWorkoutName('');
    setWorkoutModalIsOpen(false); // close the modal
  };

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

  const deleteWorkout = () => {}

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

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", rest: "" }]);
  };

  const removeExercise = async (index) => {
    const newExercises = [...exercises];
    const removedExercise = newExercises.splice(index, 1)[0];

    if (newExercises.length === 0) {
      newExercises.push({ name: "", sets: "", reps: "", rest: "" });
    }

    if (removedExercise.id && selectedWorkout.exercises.find(exercise => exercise.id === removedExercise.id)) {
      await fetch(`/api/exercises/${removedExercise.id}`, {
        method: 'DELETE',
      });
    
      setSelectedWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.filter(exercise => exercise.id !== removedExercise.id),
      }));
    }

    setExercises(newExercises);
  };

  const logWorkout = () => {}

  const exportWorkouts = () => {}

  // Render the app
  return (
    <Container>
      <Header>
        <p>Simple Workout App</p>
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
        </AddEditWorkout>
        {selectedWorkout ? (
        <>
            {/* <Button onClick={() => setExerciseModalIsOpen(true)}>Add Exercise</Button> */}
            <Header>{selectedWorkout.title}</Header>
            <table>
              <thead>
                <tr>
                  <th>Exercise</th>
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
                  <td>{exercise.name}</td>
                  <td>{exercise.sets}</td>
                  <td>{exercise.reps}</td>
                  <td>{exercise.rest}</td>
                  <td>
                    {timer !== null ? timer : '0'}
                    <button onClick={() => startTimer(exercise.rest)}>Start</button>
                    <button onClick={pauseTimer}>Pause</button>
                    <button onClick={resumeTimer}>Resume</button>
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

      <Modal isOpen={workoutModalIsOpen}>
              <h2>{editWorkout ? `Edit Workout: ${selectedWorkout.title}` : 'Add Workout'}</h2>
              <form onSubmit={(e) => {
                e.preventDefault(); 
                editWorkout ? updateWorkout({id: selectedWorkout.id, title: workoutName, exercises: exercises}) : addWorkout();
                }}>
                <input
                  type="text"
                  name="title"
                  value={editWorkout ? workoutName : ""}
                  onChange={e => setWorkoutName(e.target.value)}
                  placeholder='Enter new workout name'
                  required
                />
                <><p>Exercises: </p></>

                {exercises.map((exercise, index) => (
                <div key={index}>
                  <input
                    type="text"
                    name="name"
                    value={exercise.name}
                    onChange={(event) => handleInput(index, event)}
                    placeholder="Exercise"
                  />
                  <input
                    type="number"
                    name="sets"
                    value={exercise.sets}
                    onChange={(event) => handleInput(index, event)}
                    placeholder="Sets"
                  />
                  <input
                    type="number"
                    name="reps"
                    value={exercise.reps}
                    onChange={(event) => handleInput(index, event)}
                    placeholder="Reps"
                  />
                  <input
                    type="number"
                    name="rest"
                    value={exercise.rest}
                    onChange={(event) => handleInput(index, event)}
                    placeholder="Rest"
                  />
                <button type="button" onClick={addExercise}>+</button>
                <button type="button" onClick={() => removeExercise(index)}>-</button>
                </div>
                ))}

                <div>
                  <> </>
                  <Button type="submit">{editWorkout ? 'Update' : 'Add Workout'}</Button>
                  {editWorkout ? <Button type="submit" onClick={() => {}}>Delete</Button> : null}
                  <Button type="button" onClick={handleCancelEditWorkout}>Cancel</Button>
                </div>
            </form>
      </Modal>

    </Container>
  );
};

export default App;