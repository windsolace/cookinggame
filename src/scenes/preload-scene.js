import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from './scene-keys.js';
import { BATTLE_BACKGROUND_ASSET_KEYS, BATTLE_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS, MONSTER_ASSET_KEYS, WORLD_ASSET_KEYS, CHARACTER_ASSET_KEYS } from '../assets/asset-keys.js'

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
            // active:true
        });
        console.log(SCENE_KEYS.PRELOAD_SCENE);
    }

    init() {
        console.log('init');
    }

    preload() {
        const monsterTamerAssetPath= 'src/assets/images/monster-tamer';
        const kenneysAssetPath = 'src/assets/images/kenneys-assets';
        const pimenAssetPath = 'src/assets/images/pimen';
        const axulArtAssetPath = 'src/assets/images/axulart';
        const pbGamesAssetPath = 'src/assets/images/parabellum-games';

        //battle backgrounds
        this.load.image(BATTLE_BACKGROUND_ASSET_KEYS.FOREST, `${monsterTamerAssetPath}/battle-backgrounds/forest-background.png`);

        //battle assets
        this.load.image(BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`);

        //health bar assets
        this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`);

        //monster assets
        this.load.image(MONSTER_ASSET_KEYS.CARNODUSK, `${monsterTamerAssetPath}/monsters/carnodusk.png`);
        this.load.image(MONSTER_ASSET_KEYS.IGUANIGNITE, `${monsterTamerAssetPath}/monsters/iguanignite.png`);

        // load world assets
        this.load.image(WORLD_ASSET_KEYS.WORLD_BACKGROUND, `${monsterTamerAssetPath}/map/level_background.png`);

        // load character images
        this.load.spritesheet(CHARACTER_ASSET_KEYS.PLAYER, `${axulArtAssetPath}/character/custom.png`,{
            frameWidth: 64,
            frameHeight:88,
        });
        this.load.spritesheet(CHARACTER_ASSET_KEYS.NPC, `${pbGamesAssetPath}/characters.png`,{
            frameWidth: 64,
            frameHeight:88,
        });
    }

    create() {
        console.log(`[${PreloadScene.name}:create] invoked`);
        this.scene.start(SCENE_KEYS.WORLD_SCENE);
        // this.add.image(0,0,BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0,0);
    }
}