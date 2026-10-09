import {AIController,AI_STATES,normalize,distance,chooseWeighted} from './ai.js';
import {TileMap} from './tilemap.js';
import {GridPathfinder} from './pathfinding.js';
import {Inventory} from './inventory.js';
import {QuestManager,QUEST_STATES} from './quests.js';
import {DialogueRunner} from './dialogue.js';
import {BossController} from './boss.js';
import {ArcadeVehicle} from './vehicle-physics.js';
import {SpriteSheet,SpriteAnimator} from './sprite-sheet.js';
import {SeededRandom,hashSeed,valueNoise2D,generateDungeon} from './procedural.js';
import {LoopbackTransport,WebSocketTransport,MultiplayerSession} from './multiplayer.js';
import {LeaderboardClient} from './leaderboards.js';

export const ENGINE_SYSTEMS=Object.freeze({
  ai:{AIController,AI_STATES,normalize,distance,chooseWeighted},
  tilemaps:{TileMap},
  pathfinding:{GridPathfinder},
  inventory:{Inventory},
  quests:{QuestManager,QUEST_STATES},
  dialogue:{DialogueRunner},
  boss:{BossController},
  vehicle:{ArcadeVehicle},
  sprites:{SpriteSheet,SpriteAnimator},
  procedural:{SeededRandom,hashSeed,valueNoise2D,generateDungeon},
  multiplayer:{LoopbackTransport,WebSocketTransport,MultiplayerSession},
  leaderboards:{LeaderboardClient}
});

export function createEngineSystems(){
  return {
    ...ENGINE_SYSTEMS,
    createAI:options=>new AIController(options),
    createTileMap:options=>new TileMap(options),
    createPathfinder:(grid,options)=>new GridPathfinder(grid,options),
    createInventory:options=>new Inventory(options),
    createQuestManager:quests=>new QuestManager(quests),
    createDialogue:options=>new DialogueRunner(options),
    createBoss:options=>new BossController(options),
    createVehicle:options=>new ArcadeVehicle(options),
    createSpriteSheet:options=>new SpriteSheet(options),
    createSpriteAnimator:options=>new SpriteAnimator(options),
    createRandom:seed=>new SeededRandom(seed),
    createMultiplayer:options=>new MultiplayerSession(options),
    createLeaderboard:options=>new LeaderboardClient(options)
  };
}
