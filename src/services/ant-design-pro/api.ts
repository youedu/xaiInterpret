// @ts-ignore
/* eslint-disable */
/*import { request } from 'umi';*/
import token from '@/utils/token';
import {request as umirequest} from "umi";
import {ResponseError} from "_umi-request@1.4.0@umi-request";
import {message} from 'antd';

const request = (url: any, options: any) => {
  return umirequest(url, {
    timeout: 5000, // 超时时间
    timeoutMessage: "请求超时", // 超时之后的错误
    /*    errorHandler: (error: ResponseError) => {
          message.error(error.message);
        }, // 错误处理*/
    ...options,  // 其他参数
  })
};

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token.get(),
    },
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/micro-user-service/user/logout', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    ...(options || {}),
  });
}

/*测试用,登录接口 POST /api/micro-user-service/user/login*/
export async function testLogin(values: API.LoginParams) {
  return request('/api/micro-user-service/user/login', {
    method: 'POST',
    data: {
      account: values.account,
      password: values.password,
    }
  });
}

/*测试用，注册接口 /api/micro-user-service/user/register*/
export async function testRegister(values: API.RegisterParams) {
  return request('/api/micro-user-service/user/register', {
    method: 'POST',
    data: {
      code: values.captcha,
      mobile: values.mobile,
      username: values.username,
      password: values.password,
    }
  });
}

/*测试用，获取验证码接口 /api/micro-user-service/user/register*/
export async function testGetCaptcha(values: API.captchaParams) {
  return request('/api/micro-user-service/user/getAuthCode', {
    method: 'POST',
    data: {
      authCodeType: values.type,
      mobile: values.mobile,
    }
  });
}


/*测试用，重置密码接口 /api/micro-user-service/user/modify*/
export async function pwdReset(values: API.pwdResetParams) {
  return request('/api/micro-user-service/user/modify', {
    method: 'POST',
    data: {
      code: values.captcha,
      mobile: values.mobile,
      newPassword: values.password,
      repeatNewPassword: values.passwordRepeat,
    }
  });
}

/*测试用，上传数据集文件接口*/
export async function dataSetFile(file, signal) {
  let data = new FormData();
  data.append('file', file);
  return request('/api/micro-model-dataset-service/minio/dataset/upload', {
    method: 'POST',
    timeout: 0,
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    signal: signal,
    data: data,
  });
}

/*测试用，上传数据集信息接口*/
export async function dataSetInfo(values: API.dataSetInfoParams) {
  //console.log(values);
  return request('/api/micro-model-dataset-service/dataset/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.get(),
      Accept: '*/*',
    },
    data: {
      "dataDesc": values.dataDesc,
      "dataLength": values.dataLength,
      "dataName": values.dataName,
      "dataUrl": values.dataUrl,
      "taskTypeId": values.taskTypeId,
    },
  });
}

/*测试用，获取任务类型接口*/
export async function taskTypeQuery() {
  return request('/api/micro-model-dataset-service/datatypelist/list', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    data: null,
  });
}

/*测试用，获取数据集信息接口*/
export async function dataSetQuery(params, choose, keyWord, taskTypeId) {
  return request('/api/micro-model-dataset-service/dataset/data', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      choose: choose,
      keyWord: keyWord,
      pageSize: params.pageSize,
      pageNum: params.current,
      taskTypeIds: taskTypeId,
    },
  });
}

/*测试用，通过id获取数据集信息接口*/
export async function dataSetQueryById(id: number) {
  return request('/api/micro-model-dataset-service/dataset/info/' + id.toString(), {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    data: {
      id: id,
    }
  });
}

/*测试用，通过id获取数据集url*/
export async function dataSetUrlQueryById(id: number) {
  return request('/api/micro-model-dataset-service/dataset/url/' + id.toString(), {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    data: {
      id: id,
    }
  });
}


/*测试用，上传模型文件接口*/
export async function modelFile(file, signal) {
  let data = new FormData();
  data.append('file', file);
  return request('/api/micro-model-dataset-service/minio/model/upload', {
    method: 'POST',
    timeout: 0,
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    signal: signal,
    data: data,
  });
}

/*测试用，上传模型信息接口*/
export async function modelInfo(values: API.modelInfoParams) {
  //console.log(values);
  return request('/api/micro-model-dataset-service/model/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.get(),
      Accept: '*/*',
    },
    data: {
      "data_set_ids": values.dataSetIds,
      "modelDesc": values.modelDesc,
      "modelSize": values.size,
      "sizeUnit": values.unit,
      "modelName": values.modelName,
      "dataUrl": values.url,
      "taskTypeId": values.taskTypeId,
      "model_type": values.modelType,
      "proxy_type": values.proxyType,
      "black_model_id": values.blackModel,
      "type": values.type,
    },
  });
}

/*测试用，获取模型信息接口*/
export async function modelQuery(params: object, choose: number | null, keyWord: number | null, dataSetId: number | null, taskTypeId: number[] | null) {
  return request('/api/micro-model-dataset-service/model/data', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      choose: choose,
      dataSetId: dataSetId,
      keyWord: keyWord,
      pageSize: params.pageSize || null,
      pageNum: params.current || null,
      taskTypeIds: taskTypeId,
    },
  });
}

/*测试用，获取黑盒模型信息接口*/
export async function blackModelQuery(params, taskTypeId) {
  return request('/api/micro-model-dataset-service/model/data/blackbox', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      pageSize: params.pageSize,
      pageNum: params.current,
      taskTypeId: taskTypeId,
    },
  });
}

/*测试mock用，获取评估方法*/
export async function evaMethodMock() {
  return request('/api/evaMethod', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    /*    params: {
          pageSize: params.pageSize,
          pageNum: params.current,
          taskTypeId: taskTypeId,
        },*/
  });
}


/*测试用，通过id获取模型信息接口*/
export async function modelQueryById(id: number) {
  return request('/api/micro-model-dataset-service/model/info/' + id.toString(), {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    data: {
      id: id,
    },
  });
}


/*测试用，获取评测记录信息接口*/
export async function evaluationRecordQuery(params, choose, keyWord, taskTypeId) {
  //console.log(taskTypeId);
  return request('/api/micro-evaluate-service/evaluateRecord/list', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      choose: choose,
      keyWord: keyWord,
      pageSize: params.pageSize,
      pageNum: params.current,
      evaluateTypeIds: taskTypeId,
    },
  });
}

/*测试用，新建正确性评测接口*/
export async function accEvaluation(values) {
  //console.log(values);
  return request('/api/micro-evaluate-service/evaluateRecord/acc/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.get(),
      Accept: '*/*',
    },
    data: {
      "accConfigStr": values.accConfigStr,
      "accMethodId": 1,
      "dataSetId": values.dataSetId,
      "modelId": values.modelId,
      "taskName": values.taskName,
      "taskTypeId": values.taskTypeId,
      "device": values.deviceType,
      "measureDataSize": values.datasetNumber,
    },
  });
}

/*测试用，新建鲁棒性评测接口*/
export async function robustEvaluation(values) {
  //console.log(values);
  return request('/api/micro-evaluate-service/evaluateRecord/safe_robust/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.get(),
      Accept: '*/*',
    },
    data: {
      "dataSetId": values.dataSetId,
      "methodConfigList": values.methodConfigList,
      "modelId": values.modelId,
      "taskName": values.taskName,
      "taskTypeId": values.taskTypeId,
      "device": values.deviceType,
      "measureDataSize": values.datasetNumber,
    },
  });
}

/*获取鲁棒性评测方法配置详情信息*/
export async function robustConfigDetailed(id, taskTypeId) {
  return request('/api/micro-evaluate-service/evaluateType/safe_method/config', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.get(),
      Accept: '*/*',
    },
    params: {
      "id": id,
      "taskTypeId": taskTypeId,
    },
  });
}

/*测试用，新建适应性评测接口*/
export async function adaptEvaluation(values) {
  //console.log(values);
  return request('/api/micro-evaluate-service/evaluateRecord/noise_test/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.get(),
      Accept: '*/*',
    },
    data: {
      "dataSetId": values.dataSetId,
      "methodConfigList": values.methodConfigList,
      "modelId": values.modelId,
      "taskName": values.taskName,
      "taskTypeId": values.taskTypeId,
      "device": values.deviceType,
      "measureDataSize": values.datasetNumber,
    },
  });
}

/*获取适应性评测方法配置详情信息*/
export async function adaptConfigDetailed(id, taskTypeId) {
  return request('/api/micro-evaluate-service/evaluateType/robust_method/config', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.get(),
      Accept: '*/*',
    },
    params: {
      "id": id,
      "taskTypeId": taskTypeId,
    },
  });
}

/*测试用，新建可解释性评测接口*/
export async function interpretEvaluation(values) {
  //console.log(values);
  return request('/api/micro-evaluate-service/evaluateRecord/xai/upload', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    data: {
      "blackBoxAndProxyModelConfigList": values.blackBoxAndProxyModelConfigList,
      "dataSetName": values.dataSetName,
      "evaModel": values.evaModel,
      "evaModelConfig": values.evaModelConfig,
      "evaModelId": 1,
      "proxyType": values.proxyType,
      "taskName": "可解释性评测",
      "taskTypeId": values.taskTypeId,
    },
  });
}

/*测试用，新的新建可解释性评测接口*/
export async function interpretEvaluationNew(values) {
  //console.log(values);
  return request('/api/micro-evaluate-service/evaluateRecord/xai/upload1', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    data: values
  });
}


/*测试用，根据任务类型获取正确性指标*/
export async function accMethod(taskTypeId) {
  return request('/api/micro-evaluate-service/evaluateType/acc_method', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      "taskTypeId": taskTypeId,
    },
  });
}


/*测试用，根据任务类型获取可解释性评测方法*/
export async function interpretMethod(proxyType, taskTypeId) {
  return request('/api/micro-evaluate-service/evaluateType/interpret_method', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      "proxy_type": proxyType,
      "taskTypeId": taskTypeId,
    },
  });
}


/*测试用，根据任务类型获取鲁棒性评测方法*/
export async function robustMethod(taskTypeId: number) {
  return request('/api/micro-evaluate-service/evaluateType/robust_method', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      "taskTypeId": taskTypeId,
    },
  });
}

/*测试用，根据id获取评测结果接口*/
export async function evaluateResult(evaluateResultId) {
  //console.log(evaluateResultId);
  return request('/api/micro-evaluate-service/evaluateResult/result/detail/' + evaluateResultId, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      "id": evaluateResultId,
    },
  });
}

/*测试用，根据id获取评测结果的配置信息接口*/
export async function evaluateConfigResult(evaluateResultId) {
  //console.log(evaluateResultId);
  return request('/api/micro-evaluate-service/evaluateResult/result/config/' + evaluateResultId, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      "id": evaluateResultId,
    },
  });
}

/*测试用，根据任务类型获取安全性评测方法*/
export async function safeMethod(taskTypeId) {
  return request('/api/micro-evaluate-service/evaluateType/safe_method', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {
      "taskTypeId": taskTypeId,
    },
  });
}


/*测试用，获取可解释性数据集*/
export async function interpretDatasetGet() {
  return request('/api/micro-evaluate-service/xai/dataset', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: {},
  });
}

/*测试用，上传可解释性数据集*/
export async function interpretDatasetUpload(datasetFiles) {
  return request('/api/micro-evaluate-service/xai/dataupload/dataset', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    data: datasetFiles,
  });
}

/*测试用，上传可解释性黑盒模型文件*/
export async function interpretBlackboxUpload(blackboxFile) {
  return request('/api/micro-evaluate-service/xai/dataupload/blackbox', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    data: blackboxFile,
  });
}

/*测试用，上传可解释性代理模型文件*/
export async function interpretProxyUpload(proxyFile) {
  return request('/api/micro-evaluate-service/xai/dataupload/proxymodel', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    data: proxyFile,
  });
}

/*测试用，获取可解释性代理或黑盒模型信息*/
export async function interpretXaiGet(values) {
  return request('/api/micro-evaluate-service/xai/model', {
    method: 'Get',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: values,
  });
}

/*测试用，根据数据集获取可解释性黑盒模型信息*/
export async function BlackBoxByDataSet(values = 38) {
  return request('/api/micro-model-dataset-service/model/blackboxmodel/' + values.toString(), {
    method: 'Get',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: values.toString(),
  });
}

/*测试用，根据黑盒模型获取可解释性代理模型信息*/
export async function ProxyByBlackBox(values) {
  return request('/api/micro-model-dataset-service/model/proxymodel', {
    method: 'Get',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
    params: values,
  });
}

/*测试用，获取所有任务类型对应的评测类型*/
export async function evaluateTypesByDataType() {
  return request('/api/micro-model-dataset-service/datatype/list', {
    method: 'Get',
    headers: {
      Authorization: 'Bearer ' + token.get(),
    },
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/*测试用：加密接口 POST /api/micro-oauth2-auth/oauth/encodePassword*/
export async function encode() {
  const params = new URLSearchParams();
  params.append("password", '1122');
  return request<API.EncodePassword>('/api/micro-oauth2-auth/oauth/encodePassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': '123',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    },
    data: params,
  });
}


/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}
