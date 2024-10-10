import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, DeleteButton, Sheet, AddEditWorkout, MessageItem, RestTimer } from '../styles/styles';
import { saveAs } from 'file-saver';

import { AppContext } from '../../App';

export const WorkoutLogs = () => {
    const { skipInitialRender, setSkipInitialRender, selectedExercise, selecteDate, setLogDebug,
    logDebug, setExerciseLogs, exerciseLogs, logModalIsOpen, setCurrentLogs, currentLogs, selectedDate, 
    setSelectedDate, selectedWorkout, datesForCurrentLogs, setDatesForCurrentLogs, setLogModalIsOpen,
setSelectedExercise } = useContext(AppContext);

    // Exercise Logs 
  useEffect(() => {
    if (skipInitialRender) {
      setSkipInitialRender(false);
      return;
    }

    console.log('From Log Hook -> Selected Workout Data: ', selectedWorkout)
    console.log('From Log Hook -> Selected Workout: ', selectedWorkout.title);
    console.log('From Log Hook -> Selected Exercise: ', selectedExercise.name);
    console.log('From Log Hook -> Selected Date: ', selectedDate);
    console.log('From Log Hook -> Selected Exercise Data: ', selectedExercise);

    setLogDebug(true);
    if (logDebug) {
      // Load logs from the backend for current date
      const loadLogs = async () => {
        try {
          const response = await fetch(`/api/logs/get/${selectedWorkout.id}/${selectedExercise.id}`);
          if(!response.ok) {
            throw new Error('Failed to load logs');
          }
          const data = await response.json();
          console.log('Log Data Loaded: ', data);

          if (!data || data.length === 0) {
            setExerciseLogs({});
          } else {
            setExerciseLogs(data);
          }
        console.log('Exercise Logs Loaded: ', exerciseLogs);
      } catch (error) {
        console.error('Failed to load logs', error);
        setExerciseLogs({});
      }
    }
    loadLogs();
  }

    // // Safely check if exercise logs exist for selected workout, exercise, and date
    // const exerciseLogsForWorkout = exerciseLogs?.[selectedWorkout?.title];
    // const exerciseLogsForExercise = exerciseLogsForWorkout?.[selectedExercise?.name];
    // const exerciseLogsForDate = exerciseLogsForExercise?.[selectedDate];
    // // if (!exerciseLogs[selectedWorkout?.title][selectedExercise?.name][selectedDate]) {
    // if (!exerciseLogsForDate || exerciseLogsForDate.length === 0) {
    //   setCurrentLogs([{ reps: '', weight: '' }]);
    // } else {
    //   setCurrentLogs(exerciseLogs[selectedWorkout?.title][selectedExercise?.name][selectedDate] || []);
    // }
    // console.log('ExerciseLogs: ', exerciseLogs);
  }, [logModalIsOpen]);

  // New useEffect that runs whenever exerciseLogs changes
useEffect(() => {
  if (!exerciseLogs || Object.keys(exerciseLogs).length === 0) {
    // No logs found for the selected workout/exercise/date
    setCurrentLogs([{ reps: '', weight: '' }]);
    console.log('No logs found for the selected workout/exercise/date');
  } else {
    // Safely check if exercise logs exist for selected workout, exercise, and date
    const exerciseLogsForWorkout = exerciseLogs?.[selectedWorkout?.title];
    const exerciseLogsForExercise = exerciseLogsForWorkout?.[selectedExercise?.name];
    const exerciseLogsForDate = exerciseLogsForExercise?.[selectedDate];

    // const logsForDate = exerciseLogs?.[selectedWorkout?.id]?.[selectedExercise?.id]?.[selectedDate] || [];
    const logsForDate =  Object.values(exerciseLogs).filter(log => log.exercise_id === selectedExercise.id);
    const forCurrentLogs = []
    Object.values(exerciseLogs).forEach(log => {
      if (log.exercise_id === selectedExercise.id && log.date === selectedDate) {
        forCurrentLogs.push({'reps': log.reps, 'weight': log.weight_lbs});
        // console.log('log entry made');
      }
      // console.log('log entry not made');
      // console.log('log date: ', log.date);
      // console.log('selected date: ', selectedDate);
      // console.log('log exercise id: ', log.exercise_id);
      // console.log('selected exercise id: ', selectedExercise.id);
    });

    // if (!exerciseLogsForDate || exerciseLogsForDate.length === 0) {
    if (!forCurrentLogs || forCurrentLogs.length === 0) {
      setCurrentLogs([{ reps: '', weight: '' }]);
      console.log('Setting current logs to empty array');
    } else {
      // setCurrentLogs(exerciseLogsForDate);
      setCurrentLogs(forCurrentLogs);
      console.log('Now setting current logs to: ', forCurrentLogs);
    }
    console.log('Current Selected Exercise Name: ', selectedExercise.name);
    console.log('Current Selected Exercise ID: ', selectedExercise.id);
    console.log('Current Logs Set To:', exerciseLogsForDate);
    console.log('Current Logs Set To (TEST):', logsForDate);
    console.log('Current Logs Set To (TEST2):', forCurrentLogs);
    console.log('Current Logs Exist (TEST):', exerciseLogs);

  }
  console.log('Current Date for Select Date: ', selectedDate);
// }, [logModalIsOpen]);  // This effect runs whenever the logs or selection change
// }, [datesForCurrentLogs]);  // This effect runs whenever the logs or selection change
}, [selectedDate]);  // This effect runs whenever the logs or selection change

  useEffect(() => {
    console.log('Current Logs after set: ', currentLogs);
  }, [currentLogs]);



  const handleCloseLogModal = () => {
    // setCurrentLogs([]);
    setLogModalIsOpen(false);
    setSelectedDate(new Date().toLocaleDateString());
  }


  const handleAddLogRow = () => {
    setCurrentLogs(prevLogs => [
      ...prevLogs,
      { reps: '', weight: '' }, // Add a new log row with empty values
    ]);
  };

  const handleRemoveLogRow = () => {
    setCurrentLogs(prevLogs => prevLogs.slice(0, -1)); // Remove the last log row
  }

  const handleLogSubmit = (event) => {
    console.log('Current Logs for Submit: ', currentLogs);

    const saveLogs = async () => {
      const logData = {
        log: currentLogs,
        date: selectedDate,
      };
      try {

        /* TODO: Should change to make a GET request to endpoint for handling logs -- 
        1. If the logs do not exist, then this GET request will get handled on the backend to add the entries to the database.
        2. If the entries already exist, and they are the same as the data in the request, then the backend will not do anything.
        3. If the entries already exist, but they are different than the data in the request, then the backend will update the entries in the database.
        4. If the entries already exit, but a row is added, then the row wil be added to the database. 
        5. If the entries already exist, but a row is removed, then the row will be removed from the database.
        6. If a delete logs requesut is made, then the backend will delete the logs from the database the given date, 
        workout_id, and exercise_id.
        */

        const response = await fetch(`/api/workoutlogs/add/${selectedWorkout.id}/${selectedExercise.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // body: JSON.stringify(currentLogs),
          body: JSON.stringify(logData),
        }); 
      } catch (error) {
        console.error('Failed to save logs', error);
      }
    }
    saveLogs();

    setExerciseLogs(prev => ({
      ...prev,
      [selectedWorkout.title]: {
        ...prev[selectedWorkout.title],
        [selectedExercise.name]: {
          ...prev[selectedWorkout.title]?.[selectedExercise.name],
          [selectedDate]: currentLogs,
        },
      },
    }))

    console.log('Exercise Logged for: ', selectedExercise.name);
    handleCloseLogModal(); 
    setSelectedDate(new Date().toLocaleDateString());
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    console.log("Date changed to:", newDate);
    
    // Add any additional logic or checks here if necessary
    setSelectedDate(newDate);
  };

  const handleLogChange = (event, index) => { // Simply updates the currentLogs state with the new value as it is being typed in for input fields. 
    console.log('Log Change', event.target.placeholder);
    console.log('Input', event.target.value);
    setCurrentLogs(prev => {
      const newLogs = [...prev];
      const [property, logIndex] = index.split('-');
      newLogs[logIndex][property] = event.target.value;
      return newLogs;

    });
  }

  const handleRemoveAllLogs = () => {
    console.log('Removing all logs now...')
    return alert('Are you sure you want to delete all logs?');
  }

  // Group logs by date and ensure dates are unique
  // const groupedLogs = exerciseLogs.reduce((acc, log) => {
  //   const dateKey = new Date(log.date).toLocaleDateString(); // Format the date
  //   if (!acc[dateKey]) {
  //     acc[dateKey] = [];
  //   }
  //   acc[dateKey].push(log);
  //   return acc;
  // }, {});

  // // Get the unique dates for the selected exercise
  // const uniqueDates = Object.keys(groupedLogs);

  useEffect(() => {
    // setCurrentLogs(exerciseLogs[selectedDate])
  }, [selectedDate])

  return (
    <Modal isOpen={logModalIsOpen}>
        <h2>{selectedExercise?.name} Log</h2>

        {/* Date Picker */}
        {/* <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}> */}
        <select value={selectedDate} onChange={handleDateChange}>
        <option value={new Date().toLocaleDateString()}>Today</option>
        {/* {Object.keys(groupedLogs).map(date => ( */}
        {/* {uniqueDates.map(date => ( */}
        {/* {Object.keys(exerciseLogs[selectedWorkout?.id][selectedExercise?.id] || {}).map(date => ( */}
        {/* {Object.keys(exerciseLogs[selectedExercise?.name] || {}).map(date => (
            <option key={date} value={date}>{date}</option>
        ))} */}
        {Array.from(datesForCurrentLogs).map(date => (
            <option key={date} value={date}>{date}</option>
        ))}
        </select>

        <form onSubmit={() => handleLogSubmit(selectedExercise.name)}>
        {currentLogs.map((log, index) => (
        <div key={index}>
            <label>Set {index + 1}</label>
            <input 
            type="number" 
            value={log.reps} 
            onChange={(e) => handleLogChange(e, `reps-${index}`)}
            placeholder="Reps"
            />
            <input 
            type="number" 
            value={log.weight} 
            onChange={(e) => handleLogChange(e, `weight-${index}`)}
            placeholder="Weight"
            />
        </div>
        ))}
        <Button type="button" onClick={handleAddLogRow}>Add Set</Button>
        <Button type="button" onClick={handleRemoveLogRow}>Remove Set</Button>
        <Button type="submit">Save Log</Button>
        <DeleteButton type="button">Delete All Logs</DeleteButton>
        <Button type="button" onClick={handleCloseLogModal}>Cancel</Button>
    </form>
    </Modal>

  )
}