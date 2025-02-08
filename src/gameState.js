// gameState.js
export const gameState = {
    maxEnergy: 3,
    currentEnergy: 3,
    selectedEnemy: null,
    doubleDamageActive: false,
    discardType: "conditional", // For controlling discard behavior (Cards may change this value during their effects)
    playerDeck: [],
    cards: [],
    enemies: [],
    // A hook for UI energy updates.
    updateEnergyDisplay: null,
};
