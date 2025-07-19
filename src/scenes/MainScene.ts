import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {

    private player!: Phaser.GameObjects.Sprite;
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset; // Declare tileset property
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; // For arrow keys
    private wasd!: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    }; // For WASD keys

    constructor() {
        // Assign a unique key to this scene
        super('scene-game');
        this.cursors;
    }

    // Called first: Use to load assets (images, audio, JSON, etc.)
    preload() {
        console.log('MainScene: preload()');
        // Example: load a simple image
        this.load.image('sky', 'assets/images/sky.png'); // Make sure this path is correct!
        
        // Load tileset src and image
        this.load.tilemapTiledJSON('map_data', 'assets/tilemaps/isometric_map_32x16.tmj');
        this.load.image('tiles', 'assets/tilemaps/Floors.png');

        // Load character spritesheet
        this.load.spritesheet('player_character', 'assets/images/character_spritesheet.png', {
            frameWidth: 32,  // Adjust this to the actual width of one sprite frame
            frameHeight: 48, // Adjust this to the actual height of one sprite frame
            // startFrame: 0, // Optional: Start frame index
            // endFrame: 7  // Optional: End frame index (if you only want a subset)
        });

    }

    // Called after preload: Use to create game objects, set up initial state
    create() {
        console.log('MainScene: create() - assets loaded and ready');

         // You can also change the background color of the canvas directly
        this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue
        console.log('Camera background color set to sky blue.');

        // --- Keep the SMALLER red debug rect to confirm drawing ---
        this.add.rectangle(50, 50, 20, 20, 0xff0000).setScrollFactor(0); // Small red square, fixed to camera
        console.log('Small red debug square added.');

        // --- 1. Create Tilemap from Loaded Data ---
        // This creates a Tilemap object using the 'map_data' key from preload.
        this.map = this.make.tilemap({ key: 'map_data' });

        // --- 2. Add Tileset Image to the Map ---
        // The first parameter in addTilesetImage MUST match the name of your tileset
        // as it appears in the Tiled Map Editor's Tilesets window (e.g., "MyTileset").
        // The second parameter 'tiles' is the key you used when loading the tileset image in preload.
        const loadedTileset = this.map.addTilesetImage('assets/tilemaps/Floors.png', 'tiles');
        if (loadedTileset === null) {
            console.error(
                "Failed to load tileset! Check 'Floors' in your Tiled JSON and 'tiles' key in preload()."
            );
            // You might want to halt the game or display an error message here
            return;
        }
        this.tileset = loadedTileset; // Assign the non-null tileset

        // --- 3. Create Tilemap Layer(s) ---
        // The first parameter 'LayerNameInTiled' MUST match the name of a layer
        // in your Tiled JSON file (e.g., "GroundLayer" or "CollisionLayer").
        // The second parameter is the tileset reference you just created.
        // The last two parameters (0, 0) are the x, y coordinates to place the layer.
        let groundLayer: Phaser.Tilemaps.TilemapLayer | null = null;
        try {
            groundLayer = this.map.createLayer('Tile Layer 1', this.tileset, 0, 0);
        } catch (e) {
            console.error("Failed to load ground layer");
        }
        

        console.log('Map Width in Pixels:', this.map.widthInPixels);
console.log('Map Height in Pixels:', this.map.heightInPixels);

        // Set up camera to follow the player (optional, but good for UX)
        this.cameras.main.setZoom(1); // Adjust zoom as needed
        const boundsPadding = 2100; // Extra space around the mapconst boundsPadding = 200; // Extra space around the map
        if(groundLayer != null) {
            this.cameras.main.setBounds(
                groundLayer.x - boundsPadding,
                groundLayer.y - boundsPadding,
                this.map.widthInPixels + (boundsPadding * 2),
                this.map.heightInPixels + (boundsPadding * 2)
            );

            // --- NEW: Attempt to place a single tile directly ---
            // Use the global ID 1 (which should be your only tile)
            const testTileGID = 1;
            const testTileX = 0; // Place at tile coordinate (0,0)
            const testTileY = 0;

            try {
                groundLayer.putTileAt(testTileGID, testTileX, testTileY);
                console.log(`Manually placed tile GID ${testTileGID} at tile coordinates (${testTileX}, ${testTileY}).`);

                groundLayer.putTileAt(testTileGID, 200, 200);
                console.log(`Manually placed tile GID ${testTileGID} at tile coordinates (${testTileX}, ${testTileY}).`);
            } catch (e) {
                console.error("Error manually placing tile:", e);
            }

            // --- NEW: Debugging the Layer's Boundaries ---
            // Draw a rectangle around where Phaser *thinks* your map layer is.
            const graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xffff00, alpha: 0.8 } }); // Yellow border
            graphics.strokeRect(
                groundLayer.x,
                groundLayer.y,
                this.map.widthInPixels,
                this.map.heightInPixels
            );
            console.log('Yellow debug rectangle drawn around map layer area.');

            console.log(groundLayer.displayOriginX);
            console.log(groundLayer.displayOriginY);
        }

        

        // Center the camera on the map's pixel center (a good starting point for testing)
        // Adjust for potential isometric offset later if needed.
        this.cameras.main.centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);

        // --- 4. Add your Character Sprite ---
        // This creates a sprite using the 'player_character' spritesheet.
        // The (x, y) coordinates define where the sprite will be placed.
        // The third parameter (0 in this case) is the initial frame index to display.
        this.player = this.add.sprite(100, 100, 'player_character', 0);
        this.cameras.main.startFollow(this.player);

        

        // Add a background image (loaded in preload)
        // (400, 300) are the x, y coordinates (center of the image)
        // this.add.image(400, 300, 'sky');

        // Add some text
        // this.add.text(400, 50, 'Hello Masterchef!', {
        //     fontFamily: 'Arial',
        //     fontSize: '32px',
        //     color: '#ffffff'
        // }).setOrigin(0.5); // Center the text

        
    }

    // Called every frame: Use for game logic that needs to update continuously (movement, collisions)
    // update(time, delta) {
        // console.log('MainScene: update()'); // Don't log every frame, it's very noisy!
        // Your game logic goes here
    // }
}