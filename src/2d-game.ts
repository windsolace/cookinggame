import Phaser from 'phaser';
import { GameScene } from './scenes/2dMainScene';


// Configure your Phaser Game
const config = {
    type: Phaser.WEBGL, // Automatically choose WebGL or Canvas
    width: 500,        // Game width
    height: 500,       // Game height
    parent: 'game-container', // ID of the HTML element to put the canvas into
    pixelArt: true,    // Good for 2D isometric games
    physics: {
        default: 'arcade', // You'll likely use Arcade physics for 2D, or a custom one for isometric
        arcade: {
            gravity: { x:0, y: 0 }, // No gravity for a top-down isometric game
            debug: true       // Set to true to see physics bodies
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);