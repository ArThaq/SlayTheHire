// assets.js
import { Assets } from 'pixi.js';

const base = import.meta.env.BASE_URL;

// Gives aliases to card art location for easier handling
export const assetList = [
    { alias: 'resume', src: `${base}media/cards/resume.png` },
    { alias: 'wallOfRecruitment', src: `${base}media/enemies/wallOfRecruitment.png` },
    { alias: 'vacation', src: `${base}media/cards/vacation.jpg` },
    { alias: 'referent', src: `${base}media/cards/referent.png` },
    { alias: 'brainstorm', src: `${base}media/cards/brainstorm.png` },
    { alias: 'particle', src: `${base}media/effects/particles.png` },
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
