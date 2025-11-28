// utils/classroomGenerator.js
import * as THREE from "three";

/**
 * Genera un objeto classroom completo desde corners 2D
 */
export const generateClassroomFromCorners = (corners, level = "inicial") => {
	// Calcular dimensiones del aula desde corners
	const width = Math.sqrt(
		Math.pow(corners[1].east - corners[0].east, 2) +
			Math.pow(corners[1].north - corners[0].north, 2)
	);

	const length = Math.sqrt(
		Math.pow(corners[2].east - corners[1].east, 2) +
			Math.pow(corners[2].north - corners[1].north, 2)
	);

	const height = 110; // Altura estándar (3 metros aprox)

	// MATERIALES
	const materials = {
		inicial: new THREE.MeshStandardMaterial({
			color: "#eab308",
			roughness: 0.7,
			metalness: 0.3,
		}),
		primaria: new THREE.MeshStandardMaterial({
			color: "#3b82f6",
			roughness: 0.7,
			metalness: 0.3,
		}),
		secundaria: new THREE.MeshStandardMaterial({
			color: "#ef4444",
			roughness: 0.7,
			metalness: 0.3,
		}),
		noColor: new THREE.MeshStandardMaterial({
			color: "#cccccc",
			roughness: 0.7,
			metalness: 0.3,
		}),
	};

	// PAREDES (WALLS)
	const wallShape = new THREE.Shape();
	wallShape.moveTo(0, 0);
	wallShape.lineTo(width * 40, 0); // Escalar a cm
	wallShape.lineTo(width * 40, 20); // Altura de pared
	wallShape.lineTo(0, 20);
	wallShape.closePath();

	const wallGeometry = new THREE.ExtrudeGeometry(wallShape, {
		depth: 5,
		bevelEnabled: false,
	});

	const doorShape = new THREE.Shape();
	doorShape.moveTo(0, 0);
	doorShape.lineTo(40, 0);
	doorShape.lineTo(40, 80);
	doorShape.lineTo(0, 80);
	doorShape.closePath();

	const doorGeometry = new THREE.ExtrudeGeometry(doorShape, {
		depth: 5,
		bevelEnabled: false,
	});

	const windowShape = new THREE.Shape();
	windowShape.moveTo(0, 0);
	windowShape.lineTo(60, 0);
	windowShape.lineTo(60, 50);
	windowShape.lineTo(0, 50);
	windowShape.closePath();

	const windowGeometry = new THREE.ExtrudeGeometry(windowShape, {
		depth: 5,
		bevelEnabled: false,
	});

	const walls = {
		geometry: wallGeometry,
		material: materials,
		position: [0, 0, (length * 40) / 2],
		rotation: [-Math.PI / 2, 0, 0],

		door: {
			position: [-(width * 40) / 2 + 50, 40, (length * 40) / 2 + 2.5],
			geometry: doorGeometry,
		},

		window: {
			geometry: windowGeometry,
			position: {
				frontLeft: [-(width * 40) / 4, 60, (length * 40) / 2 + 2.5],
				frontRight: [(width * 40) / 4, 60, (length * 40) / 2 + 2.5],
				backLeft: [-(width * 40) / 4, 60, -(length * 40) / 2 - 2.5],
				backRight: [(width * 40) / 4, 60, -(length * 40) / 2 - 2.5],
			},
		},

		completeWalls: {
			geometry: new THREE.BoxGeometry(5, height, length * 40),
			position: [
				[(width * 40) / 2, height / 2, 0],
				[-(width * 40) / 2, height / 2, 0],
			],
		},
	};

	// COLUMNAS (COLUMNS)
	const columnShape = new THREE.Shape();
	columnShape.moveTo(0, 0);
	columnShape.lineTo(15, 0);
	columnShape.lineTo(15, 15);
	columnShape.lineTo(0, 15);
	columnShape.closePath();

	const columnGeometry = new THREE.ExtrudeGeometry(columnShape, {
		depth: height,
		bevelEnabled: false,
	});

	const columns = {
		geometry: columnGeometry,
		material: new THREE.MeshStandardMaterial({ color: "#888888" }),
		positions: [
			[-(width * 40) / 2 + 15, height / 2, -(length * 40) / 2 + 15],
			[(width * 40) / 2 - 15, height / 2, -(length * 40) / 2 + 15],
			[-(width * 40) / 2 + 15, height / 2, (length * 40) / 2 - 15],
			[(width * 40) / 2 - 15, height / 2, (length * 40) / 2 - 15],
			[-(width * 40) / 2 + 15, height / 2, 0],
			[(width * 40) / 2 - 15, height / 2, 0],
		],
		rotation: [-Math.PI / 2, 0, 0],
		_height: height,
		_length: 15,
	};

	// VIGAS (BIGAS)
	const vigaHorizontalGeometry = new THREE.BoxGeometry(width * 40, 15, 30);
	const vigaVerticalGeometry = new THREE.BoxGeometry(15, 30, length * 40);

	const bigas = {
		data: [
			{
				id: 0,
				position: [0, height - 15, -(length * 40) / 2],
				rotation: [0, 0, 0],
				geometry: vigaHorizontalGeometry,
			},
			{
				id: 1,
				position: [0, height - 15, (length * 40) / 2],
				rotation: [0, 0, 0],
				geometry: vigaHorizontalGeometry,
			},
			{
				id: 2,
				position: [-(width * 40) / 2, height - 15, 0],
				rotation: [0, 0, 0],
				geometry: vigaVerticalGeometry,
			},
			{
				id: 3,
				position: [(width * 40) / 2, height - 15, 0],
				rotation: [0, 0, 0],
				geometry: vigaVerticalGeometry,
			},
			{
				id: 4,
				position: [0, height - 15, 0],
				rotation: [0, 0, 0],
				geometry: vigaHorizontalGeometry,
			},
		],
		horizontal: { width: 15, height: 30 },
		vertical: { width: 15, height: 20 },
		material: new THREE.MeshStandardMaterial({ color: "#8B4513" }),
		offset: 7.5,
	};

	// TECHO (ROOF)
	const roofShape = new THREE.Shape();
	roofShape.moveTo(0, 0);
	roofShape.lineTo(width * 40 + 20, 0);
	roofShape.lineTo(width * 40 + 20, length * 40 + 20);
	roofShape.lineTo(0, length * 40 + 20);
	roofShape.closePath();

	const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
		depth: 10,
		bevelEnabled: false,
	});

	const roof = {
		geometry: roofGeometry,
		material: new THREE.MeshStandardMaterial({ color: "#654321" }),
		position: [15, height + 10, 15],
		rotation: [Math.PI / 2, 0, 0],
		_length: width * 40 - 30,
		_width: length * 40 - 30,
	};

	// OBJETO COMPLETO
	return {
		walls,
		columns,
		bigas,
		roof,
		height,
		length: length * 40,
		width: width * 40,
	};
};
