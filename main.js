var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const range = (start, end = undefined, step = 1) => {
    if (end === undefined)
        [start, end] = [0, start];
    let range = [];
    for (let i = start; i < end; i += step) {
        range.push(i);
    }
    return range;
};
const imagePath = (animation, frameNumber) => `./assets/images/${animation}/${frameNumber}.png`;
const loadImage = (srcPath) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        let img = document.createElement("img");
        img.onload = () => resolve(img);
        img.src = srcPath;
    });
});
const loadImages = (animation, frames) => __awaiter(this, void 0, void 0, function* () {
    const images = yield Promise.all(frames.map((frame) => loadImage(imagePath(animation, frame))));
    return images;
});
const loadGameBg = () => {
    loadImage("./assets/images/background.jpg").then((img) => {
        game.background.image = img;
    });
};
const loadImagesForActions = () => {
    for (const actionS in game.actions) {
        const action = game.actions[actionS];
        Promise.all(action.frames.map((frame) => loadImage(imagePath(action.name, frame)))).then((images) => {
            action.images = images;
        });
    }
};
const moveCharacter = (canvasWidth, canvasHeight, x, y) => {
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
let frameTimeouts = [];
let animationTimeout = null;
const animate = (ctx, action, callback) => {
    action.images.forEach((image, index) => {
        const timeout = setTimeout(() => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(game.background.image, 0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(image, game.character.position.x, game.character.position.y, game.character.width, game.character.height);
        }, index * game.animationSpeed);
        frameTimeouts.push(timeout);
    });
    animationTimeout = setTimeout(callback, action.images.length * game.animationSpeed);
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
        image: null,
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
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const actionObjKeys = Object.keys(game.actions);
    loadGameBg();
    loadImagesForActions();
    let selectedAnimation = "idle";
    let aux = () => {
        animate(context, game.actions[selectedAnimation], aux);
        selectedAnimation = "idle";
    };
    aux();
    const performAction = (action) => {
        var _a;
        clearPreviousAnimation();
        moveCharacter(canvas.width, canvas.height, (_a = action.moveX) !== null && _a !== void 0 ? _a : 0, 0);
        selectedAnimation = action.name;
        aux();
    };
    actionObjKeys.forEach((key) => {
        var _a;
        let action = game.actions[key];
        (_a = document.getElementById(action.buttonId)) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            performAction(action);
        });
    });
    document.addEventListener("keydown", (e) => {
        actionObjKeys.forEach((key) => {
            let action = game.actions[key];
            if (e.key === action.kbKey) {
                performAction(action);
            }
        });
    });
}
document.addEventListener("DOMContentLoaded", main);
