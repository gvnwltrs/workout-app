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

    useEffect(() => {
        loadLogDataFromDB();
    }, []);

    useEffect(() => {
        handleLoadLogsForSelectedData();
    }, [selectedDate]);

    useEffect(() => {
        logOutCurrentState('WorkoutLogs');
    }, [currentLogs]);

    const loadLogDataFromDB = () => {
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
    }

    const handleLoadLogsForSelectedData = () => {
        if (checkLogsExist()) {
          setCurrentLogs([{ reps: '', weight: '' }]);
          console.log('No logs found for the selected workout/exercise/date');
        } else {
          const logsForDate = getLogsForDate();
          setLogsForModal(logsForDate);
        }
    }

    const checkLogsExist = () => {
      return !exerciseLogs || Object.keys(exerciseLogs).length === 0
    }

    const getLogsForDate = () => {
        const logs = [];
        Object.values(exerciseLogs).forEach(log => {
            if (logExistsForDate(log)) {
              logs.push({'reps': log.reps, 'weight': log.weight_lbs});
            }
        });
        return logs;
    }

    const logExistsForDate = (log)  => {
        return log.exercise_id === selectedExercise.id && log.date === selectedDate;
    }

    const logOutCurrentState = (componentStr) => {
        const exerciseLogsForWorkout = exerciseLogs?.[selectedWorkout?.title];
        const data = {
            'exerciseLogs': exerciseLogs,
            'selectedData': selectedDate,
        }
        console.log(`Logs from ${componentStr} component: ${JSON.stringify(data)}`);
        console.log('Current Date for Select Date: ', selectedDate);
        console.log('Current Logs after set: ', currentLogs);
    }

    const setLogsForModal = (logs) => {
        if (!logs || logs.length === 0) {
          setCurrentLogs([{ reps: '', weight: '' }]);
          console.log('Setting current logs to empty array');
        } else {
          setCurrentLogs(logs);
          console.log('Now setting current logs to: ', logs);
        }
    }

    const handleCloseLogModal = () => {
      setLogModalIsOpen(false);
      setSelectedDate(new Date().toLocaleDateString());
    }

    const handleAddLogRow = () => {
      setCurrentLogs(prevLogs => [
        ...prevLogs,
        { reps: '', weight: '' },
      ]);
    };

    const handleRemoveLogRow = () => {
      setCurrentLogs(prevLogs => prevLogs.slice(0, -1));
    }

    const updateLogsDB = (event) => {
      event.preventDefault(); 
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

    const handleDateChange = (e) => {
      const newDate = e.target.value;
      console.log("Date changed to:", newDate);
      
      // Add any additional logic or checks here if necessary
      setSelectedDate(newDate);
    };

    const handleInput = (event, index) => {
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

    return (
        <Modal isOpen={logModalIsOpen}>
            <h2>{selectedExercise?.name} Log</h2>

            {/* Date Picker */}
            <select value={selectedDate} onChange={handleDateChange}>
            <option value={new Date().toLocaleDateString()}>Today</option>
            {Array.from(datesForCurrentLogs).map(date => (
                <option key={date} value={date}>{date}</option>
            ))}
            </select>

            {/* Logs Form */}
            <form onSubmit={updateLogsDB}>
            {currentLogs.map((log, index) => (
            <div key={index}>
                <label>Set {index + 1}</label>
                <input 
                type="number" 
                value={log.reps} 
                onChange={(e) => handleInput(e, `reps-${index}`)}
                placeholder="Reps"
                />
                <input 
                type="number" 
                value={log.weight} 
                onChange={(e) => handleInput(e, `weight-${index}`)}
                placeholder="Weight"
                />
            <button type="button" onClick={() => handleAddLogRow()}>+</button>
            <button type="button" onClick={() => handleRemoveLogRow()}>-</button>
            </div>
            ))}
            <Button type="submit">Save Log</Button>
            <DeleteButton type="button" onClick={handleRemoveAllLogs}>Delete All Logs</DeleteButton>
            <Button type="button" onClick={handleCloseLogModal}>Cancel</Button>
        </form>
        </Modal>
    )
};
