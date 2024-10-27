import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, DeleteButton, Sheet, AddEditWorkout, MessageItem, RestTimer } from '../styles/styles';
import { saveAs } from 'file-saver';

import { AppContext } from '../../App';

// DATA
export const WorkoutLogs = () => {
    const { skipInitialRender, setSkipInitialRender, selectedExercise, selecteDate, setLogDebug,
    logDebug, setExerciseLogs, exerciseLogs, logModalIsOpen, setCurrentLogs, currentLogs, selectedDate, 
    setSelectedDate, selectedWorkout, datesForCurrentLogs, setDatesForCurrentLogs, setLogModalIsOpen,
setSelectedExercise } = useContext(AppContext);

  // ACTION
  // Exercise Logs 
  useEffect(() => {

    // Load logs from the backend for current date
    const loadLogs = async () => {
      try {
        const response = await fetch(`/api/logs/get`);
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
  // }, [logModalIsOpen]);
  }, []);

  // ACTION
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

// ACTION
  useEffect(() => {
    console.log('Current Logs after set: ', currentLogs);
  }, [currentLogs]);

  // ACTION 
  const handleCloseLogModal = () => {
    // setCurrentLogs([]);
    setLogModalIsOpen(false);
    setSelectedDate(new Date().toLocaleDateString());
  }

  // ACTION
  const handleAddLogRow = () => {
    setCurrentLogs(prevLogs => [
      ...prevLogs,
      { reps: '', weight: '' }, // Add a new log row with empty values
    ]);
  };

  // ACTION
  const handleRemoveLogRow = () => {
    setCurrentLogs(prevLogs => prevLogs.slice(0, -1)); // Remove the last log row
  }

  // ACTION
  // const handleLogSubmit = (event) => {
  //   console.log('Current Logs for Submit: ', currentLogs);

  //   const saveLogs = async () => {
  //     const logData = {
  //       log: currentLogs,
  //       date: selectedDate,
  //     };
  //     try {
  //       const response = await fetch(`/api/workoutlogs/add/${selectedWorkout.id}/${selectedExercise.id}`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         // body: JSON.stringify(currentLogs),
  //         body: JSON.stringify(logData),
  //       }); 
  //     } catch (error) {
  //       console.error('Failed to save logs', error);
  //     }
  //   }
  //   saveLogs();

  //   setExerciseLogs(prev => ({
  //     ...prev,
  //     [selectedWorkout.title]: {
  //       ...prev[selectedWorkout.title],
  //       [selectedExercise.name]: {
  //         ...prev[selectedWorkout.title]?.[selectedExercise.name],
  //         [selectedDate]: currentLogs,
  //       },
  //     },
  //   }))

  //   console.log('Exercise Logged for: ', selectedExercise.name);
  //   handleCloseLogModal(); 
  //   setSelectedDate(new Date().toLocaleDateString());
  // };
  const handleLogSubmit = (event) => {
    // console.log('Current Logs for Submit: ', currentLogs);
    event.preventDefault(); // Prevent the form from submitting and refreshing the page automatically
    console.log('Log submitted')
    const saveLogs = async () => {
      const logData = {
        workout_id: selectedWorkout.id,
        exercise_id: selectedExercise.id,
        date: selectedDate,
        log: currentLogs,
      };
      try {
          const response = await fetch(`/api/workoutlogs/handler`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            // body: JSON.stringify(currentLogs),
            body: JSON.stringify(logData),
          }); 
          if (response.ok) {
            console.log('Log saved successfully');
            alert('Log saved successfully');
          }
        } catch (error) {
          console.error('Failed to save logs', error);
        }
    };
    saveLogs();
    
  };

  // ACTION
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    console.log("Date changed to:", newDate);
    
    // Add any additional logic or checks here if necessary
    setSelectedDate(newDate);
  };

  // ACTION
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

  // ACTION
  const handleRemoveAllLogs = () => {
    console.log('Removing all logs now...')
    return alert('Are you sure you want to delete all logs?');
  }

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

        {/* <form onSubmit={() => handleLogSubmit(selectedExercise.name)}> */}
        <form onSubmit={handleLogSubmit}>
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
        <DeleteButton type="button" onClick={handleRemoveAllLogs}>Delete All Logs</DeleteButton>
        <Button type="button" onClick={handleCloseLogModal}>Cancel</Button>
    </form>
    </Modal>

  )
}