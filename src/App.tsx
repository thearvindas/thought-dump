import React, { useState } from 'react';
import styled from 'styled-components';
import Whiteboard from './components/Whiteboard';
import ChatInput from './components/ChatInput';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const WhiteboardContainer = styled.div`
  flex: 1;
  min-height: 0; // Important for flex child
  position: relative;
  background-color: white;
`;

const ChatContainer = styled.div`
  height: 100px;
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<Array<{
    id: number;
    text: string;
    color: string;
    size: 'small' | 'medium' | 'large';
    isPinned: boolean;
  }>>([]);

  const handleThoughtSubmit = (thought: string) => {
    console.log('Submitting thought:', thought);
    
    if (thought.startsWith('/')) {
      // Handle commands
      const [command, ...args] = thought.slice(1).split(' ');
      console.log('Command:', command, 'Args:', args);
      return;
    }

    // Add new thought
    const newThought = {
      id: Date.now(),
      text: thought,
      color: '#000000',
      size: 'medium' as const,
      isPinned: false,
    };

    console.log('Adding new thought:', newThought);
    setThoughts(prev => [...prev, newThought]);
  };

  console.log('Current thoughts:', thoughts);

  return (
    <AppContainer>
      <WhiteboardContainer>
        <Whiteboard thoughts={thoughts} />
      </WhiteboardContainer>
      <ChatContainer>
        <ChatInput onThoughtSubmit={handleThoughtSubmit} />
      </ChatContainer>
    </AppContainer>
  );
};

export default App; 