/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
import './navbar.css';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Paper, styled } from '@mui/material';

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

const DtaFooterbar: React.FC = React.memo(() => {
    return (
        <>
            <div
                id="footerbar"
                style={{ marginTop: 60, zIndex: 120 }}
                className="bg-discover-dark"
            >
                <Container fixed sx={{ paddingRight: '0px' }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={1} sx={{ marginTop: '0px' }}>
                            <Grid item lg={2} md={2} sm={4} xs={4}>
                                <Item>
                                    <Link className="navbar-brand" to="">
                                        <img
                                            src="/dtalogo.svg"
                                            alt="DTA Logo"
                                            onClick={() => {
                                                window.location.href =
                                                    'https://dta.discoverfinancial.com/';
                                            }}
                                        />
                                    </Link>
                                </Item>
                            </Grid>
                            <Grid
                                item
                                lg={10}
                                md={10}
                                sm={12}
                                xs={12}
                                id="logostuff"
                                style={{ right: 0 }}
                            >
                                <span
                                    style={{
                                        width: 100,
                                        float: 'right',
                                        fontSize: 'small',
                                        textAlign: 'center',
                                        marginTop: 4,
                                    }}
                                >
                                    Powered by{' '}
                                    <img
                                        alt=""
                                        src={
                                            '/Logo-DLMS-Horizontal-Reversed.svg'
                                        }
                                        style={{ width: 100 }}
                                    />
                                </span>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </div>
        </>
    );
});

export default DtaFooterbar;
