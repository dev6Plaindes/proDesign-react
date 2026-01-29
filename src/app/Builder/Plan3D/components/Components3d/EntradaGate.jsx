import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useMemo } from "react";

const EntradaGate = ({
	corners,
	scale = 0.01, // Escala ajustable
	rotation = [0, 0, 0],
}) => {
	const { scene } = useLoader(GLTFLoader, "/models/gate/scene.gltf");

	// Calcular centro y dimensiones de la entrada
	const entradaData = useMemo(() => {
		if (!corners || corners.length < 4) return null;

		const centerX =
			corners.reduce((sum, c) => sum + c.east, 0) / corners.length;
		const centerY =
			corners.reduce((sum, c) => sum + c.north, 0) / corners.length;

		const width = Math.sqrt(
			Math.pow(corners[1].east - corners[0].east, 2) +
				Math.pow(corners[1].north - corners[0].north, 2)
		);

		const depth = Math.sqrt(
			Math.pow(corners[2].east - corners[1].east, 2) +
				Math.pow(corners[2].north - corners[1].north, 2)
		);

		const angle = Math.atan2(
			corners[1].north - corners[0].north,
			corners[1].east - corners[0].east
		);

		return { centerX, centerY, width, depth, angle };
	}, [corners]);

	if (!entradaData) return null;

	return (
		<group
			position={[
				entradaData.centerX - 5,
				entradaData.centerY + 3,
				2, // Al nivel del suelo
			]}
			rotation={[
				rotation[0],
				rotation[1],
				entradaData.angle + rotation[2], // Orientar según el ángulo de la entrada
			]}
		>
			<primitive
				object={scene.clone()}
				scale={[scale, scale, scale]}
				castShadow
				receiveShadow
			/>
		</group>
	);
};

// Precargar el modelo
useLoader.preload(GLTFLoader, "/models/gate/scene.gltf");

export default EntradaGate;
