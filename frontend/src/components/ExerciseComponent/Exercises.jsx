import React, { useEffect, useState} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, DeleteButton, Sheet, AddEditWorkout, MessageItem, RestTimer } from './components/styles/styles';
import { saveAs } from 'file-saver';

export const Exercises = () => {
    const [exercises, setExercises] = useState([{name: '', sets: '', reps: '', rest: ''}]);
    const [selectedExercise, setSelectedExercise] = useState(null);

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
}