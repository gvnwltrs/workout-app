import { render, screen, act } from '@testing-library/react';
import App from '../../App';

test('renders App title', () => {
  render(<App />);
  //const linkElement = screen.getByText(/learn react/i);
  const linkElement = screen.getByText("Simple Workout App");
  expect(linkElement).toBeInTheDocument();
});

