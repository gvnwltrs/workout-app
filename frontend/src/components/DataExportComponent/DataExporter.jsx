import React, { useEffect, useState} from 'react';
import Modal from 'react-modal';
//import axios from 'axios';
import { Container, Header, Input, Button, DeleteButton, Sheet, AddEditWorkout, MessageItem, RestTimer } from './components/styles/styles';
import { saveAs } from 'file-saver';

export const DataExporter = () => {

    const exportWorkout = async () => {
        console.log('exporting workout...');
    
        // Send a GET request to the export endpoint
        const response = await fetch(`/api/exportWorkouts/${selectedWorkout.id}`);
    
        // Check if the request was successful
        if (!response.ok) {
          console.error('Failed to export workout');
          return;
        }
    
        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition.split('filename=')[1];
    
        // Get the file data from the response
        const blob = await response.blob();
    
        // Use FileSaver to save the file
        saveAs(blob, filename);
      };
}