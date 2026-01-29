import * as THREE from "three";

export const createClassroomFromCorners = (corners, height, level) => {
	// Calcular dimensiones desde corners
	const width = Math.sqrt(
		Math.pow(corners[1].east - corners[0].east, 2) +
			Math.pow(corners[1].north - corners[0].north, 2)
	);

	const depth = Math.sqrt(
		Math.pow(corners[2].east - corners[1].east, 2) +
			Math.pow(corners[2].north - corners[1].north, 2)
	);

	// Calcular posición central
	const centerX =
		corners.reduce((sum, c) => sum + c.east, 0) / corners.length;
	const centerY =
		corners.reduce((sum, c) => sum + c.north, 0) / corners.length;

	// Calcular rotación (ángulo del aula)
	const angle = Math.atan2(
		corners[1].north - corners[0].north,
		corners[1].east - corners[0].east
	);

	// Crear geometrías básicas
	const wallThickness = 0.2;
	const wallHeight = height;

	return {
		position: [centerX, centerY, 0], // Posición central del aula
		rotation: [0, 0, angle], // Rotación en Z para alinear
		dimensions: {
			width: width,
			depth: depth,
			height: height,
		},

		// Estructura de paredes
		walls: {
			geometry: new THREE.BoxGeometry(width, wallHeight, wallThickness),
			position: [0, wallHeight / 2, 0],
			rotation: [0, 0, 0],

			// Puerta
			door: {
				position: [
					-width / 2 + 1,
					wallHeight / 2 - 1.25,
					wallThickness / 2,
				],
				geometry: new THREE.BoxGeometry(1.2, 2.5, wallThickness + 0.1),
			},

			// Ventanas
			window: {
				geometry: new THREE.BoxGeometry(1.8, 1.5, wallThickness + 0.1),
				position: {
					frontLeft: [-width / 4, wallHeight / 2, wallThickness / 2],
					frontRight: [width / 4, wallHeight / 2, wallThickness / 2],
					backLeft: [-width / 4, wallHeight / 2, -depth / 2],
					backRight: [width / 4, wallHeight / 2, -depth / 2],
				},
			},

			// Paredes completas (laterales)
			completeWalls: {
				geometry: new THREE.BoxGeometry(
					wallThickness,
					wallHeight,
					depth
				),
				position: [
					[width / 2, wallHeight / 2, 0],
					[-width / 2, wallHeight / 2, 0],
				],
			},

			// Material según nivel
			material: {
				inicial: new THREE.MeshLambertMaterial({ color: "#eab308" }),
				primaria: new THREE.MeshLambertMaterial({ color: "#3b82f6" }),
				secundaria: new THREE.MeshLambertMaterial({ color: "#ef4444" }),
				noColor: new THREE.MeshLambertMaterial({ color: "#cccccc" }),
			},
		},

		// Columnas
		columns: {
			geometry: new THREE.BoxGeometry(0.4, wallHeight, 0.4),
			position: [
				[-width / 2 + 0.5, wallHeight / 2, -depth / 2 + 0.5],
				[width / 2 - 0.5, wallHeight / 2, -depth / 2 + 0.5],
				[-width / 2 + 0.5, wallHeight / 2, depth / 2 - 0.5],
				[width / 2 - 0.5, wallHeight / 2, depth / 2 - 0.5],
			],
		},

		// Vigas
		bigas: {
			geometry: new THREE.BoxGeometry(width, 0.3, 0.4),
			position: [
				[0, wallHeight - 0.15, -depth / 2],
				[0, wallHeight - 0.15, depth / 2],
			],
		},

		// Techo
		roof: {
			geometry: new THREE.BoxGeometry(width + 0.5, 0.2, depth + 0.5),
			position: [0, wallHeight + 0.1, 0],
			rotation: [0, 0, 0],
			material: new THREE.MeshLambertMaterial({ color: "#654321" }),
		},
	};
};
