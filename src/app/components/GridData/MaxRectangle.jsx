const MaxRectangle = (coordinate) => {
	// Validación inicial
	if (!coordinate || coordinate.length < 3) {
		console.log("❌ No hay suficientes coordenadas");
		return Promise.resolve([]);
	}

	const coordinates = coordinate.map((vertex, index) => ({
		id: Date.now() + index,
		east: parseFloat(vertex[0]),
		north: parseFloat(vertex[1]),
	}));

	return new Promise((resolve) => {
		setTimeout(() => {
			const allRectangles = [];

			// Buscar rectángulos en diferentes ángulos
			for (let degrees = 0; degrees < 180; degrees += 5) {
				const angle = (degrees * Math.PI) / 180;
				const rect = findMaxRectangleAtAngle(coordinates, angle);

				if (rect) {
					allRectangles.push(rect);
				}
			}

			if (allRectangles.length === 0) {
				console.log("⚠️ No se encontraron rectángulos válidos");
				resolve([]);
				return;
			}

			// Refinamiento de los mejores
			const topRectangles = allRectangles
				.sort((a, b) => b.area - a.area)
				.slice(0, 5);

			topRectangles.forEach((rect) => {
				const bestAngle = (rect.angle * Math.PI) / 180;
				for (let offset = -5; offset <= 5; offset += 0.5) {
					const angle = bestAngle + (offset * Math.PI) / 180;
					const refinedRect = findMaxRectangleAtAngle(
						coordinates,
						angle
					);
					if (refinedRect) {
						allRectangles.push(refinedRect);
					}
				}
			});

			// Seleccionar las mejores 3 opciones diversas
			const sortedByArea = allRectangles.sort((a, b) => b.area - a.area);
			const options = [];

			// Opción 1: Rectángulo con mayor área
			if (sortedByArea[0]) {
				options.push({ ...sortedByArea[0], reason: "Mayor área" });
			}

			// Opción 2: Buscar uno con proporciones diferentes
			const firstRatio = sortedByArea[0]
				? sortedByArea[0].width / sortedByArea[0].height
				: 0;
			for (let i = 1; i < sortedByArea.length; i++) {
				const rect = sortedByArea[i];
				const ratio = rect.width / rect.height;
				const ratioDiff = Math.abs(ratio - firstRatio);

				if (
					ratioDiff > 0.2 &&
					rect.area > sortedByArea[0].area * 0.85 &&
					options.length < 3
				) {
					const isAlreadySimilar = options.some(
						(opt) =>
							Math.abs(opt.angle - rect.angle) < 10 &&
							Math.abs(opt.area - rect.area) < opt.area * 0.05
					);

					if (!isAlreadySimilar) {
						const aspectRatio = rect.width / rect.height;
						let reason = "Proporciones diferentes";
						if (aspectRatio > 1.5) {
							reason = "Más alargado";
						} else if (aspectRatio < 0.8) {
							reason = "Más vertical";
						} else {
							reason = "Más equilibrado";
						}
						options.push({ ...rect, reason });
					}
				}

				if (options.length >= 3) break;
			}

			// Si solo tenemos 1-2 opciones, agregar las siguientes mejores
			for (
				let i = 1;
				i < sortedByArea.length && options.length < 3;
				i++
			) {
				const rect = sortedByArea[i];
				const isAlreadyAdded = options.some(
					(opt) =>
						Math.abs(opt.angle - rect.angle) < 5 &&
						Math.abs(opt.area - rect.area) < opt.area * 0.02
				);

				if (!isAlreadyAdded) {
					options.push({
						...rect,
						reason: `Opción ${options.length + 1}`,
					});
				}
			}

			const result = options.slice(0, 3).map((rectangulo) => ({
				vertices: rectangulo.corners,
				angulo: (rectangulo.angle * Math.PI) / 180,
				anguloGrados: rectangulo.angle,
				ancho: rectangulo.width,
				alto: rectangulo.height,
				area: rectangulo.area,
				perimetro: rectangulo.perimeter,
				centro: {
					east:
						(rectangulo.corners[0].east +
							rectangulo.corners[2].east) /
						2,
					north:
						(rectangulo.corners[0].north +
							rectangulo.corners[2].north) /
						2,
				},
			}));

			console.log("✅ Resultado final:", result.length, "opciones");
			resolve(result);
		}, 100);
	});
};

const isPointInPolygon = (point, polygon) => {
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].east,
			yi = polygon[i].north;
		const xj = polygon[j].east,
			yj = polygon[j].north;
		const intersect =
			yi > point.north !== yj > point.north &&
			point.east < ((xj - xi) * (point.north - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
};

const rotatePoint = (point, angle, center) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const dx = point.east - center.east;
	const dy = point.north - center.north;
	return {
		east: cos * dx - sin * dy + center.east,
		north: sin * dx + cos * dy + center.north,
	};
};

const findMaxRectangleAtAngle = (polygon, angle) => {
	const center = {
		east: polygon.reduce((sum, p) => sum + p.east, 0) / polygon.length,
		north: polygon.reduce((sum, p) => sum + p.north, 0) / polygon.length,
	};

	const rotatedPolygon = polygon.map((p) => rotatePoint(p, -angle, center));

	const easts = rotatedPolygon.map((p) => p.east);
	const norths = rotatedPolygon.map((p) => p.north);
	const minE = Math.min(...easts);
	const maxE = Math.max(...easts);
	const minN = Math.min(...norths);
	const maxN = Math.max(...norths);
	let maxArea = 0;
	let bestRect = null;
	const step = (maxE - minE) / 20;
	for (let x1 = minE; x1 < maxE; x1 += step) {
		for (let y1 = minN; y1 < maxN; y1 += step) {
			for (let x2 = x1 + step; x2 <= maxE; x2 += step) {
				for (let y2 = y1 + step; y2 <= maxN; y2 += step) {
					const corners = [
						{ east: x1, north: y1 },
						{ east: x2, north: y1 },
						{ east: x2, north: y2 },
						{ east: x1, north: y2 },
					];

					const allInside = corners.every((corner) =>
						isPointInPolygon(corner, rotatedPolygon)
					);
					if (allInside) {
						const area = (x2 - x1) * (y2 - y1);
						if (area > maxArea) {
							maxArea = area;
							bestRect = { x1, y1, x2, y2 };
						}
					}
				}
			}
		}
	}
	if (!bestRect) return null;
	const rectCorners = [
		{ east: bestRect.x1, north: bestRect.y1 },
		{ east: bestRect.x2, north: bestRect.y1 },
		{ east: bestRect.x2, north: bestRect.y2 },
		{ east: bestRect.x1, north: bestRect.y2 },
	].map((p) => rotatePoint(p, angle, center));

	const width = Math.abs(bestRect.x2 - bestRect.x1);
	const height = Math.abs(bestRect.y2 - bestRect.y1);
	const perimeter = 2 * (width + height); // ✅ Cálculo del perímetro

	return {
		corners: rectCorners,
		area: maxArea,
		width: width,
		height: height,
		perimeter: perimeter,
		angle: (angle * 180) / Math.PI,
	};
};

export default MaxRectangle;
