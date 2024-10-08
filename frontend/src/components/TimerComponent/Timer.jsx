import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, DeleteButton, Sheet, AddEditWorkout, MessageItem, RestTimer } from '../styles/styles';
import { saveAs } from 'file-saver';

import { AppContext } from '../../App';

export const Timer = () => { 
    const { timer, setTimer, timerRunning, setTimerRunning } = useState(0);

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
};