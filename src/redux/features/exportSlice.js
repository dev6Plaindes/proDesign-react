import { createSlice } from "@reduxjs/toolkit";

const exportSlice = createSlice({
	name: "export",
	initialState: {
		triggerExport: false,
		exportType: null, // 'json', 'excel', etc.
	},
	reducers: {
		requestExport: (state, action) => {
			state.triggerExport = true;
			state.exportType = action.payload; // 'json', 'excel', etc.
		},
		resetExport: (state) => {
			state.triggerExport = false;
			state.exportType = null;
		},
	},
});

export const { requestExport, resetExport } = exportSlice.actions;
export default exportSlice.reducer;
