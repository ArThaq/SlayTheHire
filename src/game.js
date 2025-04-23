// game.js
import { gameState } from './gameState.js';
import { ResumeCard } from './cards.js';
import { app } from './app.js';
import { arrangeCardsInHand, centerX, centerY, radius } from './ui.js';

// Initializes the deck (Currently creates a 10 card deck of knight cards
export function initializeDeck() {
    for (let i = 0; i < 10; i++) {
        gameState.playerDeck.push(new ResumeCard());
    }
    console.log(`${gameState.playerDeck.length} Resume cards added to the deck!`);
}

// Allows for cards to be drawn from the deck and place into the hand
export function drawCard() {
    if (gameState.playerDeck.length > 0) {
        const cardToDraw = gameState.playerDeck.shift();
        console.log(`Drew a card: ${cardToDraw.label}`);
        gameState.cards.push(cardToDraw);
        app.stage.addChild(cardToDraw.sprite);
        arrangeCardsInHand(gameState.cards, centerX, centerY, radius);
    } else {
        console.log("The deck is empty!");
    }
}
