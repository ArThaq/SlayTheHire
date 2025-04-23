// app.js
import { Application } from 'pixi.js';

// Create a new application
const app = new Application();

// Initialize the application
await app.init({
    antialias: true,
    resizeTo: window,
    backgroundAlpha: 0,
});

// Set up document styles and attach the canvas to the page.
export function setupAppCanvas() {
    document.body.style.backgroundImage = "url('http://localhost:5173/media/background/Matrix4Background.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";
    document.body.style.margin = "0";
    document.body.appendChild(app.canvas);
}

export {app};
