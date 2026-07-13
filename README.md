# CanDIG Data Portal

A data analytics and visualization portal for CanDIG Services. Is built off the Berry Material-UI React Template and that documentation can be found [here](https://codedthemes.gitbook.io/berry/).

## Setup Development Server

-   Node: v24 (LTS)
-   npm: v11 (bundled with Node 24)
-   MUI: V5

There was a migration from V4 - V5 of MUI following https://mui.com/material-ui/guides/migration-v4/

### Installation

Navigate to route folder of the project and do an npm install

```
cd candig-data-portal
```

```
npm install
```

The file `.env.development` is where you specify API Servers and site-specific variables.

-   `VITE_KATSU_API_SERVER`: Path to the Katsu API.
-   `VITE_BASE_NAME`: The prepending path of your server. For example, if you would like your app to be available at `/v2/data-portal`, you should specify the aforementioned value here. By default, the app will be running at root.
-   `VITE_SITE_LOCATION`: If you specify `BCGSC` or `UHN`, the app will display the logo of respective institution.
-   `GENERATE_SOURCEMAP`: Removes map fodlers from build when set to false

After this you can start the application by running **npm start**

Note that if you change any of the variables above, you need to restart your server for them to be in effect.

```
npm start
```

This will start the Vite dev server at http://localhost:4173. Your terminal shows the following message when it is ready.

```
VITE ready in ... ms

➜  Local:   http://localhost:4173/
➜  Network: http://192.168.29.77:4173/

Note that the development build is not optimized.
To create a production build, use npm run build.
```

## Deployment

You would need to specify the variables required in `.env.production`, see the section above on what values are required for which variables.

One thing worth noting is that the `VITE_BASE_NAME` variable only affects the routes of the app. The static assets are still served from root.

As an example, if you would like the app's static assets to be served at `/v2/data-portal`, you would need to specify this line at `package.json`.

```
    "homepage": "https://example.ca/v2/data-portal",
```

Once you have all of the required environment variables defined, you may run

```
npm run build
```

This will produce a static folder `/dist` to be served with any static file server.
