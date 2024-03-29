const config = {
    // basename: only at build time to set, and don't add '/' at end off BASENAME for breadcrumbs, also don't put only '/' use blank('') instead,
    // like '/berry-material-react/react/default'
    basename: process.env.REACT_APP_BASE_NAME,
    defaultPath: process.env.REACT_APP_BASE_NAME,
    candigVersion: process.env.REACT_APP_CANDIG_VERSION,
    fontFamily: `'Roboto', sans-serif`,
    borderRadius: 12
};

export default config;
