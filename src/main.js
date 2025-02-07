import {Application, Assets, Graphics, Sprite, Text, TextStyle} from 'pixi.js';
import { gsap } from 'gsap';

(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({
        antialias: true,
        resizeTo: window,
        backgroundAlpha: 0,
    });

    let selectedEnemy = null; // Track the currently selected enemy



    // Append the application canvas to the document body
    document.body.style.backgroundImage = "url('http://localhost:5173/media/background/SpireBackground.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";
    document.body.style.margin = "0";
    document.body.appendChild(app.canvas);

    // Register assets with friendly aliases
    Assets.add({alias: 'knightCard', src: 'http://localhost:5173/media/cards/knight.jpg'});
    const knightTexture = await Assets.load('knightCard');

    Assets.add({alias: 'bandit', src: 'http://localhost:5173/media/enemies/bandit.jpg'});
    const banditTexture = await Assets.load('bandit');

    Assets.add({alias: 'vacation', src: 'http://localhost:5173/media/cards/vacation.jpg'});
    const vacationTexture = await Assets.load('vacation');

    Assets.add({ alias: 'doubleDamageCard', src: 'http://localhost:5173/media/cards/eee.png' });
    const doubleDamageTexture = await Assets.load('doubleDamageCard');

    Assets.add({ alias: 'brainstorm', src: 'http://localhost:5173/media/cards/brainstorm.png' });
    const brainstormTexture = await Assets.load('brainstorm');

    // Initial energy setup
    const maxEnergy = 3; // Maximum energy
    let currentEnergy = 3; // Starting energy
    const energyDisplay = new Text(`Energy: ${currentEnergy}`, {
        fontSize: 24,
        fill: 0xffffff,
    });
    energyDisplay.x = 10;
    energyDisplay.y = 10;
    app.stage.addChild(energyDisplay);

    // Define the player's deck
    let playerDeck = [];

    // Initialize the deck with Knight cards (for now, just 10 Knight cards)
    const initializeDeck = () => {
        for (let i = 0; i < 10; i++) {  // Add 10 Knight cards to the deck
            playerDeck.push(new KnightCard(knightTexture, 0));  // Assuming the knight card has a cost of 1 energy
        }
        console.log(`${playerDeck.length} Knight cards added to the deck!`);
    };

    const drawCard = () => {
        if (playerDeck.length > 0) {
            const cardToDraw = playerDeck.shift();  // Remove the first card from the deck (front-most)
            console.log(`Drew a card: ${cardToDraw}`);

            // Add the drawn card to the player's hand (you can place it in the player's hand as we did earlier)
            cards.push(cardToDraw);
            app.stage.addChild(cardToDraw.sprite);

            // Optionally, you could shuffle or perform other operations here
            arrangeCardsInHand(cards, centerX, centerY, radius);
        } else {
            console.log("The deck is empty!");
        }
    };

    // Flag to track if the double damage effect is active
    let doubleDamageActive = false;

    let discardType = "conditional";



    // Create the Card class before usage
    class Card {
        constructor(texture, energyCost = 0) {
            this.sprite = new Sprite(texture);
            this.energyCost = energyCost;

            // Store label (alias) for identification
            this.label = texture.label || 'Unknown Card';

            // Set up initial properties
            this.sprite.anchor.set(1.5, 1.5);
            this.sprite.width = 150;
            this.sprite.height = 250;

            // Enable interaction for the sprite
            this.sprite.eventMode = 'dynamic';
            this.sprite.buttonMode = true;
            this.sprite.cursor = 'pointer';

            // Bind event handlers
            this.sprite.on('pointerdown', this.onDragStart.bind(this));
            this.sprite.on('pointerup', this.onDragEnd.bind(this));
            this.sprite.on('pointerupoutside', this.onDragEnd.bind(this));

            // Display the energy cost
            const energyCostText = new Text(this.energyCost, {
                fontSize: 18,
                fill: 0xffd700,
            });
            energyCostText.anchor.set(0.5, 0.5);
            energyCostText.x = this.sprite.width / 2 - 100;
            energyCostText.y = this.sprite.height / 2 - 10;
            this.sprite.addChild(energyCostText);
        }

        onDragStart(event) {
            console.log(`Started dragging: ${this.label}`);
            dragTarget = this.sprite; // Store the reference to the dragged sprite
            dragTarget = this.sprite; // Store the reference to the dragged sprite
            const cursorPosition = dragTarget.parent.toLocal(event.global);

            // Reset orientation
            dragTarget.rotation = 0; // Make the card upright
            dragTarget.anchor.set(0.5, 0.5); // Center the anchor for better drag handling

            // Align the card's position with the cursor
            dragTarget.position.set(cursorPosition.x, cursorPosition.y);

            app.stage.on('pointermove', onDragMove); // Listen for move events
        }

        effect() {
            console.log("Effect for base card. Should be overridden.");
        }

        onDragEnd() {
            if (dragTarget) {
                const cardBounds = dragTarget.getBounds(); // Get the card's bounding box
                const playAreaBounds = playArea.getBounds(); // Get the play area's bounding box
                if (
                    cardBounds.x + cardBounds.width > playAreaBounds.x &&
                    cardBounds.x < playAreaBounds.x + playAreaBounds.width &&
                    cardBounds.y + cardBounds.height > playAreaBounds.y &&
                    cardBounds.y < playAreaBounds.y + playAreaBounds.height
                ) {
                    // Card is within the play area and enough energy, trigger its effect
                    if (currentEnergy >= this.energyCost) {
                        currentEnergy -= this.energyCost;
                        energyDisplay.text = `Energy: ${currentEnergy}`;
                        console.log("Card played: " + this.label);
                        // Check for selected target
                        if (!selectedEnemy && enemies.length > 0) {
                            // Default to the front-most enemy
                            selectedEnemy = enemies[0];
                            console.log("No target selected. Attacking the front-most enemy!");
                        }
                        this.effect(); // Trigger the card's effect
                        console.log('discard type : ' + discardType)
                        if (discardType === "conditional") {
                            discardType = "normal";
                            console.log('discard type : ' + discardType)
                        }
                        else {
                            app.stage.removeChild(dragTarget);
                            cards.splice(cards.indexOf(this), 1); // Remove card from array
                        }
                    } else {
                        console.log("Not enough energy to play this card.");
                        // Card is outside the play area, reset its position
                        const original = dragTarget.originalPosition;
                        dragTarget.anchor.set(1.5, 1.5); // Reset the anchor

                        gsap.to(dragTarget, {
                            x: original.x,
                            y: original.y,
                            rotation: original.rotation,
                            duration: 0.5, // Smooth animation
                            ease: "power2.out",
                        });
                    }
                } else {
                    // Card is outside the play area, reset its position
                    const original = dragTarget.originalPosition;
                    dragTarget.anchor.set(1.5, 1.5); // Reset the anchor

                    gsap.to(dragTarget, {
                        x: original.x,
                        y: original.y,
                        rotation: original.rotation,
                        duration: 0.5, // Smooth animation
                        ease: "power2.out",
                    });
                }
                app.stage.off('pointermove', onDragMove); // Stop listening for move
                dragTarget = null; // Clear the drag target
            }
        }
    }

    // Create the Enemy class
    class Enemy {
        constructor(texture, health) {
            this.sprite = new Sprite(texture);
            this.health = health;

            // Display health as a text overlay
            const style = new TextStyle({fill: '#990000', fontSize: 24, fontWeight: 'bold'});
            this.healthText = new Text("HP: " + this.health, style);

            // Position enemy and health text
            this.sprite.anchor.set(0.5);
            this.healthText.anchor.set(0.5);

            // Enable interaction for targeting
            this.sprite.eventMode = 'dynamic';
            this.sprite.buttonMode = true;
            this.sprite.cursor = 'pointer';

            // Event listeners for targeting
            this.sprite.on('pointerover', () => this.highlight(true));
            this.sprite.on('pointerout', () => this.highlight(false));
            this.sprite.on('pointerdown', () => this.select());
        }

        setPosition(x, y) {
            this.sprite.x = x;
            this.sprite.y = y;
            this.healthText.x = x;
            this.healthText.y = y - 120; // Offset above the enemy
        }

        highlight(isHovered) {
            if (isHovered) {
                this.sprite.tint = 0xffff00; // Yellow tint on hover
            } else if (this !== selectedEnemy) {
                this.sprite.tint = 0xffffff; // Reset tint if not selected
            }
        }

        select() {
            if (selectedEnemy) {
                selectedEnemy.sprite.tint = 0xffffff; // Reset previous selection's tint
            }
            selectedEnemy = this; // Set this enemy as selected
            this.sprite.tint = 0x8888FF; // Red tint to indicate selection
            console.log(`Selected enemy with HP: ${this.health}`);
        }

        takeDamage(amount) {
            this.health -= amount;
            console.log(`Enemy takes ${amount} damage! Remaining HP: ${this.health}`);

            // Update health display
            this.healthText.text = `HP: ${this.health}`;
            this.sprite.tint = 'red';
            setTimeout(() => {
                this.sprite.tint = 'white';
            }, 200);

            // Check if the enemy is defeated
            if (this.health <= 0) {
                setTimeout(() => {
                    this.destroy();
                }, 200);
            }
        }

        destroy()
        {
            console.log("Enemy defeated!");

            // Remove sprite and health text from the stage
            app.stage.removeChild(this.sprite);
            app.stage.removeChild(this.healthText);

            // Remove from the enemies array
            const index = enemies.indexOf(this);
            if (index > -1) {
                enemies.splice(index, 1);
            }

            // Nullify references for garbage collection
            this.sprite.destroy();
            this.sprite = null;
            this.healthText = null;

            // Refresh the selected enemy
            if (enemies.length > 0) {
                // Set the front-most enemy as the new target
                selectedEnemy = enemies[0];
                selectedEnemy.sprite.tint = 0x8888FF; // Highlight new selection
            } else {
                selectedEnemy = null; // No enemies left
            }
        }
    }

// Brainstorm card class
    class BrainstormCard extends Card {
        constructor() {
            super(brainstormTexture, 1);  // Assume 2 energy cost
            this.uses = 0;  // Track how many times Brainstorm has been used
        }

        effect() {
            discardType = "conditional"
            this.uses++;
            console.log("Number of uses : " + this.uses)

            let drawAmount = 4 - this.uses;  // Draw 3 initially, then 2, then 1
            if (drawAmount > 1) {
                console.log(`Brainstorm used. Drawing ${drawAmount} cards.`);
                for (let i = 0; i < drawAmount; i++) {
                    drawCard();  // Draw cards using the previously defined drawCard function
                }

                // Card is outside the play area, reset its position
                const original = dragTarget.originalPosition;
                dragTarget.anchor.set(1.5, 1.5); // Reset the anchor

                gsap.to(dragTarget, {
                    x: original.x,
                    y: original.y,
                    rotation: original.rotation,
                    duration: 0.5, // Smooth animation
                    ease: "power2.out",
                });

                //arrangeCardsInHand(cards, centerX, centerY, radius);
            } else {
                console.log("Brainstorm used 3 times. Discarding.");
                drawCard();
                this.discard();  // Discard Brainstorm after 3 uses
            }

            // Call this method to remove the card from the hand if discarded
            //arrangeCardsInHand(cards, centerX, centerY, radius);
        }

        discard() {
            // Remove the card from the hand and the stage
            let index = cards.indexOf(this);
            if (index > -1) {
                cards.splice(index, 1);
                app.stage.removeChild(this.sprite);
            }
        }
    }

    // Knight Card Class
    class KnightCard extends Card {
        constructor() {
            super(knightTexture, 0); // Assume 1 energy cost for Knight card
            discardType = "normal";
        }

        effect() {
            if (selectedEnemy) {
                const damage = doubleDamageActive ? 20 : 10; // Double the damage if effect is active
                selectedEnemy.takeDamage(damage);
                console.log("Knight card effect: Deal ${damage} damage to the enemy!");
            } else {
                console.log("No enemy targeted.");
            }
        }
    }

    // Vacation Card Class
    class VacationCard extends Card {
        constructor() {
            super(vacationTexture, 0); // Assume 2 energy cost for Vacation card
        }

        effect() {
            console.log("Vacation Card used. Restoring energy to max.");
            currentEnergy = maxEnergy;
            energyDisplay.text = `Energy: ${currentEnergy}`;
        }
    }

    // Double Damage Card Class
    class DoubleDamageCard extends Card {
        constructor() {
            super(doubleDamageTexture, 1); // Assume 1 energy cost for Double Damage card
        }

        effect() {
            console.log("Double Damage Card used. Doubling attack damage.");
            doubleDamageActive = true;
        }
    }

    // Create multiple enemies
    const enemies = Array.from({ length: 3 }, (_, i) => {
        const enemy = new Enemy(banditTexture, 80); // Each enemy starts with 50 HP
        enemy.setPosition(
            app.screen.width / 1.2 + (i - 1) * 200, // Spread enemies horizontally
            app.screen.height / 1.5
        );
        app.stage.addChild(enemy.sprite);
        app.stage.addChild(enemy.healthText);
        return enemy;
    });

    // Initialize the deck
    initializeDeck();

    // Create cards as Card objects instead of Sprites
    const cards = Array.from({ length: 0 }, () => {
        const card = new Card(knightTexture, 0);
        console.log("cardURL: " + knightTexture.label); // Outputs the URL of the card

        app.stage.addChild(card.sprite); // Add the sprite to the stage
        return card; // Store the Card object in the array
    });

    // Add 5 Knight cards to the player's hand
    for (let i = 0; i < 5; i++) {
        const knightCard = new KnightCard();
        cards.push(knightCard); // Add the card to the player's card array
        app.stage.addChild(knightCard.sprite); // Add the card's sprite to the stage
    }

    const vacationCard = new VacationCard();
    cards.push(vacationCard);
    app.stage.addChild(vacationCard.sprite);

    const doubleDamageCard = new DoubleDamageCard();
    cards.push(doubleDamageCard);
    app.stage.addChild(doubleDamageCard.sprite);

    // Add Brainstorm card to the hand and test its behavior
    const brainstormCard = new BrainstormCard();
    cards.push(brainstormCard);  // Add the Brainstorm card to the player's hand
    app.stage.addChild(brainstormCard.sprite);  // Display the card on the screen

    // Update arrangeCardsInHand to work with Card objects
    const arrangeCardsInHand = (cards, centerX, centerY, radius, startAngle = -Math.PI / 4, endAngle = Math.PI / 4) => {
        const numCards = cards.length;
        const angleStep = (endAngle - startAngle) / (numCards - 1);

        cards.forEach((cardObj, index) => {
            const card = cardObj.sprite; // Access the sprite
            const angle = startAngle + angleStep * index;
            card.x = centerX + radius * Math.cos(angle);
            card.y = centerY + radius * Math.sin(angle);
            card.rotation = angle; // Rotate the card to face the player

            // Store the card's original position
            card.originalPosition = { x: card.x, y: card.y, rotation: card.rotation };
        });
    };

    const centerX = app.screen.width / 2;
    const centerY = app.screen.height + 140; // Place the hand near the bottom
    const radius = 200; // Distance of the cards from the center of the hand
    arrangeCardsInHand(cards, centerX, centerY, radius);

    // Set the stage to be dynamic
    app.stage.eventMode = 'dynamic';

    // Create a play area
    const playArea = new Graphics();
    playArea.rect(app.screen.width / 4, app.screen.height / 2 - 350, app.screen.width / 2, 300);
    playArea.fill({ color: 0xff0000, alpha: 0.3 });
    app.stage.addChild(playArea);

    playArea.eventMode = 'static';

    // Enable drag-and-drop methods
    let dragTarget = null;
    let dragOffset = { x: 0, y: 0 };
    function onDragMove(event) {
        if (dragTarget) {
            const newPosition = dragTarget.parent.toLocal(event.global);
            dragTarget.position.set(
                newPosition.x - dragOffset.x,
                newPosition.y - dragOffset.y
            );
        }
    }
})();
