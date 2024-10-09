import React, { useEffect, useState} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, DeleteButton, Sheet, AddEditWorkout, MessageItem, RestTimer } from './components/styles/styles';
import { saveAs } from 'file-saver';

export const DateHandler = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());
}