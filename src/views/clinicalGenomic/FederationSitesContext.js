import React from "react";

const DEFAULT_STATE = {};

const FederationSitesReaderContext = React.createContext(DEFAULT_STATE);
const FederationSitesWriterContext = React.createContext();

/**
 * A context provider for anything that relies on knowing what federation sites exist,
 * which contains the sites available and a way to set them
 * @param {Object} props the props to pass onwards to the child, generally its children
 * @returns {Object} a React component with the search results provider
 */
export function FederationSitesProvider(props) {
  const [data, setData] = React.useState(DEFAULT_STATE);
  const {additionalSearchData, ...rest} = props

  return (
    <FederationSitesReaderContext.Provider value={{...data, ...additionalSearchData}}>
      <FederationSitesWriterContext.Provider value={setData} {...rest}/>
    </FederationSitesReaderContext.Provider>
    );
}

/**
 * Obtain the context reader of the federation sites query.
 * @returns {Object} a React context of values from the federation sites query
 * @throws an error if it is not within a FederationSitesProvider
 */
export function useFederationSitesReaderContext() {
  const context = React.useContext(FederationSitesReaderContext);

  if (context == undefined) {
    throw new Error("useFederationSitesReaderContext must be used within a FederationSitesProvider")
  }

  return context;
}

/**
 * Obtain a writer to the context of the federation sites query.
 * @returns {Object} a React context of values from the federation sites query
 * @throws an error if it is not within a FederationSitesProvider
 */
export function useFederationSitesWriterContext() {
  const context = React.useContext(FederationSitesWriterContext);

  if (context == undefined) {
    throw new Error("useFederationSitesWriterContext must be used within a FederationSitesProvider")
  }

  return context;
}
