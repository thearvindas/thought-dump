import React, { useState, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Whiteboard from './components/Whiteboard';
import ChatInput from './components/ChatInput';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    background-color: #000000;
    font-family: Helvetica, Arial, sans-serif;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
  width: calc(100vw - 48px);
  margin: 24px;
  overflow: hidden;
  background-color: #111111;
  border-radius: 16px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
`;

const WhiteboardContainer = styled.div`
  flex: 1;
  min-height: 0; // Important for flex child
  position: relative;
  background-color: #111111;
  border-radius: 16px;
  overflow: hidden;
`;

const Footer = styled.div`
  position: fixed;
  bottom: 32px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 11px;
  pointer-events: none;
  z-index: 1100;
  padding-bottom: 8px;

  @media (max-width: 900px) {
    bottom: 24px;
    font-size: 10px;
  }

  @media (max-width: 480px) {
    bottom: 16px;
    font-size: 9px;
    padding: 0 16px;
  }
`;

interface WhiteboardRef {
  shakeThoughts: () => void;
  exportToPDF: () => void;
  savePositions: () => { [key: number]: { x: number; y: number } };
  restorePositions: (positions: { [key: number]: { x: number; y: number } }) => void;
}

interface ThoughtState {
  thoughts: Array<{
    id: number;
    text: string;
    color: string;
    size: 'small' | 'medium' | 'large';
    isPinned: boolean;
  }>;
  positions: { [key: number]: { x: number; y: number } };
}

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<Array<{
    id: number;
    text: string;
    color: string;
    size: 'small' | 'medium' | 'large';
    isPinned: boolean;
  }>>([]);
  const [thoughtHistory, setThoughtHistory] = useState<ThoughtState[]>([]);
  const whiteboardRef = useRef<WhiteboardRef>(null);

  // Save current state to history before making changes
  const saveToHistory = () => {
    const positions = whiteboardRef.current?.savePositions() || {};
    setThoughtHistory(prev => [...prev, { thoughts, positions }]);
  };

  const handleThoughtSubmit = (thought: string) => {
    console.log('Submitting thought:', thought);
    
    if (thought.startsWith('/')) {
      // Handle commands
      const [command] = thought.slice(1).split(' ');
      console.log('Command:', command);
      
      switch (command.toLowerCase()) {
        case 'shake':
          saveToHistory();
          whiteboardRef.current?.shakeThoughts();
          return;
        case 'clear':
          saveToHistory();
          setThoughts([]);
          return;
        case 'export':
          whiteboardRef.current?.exportToPDF();
          return;
        case 'undo':
          if (thoughtHistory.length > 0) {
            const previousState = thoughtHistory[thoughtHistory.length - 1];
            setThoughts(previousState.thoughts);
            whiteboardRef.current?.restorePositions(previousState.positions);
            setThoughtHistory(prev => prev.slice(0, -1));
          }
          return;
        default:
          console.log('Unknown command:', command);
          return;
      }
    }

    // Add new thought
    const newThought = {
      id: Date.now(),
      text: thought,
      color: '#ffffff',
      size: 'medium' as const,
      isPinned: false,
    };

    console.log('Adding new thought:', newThought);
    setThoughts(prev => [...prev, newThought]);
  };

  console.log('Current thoughts:', thoughts);

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <WhiteboardContainer>
          <Whiteboard ref={whiteboardRef} thoughts={thoughts} />
          <ChatInput onThoughtSubmit={handleThoughtSubmit} />
        </WhiteboardContainer>
      </AppContainer>
      <Footer>
        built by Arvin with Claude & Cursor | your thoughts are 100% private. no data is stored or uploaded.
      </Footer>
    </>
  );
};

export default App; 