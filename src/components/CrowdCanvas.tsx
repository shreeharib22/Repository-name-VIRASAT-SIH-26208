import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

interface CrowdCanvasProps {
  src: string;
  rows?: number;
  cols?: number;
}

type Stage = {
  width: number;
  height: number;
};

type Peep = {
  image: HTMLImageElement;
  rect: number[];
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  walk: gsap.core.Timeline | null;
  setRect: (rect: number[]) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
};

type WalkProps = {
  startX: number;
  startY: number;
  endX: number;
};

type WalkFactory = (args: {
  peep: Peep;
  props: WalkProps;
}) => gsap.core.Timeline;

export function CrowdCanvas({
  src,
  rows = 15,
  cols = 7,
}: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
const crowdScale = 0.55;

    const stage: Stage = {
      width: 0,
      height: 0,
    };

    const allPeeps: Peep[] = [];
    const availablePeeps: Peep[] = [];
    const crowd: Peep[] = [];

    const randomRange = (
      min: number,
      max: number,
    ): number => {
      return min + Math.random() * (max - min);
    };

    const randomIndex = (
      array: unknown[],
    ): number => {
      return Math.floor(
        Math.random() * array.length,
      );
    };

    const removeFromArray = <T,>(
      array: T[],
      index: number,
    ): T | undefined => {
      return array.splice(index, 1)[0];
    };

    const removeItemFromArray = <T,>(
      array: T[],
      item: T,
    ): void => {
      const index = array.indexOf(item);

      if (index !== -1) {
        array.splice(index, 1);
      }
    };

    const removeRandomFromArray = <T,>(
      array: T[],
    ): T | undefined => {
      return removeFromArray(
        array,
        randomIndex(array),
      );
    };

    const getRandomFromArray = <T,>(
      array: T[],
    ): T | undefined => {
      return array[randomIndex(array)];
    };

    const resetPeep = ({
      stage,
      peep,
    }: {
      stage: Stage;
      peep: Peep;
    }): WalkProps => {
      const direction =
        Math.random() > 0.5 ? 1 : -1;

      const offsetY =
        100 -
        250 *
          gsap.parseEase('power2.in')(
            Math.random(),
          );

      const startY =
        stage.height -
        peep.height +
        offsetY;

      let startX: number;
      let endX: number;

      if (direction === 1) {
        startX = -peep.width;
        endX = stage.width;

        peep.scaleX = 1;
      } else {
        startX =
          stage.width +
          peep.width;

        endX = 0;

        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return {
        startX,
        startY,
        endX,
      };
    };

    const normalWalk: WalkFactory = ({
      peep,
      props,
    }) => {
      const xDuration =
        randomRange(8, 13);

      const yDuration = 0.28;

      const timeline = gsap.timeline();

      timeline.timeScale(
        randomRange(0.7, 1.3),
      );

      timeline.to(
        peep,
        {
          duration: xDuration,
          x: props.endX,
          ease: 'none',
        },
        0,
      );

      timeline.to(
        peep,
        {
          duration: yDuration,
          repeat: Math.ceil(
            xDuration /
              yDuration,
          ),
          yoyo: true,
          y: props.startY - randomRange(6, 12),
          ease: 'sine.inOut',
        },
        0,
      );

      return timeline;
    };

    const walks: WalkFactory[] = [
      normalWalk,
    ];

    const createPeep = ({
      image,
      rect,
    }: {
      image: HTMLImageElement;
      rect: number[];
    }): Peep => {
      const peep: Peep = {
        image,

        rect: [],

        width: 0,

        height: 0,

        x: 0,

        y: 0,

        anchorY: 0,

        scaleX: 1,

        walk: null,

        setRect: (
          nextRect: number[],
        ) => {
          peep.rect = nextRect;

          peep.width =
            nextRect[2];

          peep.height =
            nextRect[3];
        },

        render: (
          context: CanvasRenderingContext2D,
        ) => {
          context.save();

          context.translate(
            peep.x,
            peep.y,
          );

          context.scale(
            peep.scaleX,
            1,
          );

          context.drawImage(
            peep.image,
            peep.rect[0],
            peep.rect[1],
            peep.rect[2],
            peep.rect[3],
            0,
            0,
            peep.width,
            peep.height,
          );

          context.restore();
        },
      };

      peep.setRect(rect);

      return peep;
    };

    const createPeeps = (
      image: HTMLImageElement,
    ): void => {
      const total =
        rows * cols;

      const rectWidth =
        image.naturalWidth /
        rows;

      const rectHeight =
        image.naturalHeight /
        cols;

      for (
        let i = 0;
        i < total;
        i++
      ) {
        const column =
          i % rows;

        const row =
          Math.floor(i / rows);

        allPeeps.push(
          createPeep({
            image,
            rect: [
              column *
                rectWidth,

              row *
                rectHeight,

              rectWidth,

              rectHeight,
            ],
          }),
        );
      }
    };

    const removePeepFromCrowd = (
      peep: Peep,
    ): void => {
      removeItemFromArray(
        crowd,
        peep,
      );

      availablePeeps.push(peep);
    };

    const addPeepToCrowd = (): Peep | null => {
      if (
        availablePeeps.length ===
        0
      ) {
        return null;
      }

      const peep =
        removeRandomFromArray(
          availablePeeps,
        );

      if (!peep) {
        return null;
      }

      const walkFactory =
        getRandomFromArray(
          walks,
        );

      if (!walkFactory) {
        availablePeeps.push(
          peep,
        );

        return null;
      }

      const props =
        resetPeep({
          stage,
          peep,
        });

      const walk =
        walkFactory({
          peep,
          props,
        });

      walk.eventCallback(
        'onComplete',
        () => {
          removePeepFromCrowd(
            peep,
          );

          addPeepToCrowd();
        },
      );

      peep.walk = walk;

      crowd.push(peep);

      crowd.sort(
        (a, b) =>
          a.anchorY -
          b.anchorY,
      );

      return peep;
    };

    const initCrowd = (): void => {
      while (
        availablePeeps.length >
        0
      ) {
        const peep =
          addPeepToCrowd();

        peep?.walk?.progress(
          Math.random(),
        );
      }
    };

    const resize = (): void => {
      stage.width =
        canvas.clientWidth;

      stage.height =
        canvas.clientHeight;

      canvas.width =
        stage.width * dpr;

      canvas.height =
        stage.height * dpr;

      crowd.forEach(
        (peep) => {
          peep.walk?.kill();
        },
      );

      crowd.length = 0;

      availablePeeps.length = 0;

      availablePeeps.push(
        ...allPeeps,
      );

      initCrowd();
    };

    const render = (): void => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
      );

      ctx.save();

      ctx.scale(dpr, dpr);

      crowd.forEach(
        (peep) => {
          peep.render(ctx);
        },
      );

      ctx.restore();
    };

    const image =
      new Image();

    image.onload = () => {
      createPeeps(image);

      resize();

      gsap.ticker.add(
        render,
      );
    };

    image.onerror = () => {
      console.error(
        `CrowdCanvas: failed to load ${src}`,
      );
    };

    image.src = src;

    const handleResize = () => {
      resize();
    };

    window.addEventListener(
      'resize',
      handleResize,
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleResize,
      );

      gsap.ticker.remove(
        render,
      );

      crowd.forEach(
        (peep) => {
          peep.walk?.kill();
        },
      );
    };
  }, [src, rows, cols]);

  return (
    <canvas
      ref={canvasRef}
      className="crowd-canvas"
      aria-hidden="true"
    />
  );
}