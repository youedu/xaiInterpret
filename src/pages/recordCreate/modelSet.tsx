import {ProTable, ProCard} from '@ant-design/pro-components';
import type {ProColumns, ProFormInstance, ColumnsState} from '@ant-design/pro-components';
import {Input, Select, Table} from 'antd';
import React, {useRef, useState, forwardRef, useImperativeHandle, Key, useEffect} from 'react';
import type {TableRowSelection} from 'antd/es/table/interface';
import {modelQuery} from "@/services/ant-design-pro/api";
import {useModel} from 'umi';


const {Search} = Input;


interface ActionType {
  reload: (resetPageIndex?: boolean) => void;
  reloadAndRest: () => void;
  reset: () => void;
  clearSelected?: () => void;
  startEditable: (rowKey: Key) => boolean;
  cancelEditable: (rowKey: Key) => boolean;
}


export type TableListItem = {
  id: string;
  name: string;
  description: string;
  type: string;
  size: string;
  createdBy: string;
  status: string;
  createdAt: number;
};


const columns: ProColumns<TableListItem>[] = [
  {
    title: <b>模型ID</b>,
    dataIndex: 'id',
    align: 'center',
    width: '40',
  },
  {
    title: <b>模型名称</b>,
    dataIndex: 'modelName',
    align: 'center',
  },
  {
    title: <b>模型描述</b>,
    dataIndex: 'modelDesc',
    align: 'center',
  },
  {
    title: <b>任务类型</b>,
    dataIndex: 'taskTypeId',
    // initialValue: 1,
    // filters: true,
    // onFilter: true,
    valueType: 'select',
    valueEnum: {
      1: {text: '图像分类'},
      2: {text: '文本分类'},
      3: {text: '表格分类'},
      4: {text: '图像识别'},
    },
    align: 'center',
  },
  {
    title: <b>模型框架</b>,
    dataIndex: 'type',
    initialValue: 1,
    /*    filters: true,
        onFilter: true,*/
    valueType: 'select',
    valueEnum: {
      0: {text: 'PyTorch'},
      1: {text: 'TensorFlow'},
      2: {text: '其他'},
    },
    ellipsis: true,
    align: 'center',
  },
  {
    title: <b>模型大小</b>,
    dataIndex: 'modelSize',
    align: 'center',
    // sorter: (a, b) => parseFloat(a.size) - parseFloat(b.size),
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
    // sorter: (a, b) => a.createdAt - b.createdAt,
  },
  {
    title: <b>模型状态</b>,
    dataIndex: 'modelState',
    // initialValue: 'all',
    // filters: true,
    // onFilter: true,
    valueType: 'select',
    valueEnum: {
      0: {text: '正在上传', status: 'Processing'},
      1: {text: '上传成功', status: 'Success'},
    },
    align: 'center',
  },
];

export default forwardRef((props, ref) => {

  //配置当前选择项
  const [selectedRowKey, setSelectedRowKey] = useState<React.Key>();

  const onSelectChange = (newSelectedRowKey: React.Key) => {
    //console.log('selectedRowKeys changed: ', typeof(newSelectedRowKey), newSelectedRowKey);
    setSelectedRowKey(newSelectedRowKey);
  };

  const rowSelection: TableRowSelection<TableListItem> = {
    type: "radio",
    selectedRowKey,
    onChange: onSelectChange,
  };


  const actionRef = useRef<ActionType>();
  const [queryType, setQueryType] = useState('');
  const [queryContent, setQueryContent] = useState('');
  const formRef = useRef<ProFormInstance>();

  const {dataSetId, setDataSetId} = useModel("demo");

  useEffect(() => {
    actionRef.current?.reload();
  }, []);

  useImperativeHandle(ref, () => ({
    openModal: (newVal: boolean) => {
      actionRef.current?.reload();
      return selectedRowKey;
    }
  }));

  return (
    <>
      <ProCard>
        <ProTable<TableListItem, { keyWord?: string }>
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
            //console.log(dataSetId);
            const msg = await modelQuery(params, queryType, queryContent, dataSetId);
            //console.log(msg);
            const data = msg.data.records.map(item => {
              //console.log(item.odelSize);
              if (item.modelSize < 1024) {
                item.modelSize = item.modelSize.toString() + 'B';
                return item;
              } else if (item.modelSize >= 1024 && item.modelSize < 1024 * 1024) {
                item.modelSize = Math.floor(item.modelSize / 1024).toString() + 'KB'
                return item;
              } else {
                item.modelSize = Math.floor(item.modelSize / 1024 / 1024).toString() + 'MB'
                return item;
              }
            })
            return {
              data: data,
              // success 请返回 true，
              // 不然 table 会停止解析数据，即使有数据
              success: true,
              // 不传会使用 data 的长度，如果是分页一定要传
              total: msg.data.total,
            };
          }}
          /*      options={{
                  search: true,
                }}

                columnsState={{
                  value: columnsStateMap,
                  onChange: setColumnsStateMap,
                }}*/
          rowKey="id"
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
            }*/
          }}
          actionRef={actionRef}
          formRef={formRef}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          search={false}
          dateFormatter="string"
          options={false}
          defaultSize={"large"}
        />
      </ProCard>
    </>
  );
});

