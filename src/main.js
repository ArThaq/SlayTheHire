// main.js
import { app, setupAppCanvas } from './app.js';
import { loadAssets, textures } from './assets.js';
import { gameState } from './gameState.js';
import { initializeDeck } from './game.js';
import { arrangeCardsInHand, centerX, centerY, radius } from './ui.js';
import { Enemy } from './enemy.js';
import { ResumeCard, VacationCard, ReferentCard, BrainstormCard } from './cards.js';
import { Text } from 'pixi.js';
import { initGlitchGrid } from './glitchGrid.js';

(async () => {
    // Initialize the application and attach the canvas.
    setupAppCanvas();

    app.stage.eventMode = 'dynamic';

    // Load assets.
    await loadAssets();

    // Create enemies.
    for (let i = 0; i < 1; i++) {
        const enemy = new Enemy(textures["wallOfRecruitment"], 220);
        enemy.setPosition(
            app.screen.width / 1.2 + (i - 1) * 200,
            app.screen.height / 1.5
        );
        app.stage.addChild(enemy.sprite);
        app.stage.addChild(enemy.healthText);
        gameState.enemies.push(enemy);
    }

    // Create and display the energy counter.
    const energyDisplay = new Text({
        text: `Energy: ${gameState.currentEnergy}`,
        style: {
            fontSize: 30,
            fontStyle: "bold",
            fill: 0x79f558,
        },
    });
    energyDisplay.x = 10;
    energyDisplay.y = 10;
    app.stage.addChild(energyDisplay);
    // Provide a way to update the energy display.
    gameState.updateEnergyDisplay = () => {
        energyDisplay.text = `Energy: ${gameState.currentEnergy}`;
    };

    // Initialize the deck.
    initializeDeck();

    // Initialize glitch grid visual effect
    initGlitchGrid();

    // Create the initial hand.
    for (let i = 0; i < 5; i++) {
        const resumeCard = new ResumeCard();
        gameState.cards.push(resumeCard);
        app.stage.addChild(resumeCard.sprite);
    }
    const vacationCard = new VacationCard();
    gameState.cards.push(vacationCard);
    app.stage.addChild(vacationCard.sprite);

    const referentCard = new ReferentCard();
    gameState.cards.push(referentCard);
    app.stage.addChild(referentCard.sprite);

    const brainstormCard = new BrainstormCard();
    gameState.cards.push(brainstormCard);
    app.stage.addChild(brainstormCard.sprite);

    // Arrange the cards in the hand.
    arrangeCardsInHand(gameState.cards, centerX, centerY, radius);
})();
