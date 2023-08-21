// 未完成: request请求数据
import { ProTable, ProCard } from '@ant-design/pro-components';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Input, Select, Table } from 'antd';
import React, { useRef, useState, forwardRef, useImperativeHandle, Key } from 'react';
import type { TableRowSelection } from 'antd/es/table/interface';
import { dataSetQuery } from "@/services/ant-design-pro/api";


const { Search } = Input;

interface ActionType {
  reload: (resetPageIndex?: boolean) => void;
  reloadAndRest: () => void;
  reset: () => void;
  clearSelected?: () => void;
  startEditable: (rowKey: Key) => boolean;
  cancelEditable: (rowKey: Key) => boolean;
}


export type TableListItem = {
  id: number;
  name: string;
  description: string;
  type: string;
  number: number;
  createdBy: string;
  status: string;
  createdAt: number;
};


const columns: ProColumns[] = [
  {
    title: <b>数据ID</b>,
    dataIndex: 'id',
    width: '40',
    align: 'center',
  },
  {
    title: <b>数据名称</b>,
    dataIndex: 'dataName',
    align: 'center',
  },
  {
    title: <b>数据描述</b>,
    dataIndex: 'dataDesc',
    align: 'center',
  },
  {
    title: <b>任务类型</b>,
    dataIndex: 'taskTypeId',
    /*    initialValue: 2,
        filters: true,
        onFilter: true,*/
    valueType: 'select',
    valueEnum: {
      1: { text: '图像分类' },
      2: { text: '文本分类' },
      3: { text: '表格分类' },
    },
    align: 'center',
  },
  {
    title: <b>样本量</b>,
    dataIndex: 'dataLength',
    align: 'center',
    // sorter: (a, b) => a.dataLength - b.dataLength,
  },
  {
    title: <b>创建者</b>,
    dataIndex: 'belong',
    align: 'center',
  },
  {
    title: <b>创建时间</b>,
    valueType: 'dateTime',
    dataIndex: 'createTime',
    align: 'center',
    // sorter: (a, b) => a.createTime - b.createTime,
  },
  {
    title: <b>数据状态</b>,
    dataIndex: 'dataState',
    /*    initialValue: '1',
        filters: true,
        onFilter: true,*/
    valueType: 'select',
    valueEnum: {
      0: { text: '正在上传', status: 'Processing' },
      1: { text: '上传成功', status: 'Success' },
    },
    align: 'center',
  },
];


export default forwardRef((props, ref) => {

  //配置当前选择项
  const [selectedRowKey, setSelectedRowKey] = useState<React.Key>();

  const onSelectChange = (newSelectedRowKey: React.Key) => {
    //console.log('selectedRowKeys changed: ', newSelectedRowKey);
    setSelectedRowKey(newSelectedRowKey);
  };

  const rowSelection: TableRowSelection<TableListItem> = {
    type: "radio",
    selectedRowKey,
    onChange: onSelectChange,
    /*    selections: [
          Table.SELECTION_ALL,
          Table.SELECTION_INVERT,
          Table.SELECTION_NONE,
          {
            key: 'odd',
            text: 'Select Odd Row',
            onSelect: changableRowKey => {
              let newSelectedRowKey = null;
              newSelectedRowKey = changableRowKey.filter((_, index) => {
                if (index % 2 !== 0) {
                  return false;
                }
                return true;
              });
              setSelectedRowKey(newSelectedRowKey);
            },
          },
          {
            key: 'even',
            text: 'Select Even Row',
            onSelect: changableRowKey => {
              let newSelectedRowKeys = null;
              newSelectedRowKey = changableRowKey.filter((_, index) => {
                if (index % 2 !== 0) {
                  return true;
                }
                return false;
              });
              setSelectedRowKey(newSelectedRowKey);
            },
          },
        ],*/
  };

  const actionRef = useRef<ActionType>();
  const [queryType, setQueryType] = useState('');
  const [queryContent, setQueryContent] = useState('');
  const formRef = useRef<ProFormInstance>();

  useImperativeHandle(ref, () => ({
    openModal: (newVal: boolean) => {
      return selectedRowKey;
    }
  }));

  return (
    <>
      <ProCard>
        <ProTable<TableListItem, { keyWord?: string }>
          loading={false}
          columns={columns}
          rowSelection={rowSelection}
          tableAlertRender={false}
          request={async (
            // 第一个参数 params 查询表单和 params 参数的结合
            // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
            params: T & {
              pageSize: number;
              current: number;
            },
            sort,
            filter,
          ) => {
            // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
            // 如果需要转化参数可以在这里进行修改
            //console.log(props);
            const msg = await dataSetQuery(params, queryType, queryContent, props.props.location.query.taskTypeId);
            console.log(msg.data.records);
            if (msg.code === '00000') {
              return {
                data: msg.data.records,
                // success 请返回 true，
                // 不然 table 会停止解析数据，即使有数据
                success: true,
                // 不传会使用 data 的长度，如果是分页一定要传
                total: msg.data.total,
              };
            } else
              message.error(msg.message);
            return false;
          }}
          /*      options={{
                  search: true,
                }}

                columnsState={{
                  value: columnsStateMap,
                  onChange: setColumnsStateMap,
                }}*/
          toolbar={{
            search: (<Input.Group compact>
              <Select
                defaultValue=""
                style={{ width: 100 }}
                onChange={event => setQueryType(event)}
                options={[
                  {
                    value: 0,
                    label: 'ID',
                  },
                  {
                    value: 1,
                    label: '任务名称',
                  },
                ]}
              />
              <Search onChange={event => setQueryContent(event.target.value)}
                enterButton={true}
                allowClear={true}
                style={{ width: '70%' }}
                onReset={() => {
                  console.log('hello');
                }}
                onSearch={(value: string, event) => {
                  console.log('search');
                  actionRef.current?.reload();
                }}
              />
            </Input.Group>)
            /*{
              onSearch: (value: string, event) => {
                console.log(value);
                ref.current?.reload();
              },
              enterButton: true,
            } */
          }}
          rowKey="id"
          actionRef={actionRef}
          formRef={formRef}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          search={false}
          dateFormatter="string"
          options={false}
          defaultSize={'large'}
        />
      </ProCard>
    </>
  );
});

