// glitchGrid.js
import {Container, Graphics} from 'pixi.js';
import {app} from './app.js';
import {gsap} from 'gsap';

const gridContainer = new Container();
app.stage.addChildAt(gridContainer, 1); // Behind everything

const spacing = 60;
const glitchLines = [];
const glitchColors = [0x00ff9f, 0x00b8ff, 0x001eff, 0xbd00ff, 0xd600ff];

function createGrid() {
    const width = app.screen.width;
    const height = app.screen.height;

    for (let x = 0; x <= width; x += spacing) {
        const line = new Graphics();
        const x1 = x, y1 = 0, x2 = x, y2 = height;
        line.moveTo(x1, y1).lineTo(x2, y2);
        line.stroke({ width: 1, color: 0xffffff, alpha: 0.5, duration: 3 });

        // Store the coordinates for later redraws
        line.meta = { x1, y1, x2, y2 };

        gridContainer.addChild(line);
        glitchLines.push(line);
    }

    for (let y = 0; y <= height; y += spacing) {
        const line = new Graphics();
        const x1 = 0, y1 = y, x2 = width, y2 = y;
        line.moveTo(x1, y1).lineTo(x2, y2);
        line.stroke({ width: 1, color: 0xffffff, alpha: 0.5, duration: 1 });

        // Store the coordinates for later redraws
        line.meta = { x1, y1, x2, y2 };

        gridContainer.addChild(line);
        glitchLines.push(line);
    }
}

function glitchLine(line) {
    if (!line.meta) return;
    const { x1, y1, x2, y2 } = line.meta;

    const glitchColor = glitchColors[Math.floor(Math.random() * glitchColors.length)];

    line.clear();
    line.moveTo(x1, y1).lineTo(x2, y2);
    line.stroke({ width: 1, color: glitchColor, alpha: 0.5, duration: 2 });

    gsap.to(line, {
        alpha: 0.5,
        duration: 2,
        onComplete: () => {
            line.clear();
            line.moveTo(x1, y1).lineTo(x2, y2);
            line.stroke({ width: 1, color: 0xffffff, alpha: 0.5});
        }
    });
}

function animateGlitch() {
    setInterval(() => {
        for (let i = 0; i < 5; i++) { // Change limit to modify the number of glitched lines per cycle
            const line = glitchLines[Math.floor(Math.random() * glitchLines.length)];
            if (line) glitchLine(line);
        }
    }, 600); // Change to modify frequency of cycles
}

export function initGlitchGrid() {
    createGrid();
    animateGlitch();
}
