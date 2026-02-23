// Runtime config: reads from window._env_ (Docker runtime) or process.env (build-time fallback)
const config = {
    API_URL: `${window._env_?.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || ''}/api`
};

export default config;
