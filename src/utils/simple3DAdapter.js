// utils/simple3DAdapter.js

/**
 * Convierte corners 2D (east/north) a posición 3D simple
 */
export const convertCornersToPosition = (corners) => {
	if (!corners || corners.length < 3) return [0, 0, 0];

	// Calcular centro del aula
	const centerX =
		corners.reduce((sum, c) => sum + c.east, 0) / corners.length;
	const centerY =
		corners.reduce((sum, c) => sum + c.north, 0) / corners.length;

	return [centerX, centerY, 0]; // z=0 porque está en el suelo
};

/**
 * Calcula la rotación del aula basada en sus corners
 */
export const calculateRotation = (corners) => {
	if (!corners || corners.length < 2) return [0, 0, 0];

	// Calcular ángulo entre el primer y segundo punto
	const dx = corners[1].east - corners[0].east;
	const dy = corners[1].north - corners[0].north;
	const angle = Math.atan2(dy, dx);

	return [0, 0, angle]; // Solo rotación en Z
};
