import React from "react";

const DEFAULT_RESULTS_STATE = {};
const DEFAULT_QUERY_STATE = {};

const SearchResultsReaderContext = React.createContext(DEFAULT_RESULTS_STATE);
const SearchResultsWriterContext = React.createContext();
const SearchQueryReaderContext = React.createContext(DEFAULT_QUERY_STATE);
const SearchQueryWriterContext = React.createContext();

/**
 * A context provider for a search page, which contains search results and a way to set them
 * as well as a method for setting/reading from the query itself
 * @param {Object} props the props to pass onwards to the child, generally its children
 * @returns {Object} a React component with the search results provider
 */
export function SearchResultsProvider(props) {
  const [data, setData] = React.useState(DEFAULT_RESULTS_STATE);
  const [query, setQuery] = React.useState(DEFAULT_QUERY_STATE);
  const {additionalSearchData, ...rest} = props

  return (
    <SearchQueryReaderContext.Provider value={{query, ...additionalSearchData}}>
      <SearchQueryWriterContext.Provider value={setQuery}>
        <SearchResultsReaderContext.Provider value={{...data}}>
          <SearchResultsWriterContext.Provider value={setData} {...rest}/>
        </SearchResultsReaderContext.Provider>
      </SearchQueryWriterContext.Provider>
    </SearchQueryReaderContext.Provider>
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


/**
 * Obtain the context reader of the parent search page.
 * @returns {Object} a React context of values from the parent search page
 * @throws an error if it is not within a SearchResultsProvider
 */
export function useSearchQueryReaderContext() {
  const context = React.useContext(SearchQueryReaderContext);

  if (context == undefined) {
    throw new Error("useSearchQueryReaderContext must be used within a SearchResultsProvider")
  }

  return context;
}

/**
 * Obtain a writer to the context of the parent search page.
 * @returns {Object} a React context of values from the parent search page
 * @throws an error if it is not within a SearchResultsProvider
 */
export function useSearchQueryWriterContext() {
  const context = React.useContext(SearchQueryWriterContext);

  if (context == undefined) {
    throw new Error("useSearchQueryWriterContext must be used within a SearchResultsProvider")
  }

  return context;
}
