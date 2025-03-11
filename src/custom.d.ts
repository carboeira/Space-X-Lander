declare module 'phaser' {
    export = Phaser;
}

declare namespace Phaser {
    interface GameConfig {
        type: number;
        width: number;
        height: number;
        physics: {
            default: string;
            arcade: {
                gravity: { y: number };
                debug: boolean;
            };
        };
        scene: any[];
        scale: {
            mode: number;
            autoCenter: number;
        };
        pixelArt: boolean;
        audio?: {
            disableWebAudio?: boolean;
            noAudio?: boolean;
        };
    }

    class Game {
        constructor(config: GameConfig);
    }

    namespace Scale {
        const FIT: number;
        const CENTER_BOTH: number;
    }

    const AUTO: number;

    class Scene {
        constructor(config: string | SceneConfig);
        add: Phaser.GameObjects.GameObjectFactory;
        cameras: Phaser.Cameras.Scene2D.CameraManager;
        input: Phaser.Input.InputPlugin;
        load: Phaser.Loader.LoaderPlugin;
        physics: Phaser.Physics.Arcade.ArcadePhysics;
        scene: Phaser.Scenes.ScenePlugin;
        sound: Phaser.Sound.SoundManager;
        time: Phaser.Time.TimeManager;
        tweens: Phaser.Tweens.TweenManager;
        make: Phaser.GameObjects.GameObjectCreator;
        preload(): void;
        create(): void;
        update(): void;
    }

    interface SceneConfig {
        key?: string;
        active?: boolean;
        visible?: boolean;
        pack?: any;
        cameras?: any;
        map?: any;
        physics?: any;
        loader?: any;
        plugins?: any;
    }

    namespace GameObjects {
        class GameObject {
            scene: Scene;
            width: number;
            height: number;
            setActive(value: boolean): this;
            setVisible(value: boolean): this;
            setPosition(x: number, y: number): this;
            setOrigin(x: number, y?: number): this;
            setScale(x: number, y?: number): this;
            destroy(): void;
        }

        class Sprite extends GameObject {
            body: Phaser.Physics.Arcade.Body;
            angle: number;
            x: number;
            y: number;
            setTexture(key: string, frame?: string | number): this;
            setFrame(frame: string | number): this;
            setScale(x: number, y?: number): this;
            setVelocity(x: number, y?: number): this;
            setAngularVelocity(value: number): this;
            setAngle(degrees: number): this;
            setCollideWorldBounds(value: boolean): this;
            setDamping(value: boolean): this;
            setDrag(x: number, y?: number): this;
            setAngularDrag(value: number): this;
            setMaxVelocity(x: number, y?: number): this;
            setImmovable(value: boolean): this;
            setInteractive(config?: any): this;
            setVisible(value: boolean): this;
            setCircle(radius: number, offsetX?: number, offsetY?: number): this;
            setBounce(x: number, y?: number): this;
            setSize(width: number, height: number, center?: boolean): this;
            setOffset(x: number, y?: number): this;
            setDepth(value: number): this;
            setMass(value: number): this;
            setGravity(x: number, y?: number): this;
            setFriction(x: number, y?: number): this;
            setAcceleration(x: number, y?: number): this;
        }

        class Image extends GameObject {
            setScale(x: number, y?: number): this;
            y: number;
        }

        class Text extends GameObject {
            setText(text: string): this;
            setStyle(style: any): this;
            setFontSize(size: number): this;
            setFontFamily(family: string): this;
            setColor(color: string): this;
            setAlign(align: string): this;
            setBackgroundColor(color: string): this;
            setPadding(padding: any): this;
            setResolution(resolution: number): this;
            setDepth(value: number): this;
            setScrollFactor(x: number, y?: number): this;
            setWordWrapWidth(width: number): this;
            setFixedSize(width: number, height: number): this;
            setMaxLines(max: number): this;
            updateText(): this;
            getTextMetrics(): any;
            setInteractive(config?: any): this;
            on(event: string, callback: Function, context?: any): this;
            destroy(): void;
        }

        class Graphics extends GameObject {
            clear(): this;
            lineStyle(lineWidth: number, color: number, alpha?: number): this;
            fillStyle(color: number, alpha?: number): this;
            beginPath(): this;
            closePath(): this;
            strokePath(): this;
            fillPath(): this;
            strokeRect(x: number, y: number, width: number, height: number): this;
            fillRect(x: number, y: number, width: number, height: number): this;
            strokeCircle(x: number, y: number, radius: number): this;
            fillCircle(x: number, y: number, radius: number): this;
            strokeTriangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): this;
            fillTriangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): this;
            lineBetween(x1: number, y1: number, x2: number, y2: number): this;
            moveTo(x: number, y: number): this;
            lineTo(x: number, y: number): this;
            arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): this;
            generateTexture(key: string, width?: number, height?: number): this;
            createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): any;
            destroy(): void;
        }

        class TileSprite extends GameObject {
            tilePositionX: number;
            tilePositionY: number;
            setTilePosition(x: number, y?: number): this;
            setTileScale(x: number, y?: number): this;
        }

        namespace Particles {
            class ParticleEmitterManager extends GameObject {
                createEmitter(config?: any): ParticleEmitter;
            }

            class ParticleEmitter {
                on: boolean;
                setPosition(x: number, y: number): this;
                setSpeed(min: number, max?: number): this;
                setScale(start: number, end?: number): this;
                setAlpha(start: number, end?: number): this;
                setLifespan(min: number, max?: number): this;
                setQuantity(quantity: number): this;
                setFrequency(frequency: number, quantity?: number): this;
                setBlendMode(mode: string): this;
                setEmitZone(config: any): this;
                setDeathZone(config: any): this;
                explode(count: number, x: number, y: number): this;
                flow(count: number, frequency: number): this;
                pause(): this;
                resume(): this;
                stop(): this;
                killAll(): this;
            }
        }

        class GameObjectFactory {
            existing<T extends GameObject>(child: T): T;
            sprite(x: number, y: number, texture: string, frame?: string | number): Sprite;
            image(x: number, y: number, texture: string, frame?: string | number): Image;
            text(x: number, y: number, text: string | string[], style?: any): Text;
            graphics(config?: any): Graphics;
            tileSprite(x: number, y: number, width: number, height: number, texture: string, frame?: string | number): TileSprite;
            particles(texture: string): Particles.ParticleEmitterManager;
        }

        class GameObjectCreator {
            graphics(config?: any): Graphics;
        }
    }

    namespace Physics {
        namespace Arcade {
            class ArcadePhysics {
                world: World;
                add: Factory;
            }

            class World {
                gravity: { x: number; y: number };
                setBounds(x: number, y: number, width: number, height: number, checkLeft?: boolean, checkRight?: boolean, checkUp?: boolean, checkDown?: boolean): World;
                setBoundsCollision(left?: boolean, right?: boolean, up?: boolean, down?: boolean): World;
                enable(object: any, bodyType?: number): any;
                disable(object: any): any;
                pause(): World;
                resume(): World;
            }

            class Factory {
                sprite(x: number, y: number, texture: string, frame?: string | number): Phaser.Physics.Arcade.Sprite;
                collider(object1: any, object2: any, collideCallback?: Function, processCallback?: Function, callbackContext?: any): Collider;
                existing<T extends Phaser.GameObjects.GameObject>(gameObject: T): T;
            }

            class Sprite extends Phaser.GameObjects.Sprite {
                body: Body;
            }

            class Body {
                velocity: { x: number; y: number };
                enable: boolean;
            }

            class Collider {
                active: boolean;
                name: string;
                destroy(): void;
            }
        }
    }

    namespace Input {
        class InputPlugin {
            keyboard: Keyboard.KeyboardPlugin;
        }

        namespace Keyboard {
            class KeyboardPlugin {
                createCursorKeys(): CursorKeys;
            }

            interface CursorKeys {
                up: Key;
                down: Key;
                left: Key;
                right: Key;
                space: Key;
                shift: Key;
            }

            class Key {
                isDown: boolean;
                isUp: boolean;
                altKey: boolean;
                ctrlKey: boolean;
                shiftKey: boolean;
                metaKey: boolean;
                location: number;
                timeDown: number;
                duration: number;
                timeUp: number;
                repeats: number;
                keyCode: number;
            }
        }
    }

    namespace Loader {
        class LoaderPlugin {
            image(key: string, url: string): this;
            audio(key: string, url: string | string[]): this;
            on(event: string, callback: Function, context?: any): this;
        }
    }

    namespace Sound {
        class SoundManager {
            add(key: string, config?: any): BaseSound;
            play(key: string, config?: any): BaseSound;
            get(key: string): BaseSound;
            context: AudioContext;
        }

        class BaseSound {
            play(config?: any): this;
            stop(): this;
            pause(): this;
            resume(): this;
            isPlaying: boolean;
        }
    }

    namespace Scenes {
        class ScenePlugin {
            start(key: string, data?: any): this;
            restart(data?: any): this;
            pause(key?: string): this;
            resume(key?: string): this;
            stop(key?: string): this;
            switch(key: string): this;
        }
    }

    namespace Cameras {
        namespace Scene2D {
            class CameraManager {
                main: Camera;
            }

            class Camera {
                width: number;
                height: number;
            }
        }
    }

    namespace Time {
        class TimeManager {
            delayedCall(delay: number, callback: Function, args?: any[], callbackScope?: any): TimerEvent;
        }

        class TimerEvent {
            paused: boolean;
            elapsed: number;
            repeat: number;
            repeatCount: number;
            delay: number;
            callback: Function;
            callbackScope: any;
            args: any[];
            timeScale: number;
            startAt: number;
            remove(dispatchCallback?: boolean): void;
        }
    }

    namespace Tweens {
        class TweenManager {
            add(config: any): Tween;
            addCounter(config: any): Tween;
            create(config: any): Tween;
            killAll(): this;
            killTweensOf(target: any): this;
            pauseAll(): this;
            resumeAll(): this;
        }

        class Tween {
            play(): this;
            pause(): this;
            resume(): this;
            stop(): this;
            complete(): this;
            restart(): this;
            seek(value: number): this;
            setCallback(type: string, callback: Function, params?: any[], scope?: any): this;
            setCallbackScope(scope: any): this;
            setDelay(value: number): this;
            setDuration(value: number): this;
            setEase(ease: string | Function): this;
            setLoops(value: number): this;
            setOffset(value: number): this;
            setTimeScale(value: number): this;
            setYoyo(value: boolean): this;
        }
    }

    namespace Math {
        function Between(min: number, max: number): number;
        function DegToRad(degrees: number): number;
        function RadToDeg(radians: number): number;
    }

    namespace Types {
        namespace Input {
            namespace Keyboard {
                interface CursorKeys {
                    up: Phaser.Input.Keyboard.Key;
                    down: Phaser.Input.Keyboard.Key;
                    left: Phaser.Input.Keyboard.Key;
                    right: Phaser.Input.Keyboard.Key;
                    space: Phaser.Input.Keyboard.Key;
                    shift: Phaser.Input.Keyboard.Key;
                }
            }
        }
    }
} 