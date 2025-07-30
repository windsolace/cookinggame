import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { InventoryUIScene } from './scenes/InventoryUIScene';

// Configure your Phaser Game
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Automatically choose WebGL or Canvas
    width: 800,        // Game width
    height: 600,       // Game height
    parent: 'game-container', // ID of the HTML element to put the canvas into
    pixelArt: true,    // Good for pixelart games
    physics: {
        default: 'arcade', // You'll likely use Arcade physics for 2D, or a custom one for isometric
        arcade: {
            gravity: { x:0, y: 0 }, // No gravity for a top-down isometric game
            debug: false       // Set to true to see physics bodies
        }
    },
    scene: [MainScene, InventoryUIScene] // Array of scenes. The first one in the array starts automatically.
};

// Create the game instance
const game = new Phaser.Game(config);

console.log('Phaser Game Created!');