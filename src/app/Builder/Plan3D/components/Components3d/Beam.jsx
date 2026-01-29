// components3D/Beam.jsx
import * as THREE from "three";

const Beam = ({ start, end, height, yPosition }) => {
	const dx = end.east - start.east;
	const dy = end.north - start.north;
	const length = Math.sqrt(dx * dx + dy * dy);
	const angle = Math.atan2(dy, dx);

	const centerX = (start.east + end.east) / 2;
	const centerY = (start.north + end.north) / 2;

	return (
		<mesh
			position={[centerX, centerY, yPosition]}
			rotation={[0, 0, angle]}
			castShadow
			receiveShadow
		>
			<boxGeometry args={[length, 0.25, 0.3]} />
			<meshStandardMaterial
				color="#8B4513"
				roughness={0.8}
				metalness={0.2}
			/>
		</mesh>
	);
};

export default Beam;
