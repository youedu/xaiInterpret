import {
  ProFormSelect,
  ProFormCheckbox,
  EditableProTable,
  ProCard,
  ModalForm,
  ProFormTextArea,
  ProFormText,
  ProFormUploadButton, ProFormDigitRange, ProFormDigit,
} from '@ant-design/pro-components';
import type { ProColumns, ProFormInstance} from '@ant-design/pro-components';
import {Input, Form, message, Space, Button, Upload, Image,} from 'antd';
import React, {useRef, useState, forwardRef, useImperativeHandle, Key, useEffect} from 'react';
import type { TableRowSelection } from 'antd/es/table/interface';
import {ReloadOutlined} from '@ant-design/icons';

import {
  interpretMethod,
  robustMethod,
  safeMethod,
  interpretDatasetGet,
  interpretDatasetUpload,
  interpretBlackboxUpload,
  interpretProxyUpload,
  interpretXaiGet,
  dataSetQueryById,
  adaptConfigDetailed,
  robustConfigDetailed,
  BlackBoxByDataSet,
  ProxyByBlackBox,
  evaMethodMock,
} from "@/services/ant-design-pro/api";
import {useModel} from "@@/plugin-model/useModel";
import {TableListItem} from "@/pages/modelSet";
import {MinusOutlined, PlusOutlined} from "@ant-design/icons";
import {useForm} from "antd/es/form/Form";
import Link from "antd/es/typography/Link";
import datasetForm1 from "../../../public/datasetForm1.png";
import datasetForm2 from "../../../public/datasetForm2.png";

const {Search} = Input;
const {Divider} = ProCard;

interface ActionType {
  reload: (resetPageIndex?: boolean) => void;
  reloadAndRest: () => void;
  reset: () => void;
  clearSelected?: () => void;
  startEditable: (rowKey: Key) => boolean;
  cancelEditable: (rowKey: Key) => boolean;
}

//适应性编辑配置组件项
const TagList: React.FC<{
  value?: {
    methodId: number;
    configDetailed: string;
    value: string;
    label: string;
    methodName: string;
    displayName: string;
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
  //console.log(value);

  return <ProFormCheckbox.Group
    disabled={true}
    layout={"vertical"}
    fieldProps={{
      name: 'adaptConfig'+value?.length.toString()
    }}
  >
    {(value || []).map((item) =>
      [<ProFormCheckbox
        name={item.label}
        addonAfter={
          <ModalForm
/*            request={async () => {
              const config = await adaptConfigDetailed(item.methodId);
              //console.log(config);
              return ;
            }
            }*/
            title="参数配置"
            //name={item.value}
            trigger={<a onClick={async () => {
              //item.configDetailed = 'new';
            }
            }>{item.displayName}参数配置</a>}
            submitter={{
              searchConfig: {
                submitText: '确认',
                resetText: false,
              },
            }}
            fieldProps={{destroyOnClose: true}}
            onFinish={async (values) => {
              try{
                if(values[item.methodName] === undefined)
                  return true;
                if(typeof JSON.parse(values[item.methodName]) === 'object' && values[item.methodName])
                {
                  //console.log('value:',values);
                  evaConfig[item.methodName] = values[item.methodName];
                  setEvaConfig(evaConfig);
                  //console.log(evaConfig);
                  //message.success(evaluationConfig[0]);
                  return true;
                }
              }catch{
                  //console.log(values[item.methodName]);
                  message.error('参数配置格式不正确');
                  return false;
              };

            }}
          >
            <Form.Item>
              <ProFormTextArea
                name={item.methodName}
                fieldProps={{defaultValue: item.value, autoSize: true}}
              />
            </Form.Item>
            <ProFormTextArea fieldProps={{value: item.configDetailed, bordered: false, readOnly: true, autoSize: true}}/>
          </ModalForm>
        }
        fieldProps={{
          value: item.methodName+'.'+item.methodId,
          onChange:(e) => {
            //console.log('e:', e);
            if(e.target.checked === true) {
              evaConfig[e.target.value] = true;
              evaConfig[item.methodName] = item.value;
              setEvaConfig(evaConfig);
              //console.log(evaConfig);
            }
            if(e.target.checked === false) {
              delete evaConfig[e.target.value];
              delete evaConfig[item.methodName];
              setEvaConfig(evaConfig);
              //console.log(evaConfig);
            }
          }
        }}
      >{item.displayName}</ProFormCheckbox>])}
  </ProFormCheckbox.Group>;
};


//鲁棒性编辑配置组件项
const RobustTagList: React.FC<{
  value?: {
    value: string;
    label: string;
    methodName: string;
    displayName: string;
  }[];
  onChange?: (
    value: {
      value: string;
      label: string;
    }[],
  ) => void;
}> = ({ value, onChange }) => {
  const {robustEvaluationConfig, setRobustEvaluationConfig} = useModel('robustConfig', (ret) => ({
    robustEvaluationConfig: ret.robustEvaluationConfig,
    setRobustEvaluationConfig: ret.setRobustEvaluationConfig,
  }));

  return <ProFormCheckbox.Group
    disabled={true}
    layout={"vertical"}
    fieldProps={{
      name: 'robustConfig'+value?.length.toString()
    }}
  >
    {(value || []).map((item) =>
      [<ProFormCheckbox
        name={item.label}
        fieldProps={{
          value: item.methodName+'.'+item.methodId,
          onChange:(e) => {
            //console.log('e:', e);
            if(e.target.checked === true) {
              const newConfig = robustEvaluationConfig;
              newConfig[e.target.value] = true;
              newConfig[item.methodName] = item.value;
              setRobustEvaluationConfig(newConfig);
/*              robustEvaluationConfig[e.target.value] = true;
              robustEvaluationConfig[item.methodName] = item.value;
              setRobustEvaluationConfig(robustEvaluationConfig);*/

              //console.log(robustEvaluationConfig);
            }
            if(e.target.checked === false) {
              delete robustEvaluationConfig[e.target.value];
              delete robustEvaluationConfig[item.methodName];
              setRobustEvaluationConfig(robustEvaluationConfig);
              //console.log(robustEvaluationConfig);
            }
          }
        }}
        addonAfter={
          <ModalForm
            title="参数配置"
            //name={item.value}
            trigger={<a>{item.displayName}参数配置</a>}
            fieldProps={{destroyOnClose: true}}
            submitter={{
              searchConfig: {
                submitText: '确认',
                resetText: false,
              },
            }}
            onFinish={async (values) => {
              try{
                if(values[item.methodName] === undefined)
                  return true;
                if(typeof JSON.parse(values[item.methodName]) =='object'&& values[item.methodName])
                {
                  //console.log('value:',values);
                  robustEvaluationConfig[item.methodName] = values[item.methodName];
                  setRobustEvaluationConfig(robustEvaluationConfig);
                  //console.log(robustEvaluationConfig);
                  //message.success(evaluationConfig[0]);
                  return true;
                }
              }catch{
                //console.log(values[item.methodName]);
                message.error('参数配置格式不正确');
                return false;
              }

/*              //console.log('value:',values);
              robustEvaluationConfig[item.methodName] = values[item.methodName];
              setRobustEvaluationConfig(robustEvaluationConfig);
              //console.log(robustEvaluationConfig);
              //message.success(evaluationConfig[0]);
              return true;*/
            }}
          >
            <Form.Item>
              <ProFormTextArea
                name={item.methodName}
                fieldProps={{defaultValue: item.value, autoSize: true}}
              />
              <ProFormTextArea fieldProps={{value: item.configDetailed, bordered: false, readOnly: true, autoSize: true}}/>
            </Form.Item>
          </ModalForm>
        }
      >{item.displayName}</ProFormCheckbox>])}
  </ProFormCheckbox.Group>;
};


//适应性表格
/*type adaptDataSourceType = {
  id: React.Key;
  state?: string;
  children?: adaptDataSourceType[];
};

const adaptDefaultData: adaptDataSourceType[] = new Array(2).fill(1).map((_, index) => {
  return {
    id: 0,
    state: 'open',
  };
});*/



//鲁棒性表格
/*type robustDataSourceType = {
  id: React.Key;
  state?: string;
  children?: robustDataSourceType[];
};

const robustDefaultData: robustDataSourceType[] = new Array(2).fill(1).map((_, index) => {
  return {
    id: index+1,
    state: 2,
  };
});*/

const adaptColumns: ProColumns[] = [
  {
    title: '扰动类型',
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
  {
    title: '扰动方法',
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
          name: "test",
          onChange: (e) => {
            //console.log(e);
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
];


// 鲁棒性列配置
const robustColumns: ProColumns[] = [
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
      return <RobustTagList/>;
    },
    render: (_, row) => {
      return <ProFormCheckbox.Group
        disabled={true}
        layout={"vertical"}
        fieldProps={{
          name: "robust"+row.categoryId.toString(),
          onChange: (e) => {
            //console.log(e);
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
];




export default forwardRef((props, ref, params: any) => {
  //console.log(props);

  //数据集数量
  const [datasetSize, setDatasetSize] = useState(0);
  //输入数据集数量
  const [datasetNumber, setDatasetNumber] = useState(100);
  //设备类型
  const [deviceType, setDeviceType] = useState('cpu');
  //已选数据集长度
  const {dataSetNumber, setDataSetNumber} = useModel("datasetNumber");

/*  const [evaMethod, setEvaMethod] = useState([]);

  const config = async() => {
    const data = await evaMethodMock();
    //console.log(data);

    setEvaMethod(0);
  }
  useEffect(() => {
    config();
  }, []);*/


  //选择适应性行
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setEditableRowKeys(newSelectedRowKeys);
    //console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<TableListItem> = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange,
  };

  //选择鲁棒性行
  const [robustEditableKeys, setRobustEditableRowKeys] = useState<React.Key[]>([]);
  const [robustSelectedRowKeys, setRobustSelectedRowKeys] = useState<React.Key[]>([]);

  const onRobustSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setRobustEditableRowKeys(newSelectedRowKeys);
    //console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setRobustSelectedRowKeys(newSelectedRowKeys);
  };

  const robustRowSelection: TableRowSelection<TableListItem> = {
    selectedRowKeys: robustSelectedRowKeys,
    onChange: onRobustSelectChange,
  };

  //选择配置项改变内容
  //const [dataSource, setDataSource] = useState<[]>([]);

  //正确性选择内容
  const [accConfig, setAccConfig] = useState([1, 2, 3, 4]);

  //适应性选择内容
  const {evaConfig, setEvaConfig} = useModel('config', (ret) => ({
    evaConfig: ret.evaluationConfig,
    setEvaConfig: ret.setEvaluationConfig,
  }));


  //鲁棒性选择内容
  const {robustEvaluationConfig, setRobustEvaluationConfig} = useModel('robustConfig', (ret) => ({
    robustEvaluationConfig: ret.robustEvaluationConfig,
    setRobustEvaluationConfig: ret.setRobustEvaluationConfig,
  }));


  //可解释性代理模型类型
  const [proxyModelType, setProxyModelType] = useState();
  //可解释性数据集下拉列表选项
  const [dataSet, setDataSet] = useState([]);
  //可解释性数据集下拉列表选中项
  const [datasetSelect, setDatasetSelect] = useState();
  //可解释性数据集上传文件列表
  const [datasetFileList, setDatasetFileList] = useState([]);
  //可解释性黑盒模型文件列表
  const [blackboxFileList, setBlackboxFileList] = useState([]);
  //可解释性代理模型文件列表
  const [proxyFileList, setProxyFileList] = useState([]);
  //可解释性黑盒模型下拉列表选项
  const [blackboxList, setBlackboxList] = useState([]);
  //可解释性代理模型下拉列表选项
  const [proxyList, setProxyList] = useState([]);
  //可解释性xai模型表单控制
  const [xaiForm]=Form.useForm();

  //可解释性评估模型全部配置
  const [evaModelAllConfig, setEvaModelAllConfig] = useState([]);
  //可解释性评估模型全部配置文档
  const [evaModelAllConfigImage, setEvaModelAllConfigImage] = useState([]);

  //可解释性评估模型配置
  const [evaModelConfig, setEvaModelConfig] = useState();
  //可解释性评估模型选择
  const [evaModelType, setEvaModelType] = useState<string>('');

  //可解释性第一个模型信息
  const {modelName, setModelName} = useModel("modelName");
  //console.log(modelName);

  //可解释性第一个代理模型选项数据
  const [firstProxy, setFirstProxy] = useState([]);


  const robustActionRef = useRef<ActionType>();
  const adaptActionRef = useRef<ActionType>();

  const formRef = useRef<ProFormInstance>();

  const [robustForm]=Form.useForm();
  const [adaptForm]=Form.useForm();

  //其他任务的评测类型
  const [type, setType] = useState('acc');
  //表格分类任务的评测类型
  const [tableType, setTableType] = useState('interpret');

/*  if(props.props.location.query.taskTypeId === 1){
    setType('acc');
  }
  else if(props.props.location.query.taskTypeId === 2){
    setType('acc');
  }
  else if(props.props.location.query.taskTypeId === 3){
    setType('interpret');
  }*/

  useImperativeHandle(ref, () => ({
    openModal: (newVal: boolean) => {
      if(props.props.location.query.taskTypeId === 3)
        return tableType;
      return type;
    },
    AccConfig:() => {
      return accConfig;
    },
    accConfigNew: () => {
      return {deviceType: deviceType, datasetNumber: datasetNumber};
    },
    adaptConfig: () => {
      //console.log('adaptConfig', evaConfig);
      return evaConfig;
    },
    robustConfig: () => {
      //console.log('robustConfig', robustEvaluationConfig);
      return robustEvaluationConfig;
    },
    interpretConfig: () => {
      //console.log(evaModelType);
      const values = {};
      values.dataSetId = props.params;
      values.evaModel = evaModelType.split(',')[0];
      values.evaModelConfig = evaModelConfig;
      values.evaModelId = Number(evaModelType.split(',')[1]);
      if(proxyModelType === '0')
        values.proxyType = 'rule';
      else if(proxyModelType === '1')
        values.proxyType = 'tree';
      values.taskName = '表格数据分类';
      values.taskTypeId = props.props.location.query.taskTypeId;
      values.blackBoxAndProxyModelIdConfigList = [];
      //console.log(xaiForm.getFieldsValue().users);
      if(xaiForm.getFieldsValue().users !== undefined ){
        try{
          if(xaiForm.getFieldsValue().users.length !== 0){
            values.blackBoxAndProxyModelIdConfigList = xaiForm.getFieldsValue().users.map(item=>{
                return{
                  "blackBoxModelId": Number(item.blackbox.split(',')[0]),
                  "blackBoxModelUrl": item.blackbox.split(',')[1],
                  "proxyModelId": Number(item.proxy.split(',')[0]),
                  "proxyModelUrl": item.proxy.split(',')[1],
                };
              }
            );
          }
        }
        catch {
          message.error('请选择黑盒模型与代理模型');
          return false;
        }
      }
      ////console.log(xaiForm.getFieldValue());
      try{
        let pMI = xaiForm.getFieldValue('firstProxy').split(',')[0];
        //console.log(typeof (pMI));
        values.blackBoxAndProxyModelIdConfigList.push({
          "blackBoxModelId": modelName.modelId,
          "blackBoxModelUrl": modelName.modelUrl,
          "proxyModelId": Number(pMI),
          "proxyModelUrl": xaiForm.getFieldValue('firstProxy').split(',')[1],
        })
      }
      catch{

      }

/*      const values = {};
      values.dataSetName = datasetSelect;
      values.evaModel = evaModelType;
      values.evaModelConfig = evaModelConfig;
      values.evaModelId = 1;
      values.proxyType = proxyModelType;
      values.taskName = '图像分类';
      values.taskTypeId = props.props.location.query.taskTypeId;
      values.blackBoxAndProxyModelConfigList = xaiForm.getFieldsValue().users.map(item=>{
        return     {
          "blackBoxModelName": item.blackbox,
          "proxyModelName": item.proxy,
        };
        }
      );*/
      //console.log(values);
      return values;
    }
  }));

  return (
    <>
      <ProCard
        tabs={{
          type: 'card',
          centered: true,
          onChange: event => {
            //console.log(event);
            setType(event);
            setTableType(event);

/*            if(event !== 'robust')
            {
              setRobustEditableRowKeys([]);
              setRobustSelectedRowKeys([]);
              setRobustEvaluationConfig({});
            }
            if(event === 'adapt')
            {
              setSelectedRowKeys([]);
              setEditableRowKeys([]);
              setEvaConfig({});
            }*/

          }
      }}
      >
        {props.evaMethod.indexOf('ACCURACY') !== -1 && (
          <ProCard.TabPane key="acc" tab="正确性">
            <ProFormCheckbox.Group
              fieldProps={{onChange: (event)=>{
                  //console.log(event);
                  setAccConfig(event);
                },
              }}
              initialValue={[1, 2, 3, 4]}
              name='type1'
              layout={'vertical'}
              options={[
                {
                  label: '准确率',
                  value: 1,
                },
                {
                  label: '召回率',
                  value: 2,
                },
                {
                  label: '精确率',
                  value: 3,
                },
                {
                  label: 'f1分数',
                  value: 4,
                },
              ]}
            />
            <ProFormDigit
              width={'200px'}
              label={"数据集评测数据量，最大为"+dataSetNumber.toString()}
              name="inputNumber"
              initialValue={100}
              min={0}
              max={dataSetNumber}
              fieldProps={{precision: 0}}
              onChange={(e)=>{
                //console.log(e);
                setDatasetNumber(e);
              }}
            ></ProFormDigit>
            <ProFormSelect
              allowClear={false}
              label={"运行设备"}
              width={'200px'}
              name="deviceType"
              initialValue={'cpu'}
              onChange={(e)=>{
                //console.log(e);
                setDeviceType(e);
              }}
              options={[
                {label: 'cpu', value: 'cpu'},
                {label: 'cuda:0', value: 'cuda:0'},
              ]
              }/>
          </ProCard.TabPane>
        )}

        {props.evaMethod.indexOf('ROBUSTLY') !== -1 && (
          <ProCard.TabPane key="robust" tab="鲁棒性">
            <>
              <EditableProTable
                fieldProps = {{
                  name: 'robust'
                }}
                rowSelection={robustRowSelection}
                tableAlertRender={false}
                rowKey="categoryId"
                scroll={{
                  x: 960,
                }}
                formRef={formRef}
                actionRef={robustActionRef}
                headerTitle="方法配置"
                maxLength={5}
                // 关闭默认的新建按钮
                recordCreatorProps={false}
                columns={robustColumns}
                /*        request={async () => ({
                          data: defaultData,
                          total: 3,
                          success: true,
                        })}*/
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
                  const msg = await safeMethod(props.props.location.query.taskTypeId);
                  //console.log(msg);
                  const data =msg.data.methodList.map(item => {
                    item.categoryId += 10;
                    return item;
                  })
                  //console.log(data);
                  for(let item of data[0].methodList){
                    const configDetailed = await robustConfigDetailed(item.methodId, props.props.location.query.taskTypeId);
                    if(configDetailed.data !== null)
                      item.configDetailed = configDetailed.data.paramConfigList;
                    else
                      item.configDetailed = '无';
                    item.value = item.value.split("{").join("{\n");
                    item.value = item.value.split(",").join(",\n");
                    item.value = item.value.split("}").join("\n}");
                  }
                  for(let item of data[1].methodList){
                    const configDetailed = await robustConfigDetailed(item.methodId, props.props.location.query.taskTypeId);
                    if(configDetailed.data !== null)
                      item.configDetailed = configDetailed.data.paramConfigList;
                    else
                      item.configDetailed = '无';
                    item.value = item.value.split("{").join("{\n");
                    item.value = item.value.split(",").join(",\n");
                    item.value = item.value.split("}").join("\n}");
                  }
                  //console.log(data);
                  if(msg.code === '00000') {
                    return {
                      //data: msg.data.methodList,
                      data: data,
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
                /*onChange={setDataSource}*/
                editable={{
                  form: robustForm,
                  editableKeys: robustEditableKeys,
                  onChange: setRobustEditableRowKeys,
                  actionRender: (row, config, dom) => [dom.save, dom.cancel],
                }}
              />
              <ProFormDigit
                width={'200px'}
                label={"数据集评测数据量，最大为"+dataSetNumber.toString()}
                name="inputNumber"
                initialValue={1000}
                min={0}
                max={dataSetNumber}
                fieldProps={{precision: 0}}
                onChange={(e)=>{
                  //console.log(e);
                  setDatasetNumber(e);
                }}
              ></ProFormDigit>
              <ProFormSelect
                allowClear={false}
                label={"运行设备"}
                width={'200px'}
                name="deviceType"
                initialValue={'cpu'}
                onChange={(e)=>{
                  //console.log(e);
                  setDeviceType(e);
                }}
                options={[
                  {label: 'cpu', value: 'cpu'},
                  {label: 'cuda:0', value: 'cuda:0'},
                ]
                }/>
            </>
          </ProCard.TabPane>
        )}



        {props.evaMethod.indexOf('ADAPTABILITY') !== -1 && (
          <ProCard.TabPane key="adapt" tab="适应性">
            <>
              <EditableProTable
                fieldProps = {{
                  name: 'adapt'
                }}
                rowSelection={rowSelection}
                tableAlertRender={false}
                rowKey="categoryId"
                scroll={{
                  x: 960,
                }}
                actionRef={adaptActionRef}
                headerTitle="方法配置"
                maxLength={5}
                // 关闭默认的新建按钮
                recordCreatorProps={false}
                columns={adaptColumns}
                /*        request={async () => ({
                          data: defaultData,
                          total: 3,
                          success: true,
                        })}*/
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
                  /*                const msg = await safeMethod(props.props.location.query.taskTypeId);
                                  //console.log(msg);*/

                  const msg = await robustMethod(props.props.location.query.taskTypeId);
                  //console.log(msg);
                  const data =msg.data.methodList.map(item => {
                    item.categoryId += 100;
                    return item;
                  })
                  for(let item of data[0].methodList){
                    const configDetailed = await adaptConfigDetailed(item.methodId, props.props.location.query.taskTypeId);
                    item.configDetailed = configDetailed.data.paramConfigList;
                    item.value = item.value.split("{").join("{\n");
                    item.value = item.value.split(",").join(",\n");
                    item.value = item.value.split("}").join("\n}");
                  }
                  //console.log('hello');
                  //console.log(data);
                  if(msg.code === '00000') {
                    return {
                      data: data,
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

                /*              value={dataSource}
                              onChange={setDataSource}*/
                editable={{
                  form: adaptForm,
                  editableKeys: editableKeys,
                  onChange: setEditableRowKeys,
                  actionRender: (row, config, dom) => [dom.save, dom.cancel],
                }}
              />
              <ProFormDigit
                width={'200px'}
                label={"数据集评测数据量，最大为"+dataSetNumber.toString()}
                name="inputNumber"
                initialValue={1000}
                min={0}
                max={dataSetNumber}
                fieldProps={{precision: 0}}
                onChange={(e)=>{
                  //console.log(e);
                  setDatasetNumber(e);
                }}
              ></ProFormDigit>
              <ProFormSelect
                allowClear={false}
                label={"运行设备"}
                width={'200px'}
                name="deviceType"
                initialValue={'cpu'}
                onChange={(e)=>{
                  //console.log(e);
                  setDeviceType(e);
                }}
                options={[
                  {label: 'cpu', value: 'cpu'},
                  {label: 'cuda:0', value: 'cuda:0'},
                ]
                }/>
            </>
          </ProCard.TabPane>
        )}
        {props.evaMethod.indexOf('INTERPRET') !== -1 && (
          <ProCard.TabPane key={'interpret'} tab={'可解释性'}>
            <>
              <Form>

                {/*              <ProCard bordered bodyStyle={{backgroundColor: '#fafafa',}} size={'small'}>
                数据集选择：
              </ProCard>*/}
                {/*              <ProCard direction={"column"} size={'small'}>
              <ProCard direction={"row"} size={'small'}>
                <ProCard size={'small'}>
                <ProFormSelect
                  addonBefore={<Button name={"reload"} onClick={async () => {
                    const data = await interpretDatasetGet();
                    const dataset = data.data.xaiDataSetNames;
                    const newData = dataset.map(item => {
                      return {label: item, value: item};
                    })
                    setDataSet(newData);
                  }}><ReloadOutlined/></Button>}
                  name = {'dataset'}
                  width={'sm'}
                  fieldProps={{
                  onChange: (e)=>{
                    setDatasetSelect(e);
                    //console.log(e);
                  }}}
                  options={dataSet}/>
                </ProCard>
                <ProCard size={'small'}>
                <ProFormUploadButton
                  title={"请选择训练集与测试集文件"}
                  rules={[{ required: true }]}
                  name=" dataSetFile"
                  max={2}
                  accept={".csv"}
                  fieldProps={{beforeUpload: (file) => {
                      const isCsv = (file.name.split('.').reverse()[0] === 'csv');
                      //console.log(isCsv);
                      if (!isCsv) {
                        message.error(`${file.name}文件格式不正确`);
                        return false;
                      }
                      return false;
                    },
                    onChange:(info) => {
                        setDatasetFileList(info.fileList);
                    },
                    listType: "text",
                  }}
                >
                </ProFormUploadButton>
                  <Button onClick={async () => {
                    if(datasetFileList.length < 2){
                      message.error("请选择训练集与测试集文件后上传");
                      return false;
                    }
                    const datasetFiles = new FormData();
                    datasetFileList.map(item => {
                      //console.log(item.name.slice(-9));
                      if(item.name.length < 10){
                        message.error("文件命名不规范，请重新上传");
                        return false;
                      }
                      if(item.name.slice(-9) === '_test.csv'){
                        //console.log("test");
                        datasetFiles.append("test_dataset", item.originFileObj);
                      }
                      else if(item.name.slice(-10) === '_train.csv'){
                        //console.log("train");
                        datasetFiles.append("train_dataset", item.originFileObj);
                      }
                      else{
                        message.error("文件命名不规范，请重新上传");
                        return false;
                      }
                    })
                    const msg = await interpretDatasetUpload(datasetFiles);
                    //console.log(msg);
                    if(msg.code === '00000'){
                      message.success(msg.data);
                    }
                    else{
                      message.error(msg.message);
                    }
                  }}>上传</Button>
              </ProCard>

              </ProCard>

                <ProCard layout={"center"} size={'small'}>
                  <ul style={{marker: "initial"}}>
                    <li>若需要自行上传数据售，<strong>需将训练集与测试集均上传完成后再刷新数据集列表</strong>，其中训练集的命名格式为:<strong>数据集名称_train.csv</strong>，测试集的命名格式为:<strong>数据集名称_test.csv</strong>。</li>
                    <li>上传数据集后点击刷新按钮即可在已有数据集中进行选择。</li>
                    <li>确认数据集后，方可继续进行黑盒模型以及代理模型的选择。</li>
                  </ul>
                </ProCard>

              </ProCard>*/}

                <ProCard bordered bodyStyle={{backgroundColor: '#fafafa',}} size={'small'}>
                  代理模型类型：
                </ProCard>

                <Form form={xaiForm}>
                  <Form.Item>
                    <ProFormSelect
                      allowClear={false}
                      width={'200px'}
                      name="modelType"
                      //initialValue={'0'}
                      onChange={async (e)=>{
                        //console.log(modelName);
                        //console.log(e);
                        setProxyModelType(e);
                        if(e !== undefined){
                          setFirstProxy(null);
/*                          const values = {proxy_type_id: e,
                            blackbox_id: modelName.modelId};*/
                          //const msg = await interpretXaiGet(values);
/*                          //console.log(values);
                          const msg = await ProxyByBlackBox(values);
                          //console.log(msg);
                          const res = msg.data.map(item => {
                            return {label: item.modelName, value: [item.id, item.dataUrl].join(',')};
                          });
                          setFirstProxy(res);
                          //console.log(res);*/


                          /*                      xaiForm.setFields([
                                                  {
                                                    name: 'firstProxy',
                                                    value: null,
                                                  },
                                                ]);*/
                          xaiForm.setFieldValue('firstProxyIn', null);

                          //console.log(xaiForm.getFieldValue('users'));
                          try{
                            let len = xaiForm.getFieldValue('users').length;
                            for (let i = 0 ; i < len; i++){
                              xaiForm.setFields([
                                {
                                  name: ['users', i, 'proxy'],
                                  value: null,
                                },
                              ]);
                            }
                          }
                          catch{

                          };
                          //console.log(xaiForm.getFieldValue('firstProxyIn'))
                        }
                      }}
                      options={[
                        {label: '规则模型', value: '0'},
                        {label: '决策树模型', value: '1'},
                      ]
                      }/>
                  </Form.Item>

                  {/*              <ProCard bordered bodyStyle={{backgroundColor: '#fafafa',}} size={'small'} colSpan={24}>
                <ProCard colSpan={8}bodyStyle={{backgroundColor: '#fafafa',}} layout="left" size={'small'}>
                  黑盒模型上传：
                </ProCard>
                <ProCard colSpan={8} bodyStyle={{backgroundColor: '#fafafa',}} layout="left" size={'small'}>
                  代理模型上传：
                </ProCard>
                <ProCard colSpan={2} bodyStyle={{backgroundColor: '#fafafa',}} size={'small'}></ProCard >
              </ProCard>

              <ProCard size={'small'} colSpan={24}>
              <ProCard size={'small'} colSpan={8}>
                <ProFormUploadButton
                  name={"blackboxFile"}
                  rules={[{ required: true }]}
                  title={'请上传黑盒模型文件'}
                  //tooltip={'请上传黑盒模型文件'}
                  max={1}
                  accept={".pkl"}
                  fieldProps={{beforeUpload: (file) => {
                      const isPkl = (file.name.split('.').reverse()[0] === 'pkl');
                      //console.log(isPkl);
                      if (!isPkl) {
                        message.error(`${file.name}文件格式不正确`);
                        return false;
                      }
                      return false;
                    },
                    onChange: (info) => {
                      setBlackboxFileList(info.fileList);
                    },
                    listType: "text",
                  }}
                >
                </ProFormUploadButton>
                <Button onClick={async () => {
                  if(blackboxFileList.length < 1){
                    message.error("请选择黑盒模型文件后上传");
                    return false;
                  }
                  const blackboxFile = new FormData();
                  blackboxFile.append("blackbox", blackboxFileList[0].originFileObj)
                  const msg = await interpretBlackboxUpload(blackboxFile);
                  //console.log(msg);
                  if(msg.code === '00000'){
                    message.success(msg.data);
                  }
                  else{
                    message.error(msg.message);
                  }
                }}>上传</Button>
              </ProCard>
                <ProCard size={'small'} colSpan={8}>
                  <ProFormUploadButton
                    name={"proxyFile"}
                    rules={[{ required: true }]}
                    title={'请上传代理模型文件'}
                    //tooltip={'请上传代理模型文件'}
                    max={1}
                    accept={".txt"}
                    fieldProps={{beforeUpload: (file) => {
                        const isTxt = (file.name.split('.').reverse()[0] === 'txt');
                        //console.log(isTxt);
                        if (!isTxt) {
                          message.error(`${file.name}文件格式不正确`);
                          return Upload.LIST_IGNORE;
                        }
                        return true;
                      },
                      onChange: (info) => {
                        setProxyFileList(info.fileList);
                      },
                      listType: "text",
                    }}
                  >
                  </ProFormUploadButton>
                  <Button onClick={async () => {
                    if(proxyFileList.length < 1){
                      message.error("请选择代理模型文件后上传");
                      return false;
                    }
                    const proxyFile = new FormData();
                    proxyFile.append("proxy", proxyFileList[0].originFileObj);
                    proxyFile.append("proxy_type", proxyModelType);
                    const msg = await interpretProxyUpload(proxyFile);
                    //console.log(msg);
                    if(msg.code === '00000'){
                      message.success(msg.data);
                    }
                    else{
                      message.error(msg.message);
                    }
                  }}>上传</Button>
                </ProCard>
              </ProCard>*/}


                  <ProCard bordered bodyStyle={{backgroundColor: '#fafafa',}} size={'small'} colSpan={24}>
                    <ProCard colSpan={8}bodyStyle={{backgroundColor: '#fafafa',}} layout="left" size={'small'}>
                      黑盒模型选择：
                    </ProCard>
                    <ProCard colSpan={8} bodyStyle={{backgroundColor: '#fafafa',}} layout="left" size={'small'}>
                      代理模型选择：
                    </ProCard>
                    <ProCard colSpan={2} bodyStyle={{backgroundColor: '#fafafa',}} size={'small'}></ProCard >
                    <ProCard colSpan={6} bodyStyle={{backgroundColor: '#fafafa',}} layout="left" size={'small'}>
                      评估模型选择：
                    </ProCard>
                  </ProCard>

                  <ProCard colSpan={24} size={'small'}>
                    <ProCard split={'horizontal'} size={'small'}>

                      {/*                  <Form>*/}
                      <ProCard>
                        <ProCard colSpan={1} layout={'center'} size={'small'} bordered={false}>{"XAI0"}</ProCard>
                        <ProCard colSpan={8} layout={'left'} size={'small'}>
                          <Form.Item>

                            <ProFormSelect
                              //label={"XAI"+(name+1).toString()}
                              //options={[{label: props.modelName.modelName, value: [props.modelName.modelId, props.modelName.modelUrl].join(',') || undefined}]}
                              options={[{label: modelName.modelName, value: [modelName.modelId, modelName.modelUrl].join(',')}]}
                              style={{ width: '180px' }}
                              fieldProps={{value: [modelName.modelId, modelName.modelUrl].join(',')}}
                              disabled={true}
                              name={'firstBlackBox'}
                            >
                            </ProFormSelect>
                          </Form.Item>
                        </ProCard>

                        <ProCard colSpan={8} layout={'center'} size={'small'}>
                          <Form.Item name={'firstProxy'}>
                            <ProFormSelect
                              options={firstProxy}
                              //dependencies={['modelType']}
                              /*                        request={async () => {
                                                        ////console.log(xaiForm.getFieldValue('firstBlackBox'));
                                                        const values = {proxy_type_id: proxyModelType,
                                                          blackbox_id: modelName.modelId};
                                                        //const msg = await interpretXaiGet(values);
                                                        //console.log(values);
                                                        const msg = await ProxyByBlackBox(values);
                                                        //console.log(msg);
                                                        return msg.data.map(item => {
                                                          return {label: item.modelName, value: [item.id, item.dataUrl].join(',')};
                                                        });
                              /!*                          if(xaiForm.getFieldsValue(true).users[name].blackbox === undefined)
                                                        {
                                                          xaiForm.setFields([
                                                            {
                                                              name: ['users', name, 'proxy'],
                                                              value: null,
                                                            },
                                                          ]);
                                                          return null;
                                                        }*!/
                              /!*                          const values = {dataset: datasetSelect, type: "proxy", proxy_type: proxyModelType,
                                                          blackbox: xaiForm.getFieldsValue(true).users[name].blackbox};
                                                        //console.log(values.blackbox);
                                                        const msg = await interpretXaiGet(values);
                                                        //console.log(msg);
                                                        return msg.data.xaiModelNames.map(item => {
                                                          return {label: item, value: item};
                                                        });*!/
                                                      }}*/
                              //name={[name, 'proxy']}
                              name={'firstProxyIn'}
                              style={{ width: "200px" }}
                              addonAfter={<Button type={"small"} onClick={async () => {
                                //console.log(proxyModelType);
                                const values = {proxy_type_id: proxyModelType,
                                  blackbox_id: modelName.modelId};
                                if(proxyModelType !== undefined){
                                  const msg = await ProxyByBlackBox(values);
                                  //console.log(msg);
                                  const res = msg.data.map(item => {
                                    return {label: item.modelName, value: [item.id, item.dataUrl].join(',')};
                                  });
                                  setFirstProxy(res);
                                  //console.log(res);
                                }
                              }}
                              >
                                <ReloadOutlined/>
                              </Button>}
                            >
                            </ProFormSelect>
                          </Form.Item>
                        </ProCard>
                      </ProCard>
                      <ProCard split={"horizontal"}>
                        <Form.List name="users">
                          {(fields, { add, remove }) => {
                            //console.log(fields);
                            return (
                              <>
                                {fields.map(({ key, name, ...restField }) => (
                                  <ProCard colSpan={18} size={'small'}>
                                    <ProCard colSpan={1} layout={'center'} size={'small'}>{"XAI"+(name+1).toString()}</ProCard>
                                    <ProCard colSpan={7} layout={'default'} size={'small'}>
                                      <Form.Item name={[name, 'blackbox']}>
                                        <ProFormSelect
                                          //label={"XAI"+(name+1).toString()}
                                          fieldProps={{onChange: () => {
                                              xaiForm.setFields([
                                                {
                                                  name: ['users', name, 'proxy'],
                                                  value: null,
                                                },
                                              ]);
                                            }}}
                                          options={blackboxList}
                                          /*                                  options={[{
                                                                              label: 'breakfast', value: 1,
                                                                            },{
                                                                              label: 'rice', value: 2,
                                                                            }]}*/
                                          style={{ width: "180px" }}
                                          addonAfter={<Button type={"small"} onClick={async () => {
                                            //console.log(xaiForm.getFieldsValue("users"));
                                            /*                                    if(datasetSelect === undefined)
                                                                                {
                                                                                  message.error("请先选择数据集");
                                                                                  return null;
                                                                                }*/
                                            const values = {dataset: datasetSelect, type: "blackbox"};
                                            //const msg = await interpretXaiGet(values);
                                            const msg = await BlackBoxByDataSet(props.params);
                                            //console.log(msg);
                                            const blackbox = msg.data.map(item => {
                                              return {label: item.modelName, value: [item.id, item.dataUrl].join(',')};
                                            });
                                            /*                                    const blackbox = msg.data.xaiModelNames.map(item => {
                                                                                  return {label: item, value: item};
                                                                                });*/
                                            setBlackboxList(blackbox);
                                          }}
                                          >
                                            <ReloadOutlined/>
                                          </Button>}>
                                        </ProFormSelect>
                                      </Form.Item>

                                    </ProCard>
                                    <ProCard colSpan={9} layout={'center'} size={'small'}>
                                      <ProFormSelect
                                        //options={proxyList}
                                        dependencies={["users", name, 'blackbox', "modelType"]}
                                        fieldProps={{onChange: () => {
                                          }}}
                                        request={async () => {
                                          //console.log(name);
                                          if(xaiForm.getFieldsValue(true).users[name].blackbox === undefined)
                                          {
                                            xaiForm.setFields([
                                              {
                                                name: ['users', name, 'proxy'],
                                                value: null,
                                              },
                                            ]);
                                            return null;
                                          }
                                          //console.log(xaiForm.getFieldsValue(true).users[name].blackbox);
                                          /*                                    const values = {dataset: datasetSelect, type: "proxy", proxy_type: proxyModelType,
                                                                                blackbox: xaiForm.getFieldsValue(true).users[name].blackbox};
                                                                              //console.log(values.blackbox);*/
                                          const values = {proxy_type_id: proxyModelType,
                                            blackbox_id: xaiForm.getFieldsValue(true).users[name].blackbox.split(',')[0]};
                                          //const msg = await interpretXaiGet(values);
                                          //console.log(values);
                                          const msg = await ProxyByBlackBox(values);
                                          //console.log(msg);
                                          return msg.data.map(item => {
                                            return {label: item.modelName, value: [item.id, item.dataUrl].join(',')};
                                          });
                                          /*                                    return msg.data.xaiModelNames.map(item => {
                                                                                return {label: item, value: item};
                                                                              });*/
                                        }}
                                        name={[name, 'proxy']}
                                        style={{ width: "200px" }}
                                        /*                                  addonAfter={<Button type={"default"} onClick={async () => {
                                                                            const black = xaiForm.getFieldsValue(true);
                                                                            //console.log(black);
                                                                            const values = {dataset: datasetSelect, type: "proxy", proxy_type: proxyModelType, blackbox: ''};
                                                                            //console.log(values.blackbox);
                                                                          }}
                                                                          >
                                                                            代理刷新
                                                                          </Button>}*/
                                      >
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
                                      <Button type="primary" onClick={() => {
                                        if(fields.length !== 0)
                                          remove(fields.at(-1).name);
                                      }} icon={<MinusOutlined />}>
                                        删除
                                      </Button>
                                    </Space>
                                  </Form.Item>
                                </ProCard>
                              </>
                            );}}
                        </Form.List>
                      </ProCard>
                      {/*                  </Form>*/}
                    </ProCard>
                    <ProCard colSpan={6} layout="left" size={'small'}>

                      <Form.Item>
                        <ProFormSelect
                          name = 'evaModelType'
                          placeholder={'请选择评估模型类型'}
                          dependencies={['modelType']}
                          fieldProps={{onChange: (e)=> {
                              setEvaModelType(e);
                              setEvaModelConfig(evaModelAllConfig[e]);
                            }}}
                          request = {async () => {
                            //console.log(proxyModelType)
                            if(proxyModelType === undefined){
                              form.setFieldValue('evaModelType', null);
                              return null;
                            }
                            let proxyModel;
                            if(proxyModelType === '0')
                              proxyModel = 'rule';
                            else
                              proxyModel = 'tree';
                            const msg = await interpretMethod(proxyModel,3).catch((error) => {
                              //console.log('error');
                            });
                            //console.log(msg.data);
                            const allConfig = {};
                            const allConfigImg = {};
                            msg.data.map(item => {
                              allConfig[item.interpretMethod + ',' + item.id.toString()] = item.config;
                              allConfigImg[item.interpretMethod + ',' + item.id.toString()] = item.imageUrl;
                            });
                            setEvaModelAllConfig(allConfig);
                            setEvaModelAllConfigImage(allConfigImg);
                            return msg.data.map(function (item){
                              //console.log(JSON.parse(item.config));
                              return {label: item.displayName, value: item.interpretMethod + ',' + item.id.toString()}
                            })}}
                        />
                      </Form.Item>
                    </ProCard>
                  </ProCard>
                </Form>



                <ProCard bordered bodyStyle={{backgroundColor: '#fafafa',}} size={'small'}>
                  评估模型参数设置：
                </ProCard>
                <ProCard size={'small'}>
                  <ModalForm
                    title="评估模型参数配置"
                    modalProps={{
                      destroyOnClose: true
                    }}
                    //name={item.value}
                    trigger={<a onClick={()=> {
                      //console.log(evaModelType);
                      //console.log(evaModelAllConfig[evaModelType]);
                    }}>参数配置</a>}
                    onFinish={async (values) => {
                      //console.log('value:',values);
                      setEvaModelConfig(values.config);
                      //console.log(evaModelConfig);
                      //message.success(evaluationConfig[0]);
                      return true;
                    }}
                  >
                    <Form.Item label={
                      <ModalForm<{
                        name: string;
                        company: string;
                      }>
                        trigger={
                          <Link>
                            配置图示
                          </Link>
                        }
                        autoFocusFirstInput
                        modalProps={{
                          destroyOnClose: true,
                        }}
                        submitter={false}
                      >
                        <Image src={evaModelAllConfigImage[evaModelType]}></Image>
                        {/*              <ProFormText width="sm" name="id" label="主合同编号" />
              <ProFormText name="project" disabled label="项目名称" initialValue="xxxx项目" />
              <ProFormText width="xs" name="mangerName" disabled label="商务经理" initialValue="启途" />*/}
                      </ModalForm>
                    }labelCol={{span: 3, offset: 22}}>

                      <ProFormTextArea
                        name = 'config'
                        dependencies={["evaModelType"]}
                        initialValue={evaModelAllConfig[evaModelType]}
                        fieldProps={{/*value: evaModelAllConfig[evaModelType],*/
                          autoSize: true}}
                      />
                    </Form.Item>
                  </ModalForm>
                </ProCard>
              </Form>
            </>
          </ProCard.TabPane>
        )}
      </ProCard>

    </>
  );
});

