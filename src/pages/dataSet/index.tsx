import {
  ProTable,
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormUploadButton,
  ProFormUploadDragger,
  ProFormTextArea,
  ProCard,
  ProList,
} from '@ant-design/pro-components';
import type { ProColumns, ProFormInstance, ColumnsState } from '@ant-design/pro-components';
import { Button, Input, Select, Form, message, Upload, Image } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import token from "@/utils/token";
import taskId from '@/utils/taskId';
import {
  dataSetFile,
  dataSetInfo,
  dataSetQuery,
  taskTypeQuery,
  imgInfo,
  imgFile,
  dataSetQueryMP,
} from '@/services/ant-design-pro/api';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Link from 'antd/es/typography/Link';
import { history, useModel } from 'umi';
import datasetForm1 from '../../../public/datasetForm1.png';
import datasetForm2 from '../../../public/datasetForm2.png';
import tableDataForm from '../../../public/tableDataForm.png';
//import { useModel } from '@@/plugin-model/useModel';

const { Search } = Input;

const IconText = ({ icon, text }: { icon: any; text: string }) => (
  <span>
    {React.createElement(icon, { style: { marginInlineEnd: 8 } })}
    {text}
  </span>
);
const dataSource = [
  {
    title: '压缩文件',
  },
  {
    title: 'txt文件',
  },
];

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
  number: number;
  createdBy: string;
  status: string;
  createdAt: number;
};

const columns: ProColumns[] = [
  {
    title: <b>数据ID</b>,
    dataIndex: 'id',
    ellipsis: true,
    width: '40',
    align: 'center',
  },
  {
    title: <b>数据名称</b>,
    dataIndex: 'dataName',
    ellipsis: true,
    width: '15%',
    align: 'center',
  },
  {
    title: <b>数据描述</b>,
    dataIndex: 'dataDesc',
    ellipsis: true,
    width: '15%',
    align: 'center',
  },
  {
    title: <b>任务类型</b>,
    dataIndex: 'taskTypeId',
    initialValue: 2,
    filters: true,
    onFilter: true,
    valueType: 'select',
    valueEnum: {
      1: { text: '图像分类' },
      /*      2: {text: '文本分类'},
      3: {text: '表格分类'},*/
    },
    ellipsis: true,
    width: '12.5%',
    align: 'center',
  },
  {
    title: <b>样本量</b>,
    dataIndex: 'dataLength',
    ellipsis: true,
    width: '12.5%',
    align: 'center',
    // sorter: (a, b) => a.dataLength - b.dataLength,
  },
  {
    title: <b>创建者</b>,
    dataIndex: 'belong',
    ellipsis: true,
    width: '12.5%',
    align: 'center',
  },
  {
    title: <b>创建时间</b>,
    valueType: 'dateTime',
    dataIndex: 'createTime',
    // sorter: (a, b) => a.createTime - b.createTime,
    ellipsis: true,
    width: '12.5%',
    align: 'center',
  },
  {
    title: <b>数据状态</b>,
    dataIndex: 'dataState',
    initialValue: '1',
    // filters: true,
    valueType: 'select',
    ellipsis: true,
    valueEnum: {
      0: { text: '正在上传', status: 'Processing' },
      1: { text: '上传成功', status: 'Success' },
    },
    width: '12.5%',
    align: 'center',
  },
  /*  {
      title: '操作',
      key: 'option',
      width: 120,
      valueType: 'option',
      // render: () => [<a key="1">操作</a>, <a key="2">删除</a>],
    },*/
];

const columnsMP: ProColumns[] = [
  {
    title: <b>数据ID</b>,
    dataIndex: 'md5Sum',
    ellipsis: true,
    width: '40%',
    align: 'center',
  },
  {
    title: <b>数据名称</b>,
    dataIndex: 'name',
    ellipsis: true,

    align: 'center',
  },
  {
    title: <b>数据大小</b>,
    dataIndex: 'size',
    ellipsis: true,

    align: 'center',
    // sorter: (a, b) => a.dataLength - b.dataLength,
  },
  {
    title: <b>创建时间</b>,
    valueType: 'dateTime',
    dataIndex: 'lastModified',
    // sorter: (a, b) => a.createTime - b.createTime,
    ellipsis: true,

    align: 'center',
  },
];

export default (params: any) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser, setCurrentUser } = useModel('currentUser');




  const { robustEvaluationConfig, setRobustEvaluationConfig } = useModel('robustConfig', (ret) => ({
    robustEvaluationConfig: ret.robustEvaluationConfig,
    setRobustEvaluationConfig: ret.setRobustEvaluationConfig,
  }));

  const { evaConfig, setEvaConfig } = useModel('config', (ret) => ({
    evaConfig: ret.evaluationConfig,
    setEvaConfig: ret.setEvaluationConfig,
  }));

  useEffect(() => {
    /*     setInitialState({
          settings: initialState?.settings,
          fetchUserInfo: initialState?.fetchUserInfo,
          currentUser: {
            'name': 'zxy'
          }
        }) */
    setEvaConfig({});
    setRobustEvaluationConfig({});
  }, []);

  const ref = useRef<ActionType>();

  const [queryType, setQueryType] = useState();
  const [queryContent, setQueryContent] = useState('');
  const formRef = useRef<ProFormInstance>();

  const [modalForm] = Form.useForm();

  const [fileList, setFileList] = useState([]);

  //保存上传数据后返回的dataseturl
  const [dataSetUrl, setDataSetUrl] = useState('');
  //保存上传图片集后返回的url集合
  const [imgUrls, setImgUrls] = useState({});
  //保存上传图片集的数量
  const [imgNumber, setImgNumber] = useState(0);

  //上传数据集的任务类型
  const [taskTypeId, setTaskTypeId] = useState(1);

  //上传数据集的测评类型
  const [evaTypeId, setEvaTypeId] = useState(1);

  //上传数据集
  const handleTestDataInfo = async (values) => {
    const msg = values;
    msg.dataUrl = dataSetUrl;
    console.log(msg);
    const data = await dataSetInfo(msg);
    //console.log(data);
    if (data.code === '00000') {
      message.success('上传成功');
      setDataSetUrl('');
      setEvaTypeId(1);
    } else {
      message.error(data.message);
    }
    // modalForm.resetFields();
    return true;
  };
  //上传图片集信息
  const handleTestImgInfo = async (values) => {
    const msg = values;
    const dataUrls = Object.values(imgUrls);
    msg.dataUrls = dataUrls;
    msg.dataLength = dataUrls.length;
    console.log(msg);
    const data = await imgInfo(msg);
    //console.log(data);
    if (data.code === '00000') {
      message.success('上传成功');
      setImgUrls([]);
      setEvaTypeId(1);
    } else {
      message.error(data.message);
    }
    // modalForm.resetFields();
    return true;
  };

  //中断网络请求
  let controller = new AbortController(); // 创建一个控制器
  let { signal } = controller; // 返回一个 AbortSignal 对象实例，它可以用来 with/abort 一个 DOM 请求。

  return (
    <>
      <ProCard title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>数据集列表</div>}>
        <ProTable
          loading={false}
          columns={columnsMP}
          // dataSource={tableListDataSource}
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
            //console.log(filter);
            /*             let taskType;
                        if (filter.taskTypeId !== null) {
                          taskType = filter.taskTypeId.map((item) => {
                            return Number(item);
                          });
                        } else {
                          taskType = [1, 2, 3];
                        } */
            //console.log(taskType);
            //const msg = await dataSetQuery(params, queryType, queryContent, taskType);
            const data = await dataSetQueryMP(params, queryContent);
            console.log(JSON.parse(data.data));
            const dataInfo = JSON.parse(data.data);
            //window.location.replace("http://101.200.198.205");

            //console.log(msg);
            if (dataInfo.code === 200) {
              console.log(1);
              if (dataInfo.data.items !== null) {
                return {
                  data: dataInfo.data.items,
                  total: dataInfo.data.total,
                  //data: msg.data.records,
                  // success 请返回 true，
                  // 不然 table 会停止解析数据，即使有数据
                  success: true,
                  // 不传会使用 data 的长度，如果是分页一定要传
                  //total: msg.data.total,
                };
              }
              else {
                console.log(1);
                return {
                  data: [],
                  total: dataInfo.data.total,
                  success: true,
                }
              }
            }
            else message.error(msg.message);
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
            search: (
              <Input.Group compact>
                <Select
                  defaultValue=""
                  style={{ width: 100 }}
                  onChange={(event) => setQueryType(event)}
                  options={[
                    {
                      value: 0,
                      label: 'ID',
                    },
                    {
                      value: 1,
                      label: '数据名称',
                    },
                  ]}
                />
                <Search
                  onChange={(event) => setQueryContent(event.target.value)}
                  enterButton={true}
                  allowClear={true}
                  style={{ width: '70%' }}
                  onReset={() => {
                    //console.log('hello');
                  }}
                  onSearch={(value: string, event) => {
                    ref.current?.reload();
                  }}
                />
              </Input.Group>
            ),
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
                  setDataSetUrl('');
                  setImgUrls([]);
                  setEvaTypeId(1);
                  try {
                    //console.log('hello');
                    controller.abort();
                    controller = new AbortController();
                    signal = controller.signal;
                  } catch { }
                },
              }}
              preserve={false}
              form={modalForm}
              title={<div>数据上传</div>}
              trigger={<Button type="primary">上传数据集</Button>}
              submitter={{
                searchConfig: {
                  submitText: '确认',
                  resetText: '取消',
                },
              }}
              onFinish={async (values) => {
                //console.log(dataSetUrl);
                if (evaTypeId !== 1) {
                  if (dataSetUrl === '') {
                    message.error('请等待文件上传完成');
                    return false;
                  }
                  await handleTestDataInfo(values);
                  ref.current?.reload();
                  return true;
                } else {
                  if (Object.values(imgUrls).length !== imgNumber) {
                    message.error('请等待图片上传完成');
                    return false;
                  }
                  await handleTestImgInfo(values);
                  ref.current?.reload();
                  return true;
                }
              }}
            >
              <Form.Item>
                <ProFormText
                  //initialValue="1"
                  width="md"
                  name="dataName"
                  label="数据名称"
                  placeholder="请输入数据名称"
                  rules={[{ required: true, message: '请输入名称' }]}
                />
              </Form.Item>

              <Form.Item>
                <ProFormTextArea
                  //initialValue="2"
                  label="数据描述"
                  tooltip={'请输入上传数据集的信息'}
                  //label={<><label>数据描述</label><Tooltip title={'请输入上传数据集的信息'}></Tooltip></>}
                  width="md"
                  name="dataDesc"
                  placeholder="请输入数据信息"
                  rules={[{ required: true }]}
                />
              </Form.Item>

              <Form.Item>
                <ProFormSelect
                  //initialValue={1}
                  width="md"
                  name="taskTypeId"
                  label="任务类型"
                  tooltip={'请选择上传数据集的应用类型'}
                  rules={[{ required: true }]}
                  fieldProps={{
                    onChange: (e) => {
                      setTaskTypeId(e);
                    },
                  }}
                  options={[
                    {
                      value: 1,
                      label: '图像分类',
                    },
                    /*                    {
                      value: 2,
                      label: '文本分类',
                    },*/
                    /*                    {
                                          value: 3,
                                          label: '表格分类',
                                        },*/
                  ]}
                />
              </Form.Item>

              <Form.Item>
                <ProFormSelect
                  //initialValue={1}
                  width="md"
                  name="evaTypeId"
                  label="测评类型"
                  tooltip={'请选择上传数据集的测评任务类型'}
                  rules={[{ required: true }]}
                  fieldProps={{
                    onChange: (e) => {
                      setEvaTypeId(e);
                      console.log(e);
                      if (e === 1) {
                        controller.abort();
                        controller = new AbortController();
                        signal = controller.signal;
                      }
                    },
                  }}
                  options={[
                    {
                      value: 1,
                      label: '可解释性测评',
                    },
                    /*                     {
                                          value: 2,
                                          label: '正确性测评',
                                        },
                                        {
                                          value: 3,
                                          label: '鲁棒性测评',
                                        },
                                        {
                                          value: 4,
                                          label: '适应性测评',
                                        }, */
                    /*                    {
                                          value: 3,
                                          label: '表格分类',
                                        },*/
                  ]}
                />
              </Form.Item>
              {evaTypeId !== 1 && (
                <Form.Item>
                  <ProFormDigit
                    //initialValue={2}
                    width="md"
                    label="样本量"
                    tooltip={'图像数据请输入图像数量'}
                    name="dataLength"
                    rules={[{ required: true }]}
                    fieldProps={{ precision: 0 }}
                  />
                </Form.Item>
              )}

              {evaTypeId === 1 && (
                <Form.Item>
                  <ProFormUploadButton
                    rules={[{ required: true, message: '请上传图像数据文件' }]}
                    label={'图像数据文件'}
                    name={'imgFile'}
                    accept={'.jpg,.png'}
                    //fileList={fileList}
                    max={10}
                    listType={'picture-card'}
                    fieldProps={{
                      beforeUpload: (file) => {
                        //console.log(file);
                        const isImg =
                          file.name.split('.').reverse()[0] === 'zip' ||
                          file.name.split('.').reverse()[0] === 'jpg';
                        //console.log(isZip);
                        if (!isImg) {
                          message.error(`${file.name}文件格式不正确`);
                          return Upload.LIST_IGNORE;
                        }
                        if (file.size / 1024 / 1024 > 10) {
                          message.error(`${file.name}图片过大`);
                          return Upload.LIST_IGNORE;
                        }
                        return true;
                      },
                      onChange: async (info) => {
                        if (info.file.status === 'done') {
                          console.log(info);
                          setImgNumber(info.fileList.length);
                          const data = await imgFile(info.file.originFileObj);
                          if (data.code === '00000') {
                            message.success('图片上传成功');
                            console.log(data.data.url);
                            setImgUrls((prevState) => {
                              console.log(prevState);
                              prevState[info.file.uid] = data.data.url;
                              return prevState;
                            });
                            //console.log(imgUrls);
                          } else {
                            message.error(data.message);
                          }
                        } else if (info.file.status === 'removed') {
                          setImgUrls((prevState) => {
                            console.log(prevState);
                            delete prevState[info.file.uid];
                            return prevState;
                          });
                          //console.log(imgUrls);
                          return Upload.LIST_IGNORE;
                        }
                        return false;
                      },
                    }}
                  />
                </Form.Item>
              )}

              {evaTypeId !== 1 && (
                <Form.Item>
                  <ProFormUploadButton
                    /*            fieldProps={{
                                  headers: { 'authorization': 'Bearer ' + token.get(),
                                   'content-type': 'multipart/form-data; boundary=<calculated when request is sent>'}
                                }}*/
                    //fileList={fileList}
                    rules={[{ required: true }]}
                    tooltip={'请上传.zip文件，并于提示文件上传成功后点击确定上传数据集信息'}
                    label="数据文件"
                    name=" file"
                    title="选取文件"
                    max={1}
                    /*accept={".zip,.csv"}*/
                    accept={'.zip'}
                    //action={'/api/micro-model-dataset-service/minio/dataset/upload'}
                    fieldProps={{
                      beforeUpload: (file) => {
                        //console.log(file);
                        const isZip = file.name.split('.').reverse()[0] === 'zip';
                        //console.log(isZip);
                        if (!isZip) {
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
                        //console.log(info);
                        if (info.file.status === 'done') {
                          const data = await dataSetFile(info.file.originFileObj, signal);
                          //console.log(data);
                          if (data.code === '00000') {
                            message.success('数据文件上传成功');
                            //console.log(data.data.url);
                            setDataSetUrl(data.data.url);
                          } else {
                            message.error(data.message);
                          }
                        } else if (info.file.status === 'removed') {
                          setDataSetUrl('');
                          controller.abort();
                          controller = new AbortController();
                          signal = controller.signal;
                        }
                        return false;
                      },
                      listType: 'text',
                    }}
                  /*            onChange={async (info) => {
                                if(info.file.status === 'done'){
                                  const data = await dataSetFile(info.file.originFileObj);
                                  if(data.code === '00000') {
                                    //console.log(data.data.url);
                                    setDataSetUrl(data.data.url);
                                  }
                                  else{
                                    message.error(data.message);
                                  }
                                }
                              }
                              }*/
                  ></ProFormUploadButton>
                </Form.Item>
              )}

              {taskTypeId === 1 && evaTypeId !== 1 && (
                <ModalForm<{
                  name: string;
                  company: string;
                }>
                  trigger={<Link>数据集压缩文件组织形式</Link>}
                  autoFocusFirstInput
                  modalProps={{
                    destroyOnClose: true,
                  }}
                  submitter={false}
                >
                  <div style={{ fontSize: 'medium', fontWeight: 'bold' }}>图像数据</div>
                  <ProList<{ title: string }>
                    /*        toolBarRender={() => {
                              return [
                                <Button key="3" type="primary">
                                  新建
                                </Button>,
                              ];
                            }}*/
                    itemLayout="vertical"
                    rowKey="title"
                    //headerTitle="结果说明"
                    dataSource={dataSource}
                    metas={{
                      title: {},
                      /*          description: {
                                  render: () => (
                                    <>
                                      <Tag>语雀专栏</Tag>
                                      <Tag>设计语言</Tag>
                                      <Tag>蚂蚁金服</Tag>
                                    </>
                                  ),
                                },*/
                      /*          actions: {
                                  render: () => [
                                    <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                                    <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                                    <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                                  ],
                                },*/
                      extra: {
                        render: (dom, entity, index, action, schema) => {
                          if (index === 0) {
                            return <img src={datasetForm1}></img>;
                          } else if (index === 1) {
                            return <img src={datasetForm2}></img>;
                          }
                        },
                      },
                      content: {
                        render: (dom, entity, index, action, schema) => {
                          console.log(index);
                          if (index === 0) {
                            return (
                              <ul>
                                <li>
                                  上传的图像数据格式应为zip压缩文件，文件内应包含test文件夹,train文件夹,test.txt文件,train.txt文件,如右图所示
                                </li>
                              </ul>
                            );
                          } else if (index === 1) {
                            return (
                              <ul>
                                <li>
                                  txt文件应说明数据集文件与标签的对应关系，每一行对应文件夹内的一条数据文件名，以及对应的分类标签,如右图所示
                                </li>
                              </ul>
                            );
                          }
                        },
                      },
                    }}
                  />
                  {/*<div>
                      zip压缩文件内应包含test文件夹,train文件夹,test.txt文件,train.txt文件，如下
                    </div>
                    <Image src={datasetForm1}></Image>
                    <div>txt文件应说明数据集文件与标签的对应关系，每一行对应文件夹内的一条数据文件名，以及对应的分类标签,如下</div>
                    <Image src={datasetForm2}></Image>*/}
                  {/*              <ProFormText width="sm" name="id" label="主合同编号" />
              <ProFormText name="project" disabled label="项目名称" initialValue="xxxx项目" />
              <ProFormText width="xs" name="mangerName" disabled label="商务经理" initialValue="启途" />*/}
                </ModalForm>
              )}
              {taskTypeId === 3 && (
                <ModalForm<{
                  name: string;
                  company: string;
                }>
                  trigger={<Link>数据集文件组织形式</Link>}
                  autoFocusFirstInput
                  modalProps={{
                    destroyOnClose: true,
                  }}
                  submitter={false}
                >
                  <div style={{ fontSize: 'medium', fontWeight: 'bold' }}>表格数据</div>
                  <ProList<{ title: string }>
                    /*        toolBarRender={() => {
                              return [
                                <Button key="3" type="primary">
                                  新建
                                </Button>,
                              ];
                            }}*/
                    itemLayout="vertical"
                    rowKey="title"
                    //headerTitle="结果说明"
                    dataSource={[
                      {
                        title: '',
                      },
                    ]}
                    metas={{
                      title: {},
                      /*          description: {
                                  render: () => (
                                    <>
                                      <Tag>语雀专栏</Tag>
                                      <Tag>设计语言</Tag>
                                      <Tag>蚂蚁金服</Tag>
                                    </>
                                  ),
                                },*/
                      /*          actions: {
                                  render: () => [
                                    <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                                    <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                                    <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                                  ],
                                },*/
                      extra: {
                        render: (dom, entity, index, action, schema) => {
                          return <Image src={tableDataForm}></Image>;
                        },
                      },
                      content: {
                        render: (dom, entity, index, action, schema) => {
                          return (
                            <div className="row row-margin-top">
                              zip压缩文件内，
                              <div>1.需同时包含训练集与测试集，</div>
                              <div>
                                2.
                                其中训练集的命名格式为：数据集名称_train.csv，测试集的命名格式为：数据集名称_test.csv，如右图所示
                              </div>
                            </div>
                          );
                        },
                      },
                    }}
                  />
                  {/*                    <div className="row row-margin-top">
                      zip压缩文件内，需同时包含训练集与测试集，其中训练集的命名格式为，数据集名称_train.csv，测试集的命名格式为：数据集名称_test.csv
                    </div>
                    <Image src={tableDataForm}></Image>*/}
                  {/*              <ProFormText width="sm" name="id" label="主合同编号" />
              <ProFormText name="project" disabled label="项目名称" initialValue="xxxx项目" />
              <ProFormText width="xs" name="mangerName" disabled label="商务经理" initialValue="启途" />*/}
                </ModalForm>
              )}
            </ModalForm>,
          ]}
        />
      </ProCard>
    </>
  );
};
