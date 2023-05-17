import React from 'react';

const DEFAULT_STATE = <></>;

const SidebarReaderContext = React.createContext(DEFAULT_STATE);
const SidebarWriterContext = React.createContext();

/**
 * A context provider for anything that relies on knowing what goes in the sidebar
 * @param {Object} props the props to pass onwards to the child, generally its children
 * @returns {Object} a React component with the sidebar
 */
export function SidebarProvider(props) {
    const [data, setData] = React.useState(DEFAULT_STATE);
    const { additionalSearchData, ...rest } = props;

    return (
        <SidebarReaderContext.Provider value={{ ...data, ...additionalSearchData }}>
            <SidebarWriterContext.Provider value={setData} {...rest} />
        </SidebarReaderContext.Provider>
    );
}

/**
 * Obtain the context reader of the federation sites query.
 * @returns {Object} a React context of the sidebar DOM component
 * @throws an error if it is not within a SidebarProvider
 */
export function useSidebarReaderContext() {
    const context = React.useContext(SidebarReaderContext);

    if (context == undefined) {
        throw new Error('useSidebarReaderContext must be used within a SidebarProvider');
    }

    return context;
}

/**
 * Obtain a writer to the context of the federation sites query.
 * @returns {Object} a React context of the sidebar DOM component
 * @throws an error if it is not within a SidebarProvider
 */
export function useSidebarWriterContext() {
    const context = React.useContext(SidebarWriterContext);

    if (context == undefined) {
        throw new Error('useSidebarWriterContext must be used within a SidebarProvider');
    }

    return context;
}
