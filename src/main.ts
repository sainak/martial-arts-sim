interface Action {
  name: string;
  frames: number[];
  images: HTMLImageElement[];
  kbKey?: string;
  buttonId?: string;
  moveX?: number;
  moveY?: number;
}

const range = (start: number, end: number | null = null, step: number = 1) => {
  if (end === undefined) [start, end] = [0, start];
  let range = [];
  for (let i = start; i < end!; i += step) {
    range.push(i);
  }
  return range;
};

const imagePath = (animation: string, frameNumber: number) =>
  `./assets/images/${animation}/${frameNumber}.png`;

const loadImage = async (srcPath: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, _reject) => {
    let img = document.createElement("img");
    img.onload = () => resolve(img);
    img.src = srcPath;
  });
};

const loadGameBg = () => {
  loadImage("./assets/images/background.jpg").then((img) => {
    game.background.image = img;
  });
};

const loadImagesForActions = () => {
  for (const actionName in game.actions) {
    const action: Action =
      game.actions[actionName as keyof typeof game.actions];
    Promise.all(
      action.frames.map((frame) => loadImage(imagePath(action.name, frame)))
    ).then((images) => {
      action.images = images;
    });
  }
};

const moveCharacter = (
  canvasWidth: number,
  canvasHeight: number,
  x: number,
  y: number
) => {
  //ensure that the character is within the canvas
  const pX = game.character.position.x + x;
  if (pX >= 0 && pX <= canvasWidth - game.character.width) {
    game.character.position.x += x;
  }
  const pY = game.character.position.y + y;
  if (pY >= 0 && pY <= canvasHeight - game.character.height) {
    game.character.position.y += y;
  }
};

let frameTimeouts: number[] = [];
let animationTimeout: number | null = null;

const animate = (
  ctx: CanvasRenderingContext2D,
  action: Action,
  callback: () => void
) => {
  action.images.forEach((image, index) => {
    const timeout = setTimeout(() => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(
        game.background.image,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      ctx.drawImage(
        image,
        game.character.position.x,
        game.character.position.y,
        game.character.width,
        game.character.height
      );
    }, index * game.animationSpeed);
    frameTimeouts.push(timeout);
  });
  animationTimeout = setTimeout(
    callback,
    action.images.length * game.animationSpeed
  );
};

const clearPreviousAnimation = () => {
  frameTimeouts.forEach((timeout) => {
    clearTimeout(timeout);
  });
  frameTimeouts = [];
  if (animationTimeout) {
    clearTimeout(animationTimeout);
  }
  animationTimeout = null;
};

//global game state
const game = {
  animationSpeed: 100,
  background: {
    width: 800,
    height: 600,
    image: new Image(),
  },
  character: {
    height: 500,
    width: 500,
    position: {
      x: 0,
      y: 0,
    },
  },
  actions: {
    idle: {
      name: "idle",
      frames: range(1, 8),
      images: [],
    },
    backward: {
      name: "backward",
      frames: range(1, 6),
      kbKey: "a",
      buttonId: "backward",
      images: [],
      moveX: -50,
    },
    forward: {
      name: "forward",
      frames: range(1, 6),
      kbKey: "d",
      buttonId: "forward",
      images: [],
      moveX: 50,
    },
    punch: {
      name: "punch",
      frames: range(1, 7),
      kbKey: "p",
      buttonId: "punch",
      images: [],
    },
    kick: {
      name: "kick",
      frames: range(1, 7),
      kbKey: "k",
      buttonId: "kick",
      images: [],
    },
    block: {
      name: "block",
      frames: range(1, 9),
      kbKey: "l",
      buttonId: "block",
      images: [],
    },
  },
};

function main() {
  const canvas: HTMLCanvasElement = document.getElementById(
    "canvas"
  ) as HTMLCanvasElement;
  const context = canvas.getContext("2d");

  const actionObjKeys = Object.keys(game.actions);

  loadGameBg();
  loadImagesForActions();

  let selectedAnimation = "idle";
  let aux = () => {
    animate(
      context!,
      game.actions[selectedAnimation as keyof typeof game.actions],
      aux
    );
    selectedAnimation = "idle";
  };
  aux();

  const performAction = (action: Action) => {
    clearPreviousAnimation();
    moveCharacter(canvas.width, canvas.height, action.moveX ?? 0, 0);
    selectedAnimation = action.name;
    aux();
  };

  actionObjKeys.forEach((key) => {
    let action: Action = game.actions[key as keyof typeof game.actions];
    document.getElementById(action.buttonId ?? "")?.addEventListener("click", () => {
      performAction(action);
    });
  });

  document.addEventListener("keydown", (e) => {
    actionObjKeys.forEach((key) => {
      let action: Action = game.actions[key as keyof typeof game.actions];
      if (e.key === action.kbKey) {
        performAction(action);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", main);
