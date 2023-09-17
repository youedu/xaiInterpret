import { ProTable, ModalForm, ProFormRadio, ProCard } from '@ant-design/pro-components';
import type { ProColumns, ProFormInstance, ColumnsState } from '@ant-design/pro-components';
import { Button, Input, Select, Form, message, Tag, Progress } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { history, Link } from "umi";
import { dataSetQuery, evaluationRecordQuery, tokenByCookie } from "@/services/ant-design-pro/api";
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useModel } from "@@/plugin-model/useModel";
import token from '@/utils/token';
import taskId from '@/utils/taskId';
import cookie from '@/utils/cookie';

const { Search } = Input;

interface ActionType {
  reload: (resetPageIndex?: boolean) => void;
  reloadAndRest: () => void;
  reset: () => void;
  clearSelected?: () => void;
  startEditable: (rowKey: Key) => boolean;
  cancelEditable: (rowKey: Key) => boolean;
}




const statusEnum = {
  0: 'online',
  1: 'running',
  2: 'failing'
};
const taskTypeEnum = {
  0: 'img',
  1: 'text',
}
const evaTypeEnum = {
  0: '正确性',
  1: '鲁棒性',
  2: '可解释性',
}

export type TableListItem = {
  updateTime: string;
  evaluateState: number;
  modelState: number;
  key: number;
  id: string;
  name: string;
  taskType: string;
  evaType: string;
  dataSet: string;
  model: string;
  status: string;
  createdAt: number;
};

const tableListDataSource: TableListItem[] = [];

/*for (let i = 0; i < 10; i += 1) {
  tableListDataSource.push({
    key: i,
    id: 'M'+(i + 1) ,
    name: `图片classification`,
    taskType: taskTypeEnum[Math.floor(Math.random() * 10) % 2],
    evaType: evaTypeEnum[Math.floor(Math.random() * 10) % 3],
    dataSet: 'imgNet',
    model: 'ResNet-50',
    status: statusEnum[Math.floor(Math.random() * 10) % 2],
    createdAt: Date.now() - Math.floor(Math.random() * 20000 * i),
  });
}*/

// @ts-ignore
// @ts-ignore


export default (params) => {



  const { robustEvaluationConfig, setRobustEvaluationConfig } = useModel('robustConfig', (ret) => ({
    robustEvaluationConfig: ret.robustEvaluationConfig,
    setRobustEvaluationConfig: ret.setRobustEvaluationConfig,
  }));

  const { evaConfig, setEvaConfig } = useModel('config', (ret) => ({
    evaConfig: ret.evaluationConfig,
    setEvaConfig: ret.setEvaluationConfig,
  }));

  const { interpretEvaluationConfig, setInterpretEvaluationConfig } = useModel('interpretConfig', (ret) => ({
    interpretEvaluationConfig: ret.interpretEvaluationConfig,
    setInterpretEvaluationConfig: ret.setInterpretEvaluationConfig,
  }));

  //当前时间转为时间戳
  const [percent, setPercent] = useState<number>((new Date()).valueOf());

  //表格查询栏选项与输入
  const ref = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [queryType, setQueryType] = useState('');
  const [queryContent, setQueryContent] = useState('');

  const tokencookie = async () => {
    if (token.get() === null) {
      const data = await tokenByCookie();
      console.log(JSON.parse(data.data));
      const tokenInfo = JSON.parse(data.data).data.deploys[0].deployToken;
      token.save(tokenInfo);
      console.log(token.get());
      ref.current?.reload();
    }

  }
  useEffect(() => {
    ref.current?.reload();
    //tokencookie();

    setEvaConfig({});
    setRobustEvaluationConfig({});
    setInterpretEvaluationConfig({});
    //30s自动刷新当前表格数据
    setInterval(() => ref.current?.reload(), 15000);

    //每2s刷新时间戳
    setInterval(() => {
      setPercent((prevPercent) => {
        //console.log(prevPercent);
        const newPercent = prevPercent + 1000;
        return newPercent;
      }
      )
    }, 1000);

  }, []);


  //测评数据类型
  const [dataType, setDataType] = useState(1);

  //测评类型
  const [evaluationType, setEvaluationType] = useState(1);

  //外层modalForm
  const [modalForm] = Form.useForm();
  const modalRef = useRef<ProFormInstance>();


  //clearInterval(timer);
  //表格列
  const columns: ProColumns<TableListItem>[] = [
    {
      title: <b>测评子任务ID</b>,
      dataIndex: 'id',
      width: '200px',
      ellipsis: true,
      align: 'center',
    },
    {
      title: <b>测评子任务类型</b>,
      dataIndex: 'taskTypeId',
      initialValue: 'all',
      ellipsis: true,
      /*    filters: true,
          onFilter: true,*/
      valueType: 'select',
      valueEnum: {
        1: { text: '图像分类' },
        2: { text: '文本分类' },
        3: { text: '目标检测' },
      },
      align: 'center',
    },
    {
      title: <b>测评子任务名称</b>,
      dataIndex: 'taskName',
      ellipsis: true,
      align: 'center',
    },
    {
      title: <b>测评子任务类型</b>,
      dataIndex: 'evaluateType',
      ellipsis: true,
      initialValue: 'all',
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        all: { text: '全部', status: 'Default' },
        正确性: { text: '正确性', status: 'Processing' },
        鲁棒性: { text: '鲁棒性', status: 'Processing' },
        可解释性: { text: '可解释性', status: 'Processing' },
        适应性: { text: '适应性', status: 'Processing' },
      },
      align: 'center',
    },
    {
      title: <b>测评子任务方法</b>,
      dataIndex: 'methodName',
      /*    ellipsis: false,*/
      width: 300,
      render: (_, { methodName }) => {
        //console.log(methodName);
        return (
          <>
            {methodName.map((method, index) => {
              let colors = ['geekblue', 'magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green'];
              let color;
              if (index < colors.length) {
                color = colors[index];
              } else {
                color = 'geekblue';
              }
              return (
                <Tag color={color} key={method}>
                  {method}
                </Tag>
              );
            })}
          </>
        );
      },
      align: 'center',
    },
    /*     {
          title: <b>测评子任务模型</b>,
          dataIndex: 'modelName',
          ellipsis: true,
          align: 'center',
        },
        {
          title: <b>测评子任务数据</b>,
          dataIndex: 'dataSetName',
          ellipsis: true,
          align: 'center',
        }, */
    {
      title: <b>创建时间</b>,
      valueType: 'dateTime',
      dataIndex: 'createTime',
      ellipsis: true,
      width: '200px',
      align: 'center',
      // sorter: (a, b) => a.createdAt - b.createdAt,
    },
    {
      title: <b>测评子任务状态</b>,
      dataIndex: 'id',
      ellipsis: true,
      render: (_, row) => {
        if (row.evaluateState === 0)
          return <><CloseCircleOutlined />测评失败</>;
        else if (row.evaluateState === 1) {
          //return <><SyncOutlined spin/>测评中</>;
          return <Progress percent={Math.min(Math.round((percent - (new Date(row.updateTime)).valueOf()) / 250), 90)} />
        } else
          return <><CheckCircleOutlined /><Link to={'/evaluationresult?resultId=' + row.id.toString() + '&evaluateType=' + row.taskTypeId.toString()}>测评成功</Link></>;
      },
      align: 'center',
    },
  ];


  return (<>
    <ProCard title={<div style={{ fontSize: '20px', fontWeight: 'bold' }}>测评子任务记录</div>}>
      <ProTable<TableListItem, { keyWord?: string }>
        loading={false}
        columns={columns}
        //dataSource={tableListDataSource}
        toolbar={{
          search: (<Input.Group compact>
            <Select
              defaultValue=""
              style={{ width: 100 }}
              onChange={event => setQueryType(event)}
              options={[
                {
                  value: '0',
                  label: 'ID',
                },
                {
                  value: '1',
                  label: '任务名称',
                },
              ]}
            />
            <Search onChange={event => setQueryContent(event.target.value)}
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
          </Input.Group>)
          /*{
            onSearch: (value: string, event) => {
              //console.log(value);
              ref.current?.reload();
            },
            enterButton: true,
          }*/
        }}
        /*      request={(params) =>{
                //console.log(queryContent);
                //console.log(queryType);
                return Promise.resolve({
                  data: tableListDataSource.filter((item) => {
        /!*            if (!params?.keyWord) {
                      return true;
                    }
                    if (item.name.includes(params?.keyWord) || item.status.includes(params?.keyWord)) {
                      return true;
                    }*!/
                    return true;
                  }),
                  success: true,
                })
              }
              }*/
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
          let taskType = [];
          if (filter.evaluateType === null) {
            taskType = [0, 1, 2, 3]
          } else {
            for (let item of filter.evaluateType) {
              if (item === '正确性')
                taskType.push(1);
              else if (item === '适应性')
                taskType.push(3);
              else if (item === '鲁棒性')
                taskType.push(0);
              else
                taskType.push(2);
            }
          }
          //console.log(taskType);
          //console.log(token.get());
          if (token.get() !== null) {
            const msg = await evaluationRecordQuery(params, queryType, queryContent, taskType);
            console.log(msg);
            if (msg.code === '00000') {
              /*          for (let item of msg.data.records){
                            let res = '';
                            for (const method of item.methodName){
                              res = res + method;
                            }
                            item.methodName = item.methodName.join(',');
                        }*/
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
          }
          return false;
        }}

        /*      options={{
                search: true,
              }}
              rowKey="key"
              columnsState={{
                value: columnsStateMap,
                onChange: setColumnsStateMap,
              }}*/
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
          /*        <Input.Group compact>
                    <Select
                      defaultValue="lucy"
                      style={{ width: 120 }}
                      options={[
                        {
                          value: 'jack',
                          label: 'Jack',
                        },
                        {
                          value: 'lucy',
                          label: 'Lucy',
                        },
                      ]}
                    />
                    <Input style={{ width: '50%' }}/>
                  </Input.Group>,*/
          <ModalForm
            modalProps={{
              destroyOnClose: true
            }}
            preserve={false}
            form={modalForm}
            formRef={modalRef}
            title="测评子任务类型"
            trigger={<Button type="primary" onClick={() => {
              setDataType(1);
              //setFirst(1);
            }
            }>新建测评子任务</Button>}
            submitter={{
              searchConfig: {
                submitText: '确认',
                resetText: '取消',
              },
            }}
            onFinish={async (values) => {
              let taskTypeId;
              if (modalForm.getFieldValue('dataType') === 1) {
                taskTypeId = modalForm.getFieldValue('taskType1')
              }
              if (modalForm.getFieldValue('dataType') === 2) {
                taskTypeId = modalForm.getFieldValue('taskType2')
              }
              if (modalForm.getFieldValue('dataType') === 3) {
                taskTypeId = modalForm.getFieldValue('taskType3')
              }
              history.push({
                pathname: '/recordcreate',
                query: {
                  taskTypeId: String(taskTypeId),
                  evaluationType: String(evaluationType)
                },
              });
              return true;
            }}
          >
            <ProFormRadio.Group
              onChange={() => {
                //setFirst(modalForm.getFieldValue('dataType'));
                setDataType(modalForm.getFieldValue('dataType'));
              }}
              initialValue={1}
              fieldProps={{ value: 1 }}
              name="dataType"
              label="数据类型"
              radioType="button"
              options={[
                {
                  label: '图像',
                  value: 1,
                },
                {
                  label: '文本',
                  value: 2,
                  disabled: true,
                },
                {
                  label: '结构化数据',
                  value: 3,
                  disabled: true,
                },
                /*                   {
                                    label: '文本',
                                    value: 2,
                                  }, */
                /*                  {
                                    label: '表格',
                                    value: 3,
                                  },*/
              ]}
            />
            {(dataType === 1) && (
              <ProFormRadio.Group
                name="taskType1"
                label="任务类型"
                dependencies={['dataType']}
                radioType="button"
                initialValue={1}
                request={() => {
                  return [
                    { value: 1, label: '图像分类' },
                    { value: 3, label: '目标检测' }
                  ];
                }}
              />
            )}
            {dataType === 2 && (
              <ProFormRadio.Group
                name="taskType2"
                label="任务类型"
                dependencies={['dataType']}
                radioType="button"
                initialValue={2}
                request={() => {
                  return [
                    { value: 2, label: '文本分类' },
                  ];
                }}
              />
            )}
            {/*              {dataType === 3 && (
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
            {/*          <ProFormRadio.Group
            onChange={()=>{setDataType(modalForm.getFieldValue('dataType'));}}
            initialValue={1}
            name="dataType"
            label="数据类型"
            radioType="button"
            options={[
              {
                label: '图像',
                value: 1,
              },
              {
                label: '文本',
                value: 2,
              },
              {
                label: '表格',
                value: 3,
              },
            ]}
          />
          <ProFormRadio.Group
            name="taskType"
            label="任务类型"
            dependencies={['dataType']}
            radioType="button"
            initialValue={1}
            request={()=>{
              if(modalForm.getFieldValue('dataType') === 1) {
                modalForm.setFieldValue('taskType', 1);
                return [
                  {value: 1, label: '图像分类'},
                  {value: 4, label: '图像识别'}
                ];
              }
              else if(modalForm.getFieldValue('dataType') === 2) {
                modalForm.setFieldValue('taskType', 2);
                return [
                  {value: 2, label: '文本分类'},
                ];
              }
              else {
                modalForm.setFieldValue('taskType', 3);
                return [
                  {value: 3, label: '表格分类'},
                ];
              }
            }}
          />*/}
            <ProFormRadio.Group
              onChange={() => {
                //setFirst(modalForm.getFieldValue('dataType'));
                setEvaluationType(modalForm.getFieldValue('evaluationType'));
              }}
              initialValue={1}
              //fieldProps={{ value: 1 }}
              name="evaluationType"
              label="测评类型"
              radioType="button"
              options={[
                {
                  label: '黑盒测评',
                  value: 1,
                },
                {
                  label: '白盒测评',
                  value: 2,
                },
              ]}
            />
          </ModalForm>
        ]
        }
      />
    </ProCard>
  </>
  );
};

