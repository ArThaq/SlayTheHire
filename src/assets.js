// assets.js
import { Assets } from 'pixi.js';

// Gives aliases to card art location for easier handling
export const assetList = [
    { alias: 'resume', src: 'http://localhost:5173/media/cards/resume.png' },
    { alias: 'wallOfRecruitment', src: 'http://localhost:5173/media/enemies/wallOfRecruitment.png' },
    { alias: 'vacation', src: 'http://localhost:5173/media/cards/vacation.jpg' },
    { alias: 'referent', src: 'http://localhost:5173/media/cards/referent.png' },
    { alias: 'brainstorm', src: 'http://localhost:5173/media/cards/brainstorm.png' },
    { alias: 'particle', src:'http://localhost:5173/media/effects/particles.png' },
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
