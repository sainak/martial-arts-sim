const c = document.getElementById("canvas");
const ctx = c.getContext("2d");


const range = (start, end) => {
  return Array.from(Array(end - start + 1), (_, i) => i + start);
}


const imagePath = (animation, frameNumber) => {
  return "./assets/images/" + animation + "/" + frameNumber + ".png";
}


const loadImage = (src, callback) => {
  let img = document.createElement("img");
  img.onload = () => callback(img);
  img.src = src;
  return img;
};


const loadImages = (actions, callback) => {

  let imagesToLoad = 0;

  Object.keys(actions).forEach((animation) => {

    let animationFrames = actions[animation].frames;
    imagesToLoad += animationFrames.length;

    animationFrames.forEach((frameNumber) => {
      const path = imagePath(animation, frameNumber);

      loadImage(path, (image) => {
        actions[animation].images[frameNumber - 1] = image;
        imagesToLoad--;

        if (imagesToLoad === 0) {
          callback(actions);
        }
      });
    });
  });
};


const moveCharacter = (x, y) => {
  //ensure that the character is within the canvas
  let pX = game.character.position.x + x;
  if (pX >= 0 && pX <= c.width - game.character.width) {
    game.character.position.x += x;
  }
  return;
  // let pY = game.character.position.y + y;
  // if (pY >= 0 && pY <= c.height - game.character.height) {
  //   game.character.position.y += y;
  // }
}

let frameTimeouts = [];
let animationTimeout = null;

const animate = (ctx, actions, animation, callback) => {
  actions[animation].images.forEach((image, index) => {
    const t = setTimeout(() => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(game.background.image, 0, 0, c.width, c.height);
      ctx.drawImage(
        image,
        game.character.position.x,
        game.character.position.y,
        game.character.width,
        game.character.height
      );
    }, index * game.animationSpeed);
    frameTimeouts.push(t);
  });

  animationTimeout = setTimeout(callback, actions[animation].images.length * game.animationSpeed);
}

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

const game = {
  animationSpeed: 100,
  background: {
    width: 800,
    height: 600,
    image: loadImage("./assets/images/background.jpg", () => { })
  },
  character: {
    height: 500,
    width: 500,
    position: {
      x: 0,
      y: 0
    },
  },
  actions: {
    idle: {
      name: "idle",
      frames: range(1, 8),
      kbKey: "",
      buttonId: "",
      images: []
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
      images: []
    },
    kick: {
      name: "kick",
      frames: range(1, 7),
      kbKey: "k",
      buttonId: "kick",
      images: []
    },
    block: {
      name: "block",
      frames: range(1, 9),
      kbKey: "l",
      buttonId: "block",
      images: []
    },
  }
}


loadImages(game.actions, (actions) => {

  let selectedAnimation = "idle";

  let aux = () => {

    animate(ctx, actions, selectedAnimation || "idle", aux);
    selectedAnimation = "idle";
  };

  aux();

  const actionObjKeys = Object.keys(actions);

  actionObjKeys.forEach((key) => {
    document.getElementById(actions[key].buttonId)?.addEventListener("click", () => {
      clearPreviousAnimation()
      moveCharacter(actions[key].moveX ?? 0, 0);
      selectedAnimation = actions[key].name;
      aux()
    });
  });


  document.addEventListener("keyup", (ev) => {
    actionObjKeys.forEach((key) => {
      if (ev.key.toLowerCase() === actions[key].kbKey) {
        clearPreviousAnimation();
        moveCharacter(actions[key].moveX ?? 0, 0);
        selectedAnimation = actions[key].name;
        aux()
      }
    });
  });

});

console.log("main.js loaded");
