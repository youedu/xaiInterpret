import type {ProFormInstance} from '@ant-design/pro-components';
import {
  ProCard,
  StepsForm,
} from '@ant-design/pro-components';
import {message, Tooltip, Button, Form, Space, Row, Col} from 'antd';
import {useModel} from "umi";
import React, {useEffect, useRef, useState} from 'react';
import DataSetTable from './dataSet';
import ModelSetTable from './modelSet';
import EvaluationTable from "./evaluation";
import {
  accEvaluation,
  robustEvaluation,
  adaptEvaluation,
  interpretEvaluation,
  interpretEvaluationNew,
  evaluateTypesByDataType,
} from "@/services/ant-design-pro/api";
import {dataSetQueryById, modelQueryById, dataSetUrlQueryById} from "@/services/ant-design-pro/api";
import {history} from "umi";
import {QuestionCircleOutlined} from '@ant-design/icons';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export default (params) => {
  const [screenWidth, screenHeight] = [window.screen.width, window.screen.height];

  const {robustEvaluationConfig, setRobustEvaluationConfig} = useModel('robustConfig', (ret) => ({
    robustEvaluationConfig: ret.robustEvaluationConfig,
    setRobustEvaluationConfig: ret.setRobustEvaluationConfig,
  }));

  const {evaConfig, setEvaConfig} = useModel('config', (ret) => ({
    evaConfig: ret.evaluationConfig,
    setEvaConfig: ret.setEvaluationConfig,
  }));

  const [evaMethod, setEvaMethod] = useState('');

  const [taskTypeId, setTaskTypeId] = useState(params.location.query.taskTypeId);

  const config = async () => {
    //console.log(taskTypeId, typeof (taskTypeId));
    const data = await evaluateTypesByDataType();
    //console.log(data);
    if (Number(taskTypeId) === 1) {
      //console.log(data.data[0].taskList[0].supportEvaluateTypes);
      setEvaMethod(data.data[0].taskList[0].supportEvaluateTypes);
    } else if (Number(taskTypeId) === 2) {
      setEvaMethod('');
    } else if (Number(taskTypeId) === 3) {
      //console.log('hello');
      setEvaMethod(data.data[1].taskList[0].supportEvaluateTypes);
    }
  }
  useEffect(() => {
    config();
  }, []);


  const formRef = useRef<ProFormInstance>();

  const dataSetRef = useRef(null);
  const modelSetRef = useRef(null);
  const evaluationRef = useRef(null);

  const {dataSetId, setDataSetId} = useModel("demo");
  const {modelName, setModelName} = useModel("modelName");
  //const [modelName, setModelName] = useState({});
  const {dataSetNumber, setDataSetNumber} = useModel("datasetNumber");

  return (
    <>
      <div style={{fontSize: '20px', fontWeight: 'bold'}}>新建评测</div>
      <ProCard>
        <StepsForm<{
          name: string;
        }>
          submitter={{
            render: (props) => {
              if (props.step === 0) {
                return (
                  /*                <div style={{transform: 'translateX(+500%)'}}>
                                    <Button>
                                      取消
                                 <Button type="primary" onClick={() => props.onSubmit?.()}>
                                      下一步
                                    </Button>
                                  </div>*/
                  <div
                    //style={{position: 'fixed', top: '90%', left: '50%', transform: 'translate(-50%, -50%)'}}
                    style={{position: 'absolute', width: '100%'}}
                  >
                    <Button style={{position: 'absolute', left: '45%', bottom: '10%'}} type="primary" onClick={() => props.onSubmit?.()}>
                      下一步
                    </Button>
                  </div>
                );
              }
              if (props.step === 1) {
                return (
                  <div
                    //style={{position: 'fixed', top: '90%', left: '50%', transform: 'translate(-50%, -50%)'}}
                    style={{position: 'absolute', width: '100%'}}
                  >
                    <Space style={{position: 'absolute', left: '45%', bottom: '10%'}}>
                      <Button type="primary" key="pre" onClick={() => props.onPre?.()}>
                        上一步
                      </Button>
                      {/*                  <Button key="goToTree">
                    取消
                  </Button>*/}
                      <Button type="primary" key="goToTree" onClick={() => props.onSubmit?.()}>
                        下一步
                      </Button>
                    </Space>
                  </div>
                )
              }
              return (
                <div
                  /*                  style={{position: 'relative', bottom: 0, left: (600 -145) * screenWidth / 1536, display: 'flex'
                                      //transform: 'translate(-50%, -50%)'
                                  }}*/
                  //style={{display: "flex", justifyContent: 'center'}}
                  //style={{position: 'fixed', top: '90%', left: '50%', transform: 'translate(-50%, -50%)'}}
                  style={{position: 'absolute', width: '100%'}}
                >
                  <Space style={{position: 'absolute', left: '45%', bottom: '10%'}}>
                    <Button type="primary" key="pre" onClick={() => props.onPre?.()}>
                      上一步
                    </Button>
                    {/*                <Button key="goToTree">
                  取消
                </Button>*/}
                    <Button type="primary" key="goToTree" onClick={() => props.onSubmit?.()}>
                      提交
                    </Button>
                  </Space>

                </div>
              )
            },
          }}
          containerStyle={{width: "100%"}}
          formRef={formRef}
          onFinish={async () => {
            //console.log(params.location.query.taskTypeId);
            ////console.log(evaluationRef.current.openModal());
            //正确性评测
            if (evaluationRef.current.openModal() === 'acc') {
              if (evaluationRef.current.AccConfig().length === 0) {
                alert('请选择配置');
                return false;
              }
              //console.log(evaluationRef.current.AccConfig())

              if (evaluationRef.current.accConfigNew().deviceType === null || evaluationRef.current.accConfigNew().datasetNumber === null) {
                alert('请选择下方配置');
                return false;
              }
              if (evaluationRef.current.accConfigNew().datasetNumber > dataSetNumber) {
                alert('请选择需要的测评数据量');
                return false;
              }
              //console.log(evaluationRef.current.accConfigNew());

              const accConfig = ['ACC', 'RECALL', 'PRECISION', 'F1_SCORE'];
              let accConfigStr = [];
              for (const i of evaluationRef.current.AccConfig()) {
                accConfigStr.push(accConfig[i - 1]);
              }
              //console.log('accConfig:', accConfigStr);
              const value = {
                "modelId": modelSetRef.current.openModal()[0],
                "taskTypeId": params.location.query.taskTypeId,
                "dataSetId": dataSetRef.current.openModal()[0],
                "accConfigStr": accConfigStr.join(','),
                "taskName": '',
                "deviceType": evaluationRef.current.accConfigNew().deviceType,
                "datasetNumber": evaluationRef.current.accConfigNew().datasetNumber,
              }
              //console.log(value);
              const modelInfo = await modelQueryById(value.modelId);
              const modelName = modelInfo.data.modelName;
              //console.log(modelName);
              const dataSetInfo = await dataSetQueryById(value.dataSetId);
              const dataSetName = dataSetInfo.data.dataName;
              //console.log(dataSetName);
              value.taskName = dataSetName + '数据集-' + modelName + '模型-' + '正确性评测';
              if (value.taskTypeId === 1)
                value.taskName += '-图片分类'
              else
                value.taskName += '-文本分类'
              const msg = await accEvaluation(value);
              //console.log(msg);
              if (msg.code === '00000') {
                message.success('提交成功');
              }
              history.push('/evaluationrecord');
            }
            //鲁棒性评测
            if (evaluationRef.current.openModal() === 'robust') {
              //console.log('out:', evaluationRef.current.robustConfig());
              const robustConfig = evaluationRef.current.robustConfig();
              const robustConfigKeys = Object.keys(evaluationRef.current.robustConfig())
              if (robustConfigKeys.length === 0) {
                alert('请选择配置');
                return false;
              }
              const methodConfigList = [];
              for (let i of robustConfigKeys) {
                let obj = {};
                //console.log(i);
                if (i.indexOf('.') !== -1) {
                  obj.methodName = i.split('.')[0];
                  obj.methodId = Number(i.split('.')[1]);
                  obj.value = robustConfig[i.split('.')[0]];
                  methodConfigList.push(obj);
                }
              }
              //console.log('params:', methodConfigList);

              if (evaluationRef.current.accConfigNew().deviceType === null || evaluationRef.current.accConfigNew().datasetNumber === null) {
                alert('请选择下方配置');
                return false;
              }
              if (evaluationRef.current.accConfigNew().datasetNumber > dataSetNumber) {
                alert('请选择需要的测评数据量');
                return false;
              }

              const value = {
                "methodConfigList": methodConfigList,
                "modelId": modelSetRef.current.openModal()[0],
                "taskTypeId": params.location.query.taskTypeId,
                "dataSetId": dataSetRef.current.openModal()[0],
                "taskName": '',
                "deviceType": evaluationRef.current.accConfigNew().deviceType,
                "datasetNumber": evaluationRef.current.accConfigNew().datasetNumber,
              }
              //console.log(methodConfigList)

              const modelInfo = await modelQueryById(value.modelId);
              const modelName = modelInfo.data.modelName;
              //console.log(modelName);
              const dataSetInfo = await dataSetQueryById(value.dataSetId);
              const dataSetName = dataSetInfo.data.dataName;
              //console.log(dataSetName);
              value.taskName = dataSetName + '数据集-' + modelName + '模型-' + '鲁棒性评测';
              if (value.taskTypeId === 1)
                value.taskName += '-图片分类'
              else
                value.taskName += '-文本分类'
              const msg = await robustEvaluation(value);
              //console.log(msg);
              if (msg.code === '00000') {
                message.success('提交成功');
                setRobustEvaluationConfig({});
              }
              history.push('/evaluationrecord');
            }
            //适应性评测
            if (evaluationRef.current.openModal() === 'adapt') {
              console.log('out:', evaluationRef.current.adaptConfig());
              const adaptConfig = evaluationRef.current.adaptConfig();
              const adaptConfigKeys = Object.keys(evaluationRef.current.adaptConfig())
              if (adaptConfigKeys.length === 0) {
                alert('请选择配置');
                return false;
              }
              const methodParamsContent = [];
              for (let i of adaptConfigKeys) {
                let obj = {};
                //console.log(i);
                if (i.indexOf('.') !== -1) {
                  obj.methodName = i.split('.')[0];
                  obj.methodId = Number(i.split('.')[1]);
                  obj.value = adaptConfig[i.split('.')[0]];
                  methodParamsContent.push(obj);
                }
              }
              //console.log('params:', methodParamsContent);

              if (evaluationRef.current.accConfigNew().deviceType === null || evaluationRef.current.accConfigNew().datasetNumber === null) {
                alert('请选择下方配置');
                return false;
              }
              if (evaluationRef.current.accConfigNew().datasetNumber > dataSetNumber) {
                alert('请选择需要的测评数据量');
                return false;
              }

              const value = {
                "methodConfigList": methodParamsContent,
                "modelId": modelSetRef.current.openModal()[0],
                "taskTypeId": params.location.query.taskTypeId,
                "dataSetId": dataSetRef.current.openModal()[0],
                "taskName": '',
                "deviceType": evaluationRef.current.accConfigNew().deviceType,
                "datasetNumber": evaluationRef.current.accConfigNew().datasetNumber,
              }
              /*            history.push('/evaluationrecord');
                          const msg = await robustEvaluation(value).then((e) => {
                            //console.log(e);
                          }).catch((error) => {
                            //console.log(error);
                          });
                          return true;
                          //console.log(msg);*/

              const modelInfo = await modelQueryById(value.modelId);
              const modelName = modelInfo.data.modelName;
              //console.log(modelName);
              const dataSetInfo = await dataSetQueryById(value.dataSetId);
              const dataSetName = dataSetInfo.data.dataName;
              //console.log(dataSetName);
              value.taskName = dataSetName + '数据集-' + modelName + '模型-' + '适应性评测';
              if (value.taskTypeId === 1)
                value.taskName += '-图片分类'
              else
                value.taskName += '-文本分类'

              const msg = await adaptEvaluation(value);
              if (msg.code === '00000') {
                message.success('提交成功');
                setEvaConfig({});
              }
              history.push('/evaluationrecord');
            }
            if (evaluationRef.current.openModal() === 'interpret') {
              const values = evaluationRef.current.interpretConfig();
              if (values === false)
                return false;
              /*            if(values.dataSetName === undefined)
                          {
                            message.error("请选择数据集");
                            return false;
                          }*/
              if (values.proxyType === undefined) {
                message.error("请选择代理模型类型");
                return false;
              }
              if (values.evaModel === undefined) {
                message.error("请选择评估模型类型");
                return false;
              }
              if (values.blackBoxAndProxyModelIdConfigList.length === 0) {
                message.error("请选择代理模型");
                return false;
              }
              for (const item of values.blackBoxAndProxyModelIdConfigList) {
                if (item.blackBoxModelId === undefined || item.proxyModelId === undefined) {
                  message.error("请选择黑盒模型与代理模型");
                  return false;
                }
              }
              const dataurl = await dataSetUrlQueryById(dataSetId);
              if (dataurl.code === '00000') {
                values.dataSetUrl = dataurl.data;
              }
              //console.log(values);
              const msg = await interpretEvaluationNew(values);
              //console.log(msg);
              if (msg.code === '00000') {
                message.success('提交成功');
              } else {
                message.error(msg.message);
                return false;
                history.push('/evaluationrecord');
              }
              history.push('/evaluationrecord');
            }
            return true;
          }}
          formProps={{
            validateMessages: {
              required: '此项为必填项',
            },
          }}
        >
          <StepsForm.StepForm<{
            name: string;
          }>
            name="base"
            title="选择数据"
            stepProps={{
              description: '',
            }}
            onFinish={async () => {
              if (dataSetRef.current.openModal() === undefined) {
                alert('请选择数据集');
                return false;
              }
              //console.log(dataSetRef.current.openModal()[0]);
              setDataSetId(dataSetRef.current.openModal()[0]);
              const datainfo = await dataSetQueryById(dataSetRef.current.openModal()[0]);
              //console.log(datainfo);
              setDataSetNumber(datainfo.data.dataLength);
              modelSetRef.current.openModal();
              return true;

              //modelSetRef.current.openModal();

              // //console.log(formRef.current?.getFieldsValue());
              // await waitTime(2000);
            }}
          >
            {/*// 第一步(引入数据集table)*/}
            <div style={{width: '100%'}}>
              {/*            <div>数据集</div>*/}
              <DataSetTable ref={dataSetRef} props={params}></DataSetTable>
            </div>
          </StepsForm.StepForm>

          <StepsForm.StepForm<{
            checkbox: string;
          }>
            name="checkbox"
            title="选择模型"
            stepProps={{
              description: '',
            }}
            onFinish={async () => {
              if (modelSetRef.current.openModal() === undefined) {
                alert('请选择模型');
                return false;
              }
              //console.log(modelSetRef.current.openModal()[0]);
              const modelInfo = await modelQueryById(modelSetRef.current.openModal()[0]);
              setModelName({
                modelName: modelInfo.data.modelName,
                modelId: modelInfo.data.id,
                modelUrl: modelInfo.data.dataUrl
              });
              return true;
            }}
          >
            {/*第二步 选择模型*/}
            <div style={{width: '100%'}}>
              {/*            <div>模型</div>*/}
              <ModelSetTable ref={modelSetRef}/>
            </div>


          </StepsForm.StepForm>


          <StepsForm.StepForm
            name="time"
            title="评测配置"
            stepProps={{
              description: '',
            }}
            onFinish={async () => {
            }}
          >
            {/*第三步 评测设置*/}
            <div style={{width: '100%'}}>
              <span style={{
                fontSize: '18px',
                height: '30px',
                fontWeight: 'normal',
                lineHeight: '30px',
                //backgroundImage: 'linear-gradient(135deg,  #fdfcfb 0% ,#e2d1c3 100% )',
                width: 'auto',
                //position: 'absolute',
                //left: "0"
              }}>测评类型</span>
              <Tooltip title={"请选择一种测评类型进行测评"}>
                <QuestionCircleOutlined/>
              </Tooltip>
              <EvaluationTable ref={evaluationRef} props={params} params={dataSetId} evaMethod={evaMethod}
                               modelName={modelName}></EvaluationTable>
            </div>
          </StepsForm.StepForm>
        </StepsForm>
      </ProCard>
    </>
  );
};
