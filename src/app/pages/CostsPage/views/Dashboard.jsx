import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";
import styled from "@mui/material/styles/styled";
import Typography from "@mui/material/Typography";
import ComparisonChart from "../Charts/ComparisonChart";
import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	CircularProgress,
} from "@mui/material";
import TableCosts from "../TableCosts";
import { useState, useEffect } from "react";
import NewCostsTables from "./NewCostsTable";
import { updateProjectExcelService } from "../../../../services/spreadsheetService";
import { useSelector } from "react-redux";

export default function Dashboard({ project, costs, school, handleCosts }) {
	// Validaciones iniciales
	if (!project || !costs) return <></>;
	console.log("📦 Project:", project);
	console.log("💰 Costs:", costs);
	//console.log("numeros de ambientes", numberOfAmbience);

	//if (project.length - 1 !== costs.calculatedCosts.length) return <></>;

	const { numberOfClassrooms } = school;

	// Estado para manejar los proyectos de costos creados
	const [savedProjects, setSavedProjects] = useState([]);
	const [selectedProjectId, setSelectedProjectId] = useState("");
	const [selectedProjectData, setSelectedProjectData] = useState(null);
	const [loadingProjectData, setLoadingProjectData] = useState(false);
	const [excelData, setExcelData] = useState({});
	const numberOfAmbience = useSelector((state) => state.ambience);
	const [open, setOpen] = useState(false);

	const versions = project.filter((el) => el.parent_id !== 0);
	useEffect(() => {
		const fetchExcelData = async () => {
			try {
				const data = await updateProjectExcelService(numberOfAmbience);
				setExcelData(data);
			} catch (error) {
				console.error("Error al obtener datos de Excel:", error);
			}
		};

		fetchExcelData();
	}, []);

	console.log("datos enviados excel::::::", excelData);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleProjectChange = (event) => {
		const selectedId = event.target.value;
		console.log("🔄 Select cambiado a ID:", selectedId);

		setSelectedProjectId(selectedId);

		// Buscar el proyecto seleccionado en savedProjects
		const projectData = savedProjects.find((p) => p.id === selectedId);

		console.log("🔍 Buscando proyecto con ID:", selectedId);
		console.log(
			"📋 Proyectos disponibles:",
			savedProjects.map((p) => ({ id: p.id, name: p.name }))
		);
		console.log("✅ Proyecto encontrado:", projectData);

		if (projectData) {
			setSelectedProjectData(projectData);
			console.log("📊 Datos del proyecto seleccionado:", {
				id: projectData.id,
				name: projectData.name,
				categories: projectData.costsCategories,
				costs: projectData.calculatedCosts,
			});
		} else {
			console.warn("⚠️ No se encontró el proyecto con ID:", selectedId);
		}
	};

	// Función que se ejecuta cuando se crea un nuevo proyecto de costos
	const handleNewProjectVersion = (
		updatedCategories,
		updatedCalculatedCosts,
		projectData
	) => {
		console.log("🎯 handleNewProjectVersion llamado con:");
		console.log("  - Categories:", updatedCategories);
		console.log("  - Calculated Costs:", updatedCalculatedCosts);
		console.log("  - Project Data:", projectData);

		// Validar que tengamos los datos necesarios
		if (!updatedCategories || !updatedCalculatedCosts || !projectData) {
			console.error("❌ Faltan datos para crear el proyecto");
			return;
		}

		const nextProjectNumber = savedProjects.length + 1;

		// Usar un ID único y consistente
		const newProjectId = `project-${projectData.id}-${Date.now()}`;

		const newProject = {
			id: newProjectId,
			name: `Costeo ${nextProjectNumber}`,
			costsCategories: { ...updatedCategories },
			calculatedCosts: { ...updatedCalculatedCosts },
			projectData: { ...projectData },
		};

		console.log("✨ Nuevo proyecto creado:", newProject);

		// Agregar el nuevo proyecto a la lista
		setSavedProjects((prev) => {
			const updated = [...prev, newProject];
			console.log("📋 Proyectos guardados actualizados:", updated);
			return updated;
		});

		// Seleccionar automáticamente el nuevo proyecto
		setSelectedProjectId(newProjectId);
		setSelectedProjectData(newProject);

		console.log("🎯 Proyecto auto-seleccionado:", newProjectId);
	};

	// Determinar si hay proyectos guardados
	const hasProjects = savedProjects.length > 0;

	console.log("📊 Estado actual del Dashboard:");
	console.log("  - Proyectos guardados:", savedProjects.length);
	console.log("  - Proyecto seleccionado ID:", selectedProjectId);
	console.log(
		"  - Datos del proyecto seleccionado:",
		selectedProjectData ? selectedProjectData.name : "ninguno"
	);

	return (
		<Grid
			xs={12}
			sx={{
				display: "flex",
				flexDirection: "column",
				gap: "7px",
			}}
		>
			{/* Botón para crear nuevo costeo */}
			{project.map((el, i) => (
				<TableCosts
					key={el.id}
					handleCosts={handleCosts}
					categories={costs.costsCategories[i]}
					calculatedCosts={costs.calculatedCosts[i]}
					project={el}
					onNewVersion={handleNewProjectVersion}
				/>
			))}

			{/* Sección que aparece cuando hay proyectos guardados */}
			{hasProjects && (
				<>
					<div style={{ paddingBottom: "9px" }}>
						<StyledPaper>Costos del proyecto</StyledPaper>
					</div>

					<Grid container spacing={2}>
						<Grid item xs={12} sm={4}>
							<FormControl fullWidth>
								<InputLabel id="project-select-label">
									Proyecto
								</InputLabel>
								<Select
									labelId="project-select-label"
									id="project-select"
									value={selectedProjectId}
									label="Proyecto"
									onChange={handleProjectChange}
								>
									{savedProjects.map((proj) => (
										<MenuItem key={proj.id} value={proj.id}>
											{proj.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={4}>
							<Button
								variant="contained"
								fullWidth
								sx={{ height: "56px" }}
							>
								Exportar Reporte
							</Button>
						</Grid>

						<Grid item xs={12} sm={4}>
							<Button
								variant="contained"
								fullWidth
								sx={{ height: "56px" }}
								onClick={handleClickOpen}
							>
								Comparativo de Costos
							</Button>
						</Grid>
					</Grid>

					{/* Mostrar tabla de costos del proyecto seleccionado */}
					<div style={{ marginTop: "16px" }}>
						{loadingProjectData ? (
							<div
								style={{
									display: "flex",
									justifyContent: "center",
									padding: "40px",
								}}
							>
								<CircularProgress />
							</div>
						) : selectedProjectData ? (
							<>
								<Typography
									variant="h6"
									sx={{
										mb: 2,
										p: 1,
										bgcolor: "#f5f5f5",
										borderRadius: 1,
										textAlign: "center",
									}}
								>
									Mostrando: {selectedProjectData.name}
								</Typography>
								<NewCostsTables
									key={selectedProjectData.id}
									project={[
										project[0],
										selectedProjectData.projectData,
									]}
									costs={{
										costsCategories: [
											selectedProjectData.costsCategories,
										],
										calculatedCosts: [
											selectedProjectData.calculatedCosts,
										],
									}}
									numberOfClassrooms={numberOfClassrooms}
									excelData={excelData}
								/>
							</>
						) : (
							<Typography
								variant="body1"
								sx={{
									textAlign: "center",
									py: 4,
									color: "text.secondary",
								}}
							>
								Selecciona un proyecto para ver sus costos
							</Typography>
						)}
					</div>
				</>
			)}

			{/* Dialog de comparación */}
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				maxWidth="md"
				fullWidth
			>
				<DialogTitle id="alert-dialog-title">
					Comparación de costos
				</DialogTitle>
				<DialogContent>
					<Grid xs={12}>
						<Grid container spacing={2}>
							<Grid xs={12}>
								<Paper
									variant="outlined"
									sx={{
										padding: "6px 0",
										textAlign: "center",
										boxShadow:
											"0 2px 5px 1px rgb(64 60 67 / 16%)",
									}}
								>
									<Typography fontWeight={500}>
										COMPARACIÓN DE COSTOS
									</Typography>
								</Paper>
							</Grid>
							<Grid xs={12}>
								<Card>
									<CardContent
										sx={{
											px: 1.5,
											pt: 2,
											position: "relative",
											":last-child": {
												paddingBottom: "8px",
											},
										}}
									>
										{savedProjects.length > 1 ? (
											<ComparisonChart
												// versions={savedProjects.map(
												// 	(p) => p.projectData
												// )}
												// costs={savedProjects.map(
												// 	(p) => p.calculatedCosts
												// )}
												savedProjects={savedProjects}
											/>
										) : (
											<Typography
												variant="body2"
												sx={{
													textAlign: "center",
													py: 4,
												}}
											>
												Necesitas al menos 2 proyectos
												para comparar
											</Typography>
										)}
									</CardContent>
								</Card>
							</Grid>
						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
		</Grid>
	);
}

const StyledPaper = styled(Paper)(({ theme }) => ({
	...theme.typography.body2,
	color: "#fff",
	textAlign: "center",
	padding: "5px 0",
	backgroundColor: "#adadad",
	fontSize: "1rem",
	fontWeight: "500",
}));
