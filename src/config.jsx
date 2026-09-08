const config = {
    // basename: only at build time to set, and don't add '/' at end off BASENAME for breadcrumbs, also don't put only '/' use blank('') instead,
    basename: '',
    defaultPath: '',
    candigVersion: import.meta.env.VITE_CANDIG_VERSION,
    // Fall back to the documented default (5) so the censorship caption never renders
    // "less than undefined" if the build-time env var is missing.
    aggregateThreshold: import.meta.env.VITE_AGGREGATE_COUNT_THRESHOLD || 5,
    fontFamily: `'Roboto', sans-serif`,
    borderRadius: 12,
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL
};

export default config;
