import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from './scene-keys.js';
import { COOKING_UI_KEYS, INGREDIENT_KEYS, COOKED_ITEM_KEYS } from '../assets/asset-keys.js';

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.INVENTORY_SCENE,
        });
    }

    create(data) {
        const { playerInventory, potInventory } = data;
        
        this.gameScene = this.scene.get(SCENE_KEYS.COOKING_POT_SCENE);
        this.playerInventoryDisplay = this.add.container(50, 50);
        this.potInventoryDisplay = this.add.container(650, 50);

        this.drawPlayerInventory(this.playerInventoryDisplay, playerInventory);
        this.drawPotInventory(this.potInventoryDisplay, potInventory);
        
        this.add.text(50, 20, 'Player Inventory', { fontSize: '16px', color: '#fff' });
        this.add.text(650, 20, 'Pot', { fontSize: '16px', color: '#fff' });
        
        this.cookingButton = this.add.text(650, 400, 'Start Cooking', { fontSize: '18px', color: '#0f0', backgroundColor: '#333' })
            .setInteractive()
            .setPadding(10)
            .on('pointerdown', () => this.gameScene.events.emit('startCooking'));

        this.gameScene.events.on('updateInventories', this.updateDisplay, this);
    }
    
    drawPlayerInventory(container, inventory) {
        container.removeAll(true);
        let index = 0;
        for (const itemKey in inventory) {
            const x = (index % 5) * 60;
            const y = Math.floor(index / 5) * 60;
            
            if (itemKey.endsWith('_shiny')) {
                const border = this.add.graphics();
                border.lineStyle(2, 0xFFD700);
                border.strokeRect(x, y, 60, 60);
                container.add(border);
            }
            
            const slot = this.add.image(x, y, COOKING_UI_KEYS.INVENTORY).setOrigin(0);
            const ingredientName = itemKey.endsWith('_shiny') ? itemKey.split('_shiny')[0] : itemKey;
            
            // This is the core fix: `ingredientName` now holds the correct texture key
            const item = this.add.image(x + 30, y + 30, ingredientName);

            const count = this.add.text(x + 50, y + 50, inventory[itemKey], { fontSize: '12px', color: '#fff' }).setOrigin(1);
            
            slot.setInteractive();
            slot.on('pointerdown', (pointer) => {
                if (pointer.leftButtonDown()) {
                    this.gameScene.events.emit('addIngredientToPot', ingredientName);
                }
            });
            container.add([slot, item, count]);
            index++;
        }
    }

    drawPotInventory(container, inventory) {
        container.removeAll(true);
        inventory.forEach((ingredient, index) => {
            const x = (index % 5) * 60;
            const y = Math.floor(index / 5) * 60;
            const slot = this.add.image(x, y, COOKING_UI_KEYS.INVENTORY).setOrigin(0);
            const item = this.add.image(x + 30, y + 30, ingredient);
            
            slot.setInteractive();
            slot.on('pointerdown', (pointer) => {
                if (pointer.leftButtonDown()) {
                    this.gameScene.events.emit('removeIngredientFromPot', ingredient);
                }
            });
            container.add([slot, item]);
        });
    }

    updateDisplay(playerInventory, potInventory) {
        this.drawPlayerInventory(this.playerInventoryDisplay, playerInventory);
        this.drawPotInventory(this.potInventoryDisplay, potInventory);
    }
}