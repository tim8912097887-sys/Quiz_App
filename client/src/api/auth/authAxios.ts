import axios from "axios";

export const authAxios = axios.create({
    baseURL: "http://localhost:3001/api/v1/auth",
    timeout: 5000,
    // Server response with json
    responseType: "json",
    // Prevent url overide baseURL
    allowAbsoluteUrls: false
})