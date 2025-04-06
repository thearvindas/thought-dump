import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }
`;

const CharacterCounter = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
  text-align: right;
`;

const CommandHint = styled.div<{ visible: boolean }>`
  position: absolute;
  top: -1.5rem;
  left: 0;
  font-size: 0.75rem;
  color: #6c757d;
  opacity: ${props => (props.visible ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

interface ChatInputProps {
  onThoughtSubmit: (thought: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onThoughtSubmit }) => {
  const [input, setInput] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [showCommandHint, setShowCommandHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setCharacterCount(value.length);
    setShowCommandHint(value.startsWith('/'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with input:', input);
    
    if (!input.trim()) {
      console.log('Empty input, ignoring');
      return;
    }

    console.log('Calling onThoughtSubmit with:', input);
    onThoughtSubmit(input);
    setInput('');
    setCharacterCount(0);
    setShowCommandHint(false);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <InputContainer>
      <form onSubmit={handleSubmit}>
        <InputWrapper>
          <CommandHint visible={showCommandHint}>
            Available commands: /shake, /clear, /color, /size, /float, /pin, /export
          </CommandHint>
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your thought or use / for commands..."
          />
        </InputWrapper>
      </form>
      <CharacterCounter>{characterCount} characters</CharacterCounter>
    </InputContainer>
  );
};

export default ChatInput; 