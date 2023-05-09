import {
  ProTable,
  ModalForm,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
  ProFormTextArea,
  ProCard,
} from '@ant-design/pro-components';
import type {ProColumns, ProFormInstance, ColumnsState} from '@ant-design/pro-components';
import {Button, Input, message, Select, Form, Upload, Row, Col} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {
  blackModelQuery,
  dataSetQuery,
  modelFile,
  modelInfo,
  modelQuery,
  taskTypeQuery
} from "@/services/ant-design-pro/api";
import type {TableRowSelection} from "_antd@4.24.1@antd/es/table/interface";
import {useModel} from "@@/plugin-model/useModel";

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
  key: number;
  id: number;
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
    //ellipsis: true,
    width: '40',
    align: 'center'
  },
  {
    title: <b>模型名称</b>,
    dataIndex: 'modelName',
    //ellipsis: true,
    width: '13%',
    align: 'center'
  },
  {
    title: <b>模型描述</b>,
    dataIndex: 'modelDesc',
    ellipsis: true,
    width: '13%',
    align: 'center'
  },
  {
    title: <b>任务类型</b>,
    dataIndex: 'taskTypeId',
    initialValue: 1,
    filters: true,
    onFilter: true,
    valueType: 'select',
    valueEnum: {
      1: {text: '图像分类'},
/*      2: {text: '文本分类'},
      3: {text: '表格分类'},*/
    },
    ellipsis: true,
    width: '11%',
    align: 'center'
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
    width: '11%',
    align: 'center'
  },
  {
    title: <b>模型大小</b>,
    dataIndex: 'modelSize',
    ellipsis: true,
    width: '11%',
    align: 'center'
    // sorter: (a, b) => parseFloat(a.size) - parseFloat(b.size),
  },
  {
    title: <b>创建者</b>,
    dataIndex: 'belong',
    ellipsis: true,
    width: '11%',
    align: 'center'
  },
  {
    title: <b>创建时间</b>,
    valueType: 'dateTime',
    dataIndex: 'createTime',
    ellipsis: true,
    width: '11%',
    align: 'center'
    // sorter: (a, b) => a.createdAt - b.createdAt,
  },
  {
    title: <b>模型状态</b>,
    dataIndex: 'modelState',
    // initialValue: 'all',
    // filters: true,
    // onFilter: true,
    valueType: 'select',
    ellipsis: true,
    valueEnum: {
      0: {text: '正在上传', status: 'Processing'},
      1: {text: '上传成功', status: 'Success'},
    },
    width: '11%',
    align: 'center'
  },
];

export default () => {

/*  const [screenWidth, screenHeight] = [window.screen.width, window.screen.height];
  console.log(screenWidth, screenHeight)*/

  const {robustEvaluationConfig, setRobustEvaluationConfig} = useModel('robustConfig', (ret) => ({
    robustEvaluationConfig: ret.robustEvaluationConfig,
    setRobustEvaluationConfig: ret.setRobustEvaluationConfig,
  }));

  const {evaConfig, setEvaConfig} = useModel('config', (ret) => ({
    evaConfig: ret.evaluationConfig,
    setEvaConfig: ret.setEvaluationConfig,
  }));

  useEffect(() => {
    setEvaConfig({});
    setRobustEvaluationConfig({});
  }, []);

  //第一次使用
  const [first, setFirst] = useState(1);

  const ref = useRef<ActionType>();

  const [queryType, setQueryType] = useState();
  const [queryContent, setQueryContent] = useState('');
  const formRef = useRef<ProFormInstance>();

  //第一层表单form，ref
  const [modalForm] = Form.useForm();
  const modalRef = useRef<ProFormInstance>();

  //第一层表单选择模型类型是否为代理模型
  const [modelType, setModelType] = useState(0);

  //保存上传数据后返回的model信息对象
  const [modelUpload, setModelUpload] = useState({});

  const handleTestModelInfo = async (values: any) => {
    const msg = {...values, ...modelUpload};
    msg.taskTypeId = modalForm.getFieldValue('taskType1') ||
      modalForm.getFieldValue('taskType2') || modalForm.getFieldValue('taskType3');
    msg.modelType = modalForm.getFieldValue('modelType');
    msg.dataSetIds = selectedRowKeys.join(',');
    msg.type = values.modelFrame;
    msg.blackModel = selectedRowKey[0];

    msg.proxyType = values.proxyType;
    //console.log(msg);
    const data = await modelInfo(msg);
    //console.log(data);
    if (data.code === '00000') {
      setModelUpload({});
      message.success('上传成功');
      ref.current?.reload();
    } else
      message.error(data.message);
    setSelectedRowKeys([]);
    setSelectedRowKey([]);
    modalForm.resetFields();
    return true;
  }

  const [columnsStateMap, setColumnsStateMap] = useState<Record<string, ColumnsState>>({
    name: {
      show: false,
      order: 2,
    },
  });

  const [dataType, setDataType] = useState(1);

  //二层表单表格配置

  const dataColumns: ProColumns[] = [
    {
      title: <b>ID</b>,
      dataIndex: 'id',
      //ellipsis: true,
      align: 'center',
    },
    {
      title: <b>数据名称</b>,
      dataIndex: 'dataName',
      //ellipsis: true,
      align: 'center',
    },
    {
      title: <b>数据描述</b>,
      dataIndex: 'dataDesc',
      ellipsis: true,
      align: 'center',
    },
    {
      title: <b>任务类型</b>,
      dataIndex: 'taskTypeId',
      initialValue: 2,
      /*      filters: true,
            onFilter: true,*/
      valueType: 'select',
      ellipsis: true,
      valueEnum: {
        1: {text: '图像分类'},
/*        2: {text: '文本分类'},
        3: {text: '表格分类'},*/
      },
      align: 'center',
    },
    {
      title: <b>数据量</b>,
      dataIndex: 'dataLength',
      ellipsis: true,
      align: 'center',
      // sorter: (a, b) => a.dataLength - b.dataLength,
    },
    {
      title: <b>创建方式</b>,
      dataIndex: 'belong',
      ellipsis: true,
      align: 'center',
    },
    {
      title: <b>创建时间</b>,
      valueType: 'dateTime',
      dataIndex: 'createTime',
      ellipsis: true,
      // sorter: (a, b) => a.createTime - b.createTime,
    },
    {
      title: <b>数据状态</b>,
      dataIndex: 'dataState',
      initialValue: '1',
      /*      filters: true,
            onFilter: true,*/
      valueType: 'select',
      ellipsis: true,
      valueEnum: {
        0: {text: '正在上传', status: 'Processing'},
        1: {text: '上传成功', status: 'Success'},
      },
      align: 'center',
    },
  ];

  //多选数据集的配置
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);


  function getInclude(arr1: number[], arr2: number[]) {
    const temp = []
    for (const item of arr2) {
      arr1.includes(item) ? temp.push(item) : ''
    }
    return temp.length ? true : false
  }

  const onSelectChange = (record, selected, selectedRows, nativeEvent) => {
    if (selected === true) {
      ////console.log(selectedRowKeys);
      setSelectedRowKeys(selectedRowKeys.concat([record.id]));
    } else if (selected === false) {
      setSelectedRowKeys(selectedRowKeys.filter(item => {
        return item != record.id
      }));
    }
  }

  const onChange = (newSelectedRowKeys: React.Key[]) => {
    //console.log('原：', selectedRowKeys);
    //console.log('现', newSelectedRowKeys);
    if (selectedRowKeys.length === 0 || newSelectedRowKeys.length === 0)
      setSelectedRowKeys([25]);
    else if (getInclude(selectedRowKeys, newSelectedRowKeys) || getInclude(newSelectedRowKeys, selectedRowKeys)) {
      setSelectedRowKeys(newSelectedRowKeys);
    } else {
      const newKeys = selectedRowKeys.concat(newSelectedRowKeys);
      setSelectedRowKeys(newKeys);
    }

    /*    //console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        if(selectedRowKeys != true){
          const newKeys = selectedRowKeys.concat(newSelectedRowKeys);
          setSelectedRowKeys(newKeys);
        }*/
  };


  const rowSelection: TableRowSelection<TableListItem> = {
    selectedRowKeys: selectedRowKeys,
    //onChange: onChange,
    onSelect: onSelectChange,
    selections: false,
  };

  //单选黑盒模型的配置
  const [selectedRowKey, setSelectedRowKey] = useState([]);
  const onSelectChangeNew = (record, selected, selectedRows, nativeEvent) => {
    /*    if(selected === true){
          ////console.log(selectedRowKeys);
          setSelectedRowKey(selectedRowKey.concat([record.id]));
        }
        else if(selected === false){
          setSelectedRowKey(selectedRowKey.filter(item=>{return item!=record.id}));
        }*/
    setSelectedRowKey([record.id]);
    //console.log(record);
  }
  const rowSelectionNew: TableRowSelection<TableListItem> = {
    selectedRowKeys: selectedRowKey,
    //onChange: onChange,
    onSelect: onSelectChangeNew,
    selections: false,
    type: 'radio'
  };

  //中断网络请求
  let controller = new AbortController(); // 创建一个控制器
  let {signal} = controller; // 返回一个 AbortSignal 对象实例，它可以用来 with/abort 一个 DOM 请求。

  return (
    <>

      <ProCard title={<div style={{fontSize: '20px', fontWeight: 'bold'}}>模型列表</div>}>
        <ProTable<TableListItem, { keyWord?: string }>
          loading={false}
          columns={columns}
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
            let taskType;
            if (filter.taskTypeId !== null) {
              taskType = filter.taskTypeId.map((item) => {
                return Number(item);
              })
            } else {
              taskType = [1, 2, 3];
            }
            //console.log(taskType);
            const msg = await modelQuery(params, queryType, queryContent, null, taskType);
            //console.log(msg);
            const data = msg.data.records.map(item => {
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
                rowKey="id"
                columnsState={{
                  value: columnsStateMap,
                  onChange: setColumnsStateMap,
                }}*/
          toolbar={{
            search: (<Input.Group compact>
              <Select
                defaultValue=""
                style={{width: 100}}
                onChange={event => setQueryType(event)}
                options={[
                  {
                    value: 0,
                    label: 'ID',
                  },
                  {
                    value: 1,
                    label: '模型名称',
                  },
                ]}
              />
              <Search onChange={event => setQueryContent(event.target.value)}
                      enterButton={true}
                      allowClear={true}
                      style={{width: '70%'}}
                      onReset={() => {
                        //console.log('hello');
                      }}
                      onSearch={(value: string, event) => {
                        ref.current?.reload();
                      }}
              />
            </Input.Group>)
            /*{
              onSearch: (value: string, event) => {
                //console.log(value);
                ref.current?.reload();
              },
              enterButton: true,
            }*/
          }}
          rowKey="id"
          actionRef={ref}
          formRef={formRef}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          search={false}
          dateFormatter="string"
          options={false}
          toolBarRender={() => [
            <ModalForm
              modalProps={{
                destroyOnClose: true,
                onCancel: () => {
                  setModelType(0);
                  setModelUpload({});
                }
              }}
              preserve={false}
              form={modalForm}
              formRef={modalRef}
              title="模型上传"
              trigger={<Button type="primary" onClick={() => {
                setFirst(1);
              }}>上传模型</Button>}
              submitter={{
                searchConfig: {
                  submitText: '确认',
                  resetText: '取消',
                },
                render: (props, dom) => {
                  return [

                      <ProCard colSpan={20}>
                        <ModalForm
                          modalProps={{
                            destroyOnClose: true,
                            onCancel: () => {
                              setSelectedRowKeys([]);
                              setSelectedRowKey([]);
                              setModelUpload({});
                              controller.abort();
                              controller = new AbortController();
                              signal = controller.signal;
                            },
                            width: "70%" ,
                          }}
                          title="上传模型"
                          trigger={<Button type="primary" onClick={() => {
                          }}>上传模型</Button>}
                          submitter={{
                            searchConfig: {
                              submitText: '确认',
                              resetText: '取消',
                            },
                          }
                          }
                          onFinish={async (values) => {
                            //console.log(modelUpload);
                            if (!modelUpload.hasOwnProperty('url')) {
                              message.error('请等待文件上传完成');
                              return false;
                            }
                            await handleTestModelInfo(values);
                            modalRef.current?.submit();
                            ref.current?.reload();
                            return true;
                          }}
                        >
                          <ProFormText
                            width="md"
                            name="modelName"
                            label="模型名称"
                            tooltip="最长为 24 位"
                            placeholder="请输入名称"
                            required={true}
                          />
                          <ProFormTextArea label="模型描述" width="md" name="modelDesc" placeholder="请输入模型信息"
                                           required={true}/>
                          <ProFormSelect
                            width="sm"
                            name="modelFrame"
                            allowClear={false}
                            initialValue={0}
                            label="模型框架"
                            options={[
                              {
                                value: 0,
                                label: 'Pytorch',
                              },
                              {
                                value: 1,
                                label: 'TensorFlow',
                              },
                              {
                                value: 2,
                                label: '其他',
                              },
                            ]
                            }/>
                          {/*<ProFormSelect
                    width="md"
                    name="taskTypeId"
                    initialValue={modalForm.getFieldValue('dataType')}
                    addonBefore="任务类型"
                    disabled={true}
                    required={true}
                    options={[
                      {
                        value: 1,
                        label: '图像分类',
                      },
                      {
                        value: 2,
                        label: '文本分类',
                      },
                      {
                        value: 3,
                        label: '表格分类',
                      },
                      {
                        value: 4,
                        label: '图像识别',
                      }
                    ]
                    }/>*/}

                          <Form.Item>
                            <ProFormUploadButton
                              /*            fieldProps={{
                                            headers: { 'authorization': 'Bearer ' + token.get(),
                                             'content-type': 'multipart/form-data; boundary=<calculated when request is sent>'}
                                          }}*/
                              rules={[{required: true}]}
                              label="模型文件"
                              tooltip={'请上传.pkl,.pt,.pth,.zip,.txt,.h5格式文件,，并于提示文件上传成功后点击确定上传模型信息'}
                              name="file"
                              title="选取文件"
                              accept={".pkl,.pt,.zip,.txt,.h5,.pth"}
                              max={1}
                              //action={'/api/micro-model-dataset-service/minio/dataset/upload'}
                              fieldProps={{
                                beforeUpload: (file) => {
                                  const fileFormat = ['pkl', 'pt', 'zip', 'txt', 'h5', 'pth'];
                                  //console.log(fileFormat.indexOf(file.name.split('.').reverse()[0]));
                                  const isPkl = fileFormat.indexOf(file.name.split('.').reverse()[0]);
                                  if (isPkl === -1) {
                                    message.error(`${file.name}文件格式不正确`);
                                    return Upload.LIST_IGNORE;
                                  }
                                  if (file.size / 1024 / 1024 > 500) {
                                    message.error(`${file.name}文件过大`);
                                    return Upload.LIST_IGNORE;
                                  }
                                  return true;
                                },
                                onChange: async (info) => {
                                  if (info.file.status === 'done') {
                                    const data = await modelFile(info.file.originFileObj, signal);
                                    if (data.code === '00000') {
                                      message.success('模型文件上传成功');
                                      setModelUpload({
                                        'url': data.data.url,
                                        'size': Number(data.data.size),
                                        'unit': data.data.unit
                                      });
                                    } else
                                      message.error(data.message);
                                  } else if (info.file.status === 'removed') {
                                    setModelUpload({});
                                    controller.abort();
                                    controller = new AbortController();
                                    signal = controller.signal;
                                  }
                                },
                                listType: 'text'
                              }}
                              /*                      onChange={async (info) => {
                                                      if(info.file.status === 'done') {
                                                        const data = await modelFile(info.file.originFileObj);
                                                        //console.log(data.data.url);
                                                        if (data.code === '00000') {
                                                          setModelUpload({
                                                            'url': data.data.url,
                                                            'size': data.data.size,
                                                            'unit': data.data.unit
                                                          });
                                                        }
                                                        else
                                                          message.error(data.message);
                                                      }
                                                    }
                                                    }*/
                            />
                          </Form.Item>

                          {(modelType === 0 || modelType === 1) && (
                            <Form.Item>
                              <ProCard title={<div style={{fontSize: '17px', fontWeight: 'bold'}}>可选关联数据集</div> }>
                                <ProTable
                                  loading={false}
                                  columns={dataColumns}
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
                                    let msg;
                                    if (modalForm.getFieldValue('dataType') === 1) {
                                      msg = await dataSetQuery(params, null, null, modalForm.getFieldValue('taskType1'));
                                    }
                                    if (modalForm.getFieldValue('dataType') === 2) {
                                      msg = await dataSetQuery(params, null, null, modalForm.getFieldValue('taskType2'));
                                    }
                                    if (modalForm.getFieldValue('dataType') === 3) {
                                      msg = await dataSetQuery(params, null, null, modalForm.getFieldValue('taskType3'));
                                    }
                                    //console.log(msg);
                                    /*                        let currentData = [];
                                                            msg.data.records.map((item) => {
                                                              currentData.push(item.id);
                                                            });
                                                            setCurrentDataSet(currentData);
                                                            //console.log(currentDataSet);*/
                                    if (msg.code === '00000')
                                      return {
                                        data: msg.data.records,
                                        // success 请返回 true，
                                        // 不然 table 会停止解析数据，即使有数据
                                        success: true,
                                        // 不传会使用 data 的长度，如果是分页一定要传
                                        total: msg.data.total,
                                      };
                                    else
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
                                  rowKey="id"
                                  // formRef={formRef}
                                  pagination={{
                                    pageSize: 10,
                                    showSizeChanger: false,
                                  }}
                                  search={false}
                                  dateFormatter="string"
                                  options={false}
                                />
                              </ProCard>
                            </Form.Item>
                          )}
                          {(modelType === 3) && (
                            <Form.Item>
                              <ProFormSelect
                                width="sm"
                                name="proxyType"
                                allowClear={false}
                                initialValue={0}
                                label="代理模型类型"
                                options={[
                                  {
                                    value: 0,
                                    label: '规则模型',
                                  },
                                  {
                                    value: 1,
                                    label: '决策树模型',
                                  },
                                ]
                                }/>
                              <ProCard title={<div style={{fontSize: '17px', fontWeight: 'bold'}}>可选关联黑盒模型</div>}>
                                <ProTable
                                  loading={false}
                                  columns={columns}
                                  rowSelection={rowSelectionNew}
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
                                    let msg;
                                    if (modalForm.getFieldValue('dataType') === 1) {
                                      msg = await blackModelQuery(params, modalForm.getFieldValue('taskType1'));
                                    }
                                    if (modalForm.getFieldValue('dataType') === 2) {
                                      msg = await blackModelQuery(params, modalForm.getFieldValue('taskType2'));
                                    }
                                    if (modalForm.getFieldValue('dataType') === 3) {
                                      msg = await blackModelQuery(params, modalForm.getFieldValue('taskType3'));
                                    }
                                    //console.log(msg);
                                    /*                        let currentData = [];
                                                            msg.data.records.map((item) => {
                                                              currentData.push(item.id);
                                                            });
                                                            setCurrentDataSet(currentData);
                                                            //console.log(currentDataSet);*/
                                    if (msg.code === '00000')
                                      return {
                                        data: msg.data.records,
                                        // success 请返回 true，
                                        // 不然 table 会停止解析数据，即使有数据
                                        success: true,
                                        // 不传会使用 data 的长度，如果是分页一定要传
                                        total: msg.data.total,
                                      };
                                    else
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
                                  rowKey="id"
                                  // formRef={formRef}
                                  pagination={{
                                    pageSize: 10,
                                    showSizeChanger: false,
                                  }}
                                  search={false}
                                  dateFormatter="string"
                                  options={false}
                                />
                              </ProCard>
                            </Form.Item>
                          )}
                        </ModalForm>
                      </ProCard>
                  ]
                }
              }}
              onFinish={async (values) => {
                //console.log('world');
                return true;
              }}
            >
              <ProFormRadio.Group
                onChange={() => {
                  setFirst(modalForm.getFieldValue('dataType'));
                  setDataType(modalForm.getFieldValue('dataType'));
                }}
                initialValue={1}
                name="dataType"
                label="数据类型"
                radioType="button"
                options={[
                  {
                    label: '图像',
                    value: 1,
                  },
/*                  {
                    label: '文本',
                    value: 2,
                  },*/
/*                  {
                    label: '表格',
                    value: 3,
                  },*/
                ]}
              />
              {(first === 1) && (
                <ProFormRadio.Group
                  name="taskType1"
                  label="任务类型"
                  dependencies={['dataType']}
                  radioType="button"
                  initialValue={1}
                  request={() => {
                    return [
                      {value: 1, label: '图像分类'},
                    ];
                  }}
                />
              )}

              {first === 2 && (
                <ProFormRadio.Group
                  name="taskType2"
                  label="任务类型"
                  dependencies={['dataType']}
                  radioType="button"
                  initialValue={2}
                  request={() => {
                    return [
                      {value: 2, label: '文本分类'},
                    ];
                  }}
                />
              )}
{/*              {first === 3 && (
                <ProFormRadio.Group
                  name="taskType3"
                  label="任务类型"
                  dependencies={['dataType']}
                  radioType="button"
                  initialValue={3}
                  request={() => {
                    return [
                      {value: 3, label: '表格分类'},
                    ];
                  }}
                />
              )}*/}
              {/*<ProFormSelect
                width="sm"
                name="modelType"
                initialValue={0}
                allowClear={false}
                label="模型类型"
                fieldProps={{
                  onChange: (e) => {
                    //console.log(e);
                    setModelType(e);
                  }
                }}
                options={[
                  {
                    value: 0,
                    label: '普通模型',
                  },
                  {
                    value: 1,
                    label: '黑盒模型',
                  },
                  {
                    value: 3,
                    label: '代理模型',
                  },
                ]
                }/>*/}
              {/*<ProFormRadio.Group
            name="taskType"
            label="任务类型"
            dependencies={['dataType']}
            radioType="button"
            initialValue={1}
            request={()=>{
              if(modalForm.getFieldValue('dataType') === 1) {
                //console.log("图像分类");
                modalForm.setFieldValue('taskType', 1);
                return [
                  {value: 1, label: '图像分类'},
                  {value: 4, label: '图像识别'}
                ];
              }
              else if(modalForm.getFieldValue('dataType') === 2) {
                //console.log("文本分类");
                modalForm.setFieldValue('taskType', 2);
                return [
                  {value: 2, label: '文本分类'},
                ];
              }
              else {
                //console.log("表格分类");
                modalForm.setFieldValue('taskType', 3);
                return [
                  {value: 3, label: '表格分类'},
                ];
              }
            }}
          />*/}

            </ModalForm>
          ]
          }
        />
      </ProCard>
    </>
  );
};

