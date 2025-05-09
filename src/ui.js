// ui.js
import { Graphics } from 'pixi.js';
import { app } from './app.js';
import { gsap } from "gsap";

// Constants for hand positioning.
export const centerX = app.screen.width / 2;
export const centerY = app.screen.height + 140;
export const radius = 200;

// Arrange card sprites in a fanned arc.
export function arrangeCardsInHand(cards, centerX, centerY, radius, startAngle = -Math.PI / 4, endAngle = Math.PI / 4) {
    const numCards = cards.length;
    const angleStep = numCards > 1 ? (endAngle - startAngle) / (numCards - 1) : 0;
    cards.forEach((cardObj, index) => {
        const card = cardObj.sprite;
        const angle = startAngle + angleStep * index;
        const targetX = centerX + radius * Math.cos(angle);
        const targetY = centerY + radius * Math.sin(angle);
        card.rotation = angle;

        // Set initial state for animation
        card.alpha = 0;
        card.x = targetX;
        card.y = targetY + 100; // start slightly below
        card.rotation = angle;

        // Save original position
        card.originalPosition = { x: targetX, y: targetY, rotation: angle };

        // Animate in
        gsap.to(card, {
            y: targetY,
            alpha: 1,
            duration: 0.5,
            delay: 0.05 * index, // small delay between cards
            ease: "power2.out",
        });
    });
}

// Returns the grabbed card to hand
export  function returnCardToHand(cardSprite) {
    if (!cardSprite || !cardSprite.originalPosition) {
        console.warn("Cannot return card to hand: Missing reference or original position.");
        return;
    }
    const { x, y, rotation } = cardSprite.originalPosition;
    cardSprite.anchor.set(1.5, 1.5);  // Reset anchor
    gsap.to(cardSprite, {
        x,
        y,
        rotation,
        duration: 0.5,
        ease: "power2.out",
    });
}

// Create and export the play area
export const playArea = new Graphics();
playArea.rect(app.screen.width / 4, app.screen.height / 2 - 450, app.screen.width / 2, 500);
playArea.fill({color: 0xff3333, alpha : 0.3});
app.stage.addChild(playArea);
playArea.eventMode = 'static';