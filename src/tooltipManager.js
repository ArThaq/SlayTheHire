import { Text, Container, Graphics } from 'pixi.js';
import { app } from './app.js';

class TooltipManager {
    constructor() {
        this.container = new Container();
        this.container.alpha = 0;
        this.targetAlpha = 0;

        this.background = new Graphics();
        this.container.addChild(this.background);

        this.tooltip = new Text({
            text: '',
            style: {
                fontSize: 14,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 200,
            },
        });
        this.tooltip.x = 5;
        this.tooltip.y = 5;
        this.container.addChild(this.tooltip);

        this.container.visible = false;
        app.stage.addChild(this.container);

        // Follow the pointer & handle fade in/out effect
        app.ticker.add(() => {
            if (this.container.visible || this.targetAlpha > 0) {
                const pos = app.renderer.events.pointer.global;
                this.container.x = pos.x + 10;
                this.container.y = pos.y + 10;

                // Tween alpha
                const speed = 0.1;
                this.container.alpha += (this.targetAlpha - this.container.alpha) * speed;

                // Hide if completely invisible
                if (this.container.alpha < 0.01 && this.targetAlpha === 0) {
                    this.container.visible = false;
                    this.container.alpha = 0;
                }
            }
        });
    }

    show(text) {
        this.tooltip.text = text;
        const padding = 10;

        // Redraw background box to fit text
        this.background.clear();
        this.background.roundRect(
            0,
            0,
            this.tooltip.width + padding,
            this.tooltip.height + padding,
            6
        );
        this.background.fill({color:0x000000, alpha:0.8});

        this.container.visible = true;
        this.targetAlpha = 1;
    }

    hide() {
        this.targetAlpha = 0;
    }
}

export const tooltipManager = new TooltipManager();
