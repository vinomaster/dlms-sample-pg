/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, Radio, FormControlLabel } from '@mui/material';
import { DocumentSummary, formatDate } from '../common/common';
import { docStates } from '../common/states';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
    ColDef,
    ColumnResizedEvent,
    FilterChangedEvent,
    GridReadyEvent,
} from 'ag-grid-community';
import './DataGrid.css';

export interface DataGridSettings {
    displayColumns: string; // "default" | "all"
    filter: any;
}

interface DisplayRadioProps {
    value: string;
    setValue(value: string): void;
    isAdmin: boolean;
}

const DisplayRadio: React.FC<DisplayRadioProps> = ({
    value,
    setValue,
    isAdmin,
}) => {
    //console.log("DisplayRadio: value=",value);

    async function handleChange(event: any): Promise<void> {
        //console.log("handleChange=", event.target.value);
        setValue(event.target.value);
    }

    const style = {
        '.MuiTypography-root': {
            font: 'var(--body)',
        },
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}
            >
                Display columns: &nbsp;&nbsp;
                <FormControlLabel
                    sx={style}
                    id="displayColumnChangeRadio1"
                    onChange={handleChange}
                    value="default"
                    checked={value !== 'all'}
                    control={<Radio />}
                    label="Default"
                />
                <FormControlLabel
                    sx={style}
                    id="displayColumnChangeRadio2"
                    onChange={handleChange}
                    value="all"
                    checked={value === 'all'}
                    control={<Radio />}
                    label="All"
                />
            </div>
        </>
    );
};

interface Props {
    title: string;
    states?: string[];
    requests: DocumentSummary[];
    handleEditRow(event: any): Promise<any>;
    handleDeleteRow(event: any): Promise<any>;
    isAdmin: boolean;
    settings?: DataGridSettings;
    setSettings?: React.Dispatch<React.SetStateAction<DataGridSettings>>;
}

/**
 * Renders a data grid for requests with various columns and functionalities.
 *
 * @param props.title - The title of the data grid
 * @param props.requests - The list of requests to display in the grid
 * @param props.states - The states related to the requests
 * @param props.handleEditRow - The function to handle editing a row
 * @param props.handleDeleteRow - The function to handle deleting a row
 * @param props.isAdmin - Flag indicating if the user is an admin
 * @param props.settings - The settings for the data grid
 * @param props.setSettings - The function to set grid settings
 *
 * @returns {JSX.Element}
 */
const RequestDataGrid: React.FC<Props> = ({
    title,
    requests,
    states,
    handleEditRow,
    handleDeleteRow,
    isAdmin,
    settings,
    setSettings,
}) => {
    const [displayColumns, setDisplayColumns] = useState<string>(
        settings ? settings.displayColumns : 'default'
    );

    const gridRef = useRef<AgGridReact>(null);

    const radioButtonSelected = settings
        ? settings.displayColumns
        : displayColumns;

    const extraColumns = ['reviewers'];

    function onRowClicked(event: any) {
        //console.log("row clicked=",event.data);
        handleEditRow(event.data.id);
    }

    const defaultColDef: ColDef = {
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        resizable: true,
        suppressMenu: true,
        sortable: true,
    };

    function myDateComparator(
        filterLocalDateAtMidnight: Date,
        cellValue: string
    ) {
        const dateParts = cellValue.split('/');
        const day = Number(dateParts[1]);
        const month = Number(dateParts[0]) - 1;
        const year = Number(dateParts[2]);
        const cellDate = new Date(year, month, day);
        if (cellDate < filterLocalDateAtMidnight) {
            return -1;
        } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
        } else {
            return 0;
        }
    }

    const columnDefs: ColDef[] = [
        {
            field: 'title',
            headerName: 'Title',
            minWidth: 200,
            flex: 1,
            cellRenderer: function (params: any) {
                //console.log("params=",params);
                if (params && params.value) {
                    return (
                        <Tooltip
                            title={params.value}
                            placement="bottom-start"
                            enterDelay={500}
                        >
                            <span
                                style={{
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {params.value}
                            </span>
                        </Tooltip>
                    );
                }
                return <></>;
            },
        },
        {
            field: 'state',
            headerName: 'State',
            width: 200,
            cellClass: 'center-text',
            valueGetter: function (params: any) {
                if (docStates[params.data.state]) {
                    return docStates[params.data.state].label;
                }
            },
        },
        {
            field: 'requestors',
            headerName: 'Requestors',
            minWidth: 200,
            flex: 1,
            valueGetter: function (params: any) {
                //console.log("params=",params.data);
                const requestors = params.data.requestors;
                let s = '';
                for (var i = 0; i < requestors.length; i++) {
                    if (i > 0) {
                        s = s + ', ';
                    }
                    s = s + (requestors[i].name || requestors[i].email);
                }
                return s;
            },
            cellRenderer: function (params: any) {
                if (params && params.value) {
                    return (
                        <Tooltip
                            title={params.value}
                            placement="bottom-start"
                            enterDelay={500}
                        >
                            <span
                                style={{
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {params.value}
                            </span>
                        </Tooltip>
                    );
                }
                return <></>;
            },
        },
        {
            field: 'reviewers',
            headerName: 'Reviewers',
            minWidth: 200,
            hide: settings?.displayColumns === 'all' ? false : true,
            flex: 1,
            valueGetter: function (params: any) {
                //console.log("params=",params.data);
                const reviewers = params.data.reviewers;
                let s = '';
                for (var i = 0; i < reviewers.length; i++) {
                    if (i > 0) {
                        s = s + ', ';
                    }
                    s = s + (reviewers[i].name || reviewers[i].email);
                }
                return s;
            },
            cellRenderer: function (params: any) {
                if (params && params.value) {
                    return (
                        <Tooltip
                            key="reviewers"
                            title={params.value}
                            enterDelay={500}
                        >
                            <span
                                style={{
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {params.value}
                            </span>
                        </Tooltip>
                    );
                }
                return <></>;
            },
        },
        {
            field: 'dateCreated',
            type: 'dateColumn',
            headerName: 'Date Created',
            width: 175,
            cellClass: 'center-text',
            valueGetter: function (params: any) {
                return formatDate(params.data.dateCreated);
            },
        },
        {
            field: 'dateUpdated',
            type: 'dateColumn',
            headerName: 'Date Updated',
            width: 175,
            cellClass: 'center-text',
            valueGetter: function (params: any) {
                return formatDate(params.data.dateUpdated);
            },
        },
        {
            headerName: 'Actions',
            width: 125,
            cellClass: 'center-text',
            floatingFilter: false,
            suppressMenu: true,
            sortable: false,
            cellRenderer: function (i: any) {
                if (i) {
                    let s = [];
                    s.push(
                        <Tooltip
                            key="ae"
                            title="Edit Request"
                            placement="bottom"
                            enterDelay={500}
                        >
                            <span
                                onClick={() => handleEditRow(i.data.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <EditIcon
                                    style={{
                                        fontSize: '1.25rem',
                                        color: '#656565',
                                    }}
                                />
                            </span>
                        </Tooltip>
                    );
                    if (isAdmin) {
                        s.push(
                            <Tooltip
                                key="ad"
                                title="Delete Request"
                                placement="bottom"
                                enterDelay={500}
                            >
                                <span
                                    style={{
                                        paddingLeft: 10,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleDeleteRow(i.data)}
                                >
                                    <DeleteIcon
                                        style={{
                                            fontSize: '1.25rem',
                                            color: '#656565',
                                        }}
                                    />
                                </span>
                            </Tooltip>
                        );
                    }
                    return <>{s}</>;
                }
                return <></>;
            },
        },
    ];

    const columnTypes = {
        nonEditableColumn: { editable: false },
        dateColumn: {
            type: 'number',
            filter: 'agDateColumnFilter',
            filterParams: {
                comparator: myDateComparator,
                defaultOption: 'greaterThan', //equals, notEqual, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange
            },
            suppressMenu: true,
        },
    };

    async function onGridReady(params: GridReadyEvent) {
        console.log('Grid ready');
        if (settings) {
            gridRef.current!.api.setFilterModel(settings.filter);
        }
    }

    const onColumnResized = useCallback((params: ColumnResizedEvent) => {
        //console.log("Column resized: ", params);
    }, []);

    async function onFilterChanged(params: FilterChangedEvent) {
        //console.log("Filter changed: ", params)
        const model = gridRef.current!.api.getFilterModel();
        if (setSettings && settings) {
            setSettings({ displayColumns: radioButtonSelected, filter: model });
        }
    }

    useEffect(() => {
        //console.log("Init complete");
    }, []);

    useEffect(() => {
        //console.log("Set value for radio:", displayColumns)
        if (!gridRef || !gridRef.current || !gridRef.current.columnApi) return;
        if (displayColumns === 'all') {
            gridRef.current!.columnApi.setColumnsVisible(extraColumns, true);
        } else if (displayColumns === 'default') {
            gridRef.current!.columnApi.setColumnsVisible(extraColumns, false);
        }
    }, [displayColumns]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleRadioChange(value: string): Promise<void> {
        //console.log("handleRadioChange=", value);
        if (setSettings) {
            const model = gridRef.current!.api.getFilterModel();
            setSettings({ displayColumns: value, filter: model });
        } else {
            setDisplayColumns(value);
        }
    }

    //gridRef.current!.api.sizeColumnsToFit();

    var r: boolean = true;
    if (typeof states !== 'undefined') {
        r = false;
        if (requests) {
            for (var i = 0; i < requests.length; i++) {
                if (states.indexOf(requests[i].state) > -1) {
                    r = true;
                    break;
                }
            }
        }
    }

    if (r) {
        let rows: any = [];
        requests.forEach((request, i) => {
            if (
                typeof states === 'undefined' ||
                states.indexOf(request.state) > -1
            ) {
                rows.push({ ...request, mergeInto: false, mergeFrom: false });
            }
        });

        return (
            <div className="detailDiv">
                <DisplayRadio
                    value={radioButtonSelected}
                    setValue={handleRadioChange}
                    isAdmin={isAdmin}
                />
                <div
                    className="ag-theme-alpine"
                    style={{
                        width: '100%',
                        //height: "400px"
                    }}
                >
                    <AgGridReact
                        ref={gridRef}
                        defaultColDef={defaultColDef}
                        columnDefs={columnDefs}
                        columnTypes={columnTypes}
                        rowData={rows}
                        suppressCellFocus={true}
                        onGridReady={onGridReady}
                        onColumnResized={onColumnResized}
                        onRowDoubleClicked={onRowClicked}
                        onFilterChanged={onFilterChanged}
                        domLayout="autoHeight"
                        enableCellTextSelection={true}
                        pagination={true}
                        paginationPageSize={7}
                    />
                </div>
            </div>
        );
    } else {
        return <div></div>;
    }
};

export default RequestDataGrid;
