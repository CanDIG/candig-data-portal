import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

// project imports
import { INGEST_URL } from 'store/api';
import { UseUnauthorizedRoutes } from 'routes/UnauthorizedRoutes';
import { AuthContext } from './AuthContext';

// assets

function AuthCheck(props) {
    const { children } = props;
    const [authCheckState, setAuthCheckState] = useState({
        loading: true,
        authorized: false,
        pending: false,
        reqNum: 0
    });

    const setAuthCheckValue = (prop, value) => {
        setAuthCheckState((old) => {
            const retVal = { ...old };
            retVal[prop] = value;
            return retVal;
        });
    };

    // Fire off the authorization check
    useEffect(() => {
        setAuthCheckValue('loading', true);
        fetch(`${INGEST_URL}/user/me`)
            .then((request) => {
                if (request.ok) {
                    setAuthCheckValue('authorized', true);
                    return undefined;
                }
                setAuthCheckValue('authorized', false);

                // Request not ok: double check to see if we're pending
                return fetch(`${INGEST_URL}/user/pending/me`)
                    .then((request) => {
                        if (request.ok) {
                            return request.text();
                        }
                        throw new Error(request.error);
                    })
                    .then((text) => {
                        setAuthCheckValue('pending', text.trim() === 'true');
                    });
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setAuthCheckValue('loading', false);
            });
    }, [authCheckState.reqNum]);

    const contextValue = useMemo(() => [authCheckState, setAuthCheckState], [authCheckState, setAuthCheckState]);

    return (
        <AuthContext.Provider value={contextValue}>{authCheckState.authorized ? children : <UseUnauthorizedRoutes />}</AuthContext.Provider>
    );
}

AuthCheck.propTypes = {
    children: PropTypes.node
};

export default AuthCheck;
