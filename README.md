# CanDIG Data Portal

A data analytics and visualization portal for CanDIG Services. Is built off the Berry Material-UI React Template and that documentation can be found [here](https://codedthemes.gitbook.io/berry/)

## Setup Development Server

### Installation

Navigate to route folder of the project and do an npm install

```
cd candig-data-portal
```

```
npm install
```


The file `.env.development` is where you specify API Servers and site-specific variables.

- `REACT_APP_KATSU_API_SERVER`: Path to the Katsu API.
- `REACT_APP_CANDIG_SERVER`: Path to the candig-server API.
- `REACT_APP_BASE_NAME`: The prepending path of your server. For example, if you would like your app to be available at `/v2/data-portal`, you should specify the aforementioned value here. By default, the app will be running at root.

After this you can start the application by running **npm start**

Note that if you change any of the variables above, you need to restart your server for them to be in effect.
    
```
npm start
```

This will start your local server at http://localhost:3000. Also, your terminal shows the following message when compiled successfully.

```
Compiled successfully!

You can now view candig-data-portal in the browser.

Local:            http://localhost:3000    
On Your Network:  http://192.168.29.77:3000

Note that the development build is not optimized.
To create a production build, use yarn build.
```

### Deployment

You would need to specify the variables required in `.env.production`, see the section above on what values are required for which variables.

One thing worth noting is that the `REACT_APP_BASE_NAME` variable only affects the routes of the app. The static assets are still served from root.

As an example, if you would like the both the app's static assets to be served at `/v2/data-portal`, you would need to specify this line at `package.json`.

```
    "homepage": "https://example.ca/v2/data-portal",
```

Once you have all of the required environment variables defined, you may run

```
npm run build
```

This will produce a static folder `/build` to be served with any static file server.

