import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import Grid from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// ✅ Registrar componentes necesarios para Pie Chart
ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function ComparisonChart({ savedProjects }) {
	console.log("📊 ComparisonChart - Proyectos recibidos:", savedProjects);

	// Validación: necesitamos al menos 1 proyecto
	if (!savedProjects || savedProjects.length === 0) {
		return (
			<div
				style={{ textAlign: "center", padding: "40px", color: "#999" }}
			>
				No hay proyectos para comparar
			</div>
		);
	}

	// Función para calcular costos por categoría de un proyecto
	const calculateCostsByCategory = (calculatedCosts, projectData) => {
		try {
			// Obtener el área total del proyecto
			const buildData = JSON.parse(
				projectData.build_data || '{"result_data": {"area_total": 0}}'
			);
			const area_total = 3000;

			// Calcular costo de cada categoría
			const murosYColumnas =
				calculatedCosts.muros_y_columnas * area_total;
			const techos = calculatedCosts.techos * area_total;
			const puertasYVentanas =
				calculatedCosts.puertas_y_ventanas * area_total;
			const revestimientos = calculatedCosts.revestimientos * area_total;
			const banos = calculatedCosts.banos * area_total;
			const instalaciones = calculatedCosts.instalaciones * area_total;

			const total =
				murosYColumnas +
				techos +
				puertasYVentanas +
				revestimientos +
				banos +
				instalaciones;

			console.log(
				`💰 Costos por categoría - ${projectData.name || "proyecto"}:`,
				{
					murosYColumnas,
					techos,
					puertasYVentanas,
					revestimientos,
					banos,
					instalaciones,
					total,
				}
			);

			return {
				murosYColumnas,
				techos,
				puertasYVentanas,
				revestimientos,
				banos,
				instalaciones,
				total,
			};
		} catch (error) {
			console.error("❌ Error calculando costos:", error);
			return {
				murosYColumnas: 0,
				techos: 0,
				puertasYVentanas: 0,
				revestimientos: 0,
				banos: 0,
				instalaciones: 0,
				total: 0,
			};
		}
	};

	// Colores para las categorías (mismo color para todas las categorías en todos los proyectos)
	const categoryColors = {
		murosYColumnas: {
			bg: "rgba(255, 99, 132, 0.7)",
			border: "rgba(255, 99, 132, 1)",
		},
		techos: {
			bg: "rgba(54, 162, 235, 0.7)",
			border: "rgba(54, 162, 235, 1)",
		},
		puertasYVentanas: {
			bg: "rgba(255, 206, 86, 0.7)",
			border: "rgba(255, 206, 86, 1)",
		},
		revestimientos: {
			bg: "rgba(75, 192, 192, 0.7)",
			border: "rgba(75, 192, 192, 1)",
		},
		banos: {
			bg: "rgba(153, 102, 255, 0.7)",
			border: "rgba(153, 102, 255, 1)",
		},
		instalaciones: {
			bg: "rgba(255, 159, 64, 0.7)",
			border: "rgba(255, 159, 64, 1)",
		},
	};

	// Definición de categorías para la leyenda global
	const categories = [
		{
			label: "Muros y Columnas",
			color: categoryColors.murosYColumnas.bg,
		},
		{
			label: "Techos",
			color: categoryColors.techos.bg,
		},
		{
			label: "Puertas y Ventanas",
			color: categoryColors.puertasYVentanas.bg,
		},
		{
			label: "Revestimientos",
			color: categoryColors.revestimientos.bg,
		},
		{
			label: "Baños",
			color: categoryColors.banos.bg,
		},
		{
			label: "Instalaciones Eléc. y Sanit.",
			color: categoryColors.instalaciones.bg,
		},
	];

	// Crear datos para cada proyecto
	const createPieData = (project) => {
		const costs = calculateCostsByCategory(
			project.calculatedCosts,
			project.projectData
		);

		return {
			labels: [
				"Muros y Columnas",
				"Techos",
				"Puertas y Ventanas",
				"Revestimientos",
				"Baños",
				"Instalaciones Eléc. y Sanit.",
			],
			datasets: [
				{
					data: [
						costs.murosYColumnas,
						costs.techos,
						costs.puertasYVentanas,
						costs.revestimientos,
						costs.banos,
						costs.instalaciones,
					],
					backgroundColor: [
						categoryColors.murosYColumnas.bg,
						categoryColors.techos.bg,
						categoryColors.puertasYVentanas.bg,
						categoryColors.revestimientos.bg,
						categoryColors.banos.bg,
						categoryColors.instalaciones.bg,
					],
					borderColor: [
						categoryColors.murosYColumnas.border,
						categoryColors.techos.border,
						categoryColors.puertasYVentanas.border,
						categoryColors.revestimientos.border,
						categoryColors.banos.border,
						categoryColors.instalaciones.border,
					],
					borderWidth: 2,
				},
			],
			totalCost: costs.total,
		};
	};

	// Opciones para cada gráfico circular (SIN leyenda individual)
	const pieOptions = {
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				display: false, // ✅ Ocultar leyenda individual
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						const label = context.label || "";
						const value = context.parsed || 0;
						const total = context.dataset.data.reduce(
							(a, b) => a + b,
							0
						);
						const percentage = ((value / total) * 100).toFixed(1);

						return `${label}: S/ ${new Intl.NumberFormat("es-PE", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						}).format(value)} (${percentage}%)`;
					},
				},
			},
		},
	};

	return (
		<>
			<Grid container spacing={3}>
				{savedProjects.map((project, index) => {
					const pieData = createPieData(project);

					return (
						<Grid
							key={project.id}
							xs={12}
							sm={6}
							md={
								savedProjects.length === 1
									? 12
									: savedProjects.length === 2
									? 6
									: 4
							}
						>
							<Paper
								elevation={3}
								sx={{
									p: 2,
									height: "100%",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}
							>
								<Typography
									variant="h6"
									sx={{
										mb: 1,
										fontWeight: 600,
										color: "#1976d2",
										textAlign: "center",
									}}
								>
									{project.name}
								</Typography>

								<Typography
									variant="body2"
									sx={{
										mb: 2,
										fontWeight: 500,
										color: "#666",
										textAlign: "center",
									}}
								>
									Costo Total: S/{" "}
									{new Intl.NumberFormat("es-PE", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}).format(pieData.totalCost)}
								</Typography>

								<div
									style={{
										width: "100%",
										maxWidth: "350px",
										height: "350px",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<Pie data={pieData} options={pieOptions} />
								</div>
							</Paper>
						</Grid>
					);
				})}
			</Grid>

			{/* ✅ Leyenda Global Única */}
			<Paper
				elevation={2}
				sx={{
					p: 3,
					mt: 3,
					backgroundColor: "#f8f9fa",
				}}
			>
				<Typography
					variant="h6"
					sx={{
						fontWeight: 600,
						mb: 2,
						color: "#333",
						textAlign: "center",
					}}
				>
					📊 Categorías de Costos
				</Typography>

				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						justifyContent: "center",
						gap: 2,
					}}
				>
					{categories.map((category, index) => (
						<Box
							key={index}
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
							}}
						>
							<Box
								sx={{
									width: 20,
									height: 20,
									backgroundColor: category.color,
									borderRadius: "4px",
									flexShrink: 0,
								}}
							/>
							<Typography
								variant="body2"
								sx={{
									color: "#555",
									fontWeight: 500,
								}}
							>
								{category.label}
							</Typography>
						</Box>
					))}
				</Box>

				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ mt: 2, textAlign: "center" }}
				>
					Cada gráfico circular muestra cómo se distribuyen los costos
					en cada proyecto. Los colores representan las mismas
					categorías en todos los proyectos para facilitar la
					comparación.
				</Typography>
			</Paper>
		</>
	);
}
