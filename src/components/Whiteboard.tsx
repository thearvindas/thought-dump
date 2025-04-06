import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Matter from 'matter-js';

const WhiteboardContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - 100px);
  background: white;
  overflow: hidden;
  cursor: default;
  
  &.dragging {
    cursor: grabbing;
  }
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
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

const Whiteboard: React.FC<WhiteboardProps> = ({ thoughts }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const bodiesRef = useRef<{ [key: number]: Matter.Body }>({});
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    console.log('Initializing Matter.js engine');

    // Get container dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create Matter.js engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 }
    });
    engineRef.current = engine;

    // Create renderer
    const render = Matter.Render.create({
      element: container,
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        showVelocity: false,
        showCollisions: false,
        background: 'white',
        pixelRatio: window.devicePixelRatio
      }
    });
    renderRef.current = render;

    // Add walls
    const wallOptions = { 
      isStatic: true,
      render: { visible: false }
    };

    const wallThickness = 60;
    const walls = [
      Matter.Bodies.rectangle(0, height/2, wallThickness, height, wallOptions),
      Matter.Bodies.rectangle(width, height/2, wallThickness, height, wallOptions),
      Matter.Bodies.rectangle(width/2, 0, width, wallThickness, wallOptions),
      Matter.Bodies.rectangle(width/2, height, width, wallThickness, wallOptions)
    ];
    Matter.World.add(engine.world, walls);

    // Create mouse constraint
    const mouse = Matter.Mouse.create(render.canvas);
    mouse.pixelRatio = window.devicePixelRatio;
    
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        damping: 0.1,
        render: { visible: false }
      }
    });

    mouseConstraintRef.current = mouseConstraint;
    Matter.World.add(engine.world, mouseConstraint);

    // Create or update bodies for all thoughts
    thoughts.forEach((thought) => {
      if (!bodiesRef.current[thought.id]) {
        const margin = 100;
        const x = margin + Math.random() * (width - 2 * margin);
        const y = margin + Math.random() * (height - 2 * margin);

        const body = Matter.Bodies.circle(x, y, 40, {
          id: thought.id,
          render: { visible: false },
          isStatic: false,
          isSleeping: false,
          friction: 0.05,
          frictionAir: 0.02,
          restitution: 0.3,
          mass: 1,
          inertia: Infinity
        });

        bodiesRef.current[thought.id] = body;
        Matter.World.add(engine.world, body);
      }
    });

    // Start the engine and renderer
    Matter.Runner.run(Matter.Runner.create(), engine);
    Matter.Render.run(render);

    // Set up text rendering
    let animationFrameId: number;
    const renderText = () => {
      const ctx = render.canvas.getContext('2d');
      if (!ctx) return;

      // Clear the canvas
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      // Draw all thoughts
      thoughts.forEach((thought) => {
        const body = bodiesRef.current[thought.id];
        if (!body) return;

        const pos = body.position;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(body.angle);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(thought.text, 0, 0);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(renderText);
    };

    renderText();

    // Handle mouse events
    Matter.Events.on(mouseConstraint, 'mousemove', (event) => {
      const mousePosition = event.mouse.position;
      const bodiesAtPoint = Matter.Query.point(Object.values(bodiesRef.current), mousePosition);
      render.canvas.style.cursor = bodiesAtPoint.length > 0 ? 'grab' : 'default';
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

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      Matter.Events.off(mouseConstraint, 'mousemove');
      Matter.Events.off(mouseConstraint, 'startdrag');
      Matter.Events.off(mouseConstraint, 'enddrag');
      Matter.World.remove(engine.world, mouseConstraint);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      bodiesRef.current = {};
    };
  }, [thoughts]);

  return (
    <WhiteboardContainer ref={containerRef}>
      <Canvas ref={canvasRef} />
    </WhiteboardContainer>
  );
};

export default Whiteboard; 