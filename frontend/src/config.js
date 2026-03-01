// API calls go to same origin (/api/...) — nginx proxies them to the backend container internally
// This avoids CORS and doesn't require a public backend URL
const config = {
    API_URL: `${process.env.REACT_APP_BACKEND_URL || ''}/api`
};

export default config;
