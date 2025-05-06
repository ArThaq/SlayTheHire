// cards.js
import { Sprite, Text, ColorMatrixFilter, Container } from 'pixi.js';
import { app } from './app.js';
import { dragOffset, onDragMove } from './drag.js';
import { gameState } from './gameState.js';
import { drawCard } from './game.js';
import { textures } from './assets.js';
import { returnCardToHand } from "./ui";
import { createParticleBurst } from './particles.js';
import { tooltipManager } from './tooltipManager.js';

export class Card {
    constructor(texture, energyCost = 0) {
        this.container = new Container();
        this.sprite = new Sprite(texture);
        this.energyCost = energyCost;
        this.label = texture.label || 'Unknown Card';
        this.description = this.label;

        // Configure sprite appearance and size.
        this.sprite.anchor.set(1.5, 1.5);
        this.sprite.width = 150;
        this.sprite.height = 250;

        // Enable interactions.
        this.sprite.eventMode = 'dynamic';
        this.sprite.buttonMode = true;

        // Adds a hand cursor while hovering cards
        this.sprite.cursor = 'pointer';

        const hoverFilter = new ColorMatrixFilter();
        hoverFilter.brightness(1.2, false); // Slight glow-like effect

        this.sprite.on('pointerover', () => {
            this.sprite.filters = [hoverFilter]; // Highlights hovered card
            tooltipManager.show(this.description || 'No description'); // Display the tooltip
        });

        this.sprite.on('pointerout', () => {
            this.sprite.filters = [];
            tooltipManager.hide();
        });

        // Bind drag events.
        this.sprite.on('pointerdown', this.onDragStart.bind(this));
        this.sprite.on('pointerup', this.onDragEnd.bind(this));
        this.sprite.on('pointerupoutside', this.onDragEnd.bind(this));

        // Add sprite to container
        this.container.addChild(this.sprite);

        // Display the energy cost on the card.
        const energyCostText = new Text({
            text: this.energyCost,
            style: {
                fontSize: 18,
                fill: 0xffd700,
            },
        });
        energyCostText.anchor.set(0.5, 0.5);
        energyCostText.x = this.sprite.width / 2 - 100;
        energyCostText.y = this.sprite.height / 2 - 10;

        // Add label to container
        this.container.addChild(energyCostText);
    }

    onDragStart() {
        console.log(`Started dragging: ${this.label}`);

        // noinspection JSDeprecatedSymbols
        const cursorPosition = this.sprite.parent.toLocal(event);

        // Adjust sprite properties for dragging
        this.sprite.rotation = 0;
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(cursorPosition.x, cursorPosition.y);

        app.stage.on('pointermove', (e) => onDragMove(e, this.sprite, dragOffset));
    }

    effect() {
        console.log("Effect for base card. Should be overridden.");
    }

    onDragEnd() {
        if (this.sprite) {
            // Capture the current target so asynchronous operations work as expected.
            const cardBounds = this.sprite.getBounds();

            import('./ui.js').then(({ playArea }) => {
                const playAreaBounds = playArea.getBounds();
                if (
                    cardBounds.x + cardBounds.width > playAreaBounds.x &&
                    cardBounds.x < playAreaBounds.x + playAreaBounds.width &&
                    cardBounds.y + cardBounds.height > playAreaBounds.y &&
                    cardBounds.y < playAreaBounds.y + playAreaBounds.height
                ) {
                    if (gameState.currentEnergy >= this.energyCost) {
                        gameState.currentEnergy -= this.energyCost;
                        if (gameState.updateEnergyDisplay) { // noinspection JSValidateTypes
                            gameState.updateEnergyDisplay();
                        }
                        console.log("Card played: " + this.label);
                        if (!gameState.selectedEnemy && gameState.enemies.length > 0) {
                            gameState.selectedEnemy = gameState.enemies[0];
                            console.log("No target selected. Attacking the front-most enemy!");
                        }
                        this.effect(); // Activates that card's effect
                        createParticleBurst(this.sprite.x, this.sprite.y); // Creates a particle burst when a card is discarded
                        if (gameState.discardType === "conditional") {
                            gameState.discardType = "normal";
                        } else {
                            app.stage.removeChild(this.sprite);
                            const index = gameState.cards.indexOf(this);
                            if (index > -1) gameState.cards.splice(index, 1);
                        }
                    } else {
                        console.log("Not enough energy to play this card.");
                        returnCardToHand(this.sprite);
                    }
                } else {
                    // Card was dropped outside the play area; animate it back.
                    returnCardToHand(this.sprite);
                }
                app.stage.off('pointermove');
            });
        }
        tooltipManager.hide();
    }
}

// ---------------------------------------------------------------------
// Derived Card Classes
// ---------------------------------------------------------------------

export class ResumeCard extends Card {
    constructor() {
        // Use the preloaded knight texture.
        super(textures["resume"], 0);
        gameState.discardType = "normal";
        this.description = "Resume\nDeal 10 damage to the targeted enemy. If a buff is active, deal 20 instead (Costs 0 energy)";

    }
    effect() {
        if (gameState.selectedEnemy) {
            const damage = gameState.doubleDamageActive ? 20 : 10;
            gameState.selectedEnemy.takeDamage(damage);
            console.log(`Resume card effect: Deal ${damage} damage to the enemy!`);
        } else {
            console.log("No enemy targeted.");
        }
    }
}

export class VacationCard extends Card {
    constructor() {
        super(textures["vacation"], 0);
        this.description = "Vacation\nRestore your energy to the maximum value (Costs 0 energy)";
    }
    effect() {
        console.log("Vacation Card used. Restoring energy to max.");
        gameState.currentEnergy = gameState.maxEnergy;
        if (gameState.updateEnergyDisplay) { // noinspection JSValidateTypes
            gameState.updateEnergyDisplay();
        }
    }
}

export class ReferentCard extends Card {
    constructor() {
        super(textures["referent"], 3);
        this.description = "Referent\nResume cards now deal double damage (Costs 3 energy)";

    }
    effect() {
        console.log("Referent card used used. Doubling attack damage.");
        gameState.doubleDamageActive = true;
    }
}

export class BrainstormCard extends Card {
    constructor() {
        super(textures["brainstorm"], 1);
        this.description = "Brainstorm\nDraw 3 cards, each use reduces cards drawn by 1. (Costs 1 energy)";
        this.uses = 0;
        this.drawAmount = 3;

    }
    effect() {
        gameState.discardType = "conditional";
        if (this.drawAmount > 1) {
            console.log(`Brainstorm used. Drawing ${this.drawAmount} cards.`);
            for (let i = 0; i < this.drawAmount; i++) {
                drawCard();
            }
            returnCardToHand(this.sprite);
            this.uses++;
            this.drawAmount = 3 - this.uses;
            this.description = "Brainstorm\nDraw " + this.drawAmount + " cards, each use reduces cards drawn by 1 (Costs 1 energy)";
            console.log("Number of uses : " + this.uses);
        } else {
            console.log("Brainstorm used 3 times. Discarding.");
            drawCard();
            this.discard();
        }
    }
    discard() {
        const index = gameState.cards.indexOf(this);
        if (index > -1) {
            gameState.cards.splice(index, 1);
            app.stage.removeChild(this.sprite);
        }
    }
}
