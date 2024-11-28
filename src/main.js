import {Application, Assets, Graphics, Sprite} from 'pixi.js';
import { gsap } from 'gsap';


(async () =>
{
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({
        antialias: true,
        resizeTo: window,
        backgroundAlpha: 0
    });

    // Append the application canvas to the document body
    document.body.style.backgroundImage = "url('http://localhost:5173/media/background/SpireBackground.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";
    document.body.style.margin = "0";
    document.body.appendChild(app.canvas);

    const knightTexture = await Assets.load('http://localhost:5173/media/cards/knight.jpg');

    const createCard = (texture) => {
        const card = new Sprite(texture);
        card.anchor.set(1.5, 1.5); // Center the anchor
        card.width = 150;
        card.height = 250;
        return card;
    };

    const colors = [0x0000ff, 0xaa0000, 0x00ff00, 0x009999, 0x999900]
    let colorsIndex = 0;


    // Create and arrange cards
    const cards = Array.from({ length: 5 }, () => {
        const card = createCard(knightTexture);
        app.stage.addChild(card); // Add the card to the stage
        card.tint = colors[colorsIndex];
        colorsIndex += 1;
        return card; // Store the card in the array
    });

    const arrangeCardsInHand = (cards, centerX, centerY, radius, startAngle = -Math.PI / 4, endAngle = Math.PI / 4) => {
        const numCards = cards.length;
        const angleStep = (endAngle - startAngle) / (numCards - 1);

        cards.forEach((card, index) => {
            const angle = startAngle + angleStep * index;
            card.x = centerX + radius * Math.cos(angle);
            card.y = centerY + radius * Math.sin(angle);
            card.rotation = angle;  // Rotate the card to face the player

            // Store the card's original position
            card.originalPosition = { x: card.x, y: card.y, rotation: card.rotation};
        });
    };

    const centerX = app.screen.width / 2;
    const centerY = app.screen.height + 140;  // Place the hand near the bottom
    const radius = 200; // Distance of the cards from the center of the hand
    arrangeCardsInHand(cards, centerX, centerY, radius);

    // Set the stage to be dynamic
    app.stage.eventMode = 'dynamic';

    // Enable interactive mode on all cards
    cards.forEach((card) => {
        card.eventMode = 'dynamic';
        card.buttonMode = true; // Show pointer cursor
        card.cursor = 'pointer';

        card.on('pointerdown', onDragStart); // Start drag
        card.on('pointerup', onDragEnd); // End drag
        card.on('pointerupoutside', onDragEnd); // End drag outside
    });

    // Create a play area
    const playArea = new Graphics();
    playArea.rect(app.screen.width / 4, app.screen.height / 2 - 350, app.screen.width / 2, 300);
    playArea.fill({color: 0xff0000, alpha : 0.3});
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

    function onDragStart(event) {
        dragTarget = this; // Store the reference to the dragged shape
        const cursorPosition = dragTarget.parent.toLocal(event.global);

        // Reset orientation
        dragTarget.rotation = 0; // Make the card upright
        dragTarget.anchor.set(0.5, 0.5); // Center the anchor for better drag handling

        // Align the card's position with the cursor
        dragTarget.position.set(cursorPosition.x, cursorPosition.y);

        app.stage.on('pointermove', onDragMove); // Listen for move events
    }

    function onDragEnd() {
        if (dragTarget) {
            const cardBounds = dragTarget.getBounds(); // Get the card's bounding box
            const playAreaBounds = playArea.getBounds(); // Get the play area's bounding box
            if (
                cardBounds.x + cardBounds.width > playAreaBounds.x && // Card right edge > Play area left edge
                cardBounds.x < playAreaBounds.x + playAreaBounds.width && // Card left edge < Play area right edge
                cardBounds.y + cardBounds.height > playAreaBounds.y && // Card bottom edge > Play area top edge
                cardBounds.y < playAreaBounds.y + playAreaBounds.height // Card top edge < Play area bottom edge
            ) {
                // Card is within the play area, destroy it
                app.stage.removeChild(dragTarget);
                cards.splice(cards.indexOf(dragTarget), 1); // Remove from array
            }
            {
                // Card is outside the play area, reset its position
                console.log("Card Reset : " + dragTarget);

                // Animate card back to original position
                const original = dragTarget.originalPosition;
                dragTarget.anchor.set(1.5, 1.5); // Resets the anchor

                gsap.to(dragTarget, {
                    x: original.x,
                    y: original.y,
                    rotation: original.rotation,
                    duration: 0.5, // Smooth animation
                    ease: "power2.out"
                });
            }

            //console.log("Card Bounds:", cardBounds);
            //console.log("Play Area Bounds:", playAreaBounds);

            app.stage.off('pointermove', onDragMove); // Stop listening for move
            dragTarget = null; // Clear the drag target
        }
    }
})();
