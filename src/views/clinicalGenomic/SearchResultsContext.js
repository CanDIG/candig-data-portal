import React from "react";

const DEFAULT_STATE = {};

const SearchResultsReaderContext = React.createContext(DEFAULT_STATE);
const SearchResultsWriterContext = React.createContext();

/**
 * A context provider for a search page, which contains search results and a way to set them
 * @param {Object} props the props to pass onwards to the child, generally its children
 * @returns {Object} a React component with the search results provider
 */
export function SearchResultsProvider(props) {
  const [data, setData] = React.useState(DEFAULT_STATE);
  const {additionalSearchData, ...rest} = props

  return (
    <SearchResultsReaderContext.Provider value={{...data, ...additionalSearchData}}>
      <SearchResultsWriterContext.Provider value={setData} {...rest}/>
    </SearchResultsReaderContext.Provider>
    );
}

/**
 * Obtain the context reader of the parent search page.
 * @returns {Object} a React context of values from the parent search page
 * @throws an error if it is not within a SearchResultsProvider
 */
export function useSearchResultsReaderContext() {
  const context = React.useContext(SearchResultsReaderContext);

  if (context == undefined) {
    throw new Error("useSearchResultsReaderContext must be used within a SearchResultsProvider")
  }

  return context;
}

/**
 * Obtain a writer to the context of the parent search page.
 * @returns {Object} a React context of values from the parent search page
 * @throws an error if it is not within a SearchResultsProvider
 */
export function useSearchResultsWriterContext() {
  const context = React.useContext(SearchResultsWriterContext);

  if (context == undefined) {
    throw new Error("useSearchResultsWriterContext must be used within a SearchResultsProvider")
  }

  return context;
}
