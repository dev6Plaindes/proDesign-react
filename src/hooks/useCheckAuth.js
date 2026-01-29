import { useDispatch, useSelector } from "react-redux";
import { login, logout, checkingCredentials } from "../redux/auth";
import { isCheckToken } from "../providers/authProvider"; // 👈 backend

export const useAuthStore = () => {
	const { status } = useSelector((state) => state.auth);
	const dispatch = useDispatch();

	const checkAuth = async () => {
		const token = localStorage.getItem("token");

		// ❌ No hay token → logout
		if (!token) {
			dispatch(logout());
			return;
		}

		try {
			dispatch(checkingCredentials());

			// ✅ Backend valida token y devuelve usuario
			const res = await isCheckToken(token);
			// console.log("token:",token);
			

			const { usuario } = res.data;
			const { id, id_master, name, lastname, email } = usuario;

			dispatch(
				login({
					uid: id,
					uid_master: id_master,
					name,
					lastname,
					email,
				})
			);
		} catch (error) {
			// ❌ Token inválido / expirado
			localStorage.removeItem("token");
			dispatch(logout());
		}
	};

	return { status, checkAuth };
};
