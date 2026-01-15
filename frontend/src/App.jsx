import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  // We return a Fragment (<>...</>) to ensure no extra divs
  // restrict the Dashboard's full-screen layout.
  return (
    <>
      <Dashboard />
    </>
  );
}

export default App;