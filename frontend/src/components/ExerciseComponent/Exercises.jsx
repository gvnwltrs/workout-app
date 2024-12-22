import React, { useEffect, useState, useContext} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, DeleteButton, Sheet, AddEditWorkout, MessageItem, RestTimer } from '../styles/styles';
import { saveAs } from 'file-saver';

import { WorkoutContext } from '../WorkoutComponent/Workout';

import { AppContext } from '../../App';

export const Exercises = () => {
    const { selectedWorkout, setSelectedWorkout } = useContext(AppContext);

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
