// components3D/Wall.jsx
import * as THREE from "three";
import { useMemo } from "react";
import WindowFrame from "./WindowFrame";
import DoorFrame from "./DoorFrame";

const Wall = ({
	start,
	end,
	height,
	hasWindow = false,
	hasDoor = false,
	color = "#cccccc",
}) => {
	const wallData = useMemo(() => {
		// Calcular longitud de la pared
		const dx = end.east - start.east;
		const dy = end.north - start.north;
		const length = Math.sqrt(dx * dx + dy * dy);

		// Calcular ángulo de rotación
		const angle = Math.atan2(dy, dx);

		// Posición central de la pared
		const centerX = (start.east + end.east) / 2;
		const centerY = (start.north + end.north) / 2;

		return {
			length,
			angle,
			centerX,
			centerY,
		};
	}, [start, end]);

	const wallThickness = 0.15;

	// Crear shape de la pared con sustracciones
	const shape = useMemo(() => {
		const wallShape = new THREE.Shape();
		wallShape.moveTo(0, 0);
		wallShape.lineTo(wallData.length, 0);
		wallShape.lineTo(wallData.length, height);
		wallShape.lineTo(0, height);
		wallShape.closePath();

		// Agregar ventana si corresponde
		if (hasWindow) {
			const windowWidth = Math.min(1.5, wallData.length * 0.3);
			const windowHeight = 1.2;
			const windowY = height * 0.5;
			const windowX = wallData.length / 2;

			const windowHole = new THREE.Path();
			windowHole.moveTo(
				windowX - windowWidth / 2,
				windowY - windowHeight / 2
			);
			windowHole.lineTo(
				windowX + windowWidth / 2,
				windowY - windowHeight / 2
			);
			windowHole.lineTo(
				windowX + windowWidth / 2,
				windowY + windowHeight / 2
			);
			windowHole.lineTo(
				windowX - windowWidth / 2,
				windowY + windowHeight / 2
			);
			windowHole.closePath();
			wallShape.holes.push(windowHole);
		}

		// Agregar puerta si corresponde
		if (hasDoor) {
			const doorWidth = 1.0;
			const doorHeight = 2.1;
			const doorX = wallData.length * 0.3;

			const doorHole = new THREE.Path();
			doorHole.moveTo(doorX - doorWidth / 2, 0);
			doorHole.lineTo(doorX + doorWidth / 2, 0);
			doorHole.lineTo(doorX + doorWidth / 2, doorHeight);
			doorHole.lineTo(doorX - doorWidth / 2, doorHeight);
			doorHole.closePath();
			wallShape.holes.push(doorHole);
		}

		return wallShape;
	}, [wallData, height, hasWindow, hasDoor]);

	const extrudeSettings = {
		depth: wallThickness,
		bevelEnabled: false,
	};

	return (
		<group position={[wallData.centerX, wallData.centerY, height / 2]}>
			<mesh
				castShadow
				receiveShadow
				rotation={[0, 0, wallData.angle]}
				position={[-wallData.length / 2, 0, -height / 2]}
			>
				<extrudeGeometry args={[shape, extrudeSettings]} />
				<meshStandardMaterial
					color={color}
					roughness={0.8}
					metalness={0.1}
				/>
			</mesh>

			{/* Marco de ventana si tiene ventana */}
			{hasWindow && (
				<WindowFrame
					position={[0, 0, 0]}
					rotation={[0, 0, wallData.angle]}
				/>
			)}

			{/* Marco de puerta si tiene puerta */}
			{hasDoor && (
				<DoorFrame
					position={[-wallData.length * 0.2, 0, -height / 2 + 1.05]}
					rotation={[0, 0, wallData.angle]}
				/>
			)}
		</group>
	);
};

export default Wall;
