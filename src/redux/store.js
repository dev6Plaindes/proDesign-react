import { configureStore } from "@reduxjs/toolkit";
import { authSlice, registerSlice } from "./auth";
import { buildingSlice } from "./building/buildingSlice";
import { mainSlice } from "./main/mainSlice";
import { planSlice } from "./planes";
import { projectSlice } from "./projects/projectSlice";
import { distributionSlice } from "./distribution/distributionSlice";
import { ambienceSlice } from "./distribution/ambienceSlice";
import exportReducer from "./features/exportSlice";
import view3DReducer from "./features/view3DSlice";

export const store = configureStore({
	reducer: {
		register: registerSlice.reducer,
		auth: authSlice.reducer,
		main: mainSlice.reducer,
		plan: planSlice.reducer,
		building: buildingSlice.reducer,
		project: projectSlice.reducer,
		distribution: distributionSlice.reducer,
		ambience: ambienceSlice.reducer,
		export: exportReducer,
		view3D: view3DReducer,
	},
});
