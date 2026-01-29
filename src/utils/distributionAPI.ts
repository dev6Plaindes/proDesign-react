export const saveDistributionToAPI = async (
	projectId: number,
	distribution: any,
	coordinates: any,
	maxRectangle: any,
	capacityInfo: any
) => {
	try {
		console.log("📤 Guardando distribución:", {
			projectId,
			layoutMode: distribution.layoutMode,
			totalFloors: distribution.totalFloors,
		});

		const payload = {
			layoutMode: distribution.layoutMode,
			totalFloors: distribution.totalFloors,
			currentFloor: distribution.currentFloor || 1,
			floors: distribution.floors,
			pabellonInferiorEs: distribution.pabellonInferiorEs,
			pabellonIzquierdoEs: distribution.pabellonIzquierdoEs,
			pabellonDerechoEs: distribution.pabellonDerechoEs,
			ambientesEnPabellones: distribution.ambientesEnPabellones || [],
			ambientesLateralesCancha:
				distribution.ambientesLateralesCancha || [],
			capacityInfo: capacityInfo,
			coordinates: coordinates,
			maxRectangle: maxRectangle,
		};

		const response = await fetch(
			`http://localhost:8000/api/v1/projects/${projectId}/distribution`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "Error al guardar distribución");
		}

		return data;
	} catch (error) {
		console.error("❌ Error al guardar distribución:", error);
		throw error;
	}
};

export const getDistributionFromAPI = async (projectId: number) => {
	try {
		const response = await fetch(
			`http://localhost:8000/api/v1/projects/${projectId}/distribution`
		);
		const data = await response.json();

		if (!response.ok) {
			if (data.statusCode === 404) {
				// No hay distribución guardada, retornar null
				return null;
			}
			throw new Error(data.message || "Error al obtener distribución");
		}

		return data.data;
	} catch (error) {
		console.error("❌ Error al obtener distribución:", error);
		return null;
	}
};
