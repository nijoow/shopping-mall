'use client';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useState } from 'react';

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
    <div className="ag-theme-quartz min-h-full">
      <AgGridReact columnDefs={columnDefs} rowData={rowData} />
    </div>
  );
};

export default UsersDatagrid;
