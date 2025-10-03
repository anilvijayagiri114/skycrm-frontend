import api from "./services/api";
import { clearToken } from "./utils/auth";

const handleLogout = async (nav) => {
  console.log("In logout");
  try {
    await api.post("/auth/logout");
    clearToken();
    nav("/login/select");
  } catch (error) {
    console.error(error);
  }
};
export default handleLogout;
