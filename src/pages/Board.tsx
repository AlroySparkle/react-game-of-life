import { useEffect, useRef, useState } from "react";
import "./css/Board.css";

type Cellprops = {
  changeState: Function;
  column: number;
  row: number;
  isAlive: boolean;
};

function Cell(props: Cellprops) {
  return (
    <div
      key={props.row * 10 + " " + props.column}
      onClick={() => {
        props.changeState(props.row, props.column);
      }}
      style={{
        background: props.isAlive ? "black" : "white",
      }}
      className={" h-12.5 w-12.5 block cursor-pointer"}
    ></div>
  );
}
export default function Board() {
  const [size, setSize] = useState(10);
  const [isAlive, setIsAlive] = useState<Record<string, boolean>>({});

  const [ratio, setRation] = useState(50);

  const [intervalTime, setIntervalTime] = useState(1000);
  const [runGenerations, setRunGenerations] = useState(true);

  useEffect(() => {
    const createIsAlive: { [key: string]: boolean } = {};
    Array.from(Array(size)).forEach((_, row) =>
      Array.from(Array(size)).forEach((_, column) => {
        createIsAlive[row + "-" + column] = false;
      }),
    );
    setIsAlive(createIsAlive);
  }, [size]);

  const nextGeneration = () => {
    setIsAlive((prev) => {
      const copy: { [key: string]: boolean } = { ...prev };
      const neighborOffsets = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];

      Object.keys(copy).forEach((key) => {
        // Extract row and column from "row-col"
        const [row, col] = key.split("-").map(Number);

        let aliveNeighbors = 0;

        for (const [deltaRow, deltaCol] of neighborOffsets) {
          const neighborRow = row + deltaRow;
          const neighborCol = col + deltaCol;

          if (neighborRow >= 0 && neighborCol >= 0) {
            const neighborKey = `${neighborRow}-${neighborCol}`;
            if (prev[neighborKey]) {
              aliveNeighbors++;
            }
          }
        }

        copy[key] = aliveNeighbors === 3 || (aliveNeighbors === 2 && copy[key]);
      });

      return copy;
    });
  };

  const clearBoard = () => {
    setIsAlive((prev) => {
      const copy: { [key: string]: boolean } = { ...prev };
      Object.keys(copy).forEach((key) => {
        copy[key] = false;
      });

      return copy;
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loop = async () => {
      while (!cancelled && runGenerations) {
        await new Promise((res) => setTimeout(res, intervalTime));
        if (!cancelled) nextGeneration();
      }
    };

    loop();

    return () => {
      cancelled = true;
    };
  }, [runGenerations, intervalTime]);

  const randomizeGrid = () => {
    setIsAlive((prev) => {
      const copy: { [key: string]: boolean } = { ...prev };
      Object.keys(copy).forEach((key) => {
        copy[key] = Math.random() <= ratio / 100;
      });
      return copy;
    });
  };
  const changeState = (row: number, column: number): undefined => {
    setIsAlive((prev) => {
      const copy: { [key: string]: boolean } = { ...prev };
      copy[row + "-" + column] = !copy[row + "-" + column];
      return copy;
    });
  };
  const board = Array.from(Array(size)).map((_, row) =>
    Array.from(Array(size)).map((_, column) => (
      <Cell
        key={row * 10 + column}
        row={row}
        changeState={changeState}
        column={column}
        isAlive={isAlive[row + "-" + column] || false}
      />
    )),
  );
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="grid game-of-life-container"
        style={{ gridTemplateColumns: `repeat(${size}, 50px` }}
      >
        {board}
      </div>
      <div className="flex flex-col gap-4">
        <input
          value={size}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            if (isNaN(newSize)) {
              return;
            }
            setSize(newSize);
          }}
        />
        <input
          value={ratio}
          onChange={(e) => {
            const newRatio = Number(e.target.value);
            if (isNaN(newRatio)) {
              return;
            }
            setRation(newRatio);
          }}
        />
        <button
          className="button"
          onClick={() => {
            randomizeGrid();
          }}
        >
          randomize
        </button>
        <input
          value={intervalTime}
          onChange={(e) => {
            const newTime = Number(e.target.value);
            if (isNaN(newTime)) {
              return;
            }
            setIntervalTime(newTime);
          }}
        />
        <button
          className="button"
          onClick={() => {
            setRunGenerations((prev) => !prev);
          }}
        >
          {runGenerations ? "stop" : "start"}
        </button>
        <button
          className="button"
          onClick={() => {
            nextGeneration();
          }}
        >
          next gen
        </button>
        <button
          disabled={runGenerations}
          className="button"
          onClick={() => {
            clearBoard();
          }}
        >
          clear
        </button>
      </div>
    </div>
  );
}
