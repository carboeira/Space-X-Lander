export interface LevelConfig {
    id: number;
    name: string;
    gravity: number;
    windRange: [number, number]; // [min, max]
    platformSpeed: number;
    platformMoving: boolean;
    asteroids: boolean;
    asteroidCount: number;
    fuelCapacity: number;
    background: string;
    platformTexture: string;
    groundColor: number;
}

// Helper function to create a range of levels with gradually increasing difficulty
function createLevelRange(
    startId: number,
    name: string,
    baseGravity: number,
    baseWindRange: [number, number],
    basePlatformSpeed: number,
    platformMoving: boolean,
    asteroids: boolean,
    baseAsteroidCount: number,
    baseFuelCapacity: number,
    background: string,
    platformTexture: string,
    groundColor: number
): LevelConfig[] {
    const levels: LevelConfig[] = [];
    
    for (let i = 0; i < 10; i++) {
        const id = startId + i;
        const difficultyFactor = 1 + (i * 0.1); // Gradually increase difficulty
        
        // Calculate values with increasing difficulty
        const gravity = Math.round(baseGravity * (1 + (i * 0.05))); // Small gravity increase
        const windRangeFactor = i * 0.15; // Increased from 0.1 to 0.15 for stronger winds
        const windRange: [number, number] = [
            baseWindRange[0] * (1 + windRangeFactor),
            baseWindRange[1] * (1 + windRangeFactor)
        ];
        // Increase platform speed by 20% to make landing more challenging
        const platformSpeed = platformMoving ? Math.round(basePlatformSpeed * (1 + (i * 0.15))) : 0; // Increased from 0.1 to 0.15
        const asteroidCount = asteroids ? Math.min(baseAsteroidCount + Math.floor(i / 3), 5) : 0;
        const fuelCapacity = Math.max(Math.round(baseFuelCapacity * (1 - (i * 0.03))), 55); // Reduced min fuel from 60 to 55
        
        levels.push({
            id,
            name: `${name} ${i + 1}`,
            gravity,
            windRange,
            platformSpeed,
            platformMoving,
            asteroids: asteroids || i >= 7, // Add asteroids earlier (level 8 instead of 9)
            asteroidCount,
            fuelCapacity,
            background,
            platformTexture,
            groundColor
        });
    }
    
    return levels;
}

// Create 50 levels (10 for each environment)
export const levels: LevelConfig[] = [
    // Ocean Landing (Levels 1-10)
    ...createLevelRange(
        1,
        "Ocean Landing",
        200,
        [-10, 10], // Increased from [-8, 8] for more wind
        35, // Increased from 30 for faster platform movement
        true,
        false,
        0,
        100,
        'background-ocean',
        'platform-ship',
        0x0066aa
    ),
    
    // Mountain Peak (Levels 11-20)
    ...createLevelRange(
        11,
        "Mountain Peak",
        200,
        [-15, 15], // Increased from [-12, 12] for more wind
        0,
        false,
        false,
        0,
        90, // Reduced from 95 for less fuel
        'background-mountain',
        'platform-mountain',
        0x4a5568
    ),
    
    // Lunar Landing (Levels 21-30)
    ...createLevelRange(
        21,
        "Lunar Landing",
        120,
        [-5, 5], // Added some wind to lunar environment (was [0, 0])
        25, // Increased from 20 for faster platform movement
        true,
        true,
        3, // Increased from 2 for more asteroids
        85, // Reduced from 90 for less fuel
        'background-moon',
        'platform-moon',
        0xcccccc
    ),
    
    // Space Station (Levels 31-40)
    ...createLevelRange(
        31,
        "Space Station",
        80,
        [-3, 3], // Added some wind to space environment (was [0, 0])
        45, // Increased from 40 for faster platform movement
        true,
        true,
        4, // Increased from 3 for more asteroids
        80, // Reduced from 85 for less fuel
        'background-space',
        'platform-station',
        0x000000
    ),
    
    // Mars Landing (Levels 41-50)
    ...createLevelRange(
        41,
        "Mars Landing",
        150,
        [-20, 20], // Increased from [-15, 15] for more wind
        30, // Increased from 25 for faster platform movement
        true,
        true,
        3, // Increased from 2 for more asteroids
        75, // Reduced from 80 for less fuel
        'background-mars',
        'platform-mars',
        0xc43e00
    )
];

export function getLevel(levelId: number): LevelConfig {
    const level = levels.find(l => l.id === levelId);
    return level || levels[0]; // Return first level as default if not found
}

export function getMaxLevel(): number {
    return Math.max(...levels.map(l => l.id));
} 