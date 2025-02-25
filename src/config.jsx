const config = {
    // basename: only at build time to set, and don't add '/' at end off BASENAME for breadcrumbs, also don't put only '/' use blank('') instead,
    // like '/berry-material-react/react/default'
    basename: import.meta.env.VITE_BASE_NAME,
    defaultPath: import.meta.env.VITE_BASE_NAME,
    candigVersion: import.meta.env.VITE_CANDIG_VERSION,
    aggregateThreshold: import.meta.env.VITE_AGGREGATE_COUNT_THRESHOLD,
    fontFamily: `'Roboto', sans-serif`,
    borderRadius: 12,
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL
};

export default config;
