import Phaser from './lib/phaser.js';
import { BattleScene } from './scenes/battle-scene.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { SCENE_KEYS } from './scenes/scene-keys.js';
import { WorldScene } from './scenes/world-scene.js';

const game = new Phaser.Game({
    parent: 'game-container'
});

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.WORLD_SCENE, WorldScene);
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE)