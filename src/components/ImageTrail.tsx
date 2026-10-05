import { useEffect, useRef, useState } from 'react';

type TrailItem = {
  id: number;
  x: number;
  y: number;
  image: string;
  rotation: number;
};

const trailImages = [
  '/trail/trail-1.jpg',
  '/trail/trail-2.jpg',
  '/trail/trail-3.jpg',
  '/trail/trail-4.jpg',
  '/trail/trail-5.jpg',
  '/trail/trail-6.jpg',
  '/trail/trail-7.jpg',
];

export function ImageTrail() {
  const [items, setItems] = useState<TrailItem[]>([]);
  const idRef = useRef(0);
  const lastPoint = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const now = performance.now();

      if (now - lastTime.current < 85) return;

      const dx = event.clientX - lastPoint.current.x;
      const dy = event.clientY - lastPoint.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 45) return;

      lastTime.current = now;
      lastPoint.current = {
        x: event.clientX,
        y: event.clientY,
      };

      const id = idRef.current++;

      const item: TrailItem = {
        id,
        x: event.clientX,
        y: event.clientY,
        image: trailImages[id % trailImages.length],
        rotation: (Math.random() - 0.5) * 14,
      };

      setItems((current) => [...current.slice(-7), item]);

      window.setTimeout(() => {
        setItems((current) => current.filter((entry) => entry.id !== id));
      }, 1000);
    };

    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <div className="image-trail-layer" aria-hidden="true">
      {items.map((item) => (
        <div
          key={item.id}
          className="image-trail-item"
          style={{
            left: item.x,
            top: item.y,
            transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
          }}
        >
          <img src={item.image} alt="" draggable={false} />
        </div>
      ))}
    </div>
  );
}