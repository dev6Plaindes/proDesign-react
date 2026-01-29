import { createSlice } from "@reduxjs/toolkit";

const view3DSlice = createSlice({
	name: "view3D",
	initialState: {
		elementos: {
			inicial: [],
			primaria: [],
			secundaria: [],
			banos: [],
			escaleras: [],
			ambientes: [],
			laterales: [],
			entrada: null,
			cancha: null,
		},
		coordinates: [],
		maxRectangle: null,
		distribution: null,
		capacityInfo: null,

		// Configuración
		currentFloor: 1,
		totalFloors: 1,
		layoutMode: "horizontal",

		// Estado
		isReady: false, // true cuando los datos están listos
	},
	reducers: {
		// ✅ Guardar todos los datos generados en TerrainPlanner
		setVista3DData: (state, action) => {
			const {
				elementos,
				coordinates,
				maxRectangle,
				distribution,
				capacityInfo,
				currentFloor,
				totalFloors,
				layoutMode,
			} = action.payload;

			state.elementos = elementos;
			state.coordinates = coordinates;
			state.maxRectangle = maxRectangle;
			state.distribution = distribution;
			state.capacityInfo = capacityInfo;
			state.currentFloor = currentFloor;
			state.totalFloors = totalFloors;
			state.layoutMode = layoutMode;
			state.isReady = true;
		},

		// ✅ Cambiar piso actual (útil para navegación entre pisos)
		setCurrentFloor3D: (state, action) => {
			state.currentFloor = action.payload;
		},

		// ✅ Limpiar datos
		clearVista3DData: (state) => {
			state.elementos = {
				inicial: [],
				primaria: [],
				secundaria: [],
				banos: [],
				escaleras: [],
				ambientes: [],
				laterales: [],
				entrada: null,
				cancha: null,
			};
			state.coordinates = [];
			state.maxRectangle = null;
			state.distribution = null;
			state.capacityInfo = null;
			state.isReady = false;
		},
	},
});

export const { setVista3DData, setCurrentFloor3D, clearVista3DData } =
	view3DSlice.actions;

export default view3DSlice.reducer;
