# Thought Dump

A minimalist, physics-based thought board where your ideas float and interact. Built with React, TypeScript, and Matter.js.

![Thought Dump Preview](preview.png)

## Features

### Text Formatting
- `*text*` - Bold and larger text for emphasis
- `_text_` - Smaller, subtle text for quieter thoughts
- Regular text for normal thoughts

### Commands
Type `/` to see available commands:
- `/shake` - Shake up all thoughts on the board
- `/clear` - Clear the entire board
- `/export` - Export current board as PDF
- `/undo` - Undo last action (shake/clear)

### Interaction
- Drag thoughts around with physics-based movement
- Thoughts stay upright for readability
- Thoughts avoid the input area automatically
- Subtle animations and transitions

## Tech Stack
- React 18
- TypeScript
- Matter.js for physics
- Styled Components
- jsPDF for exports

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/thought-dump.git
cd thought-dump
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Privacy
Your thoughts are 100% private. All processing happens in your browser - no data is stored or uploaded to any server.

## Development

### Project Structure
```
src/
  ├── components/
  │   ├── Whiteboard.tsx   # Physics and rendering logic
  │   └── ChatInput.tsx    # Input and commands handling
  ├── App.tsx             # Main application component
  └── index.tsx          # Entry point
```

### Key Features Implementation
- Matter.js physics engine for natural movement
- Custom text rendering with Canvas API
- Responsive design with mobile support
- Command system with undo functionality

## License
MIT License - See LICENSE file for details

## Acknowledgments
Built by Arvin with Claude & Cursor 