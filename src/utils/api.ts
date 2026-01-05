import queryString from 'query-string';

export const sendRequest = async <T>(props: IRequest) => { //type
    let {
        url,
        method,
        body,
        queryParams = {},
        useCredentials = false,
        headers = {},
        nextOption = {}
    } = props;

    // Validate URL
    if (!url || url.includes('undefined')) {
        throw new Error('Invalid URL: URL is undefined or contains undefined');
    }

    // Normalize URL: remove double slashes (except after protocol) and trailing slashes
    url = url.replace(/([^:]\/)\/+/g, '$1').replace(/\/$/, '');

    const options: any = {
        method: method,
        // by default setting the content-type to be json type
        headers: new Headers({ 'content-type': 'application/json', ...headers }),
        body: body ? JSON.stringify(body) : null,
        ...nextOption
    };
    if (useCredentials) options.credentials = "include";

    // Only add query params if queryParams object has keys
    if (queryParams && Object.keys(queryParams).length > 0) {
        url = `${url}?${queryString.stringify(queryParams)}`;
    }

    return fetch(url, options).then(res => {
        if (res.ok) {
            return res.json() as T; //generic
        } else {
            return res.json().then(function (json) {
                // to be able to access error status when you catch the error 
                return {
                    statusCode: res.status,
                    message: json?.message ?? "",
                    error: json?.error ?? ""
                } as T;
            });
        }
    }).catch((error) => {
        // Handle network errors (CORS, connection refused, etc.)
        console.error('Network error:', error);
        return {
            statusCode: 0,
            message: 'Network error: Unable to connect to server',
            error: 'Internal server error',
            code: 0
        } as T;
    });
};

export const sendRequestFile = async <T>(props: IRequest) => { //type
    let {
        url,
        method,
        body,
        queryParams = {},
        useCredentials = false,
        headers = {},
        nextOption = {}
    } = props;

    // Validate URL
    if (!url || url.includes('undefined')) {
        throw new Error('Invalid URL: URL is undefined or contains undefined');
    }

    // Normalize URL: remove double slashes (except after protocol) and trailing slashes
    url = url.replace(/([^:]\/)\/+/g, '$1').replace(/\/$/, '');

    const options: any = {
        method: method,
        // by default setting the content-type to be json type
        headers: new Headers({ ...headers }),
        body: body ? body : null,
        ...nextOption
    };
    if (useCredentials) options.credentials = "include";

    // Only add query params if queryParams object has keys
    if (queryParams && Object.keys(queryParams).length > 0) {
        url = `${url}?${queryString.stringify(queryParams)}`;
    }

    return fetch(url, options).then(res => {
        if (res.ok) {
            return res.json() as T; //generic
        } else {
            return res.json().then(function (json) {
                // to be able to access error status when you catch the error 
                return {
                    statusCode: res.status,
                    message: json?.message ?? "",
                    error: json?.error ?? ""
                } as T;
            });
        }
    }).catch((error) => {
        // Handle network errors (CORS, connection refused, etc.)
        console.error('Network error:', error);
        return {
            statusCode: 0,
            message: 'Network error: Unable to connect to server',
            error: 'Internal server error',
            code: 0
        } as T;
    });
};
