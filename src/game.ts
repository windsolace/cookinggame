import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

// Configure your Phaser Game
const config = {
    type: Phaser.AUTO, // Automatically choose WebGL or Canvas
    width: 800,        // Game width
    height: 600,       // Game height
    parent: 'game-container', // ID of the HTML element to put the canvas into
    pixelArt: true,    // Good for 2D isometric games
    physics: {
        default: 'arcade', // You'll likely use Arcade physics for 2D, or a custom one for isometric
        arcade: {
            gravity: { x:0, y: 0 }, // No gravity for a top-down isometric game
            debug: false       // Set to true to see physics bodies
        }
    },
    scene: [MainScene] // Array of scenes. The first one in the array starts automatically.
};

// Create the game instance
const game = new Phaser.Game(config);

console.log('Phaser Game Created!');