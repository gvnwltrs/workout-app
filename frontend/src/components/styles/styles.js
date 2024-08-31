import styled from 'styled-components';

export const Container = styled.div`
  text-align: center;
  padding: 50px;
  font-family: Arial, sans-serif;
`;

export const Header = styled.header`
  background-color: #282c34;
  min-height: 20vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

export const Button = styled.button`
  background-color: #61dafb;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  margin-left: 10px;
  margin-right: 10px;

  &:hover {
    background-color: #21a1f1;
  }
`;

export const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  margin-top: 20px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 300px;
`;

export const Sheet = styled.div`
  background-color: #282c34;
  min-height: 20vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 20px;
  font-size: calc(10px + 2vmin);
  color: white;
  margin-top: 20px;
`;

export const AddEditWorkout = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #f1f1f1;
  color: black;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
`;

export const AddExercise = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #f1f1f1;
  color: black;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
`;

export const MessageItem = styled.div`
  background-color: #f1f1f1;
  color: black;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

export const RestTimer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;