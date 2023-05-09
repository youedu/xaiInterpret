import {
  ProFormSelect,
  ProFormCheckbox,
  EditableProTable,
  ProCard,
  ModalForm,
  ProFormTextArea,
  ProFormText,
  ProFormUploadButton, ProFormDigitRange, ProFormDigit,
  ProForm
} from '@ant-design/pro-components';
import type {ProColumns, ProFormInstance} from '@ant-design/pro-components';
import {Input, Form, message, Space, Button, Upload, Image, Col, Row, Checkbox, Card} from 'antd';
import React, {useRef, useState, forwardRef, useImperativeHandle, Key, useEffect} from 'react';
import type {TableRowSelection} from 'antd/es/table/interface';
import {ReloadOutlined} from '@ant-design/icons';
import styles from "./index.less"

import {
  interpretMethod,
  robustMethod,
  safeMethod,
  interpretImgMethod,
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
}> = ({value, onChange}) => {
  const {evaConfig, setEvaConfig} = useModel('config', (ret) => ({
    evaConfig: ret.evaluationConfig,
    setEvaConfig: ret.setEvaluationConfig,
  }));
  //console.log(value);

  return <ProFormCheckbox.Group
    disabled={true}
    layout={"vertical"}
    style={{width: '100%'}}
    fieldProps={{
      name: 'adaptConfig' + value?.length.toString()
    }}
  >
    {(value || []).map((item) =>
      [<Row>
        <Col>
          <Checkbox
            style={{width: '100%'}}
            name={item.label}
            onChange={(e) => {
              console.log('e:', e);
              if (e.target.checked === true) {
                if (evaConfig[e.target.value] === undefined) {
                  if (evaConfig[item.methodName] === undefined) {

                    let value = item.value;
                    value = JSON.parse(value);
                    value.method_name = item.methodName;
                    value = JSON.stringify(value);
                    console.log(value);

                    evaConfig[e.target.value] = true;
                    evaConfig[item.methodName] = value;
                    setEvaConfig(evaConfig);
                    //console.log(evaConfig);
                  } else {
                    const newConfig = evaConfig;
                    newConfig[e.target.value] = true;
                    setEvaConfig(newConfig);
                  }
                } else {
                  evaConfig[e.target.value] = true;
                  console.log(evaConfig);
                  setEvaConfig(evaConfig);
                }
              }
              if (e.target.checked === false) {
                delete evaConfig[e.target.value];
                delete evaConfig[item.methodName];
                setEvaConfig(evaConfig);
                //console.log(evaConfig);
              }
            }}
            /*        addonAfter={

                    }*/
            value={item.methodName + '.' + item.methodId}
            /*        fieldProps={{
                      value: item.methodName + '.' + item.methodId,
                      onChange: {(e) => {
                      console.log('e:', e);
                      if (e.target.checked === true) {
                      evaConfig[e.target.value] = true;
                      evaConfig[item.methodName] = item.value;
                      setEvaConfig(evaConfig);
                      //console.log(evaConfig);
                    }
                      if (e.target.checked === false) {
                      delete evaConfig[e.target.value];
                      delete evaConfig[item.methodName];
                      setEvaConfig(evaConfig);
                      //console.log(evaConfig);
                    }
                    }}
                    }}*/
          >{item.displayName}</Checkbox></Col>
        <Col>
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
            }>参数配置</a>}
            submitter={{
              searchConfig: {
                submitText: '确认',
                resetText: false,
              },
            }}
            fieldProps={{destroyOnClose: true}}
            onFinish={async (values) => {
              try {
                console.log(values);
                if (values[item.methodName] === undefined)
                  return true;
                if (typeof JSON.parse(values[item.methodName]) === 'object' && values[item.methodName]) {
                  //console.log('value:',values);
                  let value = values[item.methodName];
                  value = JSON.parse(value);
                  value.method_name = item.methodName;
                  value = JSON.stringify(value);
                  values[item.methodName] = value;
                  console.log(value);
                  evaConfig[item.methodName] = values[item.methodName];
                  setEvaConfig(evaConfig);
                  //console.log(evaConfig);
                  //message.success(evaluationConfig[0]);
                  return true;
                }
                return true;
              } catch {
                //console.log(values[item.methodName]);
                message.error('参数配置格式不正确');
                return false;
              }
              ;
            }}
          >
            <Form.Item>
              <ProFormTextArea
                name={item.methodName}
                fieldProps={{defaultValue: item.value, autoSize: true}}
              />
            </Form.Item>
            <ProFormTextArea
              fieldProps={{value: item.configDetailed, bordered: false, readOnly: true, autoSize: true}}/>
          </ModalForm>
        </Col>
      </Row>])}
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
}> = ({value, onChange}) => {
  const {robustEvaluationConfig, setRobustEvaluationConfig} = useModel('robustConfig', (ret) => ({
    robustEvaluationConfig: ret.robustEvaluationConfig,
    setRobustEvaluationConfig: ret.setRobustEvaluationConfig,
  }));

  return <div style={{textAlign: 'center'}}>
    <ProFormCheckbox.Group
      disabled={true}
      layout={"vertical"}
      fieldProps={{
        name: 'robustConfig' + value?.length.toString()
      }}
    >
      {(value || []).map((item) =>
        [<Row>
          <Col>
            <Checkbox
              name={item.label}
              value={item.methodName + '.' + item.methodId}
              onChange={
                (e) => {
                  console.log('e:', e);
                  if (e.target.checked === true) {
                    if (robustEvaluationConfig[e.target.value] === undefined) {
                      if (robustEvaluationConfig[item.methodName] === undefined) {
                        let value = item.value;
                        value = JSON.parse(value);
                        value.method_name = item.methodName;
                        value = JSON.stringify(value);
                        console.log(value);

                        const newConfig = robustEvaluationConfig;
                        newConfig[e.target.value] = true;
                        newConfig[item.methodName] = value;
                        setRobustEvaluationConfig(newConfig);
                      } else {
                        const newConfig = robustEvaluationConfig;
                        newConfig[e.target.value] = true;
                        setRobustEvaluationConfig(newConfig);
                      }
                    } else {
                      robustEvaluationConfig[e.target.value] = true;
                      console.log(robustEvaluationConfig);
                      setRobustEvaluationConfig(robustEvaluationConfig);
                    }

                    /*              robustEvaluationConfig[e.target.value] = true;
                                  robustEvaluationConfig[item.methodName] = item.value;
                                  setRobustEvaluationConfig(robustEvaluationConfig);*/

                    //console.log(robustEvaluationConfig);
                  }
                  if (e.target.checked === false) {
                    robustEvaluationConfig[e.target.value] = false;
                    //delete robustEvaluationConfig[item.methodName];
                    console.log(robustEvaluationConfig);
                    setRobustEvaluationConfig(robustEvaluationConfig);
                    //console.log(robustEvaluationConfig);
                  }
                }
              }
              /*        fieldProps={{
                        value: item.methodName + '.' + item.methodId,
                        onChange: (e) => {
                          //console.log('e:', e);
                          if (e.target.checked === true) {
                            const newConfig = robustEvaluationConfig;
                            newConfig[e.target.value] = true;
                            newConfig[item.methodName] = item.value;
                            setRobustEvaluationConfig(newConfig);
                            /!*              robustEvaluationConfig[e.target.value] = true;
                                          robustEvaluationConfig[item.methodName] = item.value;
                                          setRobustEvaluationConfig(robustEvaluationConfig);*!/

                            //console.log(robustEvaluationConfig);
                          }
                          if (e.target.checked === false) {
                            delete robustEvaluationConfig[e.target.value];
                            delete robustEvaluationConfig[item.methodName];
                            setRobustEvaluationConfig(robustEvaluationConfig);
                            //console.log(robustEvaluationConfig);
                          }
                        }
                      }}*/
              /*addonAfter={
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
                    try {
                      if (values[item.methodName] === undefined)
                        return true;
                      if (typeof JSON.parse(values[item.methodName]) == 'object' && values[item.methodName]) {
                        //console.log('value:',values);
                        robustEvaluationConfig[item.methodName] = values[item.methodName];
                        setRobustEvaluationConfig(robustEvaluationConfig);
                        //console.log(robustEvaluationConfig);
                        //message.success(evaluationConfig[0]);
                        return true;
                      }
                    } catch {
                      //console.log(values[item.methodName]);
                      message.error('参数配置格式不正确');
                      return false;
                    }

                    /!*              //console.log('value:',values);
                                  robustEvaluationConfig[item.methodName] = values[item.methodName];
                                  setRobustEvaluationConfig(robustEvaluationConfig);
                                  //console.log(robustEvaluationConfig);
                                  //message.success(evaluationConfig[0]);
                                  return true;*!/
                  }}
                >
                  <Form.Item>
                    <ProFormTextArea
                      name={item.methodName}
                      fieldProps={{defaultValue: item.value, autoSize: true}}
                    />
                    <ProFormTextArea
                      fieldProps={{value: item.configDetailed, bordered: false, readOnly: true, autoSize: true}}/>
                  </Form.Item>
                </ModalForm>
              }*/
            >{item.displayName}</Checkbox>
          </Col>
          <Col>
            <ModalForm
              title="参数配置"
              //name={item.value}
              trigger={<a>参数配置</a>}
              fieldProps={{destroyOnClose: true}}
              submitter={{
                searchConfig: {
                  submitText: '确认',
                  resetText: false,
                },
              }}
              onFinish={async (values) => {
                try {
                  if (values[item.methodName] === undefined)
                    return true;
                  if (typeof JSON.parse(values[item.methodName]) == 'object' && values[item.methodName]) {
                    //console.log('value:',values);

                    let value = values[item.methodName];
                    value = JSON.parse(value);
                    value.method_name = item.methodName;
                    value = JSON.stringify(value);
                    values[item.methodName] = value;
                    console.log(value);

                    robustEvaluationConfig[item.methodName] = values[item.methodName];
                    console.log(robustEvaluationConfig);
                    setRobustEvaluationConfig(robustEvaluationConfig);
                    //console.log(robustEvaluationConfig);
                    //message.success(evaluationConfig[0]);
                    return true;
                  }
                } catch {
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
                <ProFormTextArea
                  fieldProps={{value: item.configDetailed, bordered: false, readOnly: true, autoSize: true}}/>
              </Form.Item>
            </ModalForm>
          </Col>
        </Row>
        ])}
    </ProFormCheckbox.Group>
  </div>
    ;
};

//可解释性编辑配置组件项
const InterpretTagList: React.FC<{
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
}> = ({value, onChange}) => {

  const {interpretEvaluationConfig, setInterpretEvaluationConfig} = useModel('interpretConfig', (ret) => ({
    interpretEvaluationConfig: ret.interpretEvaluationConfig,
    setInterpretEvaluationConfig: ret.setInterpretEvaluationConfig,
  }));
  //console.log(value);

  return <ProFormCheckbox.Group
    disabled={true}
    layout={"vertical"}
    style={{width: '100%'}}
    fieldProps={{
      name: 'interpretConfig' + value?.length.toString()
    }}
  >
    {(value || []).map((item) =>
      [<Row>
        <Col>
          <Checkbox
            style={{width: '100%'}}
            name={item.label}
            onChange={(e) => {
              console.log('e:', e);
              if (e.target.checked === true) {
                if (interpretEvaluationConfig[e.target.value] === undefined) {
                  if (interpretEvaluationConfig[item.methodName] === undefined) {

/*                    let value = item.value;
                    console.log(value);
                    value = JSON.parse(value);
                    value.method_name = item.methodName;
                    value = JSON.stringify(value);
                    console.log(value);*/

                    interpretEvaluationConfig[e.target.value] = true;
                    interpretEvaluationConfig[item.methodName] = item.value;
                    setInterpretEvaluationConfig(interpretEvaluationConfig);
                    //console.log(evaConfig);
                  } else {
                    const newConfig = interpretEvaluationConfig;
                    newConfig[e.target.value] = true;
                    setInterpretEvaluationConfig(newConfig);
                  }
                } else {
                  interpretEvaluationConfig[e.target.value] = true;
                  console.log(interpretEvaluationConfig);
                  setInterpretEvaluationConfig(interpretEvaluationConfig);
                }
              }
              if (e.target.checked === false) {
                delete interpretEvaluationConfig[e.target.value];
                delete interpretEvaluationConfig[item.methodName];
                setInterpretEvaluationConfig(interpretEvaluationConfig);
                //console.log(evaConfig);
              }
            }}
            /*        addonAfter={

                    }*/
            value={item.methodName + '.' + item.methodId}
            /*        fieldProps={{
                      value: item.methodName + '.' + item.methodId,
                      onChange: {(e) => {
                      console.log('e:', e);
                      if (e.target.checked === true) {
                      evaConfig[e.target.value] = true;
                      evaConfig[item.methodName] = item.value;
                      setEvaConfig(evaConfig);
                      //console.log(evaConfig);
                    }
                      if (e.target.checked === false) {
                      delete evaConfig[e.target.value];
                      delete evaConfig[item.methodName];
                      setEvaConfig(evaConfig);
                      //console.log(evaConfig);
                    }
                    }}
                    }}*/
          >{item.displayName}</Checkbox></Col>
        <Col>
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
            }>参数配置</a>}
            submitter={{
              searchConfig: {
                submitText: '确认',
                resetText: false,
              },
            }}
            fieldProps={{destroyOnClose: true}}
            onFinish={async (values) => {
              try {
                console.log(values);
                if (values[item.methodName] === undefined)
                  return true;
                if (typeof JSON.parse(values[item.methodName]) === 'object' && values[item.methodName]) {
                  //console.log('value:',values);
                  let value = values[item.methodName];
                  value = JSON.parse(value);
                  value.method_name = item.methodName;
                  value = JSON.stringify(value);
                  values[item.methodName] = value;
                  console.log(value);
                  interpretEvaluationConfig[item.methodName] = values[item.methodName];
                  setInterpretEvaluationConfig(interpretEvaluationConfig);
                  //console.log(evaConfig);
                  //message.success(evaluationConfig[0]);
                  return true;
                }
                return true;
              } catch {
                //console.log(values[item.methodName]);
                message.error('参数配置格式不正确');
                return false;
              }
              ;
            }}
          >
            <Form.Item>
              <ProFormTextArea
                name={item.methodName}
                fieldProps={{defaultValue: item.value, autoSize: true}}
              />
            </Form.Item>
            <ProFormTextArea
              placeholder={''}
              fieldProps={{value: item.configDetailed, bordered: false, readOnly: true, autoSize: true}}/>
          </ModalForm>
        </Col>
      </Row>])}
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
//适应性列
const adaptColumns: ProColumns[] = [
  /*  {
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
      width: '35%',
      editable: false,
    },*/
  {
    title: '扰动方法',
    dataIndex: 'methodList',
    width: '60%',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
    renderFormItem: (row, {isEditable}) => {
      return <TagList/>;//isEditable ? <TagList /> : <Input />;
    },
    /*    render: (_, row) => {
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
        },*/
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
    width: '35%',
    editable: false,
  },
  {
    title: '攻击方法',
    dataIndex: 'methodList',
    width: '60%',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
    renderFormItem: (row, {isEditable}) => {
      return (<RobustTagList/>);
    },
    /*    render: (_, row) => {
          return <ProFormCheckbox.Group
            disabled={true}
            layout={"vertical"}
            fieldProps={{
              name: "robust" + row.categoryId.toString(),
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
        },*/
  },
];

//可解释性性列
const interpretColumns: ProColumns[] = [
  {
    title: '可解释性方法',
    dataIndex: 'methodList',
    width: '60%',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
    renderFormItem: (row, {isEditable}) => {
      return <InterpretTagList/>;//isEditable ? <TagList /> : <Input />;
    },
    /*    render: (_, row) => {
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
        },*/
  },
];


export default forwardRef((props, ref, params: any) => {
  console.log(props, params);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  const getWindowInfo = () => {
    setScreenWidth(window.innerWidth);
    setScreenHeight(window.innerHeight);
  };
  const debounce = (fn, delay) => {
    let timer;
    return function() {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn();
      }, delay);
    }
  };
  const cancelDebounce = debounce(getWindowInfo, 500);

  window.addEventListener('resize', cancelDebounce);


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

  //选择可解释性行
  const [interpretEditableKeys, setInterpretEditableRowKeys] = useState<React.Key[]>([]);
  const [interpretSelectedRowKeys, setInterpretSelectedRowKeys] = useState<React.Key[]>([]);

  const onInterpretSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setInterpretEditableRowKeys(newSelectedRowKeys);
    //console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setInterpretSelectedRowKeys(newSelectedRowKeys);
  };

  const interpretRowSelection: TableRowSelection<TableListItem> = {
    selectedRowKeys: interpretSelectedRowKeys,
    onChange: onInterpretSelectChange,
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

  //可解释性选择内容
  const {interpretEvaluationConfig, setInterpretEvaluationConfig} = useModel('interpretConfig', (ret) => ({
    interpretEvaluationConfig: ret.interpretEvaluationConfig,
    setInterpretEvaluationConfig: ret.setInterpretEvaluationConfig,
  }));


  //可解释性选择图片
  const [interpretImg, setInterpretImg] = useState([]);


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
  const [xaiForm] = Form.useForm();

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
  const interpretActionRef = useRef<ActionType>();

  const formRef = useRef<ProFormInstance>();

  const [robustForm] = Form.useForm();
  const [adaptForm] = Form.useForm();
  const [interpretForm] = Form.useForm();

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
      if (props.evaMethod.indexOf('INTERPRET') !== -1)
        return tableType;
      return type;
    },
    AccConfig: () => {
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
      console.log('robustConfig', robustEvaluationConfig);
      return robustEvaluationConfig;
    },
    interpretConfig: () => {
      console.log('interpretConfig', interpretEvaluationConfig);
      return [interpretEvaluationConfig, interpretImg];
    },
/*    interpretConfig: () => {
      //console.log(evaModelType);
      const values = {};
      values.dataSetId = props.params;
      values.evaModel = evaModelType.split(',')[0];
      values.evaModelConfig = evaModelConfig;
      values.evaModelId = Number(evaModelType.split(',')[1]);
      if (proxyModelType === '0')
        values.proxyType = 'rule';
      else if (proxyModelType === '1')
        values.proxyType = 'tree';
      values.taskName = '表格数据分类';
      values.taskTypeId = props.props.location.query.taskTypeId;
      values.blackBoxAndProxyModelIdConfigList = [];
      //console.log(xaiForm.getFieldsValue().users);
      if (xaiForm.getFieldsValue().users !== undefined) {
        try {
          if (xaiForm.getFieldsValue().users.length !== 0) {
            values.blackBoxAndProxyModelIdConfigList = xaiForm.getFieldsValue().users.map(item => {
                return {
                  "blackBoxModelId": Number(item.blackbox.split(',')[0]),
                  "blackBoxModelUrl": item.blackbox.split(',')[1],
                  "proxyModelId": Number(item.proxy.split(',')[0]),
                  "proxyModelUrl": item.proxy.split(',')[1],
                };
              }
            );
          }
        } catch {
          message.error('请选择黑盒模型与代理模型');
          return false;
        }
      }
      ////console.log(xaiForm.getFieldValue());
      try {
        let pMI = xaiForm.getFieldValue('firstProxy').split(',')[0];
        //console.log(typeof (pMI));
        values.blackBoxAndProxyModelIdConfigList.push({
          "blackBoxModelId": modelName.modelId,
          "blackBoxModelUrl": modelName.modelUrl,
          "proxyModelId": Number(pMI),
          "proxyModelUrl": xaiForm.getFieldValue('firstProxy').split(',')[1],
        })
      } catch {

      }

      /!*      const values = {};
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
            );*!/
      //console.log(values);
      return values;
    }*/
  }));

  return (
    <>
      <ProCard
        tabs={{
          type: 'card',
          centered: true,
          onChange: event => {
            console.log(event);
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
            <ProCard>
              <ProForm submitter={false}>
                <ProFormCheckbox.Group
                  label={<div style={{
                    fontSize: '18px',
                    height: '30px',
                    fontWeight: 'normal',
                    lineHeight: '30px',
                    //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                    width: 'auto',
                    //position: 'absolute',
                    left: "0"
                  }}>测评指标选择</div>}
                  fieldProps={{
                    onChange: (event) => {
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
                  label={<div style={{
                    fontSize: '18px',
                    height: '30px',
                    fontWeight: 'normal',
                    lineHeight: '30px',
                    //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                    width: 'auto',
                    //position: 'absolute',
                    //left: "0"
                  }}>数据集评测数量</div>}
                  tooltip={"最大可选数量为当前数据集的数据总量" + dataSetNumber.toString()}
                  name="inputNumber"
                  initialValue={100}
                  min={0}
                  max={dataSetNumber}
                  fieldProps={{precision: 0}}
                  onChange={(e) => {
                    //console.log(e);
                    setDatasetNumber(e);
                  }}
                ></ProFormDigit>
                <ProFormSelect
                  allowClear={false}
                  label={<div style={{
                    fontSize: '18px',
                    height: '30px',
                    fontWeight: 'normal',
                    lineHeight: '30px',
                    //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                    width: 'auto',
                    //position: 'absolute',
                    //left: "0"
                  }}>运行设备</div>}
                  tooltip={"可选运行设备为cpu与gpu"}
                  width={'200px'}
                  name="deviceType"
                  initialValue={'cpu'}
                  onChange={(e) => {
                    //console.log(e);
                    setDeviceType(e);
                  }}
                  options={[
                    {label: 'cpu', value: 'cpu'},
                    {label: 'cuda:0', value: 'cuda:0'},
                  ]
                  }/>

              </ProForm>
            </ProCard>

          </ProCard.TabPane>
        )}

        {props.evaMethod.indexOf('ROBUSTLY') !== -1 && (
          <ProCard.TabPane key="robust" tab="鲁棒性">
            <ProCard split={"horizontal"}>
              <ProCard>
                <EditableProTable
                  className={styles.antTableTbody}
                  fieldProps={{
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
                  headerTitle={<div style={{
                    fontSize: '18px',
                    height: '30px',
                    fontWeight: 'normal',
                    lineHeight: '30px',
                    //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                    width: '100%',
                    position: 'absolute',
                    left: "0"
                  }}>攻击方法选择及配置</div>}
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
                    const data = msg.data.methodList.map(item => {
                      item.categoryId += 10;
                      return item;
                    })
                    //console.log(data);
                    for (let item of data[0].methodList) {
                      const configDetailed = await robustConfigDetailed(item.methodId, props.props.location.query.taskTypeId);
                      if (configDetailed.data !== null)
                        item.configDetailed = configDetailed.data.paramConfigList;
                      else
                        item.configDetailed = '无';
                      console.log(JSON.parse(item.value));
                      item.value = JSON.parse(item.value);
                      console.log(item.value);
                      delete item.value.method_name;
                      item.value = JSON.stringify(item.value);
                      item.value = item.value.split("{").join("{\n\t");
                      item.value = item.value.split(",").join(",\n\t");
                      item.value = item.value.split("}").join("\n}");
                    }
                    for (let item of data[1].methodList) {
                      const configDetailed = await robustConfigDetailed(item.methodId, props.props.location.query.taskTypeId);
                      if (configDetailed.data !== null)
                        item.configDetailed = configDetailed.data.paramConfigList;
                      else
                        item.configDetailed = '无';
                      console.log(item.value);
                      item.value = JSON.parse(item.value);
                      console.log(item.value);
                      delete item.value.method_name;
                      item.value = JSON.stringify(item.value);
                      item.value = item.value.split("{").join("{\n\t");
                      item.value = item.value.split(",").join(",\n\t");
                      item.value = item.value.split("}").join("\n}");
                    }
                    console.log(data);
                    if (msg.code === '00000') {
                      return {
                        //data: msg.data.methodList,
                        data: data,
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
                  /*onChange={setDataSource}*/
                  editable={{
                    form: robustForm,
                    editableKeys: robustEditableKeys,
                    onChange: setRobustEditableRowKeys,
                    actionRender: (row, config, dom) => [dom.save, dom.cancel],
                  }}
                />
              </ProCard>
              <ProCard>
                <ProForm submitter={false}>
                  <ProFormDigit
                    width={'200px'}
                    label={<div style={{
                      fontSize: '18px',
                      height: '30px',
                      fontWeight: 'normal',
                      lineHeight: '30px',
                      //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                      width: 'auto',
                      //position: 'absolute',
                      //left: "0"
                    }}>数据集评测数量</div>}
                    tooltip={"最大可选数量为当前数据集的数据总量，为" + dataSetNumber.toString()}
                    name="inputNumber"
                    initialValue={100}
                    min={0}
                    max={dataSetNumber}
                    fieldProps={{precision: 0}}
                    onChange={(e) => {
                      //console.log(e);
                      setDatasetNumber(e);
                    }}
                  />
                  <ProFormSelect
                    allowClear={false}
                    label={<div style={{
                      fontSize: '18px',
                      height: '30px',
                      fontWeight: 'normal',
                      lineHeight: '30px',
                      //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                      width: 'auto',
                      //position: 'absolute',
                      //left: "0"
                    }}>运行设备</div>}
                    tooltip={"可选运行设备为cpu与gpu"}
                    width={'200px'}
                    name="deviceType"
                    initialValue={'cpu'}
                    onChange={(e) => {
                      //console.log(e);
                      setDeviceType(e);
                    }}
                    options={[
                      {label: 'cpu', value: 'cpu'},
                      {label: 'cuda:0', value: 'cuda:0'},
                    ]
                    }/>
                </ProForm>
              </ProCard>
            </ProCard>
          </ProCard.TabPane>
        )}

        {/*适应性栏*/}
        {props.evaMethod.indexOf('ADAPTABILITY') !== -1 && (
          <ProCard.TabPane key="adapt" tab="适应性">
            <Row>
              <ProCard>
                <EditableProTable
                  fieldProps={{
                    name: 'adapt'
                  }}
                  rowSelection={rowSelection}
                  tableAlertRender={false}
                  rowKey="categoryId"
                  scroll={{
                    x: 960,
                  }}
                  actionRef={adaptActionRef}
                  headerTitle={<div style={{
                    fontSize: '18px',
                    height: '30px',
                    fontWeight: 'normal',
                    lineHeight: '30px',
                    //backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
                    width: '100%',
                    position: 'absolute',
                    left: "0"
                  }}>扰动方法选择及配置</div>}
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
                    const data = msg.data.methodList.map(item => {
                      item.categoryId += 100;
                      return item;
                    })
                    for (let item of data[0].methodList) {
                      const configDetailed = await adaptConfigDetailed(item.methodId, props.props.location.query.taskTypeId);
                      item.configDetailed = configDetailed.data.paramConfigList;

                      console.log(JSON.parse(item.value));
                      item.value = JSON.parse(item.value);
                      console.log(item.value);
                      delete item.value.method_name;
                      item.value = JSON.stringify(item.value);

                      item.value = item.value.split("{").join("{\n\t");
                      item.value = item.value.split(",").join(",\n\t");
                      item.value = item.value.split("}").join("\n}");
                    }
                    //console.log('hello');
                    //console.log(data);
                    if (msg.code === '00000') {
                      return {
                        data: data,
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

                  /*              value={dataSource}
                                onChange={setDataSource}*/
                  editable={{
                    form: adaptForm,
                    editableKeys: editableKeys,
                    onChange: setEditableRowKeys,
                    actionRender: (row, config, dom) => [dom.save, dom.cancel],
                  }}
                />
              </ProCard>
              <ProCard>
                <ProForm submitter={false}></ProForm>
                <ProFormDigit
                  width={'200px'}
                  label={<div style={{
                    fontSize: '18px',
                    height: '30px',
                    fontWeight: 'normal',
                    lineHeight: '30px',
                    //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                    width: 'auto',
                    //position: 'absolute',
                    //left: "0"
                  }}>数据集评测数量</div>}
                  tooltip={"最大可选数量为当前数据集的数据总量，为" + dataSetNumber.toString()}
                  name="inputNumber"
                  initialValue={100}
                  min={0}
                  max={dataSetNumber}
                  fieldProps={{precision: 0}}
                  onChange={(e) => {
                    //console.log(e);
                    setDatasetNumber(e);
                  }}
                />
                <ProFormSelect
                  allowClear={false}
                  label={<div style={{
                    fontSize: '18px',
                    height: '30px',
                    fontWeight: 'normal',
                    lineHeight: '30px',
                    //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                    width: 'auto',
                    //position: 'absolute',
                    //left: "0"
                  }}>运行设备</div>}
                  tooltip={"可选运行设备为cpu与gpu"}
                  width={'200px'}
                  name="deviceType"
                  initialValue={'cpu'}
                  onChange={(e) => {
                    //console.log(e);
                    setDeviceType(e);
                  }}
                  options={[
                    {label: 'cpu', value: 'cpu'},
                    {label: 'cuda:0', value: 'cuda:0'},
                  ]
                  }/>
              </ProCard>
            </Row>
          </ProCard.TabPane>
        )}

        {/*可解释性栏*/}
        {props.evaMethod.indexOf('INTERPRET') !== -1 && (
          <ProCard.TabPane key="interpret" tab="可解释性">
            <Row>
              <ProCard>
                <EditableProTable
                  fieldProps={{
                    name: 'interpret'
                  }}
                  rowSelection={interpretRowSelection}
                  tableAlertRender={false}
                  rowKey="categoryId"
                  scroll={{
                    x: 960,
                  }}
                  actionRef={interpretActionRef}
                  headerTitle={<div style={{
                    fontSize: '18px',
                    height: '30px',
                    fontWeight: 'normal',
                    lineHeight: '30px',
                    //backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
                    width: '100%',
                    position: 'absolute',
                    left: "0"
                  }}>可解释性方法选择及配置</div>}
                  maxLength={5}
                  // 关闭默认的新建按钮
                  recordCreatorProps={false}
                  columns={interpretColumns}
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

                    const msg = await interpretImgMethod(props.props.location.query.taskTypeId);
                    console.log(msg);
                    const data = msg.data.methodList.map(item => {
                      item.categoryId += 100;
                      return item;
                    })
                    console.log(data);
/*                    for (let item of data[0].methodList) {
                      console.log(item);
                      console.log(JSON.parse(item.value));
                      item.value = JSON.parse(item.value);
                      console.log(item.value);
                      delete item.value.method_name;
                      item.value = JSON.stringify(item.value);

                      item.value = item.value.split("{").join("{\n\t");
                      item.value = item.value.split(",").join(",\n\t");
                      item.value = item.value.split("}").join("\n}");
                    }*/
                    //console.log('hello');
                    console.log(data);
                    if (msg.code === '00000') {
                      return {
                        data: data,
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

                  /*              value={dataSource}
                                onChange={setDataSource}*/
                  editable={{
                    form: interpretForm,
                    editableKeys: interpretEditableKeys,
                    onChange: setInterpretEditableRowKeys,
                    actionRender: (row, config, dom) => [dom.save, dom.cancel],
                  }}
                />
              </ProCard>
              <ProCard>
                <ProForm submitter={false}></ProForm>

                <div style={{
                  fontSize: '18px',
                  height: '30px',
                  fontWeight: 'normal',
                  lineHeight: '30px',
                  //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                  width: 'auto',
                  //position: 'absolute',
                  //left: "0"
                }}>待解释图片选择</div>
                  <Checkbox.Group style={{width: '100%'}} onChange={(e)=> {
                    console.log(e);
                    setInterpretImg(e);
                  }}>
                    <Row>
                      {
                        props.imgUrl.map((item: string) => {
                          return (
                              <Col span={4}>
                                <Checkbox
                                  name={item}
                                  value={item}

/*                                  onChange={(e)=>{
                                    //console.log(e);
                                    let Img = interpretImg;
                                    Img[e.target.value] = e.target.checked;
                                    setInterpretImg(Img);
                                    //console.log(Img);
                                  }}*/
                                >
                                  <Image src={item} height={150 * screenHeight / 785} width={150 * screenWidth / 1600} preview={false}></Image>
                                </Checkbox>
                              </Col>
                          )
                        })
                      }
                    </Row>
                  </Checkbox.Group>
              </ProCard>
            </Row>
          </ProCard.TabPane>
        )}
      </ProCard>

    </>
  );
});

