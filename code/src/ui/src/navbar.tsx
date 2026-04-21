/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState } from 'react';
import './navbar.css';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Paper,
    styled,
    Button,
    Avatar,
    Drawer,
} from '@mui/material';
import { AppContext } from './common/states';

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body1,
    padding: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    textAlign: 'left',
    color: '#fff',
    backgroundColor: 'transparent',
    boxShadow: '0px 0px 0px 0px transparent',
}));

type navItemType = {
    navItemName: string;
    navLink: string;
};

type Props = {
    context: AppContext;
    errors?: any;
};

/**
 * React component for rendering the navigation bar.
 *
 * @param {AppContext} props.context - The application context
 * @param {any} props.errors - The errors (optional)
 *
 * @returns {JSX.Element} The rendered navigation bar
 */
const Navbar: React.FC<Props> = React.memo(({ context, errors }) => {
    const user = context.user;

    const links: navItemType[] = [];
    const [showProfile, setShowProfile] = useState<boolean>(false);

    //const renderError = () => {
    //    if (errors !== undefined) {
    //        let errArray = [];
    //        for (var i in errors) {
    //            // errorText.push(<div key={"error_"+i}>{i}: {errors[i]}</div>)
    //            errArray.push(errors[i].label);
    //        }
    //        //let errorText = Object.keys(errors).join(", ")
    //        let errorText = errArray.join(', ');
    //        if (errorText.length > 0) {
    //            return (
    //                <div
    //                    style={{
    //                        backgroundColor: 'white',
    //                        paddingTop: '14px',
    //                        paddingLeft: '10px',
    //                        paddingRight: '10px',
    //                        paddingBottom: '6px',
    //                    }}
    //                >
    //                    <div style={{ margin: '20px' }}>
    //                        <Alert
    //                            severity="error"
    //                            title="The following information needs to be entered:"
    //                        >
    //                            <div>{errorText}</div>
    //                        </Alert>
    //                    </div>
    //                </div>
    //            );
    //        } else {
    //            return (
    //                <div
    //                    style={{
    //                        backgroundColor: 'white',
    //                        paddingTop: '0px',
    //                        paddingLeft: '10px',
    //                        paddingRight: '10px',
    //                    }}
    //                >
    //                    &nbsp;
    //                </div>
    //            );
    //        }
    //    }
    //};

    const url = '';

    return (
        <>
            <div
                id="navbar"
                style={{ position: 'sticky', top: 0, zIndex: 120 }}
                className="bg-discover-dark"
            >
                <Container fixed sx={{ paddingRight: '0px' }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={1} sx={{ marginTop: '0px' }}>
                            <Grid item lg={2} md={2} sm={4} xs={4}>
                                <Item>
                                    {/** Add a logo, if desired, using the markup here: */}
                                    {/* <Link className='navbar-brand' to=''>
                                        <img src='/logo.svg' alt='Logo' onClick={() => {
                                            window.location.href = ''
                                        }
                                        } />
                                    </Link> */}
                                </Item>
                            </Grid>
                            <Grid
                                item
                                lg={10}
                                md={10}
                                sm={12}
                                xs={12}
                                id="navstuff"
                            >
                                <Item
                                    className="link-items"
                                    id={'parent-links'}
                                >
                                    {links.length > 0 &&
                                        links.map((navItem, index) => {
                                            return (
                                                <React.Fragment
                                                    key={`nav-item-${navItem.navItemName}-${index}`}
                                                >
                                                    <Button
                                                        className="nav-item"
                                                        id={`nav-item-${navItem.navItemName}-${index}`}
                                                        onClick={() => {
                                                            window.location.href =
                                                                navItem.navLink;
                                                        }}
                                                    >
                                                        {navItem.navItemName}
                                                    </Button>
                                                </React.Fragment>
                                            );
                                        })}
                                </Item>
                                <Item className="icon-nav">
                                    <Link
                                        aria-label="Personal Profile"
                                        style={{
                                            marginLeft: '1rem',
                                            height: '44px',
                                            width: '44px',
                                            padding: 0,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        to={``}
                                        onClick={() => setShowProfile(true)}
                                    >
                                        <Avatar
                                            className="sm"
                                            src={url}
                                            sx={{
                                                height: '30px',
                                                width: '30px',
                                            }}
                                        />
                                    </Link>
                                    <Drawer
                                        anchor="right"
                                        open={showProfile}
                                        onClose={() => setShowProfile(false)}
                                    >
                                        <div style={{ marginLeft: '10px' }}>
                                            <div className="loggedinuser">
                                                Logged in User
                                            </div>
                                            <div className="detailDiv">
                                                <table className="detailTable">
                                                    <tbody>
                                                        <tr>
                                                            <td>Name</td>
                                                            <td>{user.name}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Email</td>
                                                            <td>
                                                                {user.email}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Title</td>
                                                            <td>
                                                                {user.title}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Department</td>
                                                            <td>
                                                                {
                                                                    user.department
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Roles</td>
                                                            <td>
                                                                {user.roles.map(
                                                                    (
                                                                        role: string,
                                                                        i: number
                                                                    ) => {
                                                                        return (
                                                                            <span
                                                                                key={
                                                                                    'role_' +
                                                                                    i
                                                                                }
                                                                            >
                                                                                {
                                                                                    role
                                                                                }
                                                                                <br />
                                                                            </span>
                                                                        );
                                                                    }
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            {context.info.basicAuthEnabled && (
                                                <div className="detailDiv">
                                                    <Button
                                                        onClick={() => {
                                                            window.location.href =
                                                                '/logout';
                                                        }}
                                                    >
                                                        Logout
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Drawer>
                                </Item>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
                {/* {renderError()} */}
            </div>
        </>
    );
});
Navbar.displayName = 'DtaNavbar';
export default Navbar;
