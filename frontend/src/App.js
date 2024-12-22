import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';
import { Container } from './components/styles/styles';
import { UI } from './components/UIComponent/UI';
import { Workout } from './components/WorkoutComponent/Workout';
import { WorkoutLogs } from './components/WorkoutLogsComponent/WorkoutLogs';

export const AppContext = React.createContext();

const App = () => {
  // DATA / ACTIONS
  
    // Time & Date
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());

    const [timer, setTimer] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);

    const [time, setTime] = useState(new Date().toLocaleTimeString());

    // Workout Handling
    const [workoutModalIsOpen, setWorkoutModalIsOpen] = useState(false);
    const [workoutName, setWorkoutName] = useState('');
    const [workouts, setWorkouts] = useState([{}]);
    const [selectedWorkout, setSelectedWorkout] = useState({title: '', exercises: []});
    const [editWorkout, setEditWorkout] = useState(false);

    // Exercise Handling
    const [exercises, setExercises] = useState([{name: '', sets: '', reps: '', rest: ''}]);
    const [selectedExercise, setSelectedExercise] = useState(null);

    // Workout Logging
    const [logModalIsOpen, setLogModalIsOpen] = useState(false);
    const [exerciseLogs, setExerciseLogs] = useState({});
    const [currentLogs, setCurrentLogs] = useState([]);
    const [loggedDates, setLoggedDates] = useState([]);
    const [logDebug, setLogDebug] = useState(true);
    const [logInit, setLogInit] = useState(false);
    const [datesForCurrentLogs, setDatesForCurrentLogs] = useState([]);

    // Utiltiies 
    const [skipInitialRender, setSkipInitialRender] = useState(false);
    const [content, setContent] = useState(null);

  // Render the app
  return (
    <Container>
    <AppContext.Provider value={
      { 
          selectedDate, 
          setSelectedDate, 
          timer, 
          setTimer, 
          timerRunning, 
          setTimerRunning, 
          time, 
          setTime, 
          workoutModalIsOpen, 
          setWorkoutModalIsOpen, 
          workoutName, 
          setWorkoutName, 
          workouts, 
          setWorkouts, 
          selectedWorkout, 
          setSelectedWorkout, 
          editWorkout, 
          setEditWorkout, 
          exercises, 
          setExercises, 
          selectedExercise, 
          setSelectedExercise, 
          logModalIsOpen, 
          setLogModalIsOpen, 
          logInit,
          setLogInit,
          exerciseLogs, 
          setExerciseLogs, 
          currentLogs, 
          setCurrentLogs, 
          loggedDates, 
          setLoggedDates, 
          logDebug, 
          setLogDebug, 
          datesForCurrentLogs, 
          setDatesForCurrentLogs, 
          skipInitialRender, 
          setSkipInitialRender,
          content,
          setContent
        }
      }>
      <Workout />
      <WorkoutLogs />
      <UI /> 
    </AppContext.Provider>
    </Container>
  );
};

export default App;
