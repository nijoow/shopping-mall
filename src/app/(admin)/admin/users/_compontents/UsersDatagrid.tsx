'use client';
import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { ColDef } from 'ag-grid-community';

const UsersDatagrid = () => {
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setRowData(data.rows));
  }, []);

  const columnDefs: ColDef[] = [
    { field: 'user_id' },
    { field: 'username' },
    { field: 'email' },
    { field: 'login_provider' },
  ].map(col => ({
    ...col,
    sortable: true,
    filter: true,
    headerClass: 'text-center',
    cellClass: 'text-center',
  }));

  return (
    <div className="min-h-full ag-theme-quartz">
      <AgGridReact columnDefs={columnDefs} rowData={rowData} />
    </div>
  );
};

export default UsersDatagrid;
