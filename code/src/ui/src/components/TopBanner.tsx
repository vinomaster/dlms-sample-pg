/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
import { User } from '../common/common';

interface Props {
    user: User;
    headerText?: string;
    isAdmin?: boolean;
    children?: React.ReactNode;
}

/**
 * Renders the top banner component.
 *
 * @param {User} props.user - The user object
 * @param {string} props.headerText - The text to display in the header
 * @param {boolean} props.isAdmin - Flag indicating if the user is an admin
 * @param {React.ReactNode} props.children - TopBanner contents
 *
 * @returns {JSX.Element} The top banner component
 */
const TopBanner: React.FC<Props> = ({
    user,
    headerText = 'Request Details',
    isAdmin = false,
    children,
}) => {
    return (
        <>
            <div
                style={{
                    //background: "linear-gradient(79.77deg, rgba(255, 255, 255, 0.5) 22.52%, rgba(106, 198, 247, 0.5) 62.71%, rgba(95, 57, 179, 0.5) 85.81%, rgba(225, 56, 127, 0.5) 100.6%)",
                    backgroundImage: 'url(/background.png)',
                    backgroundSize: '100%',
                    paddingLeft: '64px',
                    paddingRight: '0px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                            alt=""
                            src="/app-icon.svg"
                            height="100"
                            width="100"
                            style={{ borderRadius: '50px' }}
                        />
                        <h2 style={{ paddingLeft: '50px' }}>{headerText}</h2>
                    </div>
                </div>
                {children && (
                    <div style={{ alignSelf: 'last baseline' }}>{children}</div>
                )}
            </div>
        </>
    );
};

export default TopBanner;
