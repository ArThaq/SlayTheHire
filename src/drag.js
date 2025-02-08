// drag.js

export const dragOffset = { x: 0, y: 0 };

// Allows the grabbed card to be dragged
export function onDragMove(event, sprite, dragOffset) {
    if (sprite) {
        const newPosition = sprite.parent.toLocal(event.global);
        sprite.position.set(
            newPosition.x - dragOffset.x,
            newPosition.y - dragOffset.y
        );
    }
}

