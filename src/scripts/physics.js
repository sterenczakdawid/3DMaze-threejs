import * as THREE from "three";

const collisionGometry = new THREE.BoxGeometry(4.1, 1.1, 4.1);
const collisionMaterial = new THREE.MeshLambertMaterial({
	color: "red",
	transparent: true,
	opacity: 0.2,
});

const contactMaterial = new THREE.MeshBasicMaterial({
	wireframe: true,
	color: 0x00ff00,
});
const contactGeometry = new THREE.SphereGeometry(0.05, 6, 6);

export class Physics {
	constructor(scene) {
		this.helpers = new THREE.Group();
		scene.add(this.helpers);
	}

	update(dt, player, world) {
		this.detectColissions(player, world);
	}

	detectColissions(player, world) {
		this.helpers.clear();
		const candidates = this.broadPhase(player, world);
		const collisions = this.narrowPhase(candidates, player);

		if (collisions.length > 0) {
			this.resolveCollisions(collisions, player);
		}
	}

	broadPhase(player, world) {
		let candidates = [];
		const currX = player.position.x;
		const currZ = player.position.z;

		const x = currX >= 0 ? Math.round(currX / 4 - 0.5) : 0;
		const z = currZ >= 0 ? Math.round(currZ / 4 - 0.5) : 0;
		// console.log(`x: ${x}, z:${z}`);

		const cell = world.getCell(x, z);

		if (cell) {
			const cellCoords = { x, z };
			this.addCollisionHelper(cellCoords);
			for (const wall of Object.values(cell.walls)) {
				if (!wall.exists) continue;
				candidates.push(wall);
			}
		}

		return candidates;
	}

	narrowPhase(candidates, player) {
		const collisions = [];

		for (const wall of candidates) {
			const closestPoint = wall.isSide
				? {
						x: wall.position.x,
						y: Math.max(
							wall.position.y - 2,
							Math.min(
								player.position.y - player.height / 2,
								wall.position.y + 2
							)
						),
						z: Math.max(
							wall.position.z - 2,
							Math.min(player.position.z, wall.position.z + 2)
						),
				  }
				: {
						x: Math.max(
							wall.position.x - 2,
							Math.min(player.position.x, wall.position.x + 2)
						),
						y: Math.max(
							wall.position.y - 2,
							Math.min(
								player.position.y - player.height / 2,
								wall.position.y + 2
							)
						),
						z: wall.position.z,
				  };
			const dx = closestPoint.x - player.position.x;
			const dy = closestPoint.y - (player.position.y - player.height / 2);
			const dz = closestPoint.z - player.position.z;

			if (this.pointInPlayerBoundingCylinder(closestPoint, player)) {
				// Compute the overlap between the point and the player's bounding
				// cylinder along the y-axis and in the xz-plane
				const overlapY = player.height / 2 - Math.abs(dy);
				const overlapXZ = player.radius - Math.sqrt(dx * dx + dz * dz);
				// Compute the normal of the collision (pointing away from the contact point)
				// and the overlap between the point and the player's bounding cylinder
				let normal, overlap;
				if (overlapY < overlapXZ) {
					normal = new THREE.Vector3(0, -Math.sign(dy), 0);
					overlap = overlapY;
					player.onGround = true;
				} else {
					normal = new THREE.Vector3(-dx, 0, -dz).normalize();
					overlap = overlapXZ;
				}
				collisions.push({
					wall,
					contactPoint: closestPoint,
					normal,
					overlap,
				});
				this.addContactPointerHelper(closestPoint);
			}
		}

		// console.log(collisions.length);

		return collisions;
	}

	addCollisionHelper(cellPos) {
		const cellMesh = new THREE.Mesh(collisionGometry, collisionMaterial);
		cellMesh.position.set(cellPos.x * 4 + 2, -0.5, cellPos.z * 4 + 2);
		this.helpers.add(cellMesh);
	}

	addContactPointerHelper(p) {
		const contactMesh = new THREE.Mesh(contactGeometry, contactMaterial);
		contactMesh.position.copy(p);
		this.helpers.add(contactMesh);
	}

	pointInPlayerBoundingCylinder(point, player) {
		const dx = point.x - player.position.x;
		const dy = point.y - (player.position.y - player.height / 2);
		const dz = point.z - player.position.z;
		const r_sq = dx * dx + dz * dz;

		// Check if contact point is inside the player's bounding cylinder
		return (
			Math.abs(dy) < player.height / 2 && r_sq < player.radius * player.radius
		);
	}

	resolveCollisions(collisions, player) {
		collisions.sort((a, b) => {
			return a.overlap < b.overlap;
		});

		for (const collision of collisions) {
			console.log(collision);
			console.log(player);
			let deltaPosition = collision.normal.clone();
			deltaPosition.multiplyScalar(collision.overlap);
			player.position.add(deltaPosition);
		}
	}
}
