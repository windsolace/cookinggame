import Phaser from 'phaser';
import { InventoryItem } from '../obj/InventoryItem';

export class GameScene extends Phaser.Scene {

    private player!: Phaser.Physics.Arcade.Sprite;
    private mainTileset: Phaser.Tilemaps.Tileset | null = null;
    private map!: Phaser.Tilemaps.Tilemap;
    private groundLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    private obstaclesLayer: Phaser.Tilemaps.TilemapLayer | null = null; // New layer for obstacles
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; // For arrow keys
    private wasd!: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    }; // For WASD keys
    private collectableItems !: Phaser.Physics.Arcade.Group;
    private playerInventory: Map<string, InventoryItem> = new Map();

    constructor(){
        super("scene-game")
    }
    preload(){
        this.load.tilemapTiledJSON('map_data', 'assets/tilemaps/map-2d-grass.tmj');
        this.load.image('backgroundMap', 'assets/tilemaps/bg.png'); //preload map image
        this.load.image('tileset_spritesheet_image',"assets/images/mapPack_tilesheet.png")
        this.load.image('basicfood_sprites', 'assets/images/basicfood_sprites.png');
        // Load character spritesheet
        this.load.spritesheet('player_character', 'assets/images/character_spritesheet.png', {
            frameWidth: 24,  // Adjust this to the actual width of one sprite frame
            frameHeight: 36, // Adjust this to the actual height of one sprite frame
            // startFrame: 0, // Optional: Start frame index
            // endFrame: 7  // Optional: End frame index (if you only want a subset)
        });
    }

    create(){
        this.add.image(0,0,"backgroundMap").setOrigin(0,0);
        this.player = this.physics.add.sprite(100, 100, 'player_character', 0);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(1);

        // --- Keyboard Input Setup ---
        // Arrow Keys
        this.cursors = this.input.keyboard!.createCursorKeys();

        // WASD Keys
        this.wasd = {
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        console.log('Keyboard input listeners set up.');

        // --- Camera Setup ---
        this.cameras.main.setZoom(1);
        this.cameras.main.startFollow(this.player   , true, 0.05, 0.05); // Smooth camera follow
        console.log('Cameras set up.');

        // --- Create Tile layers ---
        this.map = this.make.tilemap({key: 'map_data'});
        this.mainTileset = this.map.addTilesetImage('2d-main-tiles', 'tileset_spritesheet_image'); 

        if(this.mainTileset === null) {
            console.error(`Failed to load tileset!`);
            return;
        }

        this.groundLayer = this.map.createLayer('Base', this.mainTileset, 0, 0); // Orthogonal map, start at 0,0
        if (this.groundLayer === null) { console.error(`Base layer returned null`); return; }

        this.obstaclesLayer = this.map.createLayer('Obstacles', this.mainTileset, 0, 0);
        if (this.obstaclesLayer === null) { console.error(`Obstacles layer returned null`); return; }

        // --- Set Collision on Obstacles Layer
        this.obstaclesLayer.setCollisionByProperty({collides:true});
        this.physics.add.collider(this.player,this.obstaclesLayer);

        const wallObjects = this.map.getObjectLayer('Walls');
        if(wallObjects) {
            const wallsGroup = this.physics.add.staticGroup();

            wallObjects.objects.forEach(object => {
                // For each object in the 'Walls' layer, create a static rectangle body
                // Tiled object coordinates (x, y) are usually top-left.
                const rect = this.add.rectangle(object.x!, object.y!, object.width!, object.height!).setOrigin(0,0);
                wallsGroup.add(rect); // Add the graphic to the group
                // The physics body will be created based on the graphic's dimensions
            });
            this.physics.add.collider(this.player, wallsGroup);
        }

        // --- Create Collectable Items from Tiled Object Layer ---
        this.collectableItems = this.physics.add.group(); // Create a physics group for items

        const collectablesLayer = this.map.getObjectLayer('Collectables'); // Get the object layer named 'Collectables'
        if (collectablesLayer) {
            collectablesLayer.objects.forEach(object => {
                // Ensure object has properties before accessing
                if (object.properties) {
                    const itemProps: any = object.properties.reduce((obj: any, prop: any) => {
                        obj[prop.name] = prop.value;
                        return obj;
                    }, {});

                    // Create a sprite for the item
                    const itemSprite = this.physics.add.sprite(
                        object.x! + object.width! / 2, // Tiled object x,y are top-left, center for sprite
                        object.y! + object.height! / 2, // Adjust based on your object creation in Tiled if needed
                        itemProps.textureKey, // Use the textureKey from Tiled properties
                        itemProps.frame      // Use the frame from Tiled properties
                    );
                    itemSprite.setOrigin(0.5, 0.5); // Set origin to center for consistent positioning

                    // Store item properties on the sprite itself for easy access later
                    itemSprite.setData('itemType', itemProps.itemType);
                    itemSprite.setData('quantity', itemProps.quantity || 1); // Default to 1 if not specified

                    this.collectableItems.add(itemSprite); // Add to the collectables group
                    itemSprite.setDepth(0.5); // Ensure items draw between map layers and player
                }
            });
            console.log(`Spawned ${this.collectableItems.getLength()} collectable items.`);
        } else {
            console.warn("No 'Collectables' object layer found in map.");
        }

        // --- Setup Overlap for Item Collection ---
        this.physics.add.overlap(
            this.player,
            this.collectableItems,
            (p,r)=> {
                const castPlayer = p as Phaser.Physics.Arcade.Sprite;
                const castItem = r as Phaser.Physics.Arcade.Sprite;
                this.collectItem(castPlayer, castItem);
            }, // Callback function when player overlaps with an item
            undefined,        // ProcessCallback - no additional check needed
            this              // Context for the callback
        );
        console.log('Item collection overlap set up.');
    }

    update(time:number, delta:number){
        // --- Player Movement Logic ---
        this.player.setVelocity(0); // Stop any previous velocity

        const speed = 150; // Adjust player speed as needed

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(speed);
        }

        // Vertical movement
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.setVelocityY(speed);
        }

        // Normalize diagonal movement (optional, but good for consistent speed)
        // If moving diagonally, velocity might be higher. This normalizes it.
        if (this.player.body!.velocity.x !== 0 && this.player.body!.velocity.y !== 0) {
            this.player.body!.velocity.normalize().scale(speed);
        }

    }

    collectItem(player: Phaser.Physics.Arcade.Sprite, itemSprite: Phaser.Physics.Arcade.Sprite):void{
        // Ensure both are sprites for type safety
        // const collectable = itemSprite as Phaser.Physics.Arcade.Sprite;

        // Optional: Add a runtime check to be absolutely sure
        if (!(player instanceof Phaser.Physics.Arcade.Sprite) || !(itemSprite instanceof Phaser.Physics.Arcade.Sprite)) {
            console.error("Type Mismatch in collectItem callback: Expected Arcade.Sprite instances.");
            return;
        }

        const itemType: string = itemSprite.getData('itemType');
        const quantity: number = itemSprite.getData('quantity');
        const textureKey: string = itemSprite.texture.key; // Get the loaded texture key
        const frame: number = itemSprite.frame.name as unknown as number; // Get the frame index

        console.log(`Player collected: ${quantity} x ${itemType}`);

        // Add to player inventory
        if (this.playerInventory.has(itemType)) {
            const existingItem = this.playerInventory.get(itemType)!;
            existingItem.quantity += quantity;
            this.playerInventory.set(itemType, existingItem);
        } else {
            this.playerInventory.set(itemType, {
                itemType: itemType,
                textureKey: textureKey,
                frame: frame,
                quantity: quantity
            });
        }

        console.log('Current Inventory:', this.playerInventory);

        // Remove the item from the game world
        itemSprite.destroy(); // Remove the sprite
    }
}