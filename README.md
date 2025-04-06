# Thought Dump

A dynamic, ephemeral thought-dumping web application that allows users to throw text entries from a chat interface onto a virtual whiteboard with physics-based interactions.

## Features

- Split-screen layout with chat input and whiteboard space
- Physics-based movement and collision detection
- Command system for special actions
- Text effects and styling options
- Export functionality to PDF
- Client-side only - no persistence between sessions

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

## Available Commands

- `/shake` - Triggers animation that shakes all thoughts on the board
- `/clear` - Removes all thoughts from the whiteboard
- `/color [colorname]` - Sets color for the next thought
- `/size [small/medium/large]` - Controls text size of next thought
- `/float` - Makes next thought drift slowly across the board
- `/pin` - Next thought will be fixed in position
- `/export` - Triggers PDF export

## Text Effects

- `*bold thought*` - Appears with stronger font weight
- `~wavy thought~` - Gets a subtle wave animation
- `!important thought!` - Highlighted with special border
- `_whisper_` - Appears smaller and with lower opacity

## Built With

- React
- TypeScript
- Matter.js
- jsPDF
- Styled Components

## License

This project is licensed under the MIT License - see the LICENSE file for details. 