// assets.js
import { Assets } from 'pixi.js';

// Gives aliases to card art location for easier handling
export const assetList = [
    { alias: 'knightCard', src: 'http://localhost:5173/media/cards/knight.jpg' },
    { alias: 'bandit', src: 'http://localhost:5173/media/enemies/bandit.jpg' },
    { alias: 'vacation', src: 'http://localhost:5173/media/cards/vacation.jpg' },
    { alias: 'doubleDamageCard', src: 'http://localhost:5173/media/cards/eee.png' },
    { alias: 'brainstorm', src: 'http://localhost:5173/media/cards/brainstorm.png' },
];

export const textures = {};

export async function loadAssets() {
    // Register all assets first.
    assetList.forEach((asset) => Assets.add(asset));
    // Load each asset and store its texture.
    for (const asset of assetList) {
        textures[asset.alias] = await Assets.load(asset.alias);
    }
}
