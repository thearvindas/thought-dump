import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';
import { jsPDF } from 'jspdf';

const WhiteboardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #111111;
  overflow: hidden;
  cursor: default;
  transition: background-color 0.3s ease;
  
  &.dragging {
    cursor: grabbing;
  }
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  transition: border-color 0.3s ease;
`;

interface HelpTextProps {
  isVisible: boolean;
}

const HelpText = styled.div<HelpTextProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.2);
  font-size: 14px;
  text-align: center;
  line-height: 2;
  pointer-events: none;
  white-space: pre-line;
  font-family: Helvetica, Arial, sans-serif;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.3s ease;
`;

interface Thought {
  id: number;
  text: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  isPinned: boolean;
}

interface WhiteboardProps {
  thoughts: Thought[];
}

// Add new interfaces for formatted text
interface FormattedTextSegment {
  text: string;
  isBold?: boolean;
  isWhisper?: boolean;
}

// Add helper function to parse text formatting
const parseTextFormatting = (text: string): FormattedTextSegment[] => {
  const segments: FormattedTextSegment[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    // Check for formatting markers
    if (text[currentIndex] === '*' && text.indexOf('*', currentIndex + 1) !== -1) {
      const endIndex = text.indexOf('*', currentIndex + 1);
      segments.push({
        text: text.slice(currentIndex + 1, endIndex),
        isBold: true
      });
      currentIndex = endIndex + 1;
    } else if (text[currentIndex] === '_' && text.indexOf('_', currentIndex + 1) !== -1) {
      const endIndex = text.indexOf('_', currentIndex + 1);
      segments.push({
        text: text.slice(currentIndex + 1, endIndex),
        isWhisper: true
      });
      currentIndex = endIndex + 1;
    } else {
      // Find next special character or end of string
      const nextSpecial = text.slice(currentIndex).search(/[*_]/);
      const endIndex = nextSpecial === -1 ? text.length : currentIndex + nextSpecial;
      segments.push({
        text: text.slice(currentIndex, endIndex)
      });
      currentIndex = endIndex;
    }
  }
  return segments;
};

// Constants
const BOTTOM_OFFSET = 160; // Space for chat input + padding
const WALL_THICKNESS = 60;

interface WhiteboardRef {
  shakeThoughts: () => void;
  exportToPDF: () => void;
  savePositions: () => { [key: number]: { x: number; y: number } };
  restorePositions: (positions: { [key: number]: { x: number; y: number } }) => void;
}

const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(({ thoughts }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const bodiesRef = useRef<{ [key: number]: Matter.Body }>({});
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const initializedThoughtsRef = useRef<Set<number>>(new Set());
  const renderLoopRef = useRef<number | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    shakeThoughts: () => {
      if (!engineRef.current) return;
      
      Object.values(bodiesRef.current).forEach(body => {
        // Apply random force for position change
        const force = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5
        };
        Matter.Body.applyForce(body, body.position, force);
        // Reset angle to 0 and angular velocity to 0 to keep text upright
        Matter.Body.setAngle(body, 0);
        Matter.Body.setAngularVelocity(body, 0);
      });
    },
    exportToPDF: () => {
      if (!canvasRef.current) return;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [canvasRef.current.width, canvasRef.current.height]
      });

      // Get canvas data
      const imgData = canvasRef.current.toDataURL('image/png', 1.0);
      
      // Add image to PDF with proper dimensions
      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      // Save the PDF
      pdf.save('thought-dump.pdf');
    },
    savePositions: () => {
      const positions: { [key: number]: { x: number; y: number } } = {};
      Object.entries(bodiesRef.current).forEach(([id, body]) => {
        positions[Number(id)] = { x: body.position.x, y: body.position.y };
      });
      return positions;
    },
    restorePositions: (positions: { [key: number]: { x: number; y: number } }) => {
      Object.entries(positions).forEach(([id, position]) => {
        const body = bodiesRef.current[Number(id)];
        if (body) {
          Matter.Body.setPosition(body, position);
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngle(body, 0);
          Matter.Body.setAngularVelocity(body, 0);
        }
      });
    }
  }));

  // Main setup effect - physics only
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    console.log('Setting up physics world');

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 }
    });
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: container,
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: '#111111',
        pixelRatio: window.devicePixelRatio
      }
    });
    renderRef.current = render;

    // Add walls
    const wallOptions = { 
      isStatic: true,
      render: { visible: false }
    };
    
    const walls = [
      Matter.Bodies.rectangle(0, height/2, WALL_THICKNESS, height, wallOptions), // Left wall
      Matter.Bodies.rectangle(width, height/2, WALL_THICKNESS, height, wallOptions), // Right wall
      Matter.Bodies.rectangle(width/2, 0, width, WALL_THICKNESS, wallOptions), // Top wall
      Matter.Bodies.rectangle(width/2, height - BOTTOM_OFFSET, width, WALL_THICKNESS, wallOptions) // Bottom wall higher up
    ];
    Matter.World.add(engine.world, walls);

    // Create mouse constraint
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: Matter.Mouse.create(render.canvas),
      constraint: {
        stiffness: 0.2,
        damping: 0.1,
        render: { visible: false }
      }
    });

    mouseConstraintRef.current = mouseConstraint;
    Matter.World.add(engine.world, mouseConstraint);

    // Start the engine and renderer
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Handle mouse events with smooth transitions
    Matter.Events.on(mouseConstraint, 'mousemove', (event) => {
      const mousePosition = event.mouse.position;
      const bodiesAtPoint = Matter.Query.point(Object.values(bodiesRef.current), mousePosition);
      render.canvas.style.cursor = bodiesAtPoint.length > 0 ? 'grab' : 'default';
      
      // Add subtle hover effect
      bodiesAtPoint.forEach(body => {
        const thought = thoughts.find(t => t.id === body.id);
        if (thought) {
          body.render.opacity = 0.9;
        }
      });
    });

    Matter.Events.on(mouseConstraint, 'startdrag', () => {
      render.canvas.style.cursor = 'grabbing';
    });

    Matter.Events.on(mouseConstraint, 'enddrag', () => {
      render.canvas.style.cursor = 'grab';
    });

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      render.canvas.width = newWidth;
      render.canvas.height = newHeight;
      Matter.Render.setPixelRatio(render, window.devicePixelRatio);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      console.log('Cleaning up physics world');
      window.removeEventListener('resize', handleResize);
      Matter.Events.off(mouseConstraint, 'mousemove');
      Matter.Events.off(mouseConstraint, 'startdrag');
      Matter.Events.off(mouseConstraint, 'enddrag');
      Matter.World.remove(engine.world, mouseConstraint);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, []); // Empty dependency array - physics setup runs once

  // Separate effect for text rendering with enhanced styling
  useEffect(() => {
    if (!renderRef.current?.canvas) return;

    const render = renderRef.current;
    const width = render.canvas.width;
    const height = render.canvas.height;

    const renderText = () => {
      const ctx = render.canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, width, height);

      thoughts.forEach((thought) => {
        const body = bodiesRef.current[thought.id];
        if (!body) return;

        const pos = body.position;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(body.angle);

        // Parse the text for formatting
        const segments = parseTextFormatting(thought.text);
        let xOffset = 0;

        // Calculate total width for centering
        let totalWidth = 0;
        segments.forEach(segment => {
          ctx.font = `${segment.isBold ? 'bold' : ''} ${segment.isWhisper ? '14px' : '18px'} Helvetica, Arial, sans-serif`;
          totalWidth += ctx.measureText(segment.text).width;
        });
        xOffset = -totalWidth / 2;

        // Render each segment with its formatting
        segments.forEach(segment => {
          ctx.save();

          // Set font based on formatting
          const fontSize = segment.isWhisper ? '14px' : segment.isBold ? '22px' : '18px';
          const fontWeight = segment.isBold ? 'bold' : 'normal';
          ctx.font = `${fontWeight} ${fontSize} Helvetica, Arial, sans-serif`;
          
          // Set opacity and shadow
          ctx.globalAlpha = segment.isWhisper ? 0.6 : 1;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.15)';
          ctx.shadowBlur = 15;

          // Regular text rendering
          ctx.fillStyle = '#ffffff';
          ctx.fillText(segment.text, xOffset, 0);
          xOffset += ctx.measureText(segment.text).width;

          ctx.restore();
        });

        ctx.restore();
      });

      renderLoopRef.current = requestAnimationFrame(renderText);
    };

    renderText();

    return () => {
      if (renderLoopRef.current) {
        cancelAnimationFrame(renderLoopRef.current);
      }
    };
  }, [thoughts]); // Only re-setup text rendering when thoughts change

  // Effect to handle thought updates with improved physics
  useEffect(() => {
    if (!engineRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const engine = engineRef.current;

    thoughts.forEach((thought) => {
      if (!initializedThoughtsRef.current.has(thought.id)) {
        console.log('Adding new thought:', thought);
        
        const margin = {
          top: 100,
          right: 100,
          bottom: BOTTOM_OFFSET + 40, // Keep thoughts away from the bottom wall
          left: 100
        };
        const x = margin.left + Math.random() * (container.clientWidth - margin.left - margin.right);
        const y = margin.top + Math.random() * (container.clientHeight - margin.top - margin.bottom);

        // Create temporary canvas to measure text
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.font = '18px Helvetica, Arial, sans-serif';
          const textMetrics = tempCtx.measureText(thought.text);
          // Add padding to the text width for better dragging
          const width = Math.max(textMetrics.width + 40, 80); // minimum width of 80
          const height = 40; // fixed height for consistent feel

          // Create rectangle instead of circle for better text coverage
          const body = Matter.Bodies.rectangle(x, y, width, height, {
            id: thought.id,
            render: { 
              visible: false,
              opacity: 1
            },
            isStatic: false,
            isSleeping: false,
            friction: 0.03,
            frictionAir: 0.015,
            restitution: 0.4,
            mass: 1,
            inertia: Infinity,
            chamfer: { radius: 5 } // slightly rounded corners
          });

          Matter.World.add(engine.world, body);
          bodiesRef.current[thought.id] = body;
          initializedThoughtsRef.current.add(thought.id);

          // Smoother initial movement
          Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 1.5,
            y: (Math.random() - 0.5) * 1.5
          });
        }
      }
    });

    // Remove bodies for thoughts that no longer exist
    Object.entries(bodiesRef.current).forEach(([id, body]) => {
      const thoughtId = Number(id);
      if (!thoughts.find(t => t.id === thoughtId)) {
        Matter.World.remove(engine.world, body);
        delete bodiesRef.current[thoughtId];
        initializedThoughtsRef.current.delete(thoughtId);
      }
    });
  }, [thoughts]);

  return (
    <WhiteboardContainer ref={containerRef}>
      <Canvas ref={canvasRef} />
      <HelpText isVisible={thoughts.length === 0}>Formatting guide:
*This* to be loud.
This is normal.
_This_ to be quiet.

press / for commands.</HelpText>
    </WhiteboardContainer>
  );
});

export default Whiteboard; 