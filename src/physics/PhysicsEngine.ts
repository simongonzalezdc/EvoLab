// Matter.js physics integration for realistic collisions and forces

import Matter from 'matter-js';
import type { Vector2D } from '../types/entities';
import type { Cell } from '../entities/Cell';

export interface PhysicsBody {
  body: Matter.Body;
  entityId: string;
  radius: number;
}

export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private bodies: Map<string, PhysicsBody> = new Map();
  private runner: Matter.Runner;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    // Create Matter.js engine with custom gravity (minimal for underwater simulation)
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.05, scale: 0.001 }, // Very light gravity for floating
    });

    this.world = this.engine.world;
    this.runner = Matter.Runner.create();

    // Set up collision handling
    this.setupCollisionHandling();

    // Create boundaries
    this.createBoundaries();
  }

  // Create invisible boundaries to keep cells within the lake
  private createBoundaries(): void {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    const thickness = 50;

    const options = {
      isStatic: true,
      restitution: 0.8, // Bounciness
      friction: 0.1,
    };

    // Create walls
    const walls = [
      // Top
      Matter.Bodies.rectangle(0, -halfHeight - thickness / 2, this.width, thickness, options),
      // Bottom
      Matter.Bodies.rectangle(0, halfHeight + thickness / 2, this.width, thickness, options),
      // Left
      Matter.Bodies.rectangle(-halfWidth - thickness / 2, 0, thickness, this.height, options),
      // Right
      Matter.Bodies.rectangle(halfWidth + thickness / 2, 0, thickness, this.height, options),
    ];

    Matter.Composite.add(this.world, walls);
  }

  // Set up collision event handlers
  private setupCollisionHandling(): void {
    Matter.Events.on(this.engine, 'collisionStart', (event: Matter.IEventCollision<Matter.Engine>) => {
      event.pairs.forEach((pair: Matter.Pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Find which entities collided
        const entityA = this.findEntityByBody(bodyA);
        const entityB = this.findEntityByBody(bodyB);

        if (entityA && entityB) {
          this.handleCollision(entityA, entityB, pair);
        }
      });
    });
  }

  // Handle collision between two entities
  private handleCollision(
    entityA: PhysicsBody,
    entityB: PhysicsBody,
    pair: Matter.Pair
  ): void {
    // Calculate collision force based on relative velocity
    const relativeVelocity = Matter.Vector.sub(entityA.body.velocity, entityB.body.velocity);
    const collisionForce = Matter.Vector.magnitude(relativeVelocity);

    // Apply elastic collision response (bouncing)
    const normal = pair.collision.normal;
    const impulse = collisionForce * 0.5;

    // Apply impulse to both bodies
    Matter.Body.applyForce(
      entityA.body,
      entityA.body.position,
      Matter.Vector.mult(normal, -impulse)
    );
    Matter.Body.applyForce(
      entityB.body,
      entityB.body.position,
      Matter.Vector.mult(normal, impulse)
    );
  }

  // Find entity by Matter.js body
  private findEntityByBody(body: Matter.Body): PhysicsBody | null {
    for (const [_, physicsBody] of this.bodies) {
      if (physicsBody.body === body) {
        return physicsBody;
      }
    }
    return null;
  }

  // Create a physics body for a cell
  createCellBody(entityId: string, x: number, y: number, radius: number, mass: number = 1): PhysicsBody {
    const body = Matter.Bodies.circle(x, y, radius, {
      mass: mass,
      restitution: 0.6, // Bounciness
      friction: 0.01,
      frictionAir: 0.02, // Water resistance
      density: 0.001,
    });

    const physicsBody: PhysicsBody = {
      body,
      entityId,
      radius,
    };

    this.bodies.set(entityId, physicsBody);
    Matter.Composite.add(this.world, body);

    return physicsBody;
  }

  // Create compound body for multi-cellular organisms
  createCompoundBody(
    entityId: string,
    parts: Array<{ x: number; y: number; radius: number }>,
    centerX: number,
    centerY: number
  ): PhysicsBody {
    // Create individual circles for each cell
    const bodies = parts.map((part) =>
      Matter.Bodies.circle(centerX + part.x, centerY + part.y, part.radius, {
        restitution: 0.6,
        friction: 0.01,
        frictionAir: 0.02,
      })
    );

    // Create compound body
    const compound = Matter.Body.create({
      parts: bodies,
      restitution: 0.6,
      friction: 0.01,
      frictionAir: 0.02,
    });

    const physicsBody: PhysicsBody = {
      body: compound,
      entityId,
      radius: Math.max(...parts.map((p) => p.radius)),
    };

    this.bodies.set(entityId, physicsBody);
    Matter.Composite.add(this.world, compound);

    return physicsBody;
  }

  // Create joint constraint between two bodies (for multi-cellular organisms)
  createJoint(
    entityIdA: string,
    entityIdB: string,
    length: number,
    stiffness: number = 0.9
  ): Matter.Constraint | null {
    const bodyA = this.bodies.get(entityIdA)?.body;
    const bodyB = this.bodies.get(entityIdB)?.body;

    if (!bodyA || !bodyB) {
      return null;
    }

    const constraint = Matter.Constraint.create({
      bodyA,
      bodyB,
      length,
      stiffness,
      damping: 0.1,
    });

    Matter.Composite.add(this.world, constraint);
    return constraint;
  }

  // Apply force to a body
  applyForce(entityId: string, force: Vector2D): void {
    const physicsBody = this.bodies.get(entityId);
    if (physicsBody) {
      Matter.Body.applyForce(physicsBody.body, physicsBody.body.position, {
        x: force.x,
        y: force.y,
      });
    }
  }

  // Set velocity directly (useful for AI movement)
  setVelocity(entityId: string, velocity: Vector2D): void {
    const physicsBody = this.bodies.get(entityId);
    if (physicsBody) {
      Matter.Body.setVelocity(physicsBody.body, velocity);
    }
  }

  // Get position from physics body
  getPosition(entityId: string): Vector2D | null {
    const physicsBody = this.bodies.get(entityId);
    if (physicsBody) {
      return {
        x: physicsBody.body.position.x,
        y: physicsBody.body.position.y,
      };
    }
    return null;
  }

  // Get velocity from physics body
  getVelocity(entityId: string): Vector2D | null {
    const physicsBody = this.bodies.get(entityId);
    if (physicsBody) {
      return {
        x: physicsBody.body.velocity.x,
        y: physicsBody.body.velocity.y,
      };
    }
    return null;
  }

  // Remove body from physics world
  removeBody(entityId: string): void {
    const physicsBody = this.bodies.get(entityId);
    if (physicsBody) {
      Matter.Composite.remove(this.world, physicsBody.body);
      this.bodies.delete(entityId);
    }
  }

  // Update physics simulation
  update(deltaTime: number): void {
    // Run physics engine with delta time
    Matter.Engine.update(this.engine, deltaTime * 1000);
  }

  // Sync cell position with physics body
  syncCellToPhysics(cell: Cell): void {
    const position = this.getPosition(cell.id);
    const velocity = this.getVelocity(cell.id);

    if (position) {
      cell.position.x = position.x;
      cell.position.y = position.y;
    }

    if (velocity) {
      cell.velocity.x = velocity.x;
      cell.velocity.y = velocity.y;
    }
  }

  // Check collision between two positions (no physics body needed)
  checkCollision(pos1: Vector2D, radius1: number, pos2: Vector2D, radius2: number): boolean {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }

  // Get all bodies in a radius (useful for queries)
  getBodiesInRadius(position: Vector2D, radius: number): PhysicsBody[] {
    const bodies: PhysicsBody[] = [];

    this.bodies.forEach((physicsBody) => {
      const dx = physicsBody.body.position.x - position.x;
      const dy = physicsBody.body.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        bodies.push(physicsBody);
      }
    });

    return bodies;
  }

  // Dispose physics engine
  dispose(): void {
    Matter.Runner.stop(this.runner);
    Matter.Engine.clear(this.engine);
    Matter.World.clear(this.world, false);
    this.bodies.clear();
  }
}
