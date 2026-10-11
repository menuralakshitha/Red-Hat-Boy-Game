"use strict";

var score = 0;
var gameState = "ready";
var groundMarginTop = 370;
var jumpHeight = 180;
var boyMarginTop = groundMarginTop;
var backgroundMargin = 0;
var obstacleCount = 20;
var runImageNum = 1;
var jumpImageNum = 1;
var deadImageNum = 1;
// The supplied ZIP contains Idle frames 2 through 10.
var idleImageNum = 2;
var runWorkerNum = 0;
var jumpWorkerNum = 0;
var deadWorkerNum = 0;
var idleWorkerNum = 0;

var jumpSound = new Audio("jump.mp3");
var deadSound = new Audio("dead.mp3");
var runSound = new Audio("run.mp3");
runSound.loop = true;

function playSound(sound, restart) {
    try {
        if (restart) sound.currentTime = 0;
        var playback = sound.play();
        if (playback && typeof playback.catch === "function") {
            playback.catch(function () {
                // Gameplay continues if the browser blocks audio playback.
            });
        }
    } catch (error) {
        // Audio is optional; it must not interrupt the game.
    }
}

function stopSound(sound) {
    sound.pause();
    try {
        sound.currentTime = 0;
    } catch (error) {
        // An unloaded audio file may not allow seeking yet.
    }
}

function setSprite(id, animation, frame) {
    document.getElementById(id).src = animation + " (" + frame + ").png";
}

function stopWorkers() {
    clearInterval(runWorkerNum);
    clearInterval(jumpWorkerNum);
    clearInterval(deadWorkerNum);
    clearInterval(idleWorkerNum);
    runWorkerNum = 0;
    jumpWorkerNum = 0;
    deadWorkerNum = 0;
    idleWorkerNum = 0;
}

function keyCheck(event) {
    var key = event.code || event.key;
    if (!key) {
        key = { 13: "Enter", 32: "Space", 38: "ArrowUp" }[event.which || event.keyCode];
    }
    if (key !== "Enter" && key !== "Space" && key !== " " && key !== "ArrowUp") return;
    event.preventDefault();
    if (event.repeat) return;

    var focusedControl = event.target && event.target.id;
    if (key === "ArrowUp" || (gameState === "running" && focusedControl === "jumpButton")) {
        startJump();
    } else if (gameState === "ready") {
        startGame();
    } else if (gameState === "over" && (key === "Enter" || focusedControl === "restartButton")) {
        newGame();
    }
}

function createBox() {
    for (var i = 0; i < obstacleCount; i++) {
        if (!document.getElementById("box" + i)) {
            var box = document.createElement("div");
            box.className = "box";
            box.id = "box" + i;
            box.setAttribute("aria-hidden", "true");
            document.getElementById("mainBox").appendChild(box);
        }
    }
    newGame();
}

function newGame() {
    stopWorkers();
    stopSound(runSound);
    stopSound(jumpSound);
    stopSound(deadSound);
    gameState = "ready";
    score = 0;
    boyMarginTop = groundMarginTop;
    backgroundMargin = 0;
    runImageNum = 1;
    jumpImageNum = 1;
    deadImageNum = 1;
    idleImageNum = 2;

    document.getElementById("score").textContent = "0";
    document.getElementById("gameOverScore").textContent = "0";
    document.getElementById("boy").style.marginTop = boyMarginTop + "px";
    document.getElementById("mainBox").style.backgroundPositionX = "0px";
    document.getElementById("startBox").hidden = false;
    document.getElementById("endBox").hidden = true;
    document.getElementById("controls").hidden = true;
    document.getElementById("jumpButton").disabled = false;
    setSprite("boy", "Run", 1);
    setSprite("idleBoy", "Idle", 2);

    var nextPosition = 700;
    for (var i = 0; i < obstacleCount; i++) {
        nextPosition += i < 10 ? 800 : 500;
        document.getElementById("box" + i).style.marginLeft = nextPosition + "px";
    }
    idleWorkerNum = setInterval(idle, 100);
    document.getElementById("startButton").focus({ preventScroll: true });
}

function startGame() {
    if (gameState !== "ready") return;
    clearInterval(idleWorkerNum);
    idleWorkerNum = 0;
    gameState = "running";
    document.getElementById("startBox").hidden = true;
    document.getElementById("controls").hidden = false;
    document.getElementById("startButton").blur();
    playSound(runSound, true);
    runWorkerNum = setInterval(run, 100);
}

function startJump() {
    if (gameState !== "running") return;
    clearInterval(runWorkerNum);
    runWorkerNum = 0;
    gameState = "jumping";
    jumpImageNum = 1;
    runSound.pause();
    document.getElementById("jumpButton").disabled = true;
    playSound(jumpSound, true);
    jumpWorkerNum = setInterval(jump, 100);
}

function moveWorld() {
    var furthestPosition = 0;
    for (var i = 0; i < obstacleCount; i++) {
        var obstacle = document.getElementById("box" + i);
        furthestPosition = Math.max(furthestPosition, parseFloat(obstacle.style.marginLeft));
    }
    furthestPosition -= 20;

    for (var i = 0; i < obstacleCount; i++) {
        var box = document.getElementById("box" + i);
        var position = parseFloat(box.style.marginLeft) - 20;
        // Recycle obstacles so the game keeps presenting challenges.
        if (position < -100) {
            position = furthestPosition + 500;
            furthestPosition = position;
        }
        box.style.marginLeft = position + "px";

        // Ignore the transparent edges of the character and flame images.
        var overlapsPlayer = position + 10 < 175 && position + 40 > 95;
        var feetTouchFlame = boyMarginTop + 180 > 484;
        if (overlapsPlayer && feetTouchFlame) {
            startDeath();
            return false;
        }
    }

    backgroundMargin -= 20;
    document.getElementById("mainBox").style.backgroundPositionX = backgroundMargin + "px";
    score += 1;
    document.getElementById("score").textContent = String(score);
    return true;
}

function run() {
    if (gameState !== "running" || !moveWorld()) return;
    setSprite("boy", "Run", runImageNum);
    runImageNum = runImageNum === 8 ? 1 : runImageNum + 1;
}

function jump() {
    if (gameState !== "jumping") return;
    // A complete arc gives enough airtime to clear a flame, then lands exactly.
    boyMarginTop = groundMarginTop - Math.round(
        jumpHeight * Math.sin(Math.PI * jumpImageNum / 12)
    );
    document.getElementById("boy").style.marginTop = boyMarginTop + "px";
    setSprite("boy", "Jump", jumpImageNum);
    if (!moveWorld()) return;

    if (jumpImageNum === 12) {
        clearInterval(jumpWorkerNum);
        jumpWorkerNum = 0;
        jumpImageNum = 1;
        boyMarginTop = groundMarginTop;
        document.getElementById("boy").style.marginTop = boyMarginTop + "px";
        gameState = "running";
        document.getElementById("jumpButton").disabled = false;
        runImageNum = 1;
        playSound(runSound, false);
        runWorkerNum = setInterval(run, 100);
    } else {
        jumpImageNum += 1;
    }
}

function startDeath() {
    if (gameState !== "running" && gameState !== "jumping") return;
    stopWorkers();
    gameState = "dead";
    stopSound(runSound);
    stopSound(jumpSound);
    document.getElementById("controls").hidden = true;
    boyMarginTop = groundMarginTop;
    document.getElementById("boy").style.marginTop = boyMarginTop + "px";
    deadImageNum = 1;
    setSprite("boy", "Dead", deadImageNum);
    playSound(deadSound, true);
    deadWorkerNum = setInterval(dead, 200);
}

function dead() {
    if (gameState !== "dead") return;
    deadImageNum += 1;
    setSprite("boy", "Dead", deadImageNum);
    if (deadImageNum === 10) {
        clearInterval(deadWorkerNum);
        deadWorkerNum = 0;
        gameState = "over";
        document.getElementById("gameOverScore").textContent = String(score);
        document.getElementById("endBox").hidden = false;
        document.getElementById("restartButton").focus({ preventScroll: true });
    }
}

function idle() {
    if (gameState !== "ready") return;
    setSprite("idleBoy", "Idle", idleImageNum);
    idleImageNum = idleImageNum === 10 ? 2 : idleImageNum + 1;
}
