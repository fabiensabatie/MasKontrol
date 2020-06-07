import axios from "axios";
console.log(process.env);
const SERVER_URL =
  process.env.REACT_APP_ENV === "dev"
    ? "http://localhost:8000"
    : "http://192.168.4.1:8000";

function getSettings() {
  return axios.get(SERVER_URL + "/settings");
}
export default getSettings;
