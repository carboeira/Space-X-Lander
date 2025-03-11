/**
 * Game storage utility for saving and loading game progress
 */

// Storage keys
const STORAGE_PREFIX = 'falcon_lander_';
const LEVEL_KEY = `${STORAGE_PREFIX}level`;
const SCORE_KEY = `${STORAGE_PREFIX}score`;
const HIGH_SCORE_KEY = `${STORAGE_PREFIX}high_score`;
const SOUND_ENABLED_KEY = `${STORAGE_PREFIX}sound_enabled`;
const COMPLETED_LEVELS_KEY = `${STORAGE_PREFIX}completed_levels`;

/**
 * Check if local storage is available
 */
export const isStorageAvailable = (): boolean => {
    try {
        const testKey = `${STORAGE_PREFIX}test`;
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.error('Local storage is not available:', e);
        return false;
    }
};

/**
 * Save current level
 */
export const saveLevel = (level: number): void => {
    if (!isStorageAvailable()) return;
    
    try {
        localStorage.setItem(LEVEL_KEY, level.toString());
    } catch (e) {
        console.error('Error saving level:', e);
    }
};

/**
 * Load saved level
 */
export const loadLevel = (): number => {
    if (!isStorageAvailable()) return 1;
    
    try {
        const savedLevel = localStorage.getItem(LEVEL_KEY);
        return savedLevel ? parseInt(savedLevel, 10) : 1;
    } catch (e) {
        console.error('Error loading level:', e);
        return 1;
    }
};

/**
 * Save current score
 */
export const saveScore = (score: number): void => {
    if (!isStorageAvailable()) return;
    
    try {
        localStorage.setItem(SCORE_KEY, score.toString());
        
        // Update high score if needed
        const highScore = loadHighScore();
        if (score > highScore) {
            saveHighScore(score);
        }
    } catch (e) {
        console.error('Error saving score:', e);
    }
};

/**
 * Load saved score
 */
export const loadScore = (): number => {
    if (!isStorageAvailable()) return 0;
    
    try {
        const savedScore = localStorage.getItem(SCORE_KEY);
        return savedScore ? parseInt(savedScore, 10) : 0;
    } catch (e) {
        console.error('Error loading score:', e);
        return 0;
    }
};

/**
 * Save high score
 */
export const saveHighScore = (score: number): void => {
    if (!isStorageAvailable()) return;
    
    try {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    } catch (e) {
        console.error('Error saving high score:', e);
    }
};

/**
 * Load high score
 */
export const loadHighScore = (): number => {
    if (!isStorageAvailable()) return 0;
    
    try {
        const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
        return savedHighScore ? parseInt(savedHighScore, 10) : 0;
    } catch (e) {
        console.error('Error loading high score:', e);
        return 0;
    }
};

/**
 * Save sound enabled state
 */
export const saveSoundEnabled = (enabled: boolean): void => {
    if (!isStorageAvailable()) return;
    
    try {
        localStorage.setItem(SOUND_ENABLED_KEY, enabled ? '1' : '0');
    } catch (e) {
        console.error('Error saving sound enabled state:', e);
    }
};

/**
 * Load sound enabled state
 */
export const loadSoundEnabled = (): boolean => {
    if (!isStorageAvailable()) return true;
    
    try {
        const savedState = localStorage.getItem(SOUND_ENABLED_KEY);
        return savedState ? savedState === '1' : true;
    } catch (e) {
        console.error('Error loading sound enabled state:', e);
        return true;
    }
};

/**
 * Mark a level as completed
 */
export const markLevelCompleted = (level: number): void => {
    if (!isStorageAvailable()) return;
    
    try {
        const completedLevels = getCompletedLevels();
        if (!completedLevels.includes(level)) {
            completedLevels.push(level);
            localStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(completedLevels));
        }
    } catch (e) {
        console.error('Error marking level as completed:', e);
    }
};

/**
 * Check if a level is completed
 */
export const isLevelCompleted = (level: number): boolean => {
    if (!isStorageAvailable()) return false;
    
    try {
        const completedLevels = getCompletedLevels();
        return completedLevels.includes(level);
    } catch (e) {
        console.error('Error checking if level is completed:', e);
        return false;
    }
};

/**
 * Get all completed levels
 */
export const getCompletedLevels = (): number[] => {
    if (!isStorageAvailable()) return [];
    
    try {
        const savedLevels = localStorage.getItem(COMPLETED_LEVELS_KEY);
        return savedLevels ? JSON.parse(savedLevels) : [];
    } catch (e) {
        console.error('Error getting completed levels:', e);
        return [];
    }
};

/**
 * Reset all game progress
 */
export const resetGameProgress = (): void => {
    if (!isStorageAvailable()) return;
    
    try {
        localStorage.removeItem(LEVEL_KEY);
        localStorage.removeItem(SCORE_KEY);
        localStorage.removeItem(COMPLETED_LEVELS_KEY);
        // Don't reset high score or sound settings
    } catch (e) {
        console.error('Error resetting game progress:', e);
    }
}; 