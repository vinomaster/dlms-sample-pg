/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
import './index.css';
import { Http } from './Http';
import App from './App';
import { User } from './common/common';
import { Role, AppContext } from './common/states';
import { Buffer } from 'buffer';
import ReactDOM from 'react-dom';

console.log('Document cookie=', document.cookie);

/** Get the cookie value */
function getCookie(key: string): any {
    var b = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

/** Create a default user */
const defaultUser: User = {
    id: 'testuser',
    roles: [
        Role.Employee.name,
        /** Leave these other roles in to give an example */
        // Role.Administrator,
        // Role.Requestor,
        // Role.Reviewer,
    ],
    name: 'Test User',
    department: 'Business Technology',
    email: 'testuser@discover.com', // Customize as needed
    title: 'Programmer',
    employeeNumber: '1235D',
};

let http: Http;
console.log('env=', process.env);
if (window.location.hostname === 'localhost' && process.env.REACT_APP_SERVER) {
    http = Http.init(
        window.location.origin.replace(
            window.location.port,
            process.env.REACT_APP_SERVER
        )
    );
} else {
    http = Http.init(window.location.origin);
}

/**
 * Retrieves the user information either from the access token
 * or by making an API call to the server.
 *
 * @returns {Promise<User>} The user object
 */
async function getUser(): Promise<User> {
    console.log('getUser()');
    try {
        const accessToken = getCookie('dlms.session').split('.')[1];
        const claims = JSON.parse(
            Buffer.from(accessToken, 'base64').toString()
        );
        console.log('claims=', claims);
        let user: User = {
            id: claims.user.id,
            name: claims.user.name,
            roles: claims.user.roles,
            department: claims.user.department,
            email: claims.user.email,
            title: claims.user.title,
            employeeNumber: claims.user.employeeNumber,
        };
        return user;
    } catch (e) {
        // If no cookie is set, check for no-auth-user from server
        console.log('No cookie set - check for no-auth-user from server');
        // Make any ajax call to get no-auth-user header from server
        try {
            const response = await http.get('/api/info');
            if (response.headers['no-auth-user']) {
                try {
                    const ctx = JSON.parse(response.headers['no-auth-user']);
                    console.log('no-auth-user ctx=', ctx);
                    let user = ctx.user;
                    return user;
                } catch (e) {
                    console.log('Error parsing no-auth-user');
                }
            }
        } catch (e) {
            console.log('Error getting no-auth-user');
        }
    }
    // If none of the other methods work, use the default user
    console.warn('No user - using default user');
    return defaultUser;
}

async function getInfo() {
    try {
        const response = await http.get('/api/info');
        console.log('getInfo: ', response.data);
        return response.data;
    } catch (e) {
        console.log('Error getting info');
    }
}

/** Start the app after a short delay (1 millisecond).
 *
 * @summary
 * Start the app after a short delay to allow
 * the cookie to be set by the server. Use `ReactDOM.render()` to
 * insert the app into the DOM and start the server.
 *
 * */
setTimeout(async function () {
    let user = await getUser();
    const info = await getInfo();

    const context: AppContext = {
        user: user,
        isAdministrator:
            user.roles.indexOf(Role.Administrator.name) > -1 || false,
        isRequestor: user.roles.indexOf(Role.Requestor.name) > -1 || false,
        isReviewer: user.roles.indexOf(Role.Reviewer.name) > -1 || false,
        isEmployee: user.roles.indexOf(Role.Employee.name) > -1 || false,
        editMode: false,
        readGroups: [],
        writeGroups: [],
    };
    if (info) {
        context.info = info;
    }

    console.log('Authenticated user =', user);
    document.title = 'Team-Outing Request Tracker Dashboard';

    // Must use this way of rendering ReactJS to work with react-draft-wysiwyg
    ReactDOM.render(
        <React.StrictMode>
            <App context={context} />
        </React.StrictMode>,
        document.getElementById('root')
    );
}, 1);
