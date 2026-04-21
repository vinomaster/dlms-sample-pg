/**
 * Copyright (c) 2024 Discover Financial Services
 */
import { UserContext, Logger } from 'dlms-server';
import { Role } from './ui/src/common/states';

const log = new Logger('test');

/**
 * A barebones test function.
 */
async function main() {
    // Done
    log.debug('Passed');
    process.exit(0);
}

function createUserContext(id: string): UserContext {
    return {
        user: {
            id,
            name: id,
            department: id,
            email: `${id}@acme.com`,
            roles: [Role.Employee.name],
            title: 'chief flunky',
            employeeNumber: id,
        },
    };
}

function myAssert(pass: boolean, err: string) {
    if (!pass) {
        throw Error(err);
    }
}

main();
