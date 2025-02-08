// cards.js
import { Sprite, Text } from 'pixi.js';
import { app } from './app.js';
import {dragOffset, onDragMove} from './drag.js';
import { gameState } from './gameState.js';
import { drawCard } from './game.js';
import { textures } from './assets.js';
import { returnCardToHand } from "./ui";

export class Card {
    constructor(texture, energyCost = 0) {
        this.sprite = new Sprite(texture);
        this.energyCost = energyCost;
        this.label = texture.label || 'Unknown Card';

        // Configure sprite appearance and size.
        this.sprite.anchor.set(1.5, 1.5);
        this.sprite.width = 150;
        this.sprite.height = 250;

        // Enable interactions.
        this.sprite.eventMode = 'dynamic';
        this.sprite.buttonMode = true;
        this.sprite.cursor = 'pointer';

        // Bind drag events.
        this.sprite.on('pointerdown', this.onDragStart.bind(this));
        this.sprite.on('pointerup', this.onDragEnd.bind(this));
        this.sprite.on('pointerupoutside', this.onDragEnd.bind(this));

        // Display the energy cost on the card.
        const energyCostText = new Text(this.energyCost, {
            fontSize: 18,
            fill: 0xffd700,
        });
        energyCostText.anchor.set(0.5, 0.5);
        energyCostText.x = this.sprite.width / 2 - 100;
        energyCostText.y = this.sprite.height / 2 - 10;
        this.sprite.addChild(energyCostText);
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
                        this.effect();
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
    }
}

// ---------------------------------------------------------------------
// Derived Card Classes
// ---------------------------------------------------------------------

export class KnightCard extends Card {
    constructor() {
        // Use the preloaded knight texture.
        super(textures["knightCard"], 0);
        gameState.discardType = "normal";
    }
    effect() {
        if (gameState.selectedEnemy) {
            const damage = gameState.doubleDamageActive ? 20 : 10;
            gameState.selectedEnemy.takeDamage(damage);
            console.log(`Knight card effect: Deal ${damage} damage to the enemy!`);
        } else {
            console.log("No enemy targeted.");
        }
    }
}

export class VacationCard extends Card {
    constructor() {
        super(textures["vacation"], 0);
    }
    effect() {
        console.log("Vacation Card used. Restoring energy to max.");
        gameState.currentEnergy = gameState.maxEnergy;
        if (gameState.updateEnergyDisplay) { // noinspection JSValidateTypes
            gameState.updateEnergyDisplay();
        }
    }
}

export class DoubleDamageCard extends Card {
    constructor() {
        super(textures["doubleDamageCard"], 3);
    }
    effect() {
        console.log("Double Damage Card used. Doubling attack damage.");
        gameState.doubleDamageActive = true;
    }
}

export class BrainstormCard extends Card {
    constructor() {
        super(textures["brainstorm"], 1);
        this.uses = 0;
    }
    effect() {
        gameState.discardType = "conditional";
        this.uses++;
        console.log("Number of uses : " + this.uses);
        let drawAmount = 4 - this.uses;
        if (drawAmount > 1) {
            console.log(`Brainstorm used. Drawing ${drawAmount} cards.`);
            for (let i = 0; i < drawAmount; i++) {
                drawCard();
            }
            returnCardToHand(this.sprite);
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
