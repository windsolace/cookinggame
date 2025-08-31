import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from './scene-keys.js';

export default class CookingPostScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.COOKING_POST_SCENE,
        });
    }

    create(data) {
        const { output, isShiny = false } = data;
        
        // Change the text color based on the item's shininess
        const outputText = this.add.text(400, 300, `You made a ${output}!`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

        if (isShiny) {
            const shinyText = this.add.text(400, 350, `It's shiny!`, { fontSize: '24px', color: '#FFD700' }).setOrigin(0.5);
        }
        
        this.time.delayedCall(3000, () => {
            this.scene.stop(SCENE_KEYS.COOKING_POST_SCENE);
        });
    }
}