// main.js
import { app, setupAppCanvas } from './app.js';
import { loadAssets, textures } from './assets.js';
import { gameState } from './gameState.js';
import { initializeDeck } from './game.js';
import { arrangeCardsInHand, centerX, centerY, radius } from './ui.js';
import { Enemy } from './enemy.js';
import { KnightCard, VacationCard, DoubleDamageCard, BrainstormCard } from './cards.js';
import { Text } from 'pixi.js';

(async () => {
    // Initialize the application and attach the canvas.
    setupAppCanvas();

    app.stage.eventMode = 'dynamic';

    // Load assets.
    await loadAssets();

    // Create enemies.
    for (let i = 0; i < 3; i++) {
        const enemy = new Enemy(textures["bandit"], 80);
        enemy.setPosition(
            app.screen.width / 1.2 + (i - 1) * 200,
            app.screen.height / 1.5
        );
        app.stage.addChild(enemy.sprite);
        app.stage.addChild(enemy.healthText);
        gameState.enemies.push(enemy);
    }

    // Create and display the energy counter.
    const energyDisplay = new Text(`Energy: ${gameState.currentEnergy}`, {
        fontSize: 24,
        fill: 0xffffff,
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

    // Create the initial hand.
    for (let i = 0; i < 5; i++) {
        const knightCard = new KnightCard();
        gameState.cards.push(knightCard);
        app.stage.addChild(knightCard.sprite);
    }
    const vacationCard = new VacationCard();
    gameState.cards.push(vacationCard);
    app.stage.addChild(vacationCard.sprite);

    const doubleDamageCard = new DoubleDamageCard();
    gameState.cards.push(doubleDamageCard);
    app.stage.addChild(doubleDamageCard.sprite);

    const brainstormCard = new BrainstormCard();
    gameState.cards.push(brainstormCard);
    app.stage.addChild(brainstormCard.sprite);

    // Arrange the cards in the hand.
    arrangeCardsInHand(gameState.cards, centerX, centerY, radius);
})();
