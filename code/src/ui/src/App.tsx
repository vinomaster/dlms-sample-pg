/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
// import { customTheme } from "./theme";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './AdminPage';
import { themes } from './mui-a11y-tb/themes/Theme';
import { ThemeProvider } from '@mui/material';
import TestDocumentListPage from './DocumentListPage';
import DocumentDetailsPage from './DocumentDetailsPage';
import { AppContext } from './common/states';

interface Props {
    context: AppContext;
}

/**
 * Renders the main application component with different routes based on the path.
 *
 * @param {Props} context - The context object containing application state
 * @returns {JSX.Element} The main application component with different routes
 */
const App: React.FC<Props> = ({ context }) => {
    return (
        <ThemeProvider theme={(themes as any)['light']}>
            <Router>
                <div className="App">
                    <Routes>
                        <Route
                            path="/"
                            element={<TestDocumentListPage context={context} />}
                        />
                        <Route
                            path="/details/:id"
                            element={<DocumentDetailsPage context={context} />}
                        />
                        <Route
                            path="/admin/"
                            element={<AdminPage context={context} />}
                        />
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    );
};

export default App;
