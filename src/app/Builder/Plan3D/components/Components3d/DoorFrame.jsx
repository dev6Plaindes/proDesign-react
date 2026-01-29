// components3D/DoorFrame.jsx
import * as THREE from "three";

const DoorFrame = ({ position, rotation }) => {
	const frameMaterial = new THREE.MeshStandardMaterial({
		color: "#654321",
		roughness: 0.7,
		metalness: 0.1,
	});

	const doorMaterial = new THREE.MeshStandardMaterial({
		color: "#8B6914",
		roughness: 0.6,
		metalness: 0.1,
	});

	return (
		<group position={position} rotation={rotation}>
			{/* Puerta */}
			<mesh material={doorMaterial}>
				<boxGeometry args={[0.95, 2.0, 0.05]} />
			</mesh>

			{/* Marco superior */}
			<mesh position={[0, 1.05, 0]} material={frameMaterial}>
				<boxGeometry args={[1.1, 0.1, 0.15]} />
			</mesh>

			{/* Marco izquierdo */}
			<mesh position={[-0.525, 0, 0]} material={frameMaterial}>
				<boxGeometry args={[0.05, 2.1, 0.15]} />
			</mesh>

			{/* Marco derecho */}
			<mesh position={[0.525, 0, 0]} material={frameMaterial}>
				<boxGeometry args={[0.05, 2.1, 0.15]} />
			</mesh>

			{/* Manija */}
			<mesh position={[0.4, 0, 0.05]}>
				<sphereGeometry args={[0.04, 16, 16]} />
				<meshStandardMaterial
					color="#D4AF37"
					metalness={0.9}
					roughness={0.2}
				/>
			</mesh>
		</group>
	);
};

export default DoorFrame;
