import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, DeleteButton, Sheet, AddEditWorkout, MessageItem, RestTimer } from '../styles/styles';
import { saveAs } from 'file-saver';

import { AppContext } from '../../App';

// DATA
export const WorkoutLogs = () => {
    const { 
            skipInitialRender, 
            setSkipInitialRender, 
            selectedExercise, 
            selecteDate, 
            setLogDebug,
            logDebug, 
            setExerciseLogs, 
            exerciseLogs, 
            logModalIsOpen, 
            setCurrentLogs, 
            currentLogs, 
            selectedDate, 
            setSelectedDate, 
            selectedWorkout, 
            datesForCurrentLogs, 
            setDatesForCurrentLogs, 
            setLogModalIsOpen,
            setSelectedExercise,
            logInit,
            setLogInit,
            content,
            setContent
  } = useContext(AppContext);

    useEffect(() => {
        loadLogDataFromDB();
    }, []);

    useEffect(() => {
      console.log('Exercise Logs Stored.');
    }, [exerciseLogs]);

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
              // console.log('Log Data Received: ', data);

              if (!data || data.length === 0) {
                setExerciseLogs([{}]);
                console.log('No log data...')
              } else {
                setExerciseLogs(data);
                // console.log('Found log data!')
                // console.log('Should be: ', data)
              }
            } catch (error) {
              console.error('Failed to load logs', error);
              setExerciseLogs([{}]);
            }
        }
        loadLogs();
    }

    const handleLoadLogsForSelectedData = () => {
        // if (!logInit) {
        //   console.log('Logs not initialized yet.')
        //   setLogInit(true);
        //   return;
        // }
        if (checkLogsExist()) {
          setCurrentLogs([{ reps: '', weight: '' }]);
          console.log('No logs found for the selected workout/exercise/date');
        } else {
          const logsForDate = getLogsForDate();
          console.log('Logs found for date. Setting in modal.');
          setLogsForModal(logsForDate);
        }
    }

    const checkLogsExist = () => {
      return !exerciseLogs || Object.keys(exerciseLogs).length === 0
    }

    // TODO: Ensure safety
    const getLogsForDate = () => {
        const logs = [];
        Object.values(exerciseLogs).reverse().forEach(log => { // get the last log entered
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
        if (!logInit) {
          return;
        }
        const exerciseLogsForWorkout = exerciseLogs?.[selectedWorkout?.title];
        const data = {
            'exerciseLogs': exerciseLogs,
            'selectedData': selectedDate,
        }
        console.log(`Logs from ${componentStr} component: ${JSON.stringify(data)}`);
        console.log('Current Date for Select Date: ', selectedDate);
        console.log('Current Logs after input: ', currentLogs);
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
      setCurrentLogs([{reps: '', weight: ''}]);
      setLogModalIsOpen(false);
      setSelectedDate(new Date().toLocaleDateString());
      setContent(null);
    }

    const handleAddLogRow = (set) => {
      console.log(`set value: ${set}`);
      setCurrentLogs(prevLogs => [
        ...prevLogs,
        { reps: '', weight: '' },
      ]);
    };

    const handleRemoveLogRow = (index) => {
      console.log("Remove Row: Current Index -> ", index);
      if (index <= 0) {
        setCurrentLogs([{'reps': '', 'weight': ''}]);
      } else {
        setCurrentLogs(prevLogs => prevLogs.slice(0, -1));
      }
    }

    const addLog = (event) => {
      event.preventDefault(); 
      console.log('Log submitted')
      const saveLogs = async () => {
        const logData = {
          workout_id: selectedWorkout.id,
          exercise_id: selectedExercise.id,
          date: selectedDate,
          log: currentLogs,
        };
        console.log('Log to submit: ', logData);
        try {
            const response = await fetch(`/api/workoutlogs/add`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(logData),
            }); 
            if (response.ok) {
              console.log('Log saved successfully');
              loadLogDataFromDB();
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
      let emptyLog = [{'reps': '', 'weight': ''}];
      let logToSet = emptyLog;
      exerciseLogs.reverse().forEach(log => {
        if (log['date'] == newDate && log['exercise_id'] == selectedExercise['id']) {
          logToSet = JSON.parse(log['log']); // have to covert JSON to real type
        }
      })

      setSelectedDate(newDate);
      if (logToSet != emptyLog) {
        setCurrentLogs(logToSet);
        setContent(null);
      } else {
        setContent(
          <div>
            <br />
            <p>No logs for current date.</p>
          </div>
        );
      }
    };

    const handleInput = (event, index) => {
      setCurrentLogs(prev => {
        const newLogs = [...prev];
        const [property, logIndex] = index.split('-');
        newLogs[logIndex][property] = event.target.value;
        return newLogs;
      });
    }

    // FIXME: have to handle dates properly on the backend
    const handleRemoveLogsForSelection = async () => {
      console.log('Removing all logs now...')
      alert('WARNING: you are going to delete only this log for the current date.');
      const _date = {'date': selectedDate};
      const result = await fetch(`/api/workoutlogs/remove/${selectedWorkout.id}/${selectedExercise.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(_date),
      });
      const response = await result.json()
      alert(JSON.stringify(response.message));
      let emptyLog = [{'reps': '', 'weight': ''}];
      setCurrentLogs(emptyLog);
      loadLogDataFromDB();
    }

    // TODO: Implement
    const handleRemoveAllLogsForSelection = async () => {
      console.log('Removing all logs now...')
      return alert('Are you sure you want to delete all logs?');
      await fetch(`/api/workoutlogs/remove_all/${selectedWorkout.id}/${selectedExercise.id}`, {
        method: 'DELETE',
      });
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
            <form onSubmit={addLog}>
            {currentLogs.map((log, index) => (
            <div key={index}>
                <label>Set {index + 1}</label>
                <input 
                type="number" 
                value={log.reps} 
                onChange={(e) => handleInput(e, `reps-${index}`)}
                placeholder="Reps"
                required
                />
                <input 
                type="number" 
                value={log.weight} 
                onChange={(e) => handleInput(e, `weight-${index}`)}
                placeholder="Weight"
                required
                />
            <button type="button" onClick={() => handleAddLogRow(index + 2)}>+</button>
            <button type="button" onClick={() => handleRemoveLogRow(index)}>-</button>
            </div>
            ))}
            <Button type="submit">Save Log</Button>
            <DeleteButton type="button" onClick={handleRemoveLogsForSelection}>Delete Log</DeleteButton>
            <Button type="button" onClick={handleCloseLogModal}>Cancel</Button>
            {content}
        </form>
        </Modal>
    )
};
