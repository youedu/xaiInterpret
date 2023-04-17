import { PlusOutlined,MinusCircleOutlined, MinusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { EditableProTable, ProCard, ProFormField, ProFormCheckbox, ModalForm, ProFormTextArea, ProFormSelect} from '@ant-design/pro-components';
import type { InputRef } from 'antd';
import { Button, Form, Input, Select,Space, message } from 'antd';
import React, { useRef, useState } from 'react';
import {TableRowSelection} from "@antd/es/table/interface";
import {TableListItem} from "@/pages/modelSet";
import {useModel} from "umi";
import {dataSetQuery, robustMethod, interpretMethod} from "@/services/ant-design-pro/api";


const sights = {
  Beijing: ['Tiananmen', 'Great Wall'],
  Shanghai: ['Oriental Pearl', 'The Bund'],
};
type SightsKeys = keyof typeof sights;

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

const TagList: React.FC<{
  value?: {
    value: string;
    label: string;
    methodName: string;
  }[];
  onChange?: (
    value: {
      value: string;
      label: string;
    }[],
  ) => void;
}> = ({ value, onChange }) => {
  const {evaConfig, setEvaConfig} = useModel('config', (ret) => ({
    evaConfig: ret.evaluationConfig,
    setEvaConfig: ret.setEvaluationConfig,
  }));
  const [config, setConfig] = useState({});
  const modalForm = Form.useForm();

  return <ProFormCheckbox.Group
    disabled={true}
    layout={"vertical"}
    name={'config'}
    fieldProps={{
      onChange: (e) => {
      }
    }}
  >
    {(value || []).map((item) =>
      [<ProFormCheckbox
        name={item.label}
        fieldProps={{
          value: item.value,
          onChange:(e) => {
            evaConfig[e.target.value] = e.target.id;
            setEvaConfig(evaConfig);
            console.log(evaConfig);
          }
        }}>{<ModalForm
        title="参数配置"
        //name={item.value}
        trigger={<a>{item.methodName}配置</a>}
        onFinish={async (values) => {
          console.log(values);
          evaConfig[item.methodName] = values[item.methodName];
          setEvaConfig(evaConfig);
          console.log(evaConfig);
          //message.success(evaluationConfig[0]);
          return true;
        }}
      >
        <Form.Item>
          <ProFormTextArea  name={item.methodName} fieldProps={{defaultValue: item.value}}></ProFormTextArea>
        </Form.Item>
      </ModalForm>}</ProFormCheckbox>])}
  </ProFormCheckbox.Group>;
};

const ConfigList: React.FC<{
  value?: {
    value: string;
    label: string;
  }[];
  onChange?: (
    value: {
      value: string;
      label: string;
    }[],
  ) => void;
}> = ({ value, onChange }) => {
  const {evaConfig} = useModel('config', (ret) => ({
    evaConfig: ret.evaluationConfig
  }));

  return <>
    {(value || []).map((item) =>
      <ModalForm
        title="新建表单"
        //name={item.value}
        trigger={<a style={{display: item.value in evaConfig? 'block':'none'}}>{item.label}参数配置</a>}
        onFinish={async () => {
          //setEvaConfig(evaConfig);
          console.log(evaConfig, item);
          //message.success(evaluationConfig[0]);
          return true;
        }}
      >
        <ProFormTextArea></ProFormTextArea>
      </ModalForm>
    )}
  </>;
};

type DataSourceType = {
  id: React.Key;
  title?: string;
  labels?: {
    value: string;
    label: string;
  }[];
  state?: string;
  created_at?: string;
  children?: DataSourceType[];
};

const defaultData: DataSourceType[] = [
  {
    id: 624748504,
    title: '活动名称一',
    labels: [{ value: 'woman1', label: '川妹子1' },
      { value: 'woman2', label: '川妹子2' },
      { value: 'woman3', label: '川妹子3' }],
    state: 'open',
    created_at: '1590486176000',
  },
  {
    id: 624691229,
    title: '活动名称二',
    labels: [{ value: 'man1', label: '西北汉子1' },
      { value: 'man2', label: '西北汉子2' },
      { value: 'man3', label: '西北汉子3' },],
    state: 'closed',
    created_at: '1590481162000',
  },
];

const columns: ProColumns<DataSourceType>[] = [
  {
    title: '攻击类型',
    dataIndex: 'categoryName',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
    width: '30%',
    editable: false,
  },
  /*  {
      title: '状态',
      key: 'state',
      dataIndex: 'state',
      valueType: 'select',
      valueEnum: {
        all: { text: '全部', status: 'Default' },
        open: {
          text: '未解决',
          status: 'Error',
        },
        closed: {
          text: '已解决',
          status: 'Success',
        },
      },
    },*/
  {
    title: '攻击方法',
    dataIndex: 'methodList',
    width: '40%',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
    renderFormItem: (row, { isEditable }) => {
      return <TagList/>;//isEditable ? <TagList /> : <Input />;
    },
    render: (_, row) => {
      return <ProFormCheckbox.Group
        disabled={true}
        layout={"vertical"}
        fieldProps={{
          onChange: (e) => {
            console.log(e);
          }
        }}
      >
        {row?.labels?.map((item) =>
          <ProFormCheckbox
            disabled={true}
            fieldProps={{
              value: item.value,
            }}>{item.label}</ProFormCheckbox>)}
      </ProFormCheckbox.Group>;
    },
  },
  {
    title: '配置',
    width: '20%',
    dataIndex: 'labels',
    renderFormItem: (row, { isEditable }) => {
      return <ConfigList/>;
    },
    render: (text, record, _, action) => {
      return;
    }
  },
  {
    title: '操作',
    valueType: 'option',
    width: 250,
    render: (text, record, _, action) => [
      <a
        key="editable"
        onClick={() => {
          action?.startEditable?.(record.id);
        }}
      >
        编辑
      </a>,
      <EditableProTable.RecordCreator
        key="copy"
        record={{
          ...record,
          id: (Math.random() * 1000000).toFixed(0),
        }}
      >
        <a>复制此行到末尾</a>
      </EditableProTable.RecordCreator>,
    ],
  },
];

export default () => {
  //选择
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setEditableRowKeys(newSelectedRowKeys);
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };


  const rowSelection: TableRowSelection<TableListItem> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };


  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly DataSourceType[]>([]);
  const [form] = Form.useForm();

  //可解释性模型类型
  const [modelType, setModelType] = useState('rule');
  //可解释性评估模型配置
  const [evaModelConfig, setEvaModelConfig] = useState();

  return (
    <>
      <Form>
      <ProCard bordered>
        代理模型类型：
      </ProCard>
        <Form.Item>
        <ProFormSelect
          width={'200px'}
          name="modelType"
          initialValue={'rule'}
          onChange={(e)=>{
            console.log(e);
            setModelType(e);
          }}
          options={[
            {label: '规则模型', value: 'rule'},
            {label: '决策树模型', value: 'tree'},
          ]
          }/>
        </Form.Item>
      <ProCard bordered size={'small'}  >
        <ProCard colSpan={8} layout="left" size={'small'}>
          黑盒模型选择：
        </ProCard>
        <ProCard colSpan={8} layout="left" size={'small'}>
          代理模型选择：
        </ProCard>
        <ProCard colSpan={2} size={'small'}></ProCard >
        <ProCard colSpan={6} layout="left" size={'small'}>
          评估模型选择：
        </ProCard>
      </ProCard>

      <ProCard >
{/*        <ProCard colSpan={6} layout="left">
          <ProFormSelect
            label={'XAI1'}
            width={'200px'}
            initialValue={1}
            options={[
              {label: '规则模型', value: 1},
              {label: '决策树模型', value: 2},
            ]
            }/>
          <ProFormSelect
            label={'XAI2'}
            width={'200px'}
            initialValue={1}
            options={[
              {label: '规则模型', value: 1},
              {label: '决策树模型', value: 2},
            ]
            }/>
        </ProCard>*/}
{/*        <ProCard colSpan={6} layout="left">
          <ProFormSelect
            width={'200px'}
            initialValue={1}
            options={[
              {label: '规则模型', value: 1},
              {label: '决策树模型', value: 2},
            ]
            }/>
          <ProFormSelect
            width={'200px'}
            initialValue={1}
            options={[
              {label: '规则模型', value: 1},
              {label: '决策树模型', value: 2},
            ]
            }/>
        </ProCard>*/}
        <ProCard colSpan={18} split={'vertical'}>
          <Form.List name="users">
            {(fields, { add, remove }) => {
              console.log(fields);
              return (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <ProCard colSpan={16} size={'small'}>
                    <ProCard colSpan={11 } size={'small'}>
                      <ProFormSelect label={"XAI"+(name+1).toString()} name={[name, 'sight']}  style={{ width: 300 }}>
                      </ProFormSelect>
                    </ProCard>
                    <ProCard colSpan={12} size={'small'}>
                      <ProFormSelect
                        name={[name, 'last']}
                        style={{ width: 300 }}>
                      </ProFormSelect>
                    </ProCard>
                  </ProCard>
                ))}
                <ProCard colSpan={4} size={'small'}>
                <Form.Item>
                  <Space>
                  <Button type="primary" onClick={() => add()} icon={<PlusOutlined />}>
                    添加
                  </Button>
                  <Button type="primary" onClick={() => remove(fields.at(-1).name)} icon={<MinusOutlined />}>
                    删除
                  </Button>
                  </Space>
                </Form.Item>
                </ProCard>
              </>
            );}}
          </Form.List>
        </ProCard>
        <ProCard colSpan={6} layout="left">
        <Form.Item>
          <ProFormSelect
            name = 'evaModelType'
            placeholder={'请选择评估模型类型'}
            dependencies={['modelType']}
            request = {async () => {
              const msg = await interpretMethod(modelType,3).catch((error) => {
                console.log('error');
              });
              console.log(msg.data);
              return msg.data.map(function (item){
                console.log(JSON.parse(item.config));
                return {label: item.displayName, value: item.interpretMethod}
              })}}
          />
        </Form.Item>
        </ProCard>
      </ProCard>
      <ProCard bordered>
        评估模型参数设置：
      </ProCard>
      <ProCard>
      <ModalForm
        title="评估模型参数配置"
        //name={item.value}
        trigger={<a>参数配置</a>}
        onFinish={async (values) => {
          console.log('value:',values);
          //message.success(evaluationConfig[0]);
          return true;
        }}
      >
{/*        <Form.Item label={<a>配置文档</a>}labelCol={{span: 3, offset: 22}}>
        </Form.Item>*/}
          <a>配置文档</a>
        <Form.Item>
          <ProFormTextArea
            name = 'config'
            fieldProps={{defaultValue: '{\n' +
                '//以下3行为规则、决策树都需配置的项\n' +
                '"consistency_complexity":3,\n' +
                '"consistency_specificity":4,\n' +
                '"complexity_specificity":1,\n' +
                '}' + '{\n' +
                  '"CoverageRate_ClassCoverage":1,\n' +
            '}',
            autoSize: true}}
          />
        </Form.Item>
      </ModalForm>
      </ProCard>
      </Form>
     {/* <Space>

      </Space>

      <EditableProTable<DataSourceType>
        rowSelection={rowSelection}
        tableAlertRender={false}
        rowKey="categoryId"
        scroll={{
          x: 960,
        }}
        actionRef={actionRef}
        headerTitle="可编辑表格"
        maxLength={5}
        // 关闭默认的新建按钮
        recordCreatorProps={false}
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
          const msg = await robustMethod(1);
          console.log(msg);
          if(msg.code === '00000') {
            return {
              data: msg.data.methodList,
              // success 请返回 true，
              // 不然 table 会停止解析数据，即使有数据
              success: true,
              // 不传会使用 data 的长度，如果是分页一定要传
              total: msg.data.total,
            };
          }
          else
            message.error(msg.message);
          return false;
        }}

        value={dataSource}
        onChange={setDataSource}
        editable={{
          form,
          editableKeys,
          onSave: async () => {
            await waitTime(2000);
          },
          onChange: setEditableRowKeys,
          actionRender: (row, config, dom) => [dom.save, dom.cancel],
        }}
      />*/}

{/*      <ProCard title="表格数据" headerBordered collapsible defaultCollapsed>
        <ProFormField
          ignoreFormItem
          fieldProps={{
            style: {
              width: '100%',
            },
          }}
          mode="read"
          valueType="jsonCode"
          text={JSON.stringify(dataSource)}
        />
      </ProCard>*/}
    </>
  );
};

