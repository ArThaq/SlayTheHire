// particles.js
import { Container, Sprite, Texture } from 'pixi.js';
import { app } from './app.js';

export function createParticleBurst(x, y, textureKey = 'particle') {
    const container = new Container();
    app.stage.addChild(container);

    for (let i = 0; i < 10; i++) {
        const particle = new Sprite(Texture.from(textureKey));
        particle.anchor.set(0.5);
        particle.x = x;
        particle.y = y;
        particle.scale.set(0.5 + Math.random() * 0.5);
        particle.alpha = 1;

        // Random movement and spin
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 2;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.vr = (Math.random() - 0.5) * 0.1;

        container.addChild(particle);
    }

    // Use ONE ticker for the container
    const update = () => {
        for (let particle of container.children) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.vr;
            particle.alpha -= 0.03;
        }

        // Remove dead particles
        container.children = container.children.filter(p => p.alpha > 0);

        // Remove container and stop ticker if empty
        if (container.children.length === 0) {
            app.stage.removeChild(container);
            app.ticker.remove(update);
        }
    };

    app.ticker.add(update);
}
