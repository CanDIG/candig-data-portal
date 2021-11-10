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


Specify api in `.env.development` below is where you'd specifiy the Katsu api

```
REACT_APP_KATSU_API_SERVER='ADD URL HERE'
```


After this you can start the application by running **npm start**
    
```
npm start
```

This will start your local server at http://localhost:3000 Also, your terminal shows the following when compiled successfully

```
Compiled successfully!

You can now view candig-data-portal in the browser.

Local:            http://localhost:3000    
On Your Network:  http://192.168.29.77:3000

Note that the development build is not optimized.
To create a production build, use yarn build.
```
