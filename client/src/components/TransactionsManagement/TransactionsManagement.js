import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';

// Components
import FilterOptions from '../FilterOptions/FilterOptions';
import ComponentHeader from '../ComponentHeader/ComponentHeader';

// Actions
import { getTransactions } from '../../actions/StaffActions';

// Constants
import { FILTER_TRANSACTIONS } from '../../constants/ColumnFilter';

// Utils
import { getErrorMessage, statusLabel } from '../../utils/helpers';

// Styles
import './TransactionsManagement.scss';

const TransactionsManagement = () => {
  const [dataTable, setDataTable] = useState([]);
  const [paramsTable, setParamsTable] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDataTable();
  }, []);

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      sorter: false
    },
    {
      title: 'Account Source ID',
      dataIndex: 'accountSourceId',
      sorter: true
    },
    {
      title: 'Account Destination ID',
      dataIndex: 'accountDestination',
      sorter: true
    },
    {
      title: 'Bank Destination ID',
      dataIndex: 'bankDestinationId',
      sorter: true
    },
    {
      title: 'Bank Name',
      dataIndex: 'bankDestinationName',
      sorter: false
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      sorter: false
    },
    {
      title: 'Description',
      dataIndex: 'description',
      sorter: false
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      sorter: false
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: false,
      render: text => {
        const [label, style] = statusLabel('trans', text);
        return <span style={style}>{label}</span>;
      }
    }
  ];

  const onTableChange = (pagination, filters, sorter) => {
    const sortOrder =
      sorter.order === 'descend'
        ? 'desc'
        : sorter.order === 'ascend'
        ? 'asc'
        : undefined;

    fetchDataTable({
      ...paramsTable,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: sorter.field,
      sortType: sortOrder
    });
  };

  const fetchDataTable = async (params = {}) => {
    const { page, pageSize } = pagination;
    const customParams = {
      page: params.page || page,
      limit: params.pageSize || pageSize,
      sortBy: params.sortBy,
      sortType: params.sortType,

      createDate: params.createDate,
      fromDate: params.fromDate,
      toDate: params.toDate,
      accountSourceId: params.accountSourceId,
      accountDestination: params.accountDestination,
      bankDestinationId: params.bankDestinationId,
      status: params.status
    };

    try {
      setLoading(true);

      const { items, totalItems } = await getTransactions(customParams);

      const paper = { ...pagination };
      paper.total = totalItems;
      paper.current = customParams.page;
      paper.pageSize = customParams.pageSize;

      setLoading(false);
      setPagination(paper);
      setParamsTable(customParams);
      setDataTable(items);
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <ComponentHeader title="Transactions information" />

      <FilterOptions
        columnFilter={FILTER_TRANSACTIONS}
        fetchData={fetchDataTable}
        paramsTable={paramsTable}
      />

      <div className="table">
        <Table
          size="middle"
          rowKey={record => record.id}
          dataSource={dataTable}
          pagination={pagination}
          columns={tableColumns}
          loading={loading}
          onChange={onTableChange}
        />
      </div>
    </div>
  );
};

export default TransactionsManagement;
