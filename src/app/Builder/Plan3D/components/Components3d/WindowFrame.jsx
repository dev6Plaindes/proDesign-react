// components3D/WindowFrame.jsx
import * as THREE from "three";

const WindowFrame = ({ position, rotation }) => {
	const frameMaterial = new THREE.MeshStandardMaterial({
		color: "#8B4513",
		roughness: 0.6,
		metalness: 0.2,
	});

	const glassMaterial = new THREE.MeshPhysicalMaterial({
		color: "#87CEEB",
		transparent: true,
		opacity: 0.4,
		metalness: 0.1,
		roughness: 0.05,
		transmission: 0.9,
		thickness: 0.1,
	});

	return (
		<group position={position} rotation={rotation}>
			{/* Vidrio */}
			<mesh material={glassMaterial}>
				<boxGeometry args={[1.4, 1.1, 0.02]} />
			</mesh>

			{/* Marco horizontal superior */}
			<mesh position={[0, 0.55, 0]} material={frameMaterial}>
				<boxGeometry args={[1.5, 0.05, 0.1]} />
			</mesh>

			{/* Marco horizontal inferior */}
			<mesh position={[0, -0.55, 0]} material={frameMaterial}>
				<boxGeometry args={[1.5, 0.05, 0.1]} />
			</mesh>

			{/* Marco vertical izquierdo */}
			<mesh position={[-0.7, 0, 0]} material={frameMaterial}>
				<boxGeometry args={[0.05, 1.2, 0.1]} />
			</mesh>

			{/* Marco vertical derecho */}
			<mesh position={[0.7, 0, 0]} material={frameMaterial}>
				<boxGeometry args={[0.05, 1.2, 0.1]} />
			</mesh>

			{/* Divisor central */}
			<mesh position={[0, 0, 0]} material={frameMaterial}>
				<boxGeometry args={[0.05, 1.2, 0.1]} />
			</mesh>
		</group>
	);
};

export default WindowFrame;
