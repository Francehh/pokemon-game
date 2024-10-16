import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

test('renders the Pokémon Randomizer header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Pokémon Randomizer/i);
  expect(headerElement).toBeInTheDocument();
});
