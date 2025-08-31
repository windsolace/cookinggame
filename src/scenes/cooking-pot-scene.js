import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from './scene-keys.js';
import { COOKING_EQUIPMENT_KEYS, COOKING_UI_KEYS, INGREDIENT_KEYS, COOKED_ITEM_KEYS } from '../assets/asset-keys.js';

export default class CookingPotScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.COOKING_POT_SCENE,
        });
        this.playerInventory = {};
        this.potInventory = [];
        this.cookingStat = 5;
        this.recipes = [
            // Use the string literals from asset-keys.js
            { id: 'soup', ingredients: [INGREDIENT_KEYS.WATER, INGREDIENT_KEYS.ROCK_POTATO], difficulty: 4, output: COOKED_ITEM_KEYS.ROCK_POTATO_SOUP },
            { id: 'stew', ingredients: [INGREDIENT_KEYS.WATER, INGREDIENT_KEYS.BOG_HOG_MEAT], difficulty: 6, output: COOKED_ITEM_KEYS.BOG_HOG_STEW }
        ];
    }

    preload() {
        this.load.image(COOKING_EQUIPMENT_KEYS.POT, 'src/assets/images/axulart/character/custom.png');
        this.load.image(COOKING_UI_KEYS.INVENTORY, 'src/assets/images/monster-tamer/ui/title/title_background.png');
        this.load.image(INGREDIENT_KEYS.WATER, 'src/assets/images/items/water.png');
        this.load.image(INGREDIENT_KEYS.ROCK_POTATO, 'src/assets/images/items/rock_potato.png');
        this.load.image(INGREDIENT_KEYS.BOG_HOG_MEAT, 'src/assets/images/items/bog_hog_meat.png');
        this.load.image(COOKED_ITEM_KEYS.ROCK_POTATO_SOUP, 'src/assets/images/items/rock_potato_soup.png');
        this.load.image(COOKED_ITEM_KEYS.BOG_HOG_STEW, 'src/assets/images/items/bog_hog_stew.png');
        this.load.image(COOKED_ITEM_KEYS.BURNT_MESS, 'src/assets/images/items/burnt_mess.png');
    }

    create() {
        this.pot = this.add.image(400, 300, COOKING_EQUIPMENT_KEYS.POT);
        this.playerInventory = {
            // Use the keys from your asset-keys.js
            [INGREDIENT_KEYS.WATER]: 2,
            [INGREDIENT_KEYS.ROCK_POTATO]: 2,
            [INGREDIENT_KEYS.BOG_HOG_MEAT]: 2
        };
        this.scene.launch(SCENE_KEYS.INVENTORY_SCENE, {
            playerInventory: this.playerInventory,
            potInventory: this.potInventory
        });
        this.events.on('addIngredientToPot', this.addIngredientToPot, this);
        this.events.on('removeIngredientFromPot', this.removeIngredientFromPot, this);
        this.events.on('startCooking', this.startCooking, this);
    }
    
    // ... rest of the code is unchanged ...
    addIngredientToPot(ingredient) {
        if (this.playerInventory[ingredient] > 0) {
            this.playerInventory[ingredient]--;
            if (this.playerInventory[ingredient] === 0) {
                delete this.playerInventory[ingredient];
            }
            this.potInventory.push(ingredient);
            this.events.emit('updateInventories', this.playerInventory, this.potInventory);
            console.log(`Adding ${ingredient} to pot`);
        }
    }

    removeIngredientFromPot(ingredient) {
        const index = this.potInventory.indexOf(ingredient);
        if (index !== -1) {
            this.potInventory.splice(index, 1);
            if (this.playerInventory[ingredient]) {
                this.playerInventory[ingredient]++;
            } else {
                this.playerInventory[ingredient] = 1;
            }
            this.events.emit('updateInventories', this.playerInventory, this.potInventory);
            console.log(`Removing ${ingredient} from pot`);
        }
    }

    startCooking() {
        const recipe = this.recipes.find(r => {
            const potCopy = [...this.potInventory].sort();
            const ingredientsCopy = [...r.ingredients].sort();
            return JSON.stringify(potCopy) === JSON.stringify(ingredientsCopy);
        });

        // Clear the pot
        this.potInventory = [];
        this.events.emit('updateInventories', this.playerInventory, this.potInventory);

        if (recipe) {
            let outputItem = recipe.output;
            const chanceOfBurnt = Math.max(0, (recipe.difficulty - this.cookingStat) / 10);
            const randomChance = Math.random();

            if (randomChance < chanceOfBurnt) {
                this.addCookedItem(COOKED_ITEM_KEYS.BURNT_MESS);
                console.log("Cooking failed. Produced a burnt mess.");
            } else {
                const isShiny = this.cookingStat >= (recipe.difficulty * 2);
                this.addCookedItem(outputItem, isShiny);
                console.log(`Successfully cooked ${outputItem}. Shiny: ${isShiny}`);

                this.scene.launch(SCENE_KEYS.COOKING_POST_SCENE, { output: outputItem, isShiny: isShiny });
            }
        } else {
            console.log("No matching recipe found. Produced a burnt mess.");
            this.addCookedItem(COOKED_ITEM_KEYS.BURNT_MESS);
        }
    }

    addCookedItem(item, isShiny = false) {
        const stackKey = isShiny ? `${item}_shiny` : item;
        if (this.playerInventory[stackKey]) {
            this.playerInventory[stackKey]++;
        } else {
            this.playerInventory[stackKey] = 1;
        }
        this.events.emit('updateInventories', this.playerInventory, this.potInventory);
    }
}