import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: min(600px, calc(100vw - 48px));
  max-width: min(800px, calc(100vw - 48px));
  background: rgba(32, 32, 32, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;

  @media (max-width: 900px) {
    min-width: calc(100vw - 48px);
    max-width: calc(100vw - 48px);
    padding: 12px 16px;
    bottom: 72px;
  }

  @media (max-width: 480px) {
    min-width: calc(100vw - 32px);
    max-width: calc(100vw - 32px);
    padding: 10px 12px;
    bottom: 64px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 15px;
  color: white;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 14px;
    border-radius: 10px;
  }
`;

const CharacterCounter = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-align: right;
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 480px) {
    font-size: 11px;
    margin-top: 6px;
  }
`;

const EnterHint = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const CommandHint = styled.div<{ visible: boolean }>`
  position: absolute;
  top: -32px;
  left: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.8);
  padding: 6px 12px;
  border-radius: 8px;
  opacity: ${props => (props.visible ? 1 : 0)};
  transform: translateY(${props => (props.visible ? '0' : '4px')});
  transition: all 0.2s ease;
  pointer-events: none;
  max-width: calc(100% - 32px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 4px 8px;
    top: -28px;
    left: 12px;
  }
`;

interface ChatInputProps {
  onThoughtSubmit: (thought: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onThoughtSubmit }) => {
  const [input, setInput] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [showCommandHint, setShowCommandHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onThoughtSubmit(input);
    setInput('');
    setCharacterCount(0);
    setShowCommandHint(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setCharacterCount(value.length);
    setShowCommandHint(value.startsWith('/'));
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
            Available commands: /shake, /clear, /export, /undo
          </CommandHint>
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="dump your thoughts here"
          />
        </InputWrapper>
      </form>
      <CharacterCounter>
        <EnterHint>hit enter to send</EnterHint>
        <span>{characterCount} characters</span>
      </CharacterCounter>
    </InputContainer>
  );
};

export default ChatInput; 