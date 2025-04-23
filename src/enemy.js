// enemy.js
import { Sprite, Text, TextStyle } from 'pixi.js';
import { app } from './app.js';
import { gameState } from './gameState.js';

export class Enemy {
    constructor(texture, health) {
        this.sprite = new Sprite(texture);
        this.health = health;

        const style = new TextStyle({ fill: '#990000', fontSize: 24, fontWeight: 'bold', dropShadow: true });
        this.healthText = new Text("Wall of Recruitment \n         HP: " + this.health, style);

        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.5)
        this.healthText.anchor.set(0.5);

        this.sprite.eventMode = 'dynamic';
        this.sprite.buttonMode = true;
        this.sprite.cursor = 'pointer';

        this.sprite.on('pointerover', () => this.highlight(true));
        this.sprite.on('pointerout', () => this.highlight(false));
        this.sprite.on('pointerdown', () => this.select());
    }

    setPosition(x, y) {
        this.sprite.x = app.screen.width / 2;
        this.sprite.y = app.screen.height / 4;
        this.healthText.x = app.screen.width / 2;
        this.healthText.y = app.screen.height / 4 + 220;
    }

    highlight(isHovered) {
        if (isHovered) {
            this.sprite.tint = 0xffff00;
        } else if (this !== gameState.selectedEnemy) {
            this.sprite.tint = 0xffffff;
        }
    }

    select() {
        if (gameState.selectedEnemy) {
            gameState.selectedEnemy.sprite.tint = 0xffffff;
        }
        gameState.selectedEnemy = this;
        this.sprite.tint = 0x8888FF;
        console.log(`Selected enemy with HP: ${this.health}`);
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`Enemy takes ${amount} damage! Remaining HP: ${this.health}`);
        this.healthText.text = `Wall of Recruitment \n         HP: ${this.health}`;
        this.sprite.tint = 0xff0000;
        setTimeout(() => {
            this.sprite.tint = 0xffffff;
        }, 200);
        if (this.health <= 0) {
            setTimeout(() => this.destroy(), 200);
        }
    }

    destroy() {
        console.log("Enemy defeated!");
        app.stage.removeChild(this.sprite);
        app.stage.removeChild(this.healthText);
        const index = gameState.enemies.indexOf(this);
        if (index > -1) {
            gameState.enemies.splice(index, 1);
        }
        this.sprite.destroy();
        this.sprite = null;
        this.healthText.destroy();
        this.healthText = null;
        if (gameState.enemies.length > 0) {
            gameState.selectedEnemy = gameState.enemies[0];
            gameState.selectedEnemy.sprite.tint = 0x8888FF;
        } else {
            gameState.selectedEnemy = null;
        }
    }
}
