// API URL is baked in at build time via REACT_APP_BACKEND_URL (ARG in Dockerfile)
const config = {
    API_URL: `${process.env.REACT_APP_BACKEND_URL}/api`
};

export default config;
