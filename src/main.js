import Phaser from './lib/phaser.js';
import { BattleScene } from './scenes/battle-scene.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { WorldScene } from './scenes/world-scene.js';
import { SCENE_KEYS } from './scenes/scene-keys.js';

import InventoryScene from './scenes/inventory-scene.js';
import CookingPotScene from './scenes/cooking-pot-scene.js';
import CookingPostScene from './scenes/cooking-post-scene.js';

const game = new Phaser.Game({
    parent: 'game-container'
});

// game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
// game.scene.add(SCENE_KEYS.WORLD_SCENE, WorldScene);
// game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene);
// game.scene.start(SCENE_KEYS.PRELOAD_SCENE)

game.scene.add(SCENE_KEYS.COOKING_POT_SCENE, CookingPotScene);
game.scene.add(SCENE_KEYS.INVENTORY_SCENE, InventoryScene);
game.scene.add(SCENE_KEYS.COOKING_POST_SCENE, CookingPostScene);

game.scene.start(SCENE_KEYS.COOKING_POT_SCENE);
