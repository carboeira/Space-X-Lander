import Phaser from 'phaser';

// Extend existing Phaser types to match your usage
declare module 'phaser' {
    namespace GameObjects {
        interface Image {
            setDepth(depth: number): this;
        }
        
        interface TileSprite {
            setDepth(depth: number): this;
            setAlpha(alpha: number): this;
        }
        
        interface Sprite {
            setAlpha(alpha: number): this;
            setTint(tint: number): this;
        }
        
        interface Text {
            setAlpha(alpha: number): this;
            setTint(tint: number): this;
            y: number;
        }
        
        namespace Particles {
            interface ParticleEmitter {
                setDepth(depth: number): this;
                emitParticle(count?: number): this;
                texture: { key: string };
                visible: boolean;
                active: boolean;
                depth: number;
                x: number;
                y: number;
            }
        }
    }
    
    namespace Physics {
        namespace Arcade {
            interface Body {
                gameObject: any;
                angularVelocity: number;
                allowGravity: boolean;
                setCollideWorldBounds(collide: boolean): this;
                setBounce(bounce: number): this;
                setDrag(drag: number): this;
                setAngularDrag(drag: number): this;
                velocity: {
                    x: number;
                    y: number;
                    set(x: number, y: number): this;
                };
            }
            
            interface World {
                on(event: string, callback: Function, context?: any): this;
                off(event: string, callback: Function, context?: any): this;
                drawDebug: boolean;
                debugGraphic: Phaser.GameObjects.Graphics;
            }

            interface Factory {
                overlap(object1: any, object2: any, collideCallback?: Function, processCallback?: Function, callbackContext?: any): Phaser.Physics.Arcade.Collider;
            }
        }
    }
    
    namespace Input {
        interface KeyboardPlugin {
            on(event: string, callback: Function, context?: any): this;
            off(event: string, callback: Function, context?: any): this;
        }
    }
    
    namespace Sound {
        interface SoundManager {
            locked: boolean;
            unlock(): this;
        }
    }
    
    namespace Time {
        interface TimeManager {
            addEvent(config: any): any;
        }
    }

    // Fix Scene class to allow update with parameters
    class Scene {
        update(time?: number, delta?: number): void;
    }
}

// Extend the Rocket class to include rotation property
declare module '../objects/Rocket' {
    interface Rocket {
        rotation: number;
        thrustSound: Phaser.Sound.BaseSound;
    }
}

// Extend the GameScene class to include missing properties
declare module '../scenes/GameScene' {
    interface GameScene {
        sys: Phaser.Scenes.Systems;
        events: Phaser.Events.EventEmitter;
        controlsEnabled: boolean;
    }
} 