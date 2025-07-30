import Phaser from 'phaser';
import { GameScene } from './2dMainScene'; // Import GameScene to access its instance

// Define a simple interface for your item data for clarity
interface InventoryItem {
    itemType: string;
    textureKey: string;
    frame: number;
    quantity: number;
}

export class InventoryUIScene extends Phaser.Scene {

    private inventoryPanel!: Phaser.GameObjects.Image;
    private inventorySlots: Phaser.GameObjects.Image[] = [];
    private itemIcons: Phaser.GameObjects.Image[] = [];
    private quantityTexts: Phaser.GameObjects.Text[] = [];

    private playerInventoryData: Map<string, InventoryItem> = new Map(); // Local copy of inventory data

    // UI Configuration
    private panelWidth: number = 200;
    private panelHeight: number = 900;
    private slotSize: number = 32; // Size of each slot image
    private slotPadding: number = 5; // Horizontal padding between slots
    private numColumns: number = 5;
    private maxSlots: number = 30; // Example: 4 rows of 5 columns

    // --- ASSUMPTIONS FOR SPRITESHEET FRAMES ---
    // Adjust these values based on your actual spritesheet.
    // If you used Aseprite and exported a JSON hash, these would be frame names (strings).
    // If it's a grid, these are indices (numbers).
    private INVENTORY_PANEL_FRAME: number | string = 1; // Example: Frame 0 for the panel
    private INVENTORY_SLOT_FRAME: number | string = 2;  // Example: Frame 1 for the empty slot

    private toggleInventoryKey!: Phaser.Input.Keyboard.Key;

    public KEYSTROKE_INVENTORY = Phaser.Input.Keyboard.KeyCodes.I;

    constructor() {
        super({ key: 'InventoryUIScene', active: false }); // Start inactive
    }

    preload() {
        console.log('InventoryUIScene: preload() started.');
        // Ensure items_spritesheet is loaded, though GameScene will also load it
        this.load.spritesheet('items_spritesheet', 'assets/images/basicfood_sprites.png', {
            frameWidth: 32, // Match your item sprite width
            frameHeight: 32, // Match your item sprite height
        });
        this.load.spritesheet('inventory_spritesheet', 'assets/images/inventory_sprites.png', {
            frameWidth: 30,
            frameHeight: 30
        });
    }

    create() {
        console.log('InventoryUIScene: create() started.');

        // Create the background panel
        this.inventoryPanel = this.add.image(
            this.cameras.main.centerX,0,
            'inventory_spritesheet',
            this.INVENTORY_PANEL_FRAME
        );
        console.log("==== DEBUG: Inventory Panel starting position is " + this.cameras.main.centerX + "," + 0);
        // Set fixed position relative to camera (important for UI)
        this.inventoryPanel.setScrollFactor(0);
        this.inventoryPanel.setDepth(100); // Ensure it's on top of everything else
        this.inventoryPanel.setVisible(false); // Initially hidden

        // Set panel size if your image is not exact
        this.inventoryPanel.displayWidth = this.panelWidth;
        this.inventoryPanel.displayHeight = this.panelHeight;

        // Calculate starting position for slots relative to the panel's top-left
        const startX = this.inventoryPanel.x - this.panelWidth / 2 + this.slotPadding + this.slotSize / 2;
        // const startY = this.inventoryPanel.y - this.panelHeight / 2 + this.slotPadding + this.slotSize / 2;
        const startY = 0;

        // Create inventory slots, item icons, and quantity texts
        for (let i = 0; i < this.maxSlots; i++) {
            const col = i % this.numColumns;
            const row = Math.floor(i / this.numColumns);

            const x = startX + col * (this.slotSize + this.slotPadding);
            const y = startY + row * (this.slotSize + this.slotPadding);

            // Slot background
            const slot = this.add.image(x,y, 'inventory_spritesheet',this.INVENTORY_SLOT_FRAME);
            console.log("==== DEBUG: Slot starting position is " + x + "," + y);

            slot.setScrollFactor(0);
            slot.setDepth(101);
            slot.displayWidth = this.slotSize;
            slot.displayHeight = this.slotSize; console.log("slot width x height --> " + slot.displayWidth + " x " + slot.displayHeight);
            slot.setVisible(false); // Initially hidden
            this.inventorySlots.push(slot);

            // Placeholder for item icon (initially empty/hidden)
            const itemIcon = this.add.image(x, y, 'items_spritesheet', 0); // Use frame 0 as placeholder
            itemIcon.setScrollFactor(0);
            itemIcon.setDepth(102);
            itemIcon.setVisible(false);
            itemIcon.displayWidth = this.slotSize * 0.8; // Make icon slightly smaller than slot
            itemIcon.displayHeight = this.slotSize * 0.8;
            this.itemIcons.push(itemIcon);

            // Placeholder for quantity text
            const quantityText = this.add.text(x + this.slotSize / 2 - 5, y + this.slotSize / 2 - 5, '', {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            });
            quantityText.setOrigin(1, 1); // Origin at bottom-right for quantity
            quantityText.setScrollFactor(0);
            quantityText.setDepth(103);
            quantityText.setVisible(false);
            this.quantityTexts.push(quantityText);
        }

        // Inventory Toggle Key
        this.toggleInventoryKey = this.input.keyboard!.addKey(this.KEYSTROKE_INVENTORY);
        this.toggleInventoryKey.on('down', () => {
            if(this.inventoryPanel.visible) {
                this.hideInventory();
            }
            else {
                this.showInventory();
            }
        });
    }

    public getIsVisible(): boolean {
        return this.inventoryPanel.visible; // Check the visibility of the main panel
    }

    // Method to show the inventory UI
    private showInventory() {
        this.inventoryPanel.setVisible(true);
        this.inventorySlots.forEach(slot => slot.setVisible(true));
        this.itemIcons.forEach(icon => icon.setVisible(false)); // Hide all icons initially
        this.quantityTexts.forEach(text => text.setVisible(false)); // Hide all texts initially
        this.refreshInventoryUI(); // Populate with current data

        // this.gameScene.scene.pause();
    }

    // Method to hide the inventory UI
    private hideInventory() {
        this.inventoryPanel.setVisible(false);
        this.inventorySlots.forEach(slot => slot.setVisible(false));
        this.itemIcons.forEach(icon => icon.setVisible(false));
        this.quantityTexts.forEach(text => text.setVisible(false));

        // this.gameScene.scene.resume();
    }

    // Method to refresh the UI based on current inventory data
    private refreshInventoryUI() {
        console.log('InventoryUIScene: Refreshing UI.');
        let slotIndex = 0;

        // Clear previous items from display
        this.itemIcons.forEach(icon => icon.setVisible(false));
        this.quantityTexts.forEach(text => text.setVisible(false).setText(''));

        // Iterate over playerInventoryData (local copy)
        this.playerInventoryData.forEach((item, itemType) => {
            if (slotIndex < this.maxSlots) {
                const itemIcon = this.itemIcons[slotIndex];
                const quantityText = this.quantityTexts[slotIndex];

                itemIcon.setTexture(item.textureKey, item.frame);
                itemIcon.setVisible(true);
                quantityText.setText(item.quantity.toString());
                quantityText.setVisible(true);
            }
            slotIndex++;
        });
    }

    // Method to update the local inventory data from GameScene
    public updateInventoryData(data: Map<string, InventoryItem>) {
        this.playerInventoryData = data;
        // The refreshInventoryUI will be called by the event listener.
        // Or you can call it here if you prefer to decouple from events.
        // if (this.inventoryPanel.visible) { // Only refresh if currently visible
        //    this.refreshInventoryUI();
        // }
    }
}