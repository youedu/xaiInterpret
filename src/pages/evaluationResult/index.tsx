import React, {useState, useEffect} from 'react';
import {Column} from '@ant-design/plots';
import {ProTable} from "@ant-design/pro-components";
import type {ProColumns} from "@ant-design/pro-components";
import {message, Modal, Progress, Typography, Image, Space} from 'antd';
import {ProCard, ProFormSelect} from '@ant-design/pro-components';
import {evaluateResult, evaluateConfigResult, evaluateImgList, evaluateImgResult} from "@/services/ant-design-pro/api";
import {history, Link} from "umi";


//柱状图组件
import Proxy_rule_bar from "@/pages/evaluationResult/interpretResult/proxy_rule_bar";
import Proxy_tree_bar from "@/pages/evaluationResult/interpretResult/proxy_tree_bar";

//规则剩余结果组件
import Topsis_ahp_entropy_rule from "@/pages/evaluationResult/interpretResult/topsis_ahp_entropy_rule";
import Fuzzy_ahp_rule from "@/pages/evaluationResult/interpretResult/fuzzy_ahp_rule";
import Grey_ahp_rule from "@/pages/evaluationResult/interpretResult/grey_ahp_rule";
import Rsr_ahp_rule from "@/pages/evaluationResult/interpretResult/rsr_ahp_rule";
import Topsis_ahp_rule from "@/pages/evaluationResult/interpretResult/topsis_ahp_rule";


//决策树剩余结果组件
import Fuzzy_ahp_tree from "@/pages/evaluationResult/interpretResult/fuzzy_ahp_tree";
import Grey_ahp_tree from "@/pages/evaluationResult/interpretResult/grey_ahp_tree";
import Rsr_ahp_tree from "@/pages/evaluationResult/interpretResult/rsr_ahp_tree";
import Topsis_ahp_tree from "@/pages/evaluationResult/interpretResult/topsis_ahp_tree";
import Topsis_ahp_entropy_tree from "@/pages/evaluationResult/interpretResult/topsis_ahp_entropy_tree";
import {CheckCircleOutlined, CloseCircleOutlined} from "@ant-design/icons";


//(正确性表格
const accuracyColumns: ProColumns[] = [
  {
    title: <b>样本数量</b>,
    dataIndex: 'BATCH_SIZE',
    valueType: "digit",
    align: "center",
  },
  {
    title: <b>测试集准确率(%)</b>,
    dataIndex: 'ACC',
    valueType: "text",
    align: "center",
  },
  {
    title: <b>测试集召回率(%)</b>,
    dataIndex: 'RECALL',
    valueType: "text",
    align: "center",
  },
  {
    title: <b>测试集精确率(%)</b>,
    dataIndex: 'PRECISION',
    valueType: "text",
    align: "center",
  },
  {
    title: <b>F1分数</b>,
    dataIndex: 'F1_SCORE',
    valueType: "text",
    align: "center",
  },
];
//正确性表格)

//(鲁棒性表格
export type robustTableListItem = {
  attackMethod: string;
  sampleNumber: number;
  successNumber: number;
  successRate: string;
};

const robustColumns: ProColumns<robustTableListItem>[] = [
  {
    title: <b>攻击方法</b>,
    dataIndex: 'methodName',
    align: "center",
  },
  {
    title: <b>样本数</b>,
    dataIndex: 'batch_size',
    valueType: 'digit',
    align: "center",
  },
  {
    title: <b>攻击成功率(%)</b>,
    dataIndex: 'success_attack_rate',
    valueType: 'text',
    align: "center",
  },
  {
    title: <b>平均结构相似度(%)</b>,
    dataIndex: 'ssim',
    valueType: 'text',
    align: "center",
  },
  {
    title: <b>峰值信噪比</b>,
    dataIndex: 'psnr',
    valueType: 'text',
    align: "center",
  },
  {
    title: <b>L1失真度</b>,
    dataIndex: 'L1_distortion_factor',
    valueType: 'text',
    align: "center",
  },
  {
    title: <b>L2失真度</b>,
    dataIndex: 'L2_distortion_factor',
    valueType: 'text',
    align: "center",
  },
  {
    title: <b>L∞失真度</b>,
    dataIndex: 'L_infinity_distortion_factor',
    valueType: 'text',
    align: "center",
  },
  {
    title: <b>平均扰动大小（L1范数）</b>,
    dataIndex: 'L1_avg_epsilon',
    valueType: 'text',
    align: "center",
  },
  {
    title: <b>平均扰动大小（L2范数）</b>,
    dataIndex: 'L2_avg_epsilon',
    valueType: 'text',
    align: "center",
  },
  {
    title: <b>平均扰动大小（L∞范数）</b>,
    dataIndex: 'L_infinity_avg_epsilon',
    valueType: 'text',
    align: "center",
  },
];
//鲁棒性表格)

//(可解释性表格
export type interpretTableListItem = {
  imgId: string;
  imageUrl: string;
  classResult: string;
  accuracy: string;
  createTime: string;
  evaResult: string;
};

const interpretColumns: ProColumns<interpretTableListItem>[] = [
  {
    title: <b>图片编号</b>,
    dataIndex: 'id',
    align: "center",
  },
  {
    title: <b>图片预览</b>,
    dataIndex: 'imageUrl',
    align: "center",
    render: (_, row) => {
      return <><Image src={'http://10.105.240.103:9000/images/' + row.imageUrl} height={100} width={100}></Image></>;
    },
  },
  {
    title: <b>创建时间</b>,
    dataIndex: 'createTime',
    valueType: 'text',
    align: "center",
  },
  {
    title: <b>测评结果</b>,
    dataIndex: 'id',
    valueType: 'text',
    align: "center",
    render: (_, row) => {
      return <><CheckCircleOutlined/><Link
        onClick={() => {
          window.location.replace('/evaluationresult?resultId=' + row.evaluateRecordId.toString() + '&evaluateType=2&imgId=' + row.id.toString());
        }}>查看解释</Link></>;
    },
  },
];


export default (params: object) => {
  let obj;
  const [evaluateType, setEvaluateType] = useState('');
  //适应性柱状图数据
  const [adaptData2, setAdaptData2] = useState({});
  //鲁棒性柱状图数据
  const [robustData2, setRobustData2] = useState({});
  //鲁棒性表格数据
  const [robustDataTable, setRobustDataTable] = useState({});
  //鲁棒性结果柱状图展示选择
  const [robustBarType, setRobustBarType] = useState('success_attack_rate');
  //适应性结果柱状图展示选择
  const [adaptBarType, setAdaptBarType] = useState('Acc');
  //图片可解释性结果展示选择
  const [imgInterpretMethodType, setImgInterpretMethodType] = useState('');


  const [interpretData2, setInterpretData2] = useState(null);

  //文本参数
  const [textParam, setTextParam] = useState();

  //可解释性测评结果表2的权重数据
  const [tableData, setTableData] = useState([]);

  //鲁棒性失真度大小柱状图最大值
  const [distortionFactor, setDistortionFactor] = useState(0);
  //鲁棒性失真度柱状图新组织
  const [newDistortionFactor, setNewDistortionFactor] = useState([]);
  //鲁棒性平均扰动大小柱状图数据
  const [avgEpsilonL1, setAvgEpsilonL1] = useState([]);
  const [avgEpsilonL2, setAvgEpsilonL2] = useState([]);
  const [avgEpsilonLInfinity, setAvgEpsilonLInfinity] = useState([]);

  //可解释性展示类型
  const [interpretType, setInterpretType] = useState('');

  //设置评估模型类型
  const [proxyType, setProxyType] = useState('');

  //图片可解释性评测图片列表
  const [interpretImgList, setInterpretImgList] = useState([]);
  //图片可解释性评测结果图片
  const [interpretImgResult, setInterpretImgResult] = useState();
  //图片可解释性评测结果方法列表
  const [interpretImgMethodList, setInterpretImgMethodList] = useState();

  //初始化评测结果的展示数据
  const presentResult = async () => {
    if (params.location.query.evaluateType.toString() !== '2') {
      const data = await evaluateResult(params.location.query.resultId);
      const configRes = await evaluateConfigResult(params.location.query.resultId);


      const configData = configRes.data;
      data.data.resultStr = data.data.resultStr.replaceAll('Infinity', '0');
      data.data.resultStr = data.data.resultStr.replaceAll('NaN', '0');


      try {
        if (data.code === "00000" && data.data.resultStr !== '') {
          obj = data.data;
          if (obj.evaluateType === '鲁棒性') {
            const res = JSON.parse(obj.resultStr);
            const res2 = JSON.parse(obj.resultStr)
            let max = 0;
            let maxFactor = 0;
            let newDistortionFactor = [];
            let avgEpsilonL1 = [];
            let avgEpsilonL2 = [];
            let avgEpsilonLInfinity = [];
            res.attacks.forEach((item: any) => {
              if (max < item.epsilon)
                max = item.epsilon;
              maxFactor = Math.max(maxFactor, item.distortion_factor[0], item.distortion_factor[1], item.distortion_factor[2])
              item.distortion_factor[0] = Number(item.distortion_factor[0].toFixed(2));
              item.distortion_factor[1] = Number(item.distortion_factor[1].toFixed(2));
              item.distortion_factor[2] = Number(item.distortion_factor[2].toFixed(2));

              item.avg_epsilon[0] = Number(item.avg_epsilon[0].toFixed(2));
              item.avg_epsilon[1] = Number(item.avg_epsilon[1].toFixed(2));
              item.avg_epsilon[2] = Number(item.avg_epsilon[2].toFixed(2));

              if (typeof item.ssim === 'number' && !isNaN(item.ssim))
                item.ssim = Number((Number(item.ssim.toFixed(3)) * 100).toFixed(1));
              if (typeof item.psnr === 'number' && !isNaN(item.psnr))
                item.psnr = Number(item.psnr.toFixed(3));
              item.success_attack_rate = parseFloat((item.success_attack_rate * 100).toFixed(2));

              return item;
            })
            res2.attacks.forEach((item) => {
              item.distortion_factor[0] = Number(item.distortion_factor[0].toFixed(3));
              item.distortion_factor[1] = Number(item.distortion_factor[1].toFixed(3));
              item.distortion_factor[2] = Number(item.distortion_factor[2].toFixed(3));

              item.avg_epsilon[0] = Number(item.avg_epsilon[0].toFixed(3));
              item.avg_epsilon[1] = Number(item.avg_epsilon[1].toFixed(3));
              item.avg_epsilon[2] = Number(item.avg_epsilon[2].toFixed(3));

              if (typeof item.ssim === 'number' && !isNaN(item.ssim))
                item.ssim = Number((Number(item.ssim.toFixed(3)) * 100).toFixed(1));
              if (typeof item.psnr === 'number' && !isNaN(item.psnr))
                item.psnr = Number(item.psnr.toFixed(3));
              item.success_attack_rate = parseFloat((item.success_attack_rate * 100).toFixed(2));
              return item;
            })

            res.attacks.forEach((item: object, index: number) => {
              item.config = configData[index].config;
              newDistortionFactor.push({
                distortionType: "L1失真度",
                methodName: item.methodName,
                index: item.distortion_factor[0],
                epsilon: item.epsilon,
                config: configData[index].config,
              });
              newDistortionFactor.push({
                distortionType: "L2失真度",
                methodName: item.methodName,
                index: item.distortion_factor[1],
                epsilon: item.epsilon,
                config: configData[index].config,
              });
              newDistortionFactor.push({
                distortionType: "L∞失真度",
                methodName: item.methodName,
                index: item.distortion_factor[2],
                epsilon: item.epsilon,
                config: configData[index].config,
              });
              avgEpsilonL1.push({
                epsilonType: "L1范数下的平均扰动",
                methodName: item.methodName,
                index: item.avg_epsilon[0],
                epsilon: item.epsilon,
                config: configData[index].config,
              });
              avgEpsilonL2.push({
                epsilonType: "L2范数下的平均扰动",
                methodName: item.methodName,
                index: item.avg_epsilon[1],
                epsilon: item.epsilon,
                config: configData[index].config,
              });
              avgEpsilonLInfinity.push({
                epsilonType: "L∞范数下的平均扰动",
                methodName: item.methodName,
                index: item.avg_epsilon[2],
                epsilon: item.epsilon,
                config: configData[index].config,
              });
            });
            setRobustData2(res);
            setRobustDataTable(res2);

            setNewDistortionFactor(newDistortionFactor);
            setAvgEpsilonL1(avgEpsilonL1);
            setAvgEpsilonL2(avgEpsilonL2);
            setAvgEpsilonLInfinity(avgEpsilonLInfinity);
            setDistortionFactor(maxFactor);
            setEvaluateType('ROBUST');

          }
          if (obj.evaluateType === '正确性') {
            setEvaluateType('ACC');
          }
          if (obj.evaluateType === '适应性') {
            const res = JSON.parse(obj.resultStr);
            console.log(res);
            let avgAccDec = 0;
            let avgRecDec = 0;
            let avgPreDec = 0;
            let avgF1Dec = 0;
            res.noiseMethodList.forEach((item: object, index: number) => {
              item.config = configData[index].config;
              avgAccDec = avgAccDec + res.clean_acc - item.change_clean_acc;
              avgRecDec = avgRecDec + res.RECALL - item.RECALL;
              avgPreDec = avgPreDec + res.PRECISION - item.PRECISION;
              avgF1Dec = avgF1Dec + res.F1_SCORE - item.F1_SCORE;
              item.change_clean_acc = parseFloat((item.change_clean_acc * 100).toFixed(2));
              item.RECALL = parseFloat((item.RECALL * 100).toFixed(2));
              item.PRECISION = parseFloat((item.PRECISION * 100).toFixed(2));
              item.F1_SCORE = parseFloat(item.F1_SCORE.toFixed(2));
            });
            avgAccDec = Number(((avgAccDec / res.noiseMethodList.length) * 100).toFixed(2));
            avgRecDec = Number(((avgRecDec / res.noiseMethodList.length) * 100).toFixed(2));
            avgPreDec = Number(((avgPreDec / res.noiseMethodList.length) * 100).toFixed(2));
            avgF1Dec = Number((avgF1Dec / res.noiseMethodList.length).toFixed(2));
            res.avgAccDec = avgAccDec;
            res.avgRecDec = avgRecDec;
            res.avgPreDec = avgPreDec;
            res.avgF1Dec = avgF1Dec;
            res.noiseMethodList.unshift({
              'methodName': '原始情况',
              'change_clean_acc': parseFloat((res.clean_acc * 100).toFixed(2)),
              'RECALL': parseFloat((res.RECALL * 100).toFixed(2)),
              'PRECISION': parseFloat((res.PRECISION * 100).toFixed(2)),
              'F1_SCORE': parseFloat(res.F1_SCORE.toFixed(2)),
            });
            setAdaptData2(res);
            console.log(res);
            setEvaluateType('ADAPT');
            //console.log(evaluateType);
          }
          if (obj.evaluateType === '可解释性') {

            const first = JSON.parse(obj.resultStr);

            setTextParam(first[5]);

            //设置表格数据
            const newTableData = [];
            // @ts-ignore
            if (first[0].proxy_type === 'rule') {
              setProxyType('rule');
              newTableData.push({
                normIndex: '一致性',
                normWeight: first[2][0],
                indexIndex: 'auc',
                indexWeight: first[3][0][0],
                weight: first[4][0][0],
              });
              newTableData.push({
                normIndex: '复杂性',
                normWeight: first[2][1],
                indexIndex: '覆盖率',
                indexWeight: first[3][1][0],
                weight: first[4][1][0],
              });
              newTableData.push({
                normWeight: first[2][0],
                indexIndex: '类覆盖率',
                indexWeight: first[3][1][1],
                weight: first[4][1][1],
              });
              newTableData.push({
                normWeight: first[2][0],
                indexIndex: '重叠率',
                indexWeight: first[3][1][2],
                weight: first[4][1][2],
              });
              newTableData.push({
                normWeight: first[2][0],
                indexIndex: '矛盾率',
                indexWeight: first[3][1][3],
                weight: first[4][1][3],
              });
              newTableData.push({
                normIndex: '明确性',
                normWeight: first[2][2],
                indexIndex: '模型大小',
                indexWeight: first[3][2][0],
                weight: first[4][2][0],
              });
              newTableData.push({
                normWeight: first[2][0],
                indexIndex: '规则模型总长度',
                indexWeight: first[3][2][1],
                weight: first[4][2][1],
              });
              newTableData.push({
                normWeight: first[2][0],
                indexIndex: '规则最大长度',
                indexWeight: first[3][2][2],
                weight: first[4][2][2],
              });
            } else {
              setProxyType('tree');
              newTableData.push({
                normIndex: '一致性',
                normWeight: first[2][0],
                indexIndex: 'auc',
                indexWeight: first[3][0][0],
                weight: first[4][0][0],
              });
              newTableData.push({
                normIndex: '复杂性',
                normWeight: first[2][1],
                indexIndex: 'APL',
                indexWeight: first[3][1][0],
                weight: first[4][1][0],
              });
              newTableData.push({
                indexIndex: '节点数量',
                indexWeight: first[3][1][1],
                weight: first[4][1][1],
              });
              newTableData.push({
                normIndex: '明确性',
                normWeight: first[2][2],
                indexIndex: '重复子树比例',
                indexWeight: first[3][2][0],
                weight: first[4][2][0],
              });
              newTableData.push({
                indexIndex: '重复属性比例',
                indexWeight: first[3][2][1],
                weight: first[4][2][1],
              });
            }

            ////console.log(newTableData);
            setTableData(newTableData);

            //设置可解释性结果类型
            if (first[0].proxy_type === 'rule') {
              switch (first[0].method_name) {
                case  'fuzzy_ahp':
                  setInterpretType('fuzzy_ahp_rule');
                  break;
                case 'grey_ahp':
                  setInterpretType('grey_ahp_rule');
                  break;
                case  'rsr_ahp':
                  setInterpretType('rsr_ahp_rule');
                  break;
                case  'topsis_ahp':
                  setInterpretType('topsis_ahp_rule');
                  break;
                case  'topsis_ahp_entropy':
                  setInterpretType('topsis_ahp_entropy_rule');
                  break;
                default:
                  break;
              }
            } else if (first[0].proxy_type === 'tree') {
              switch (first[0].method_name) {
                case  'fuzzy_ahp':
                  setInterpretType('fuzzy_ahp_tree');
                  break;
                case 'grey_ahp':
                  setInterpretType('grey_ahp_tree');
                  break;
                case  'rsr_ahp':
                  setInterpretType('rsr_ahp_tree');
                  break;
                case  'topsis_ahp':
                  setInterpretType('topsis_ahp_tree');
                  break;
                case  'topsis_ahp_entropy':
                  setInterpretType('topsis_ahp_entropy_tree');
                  break;
                default:
                  break;
              }
            }
            //console.log('interpretType:', interpretType);

            //设置规则可解释性柱状图数据
            const res = JSON.parse(obj.resultStr)[1];
            let consistency = [];
            let complexity = [];
            let specificity = [];

            //决策树柱状图数据
            let APL = [];
            let nodeNumber = [];
            let repetitionRatio = [];

            let second = [];

            if (first[0].proxy_type === 'rule') {
              if (first[0].method_name !== 'rsr_ahp') {
                for (let key in res) {
                  //console.log(key);
                  //复杂性
                  let max = {};
                  let size = {};
                  let total = {};
                  max.model_name = res[key].model_name;
                  max.prop = '最大规则长度';
                  max.index = res[key].max_length;
                  size.model_name = res[key].model_name;
                  size.prop = '模型大小';
                  size.index = res[key].model_size;
                  total.model_name = res[key].model_name;
                  total.prop = '规则总长度';
                  total.index = res[key].total_rule_length;

                  //一致性
                  let newKey = res[key];
                  newKey.model_name = res[key].model_name;

                  //明确性
                  let overlap = {};
                  let classOverlap = {};
                  let coverage = {};
                  let conflict = {};

                  overlap.model_name = res[key].model_name;
                  overlap.prop = '覆盖率';
                  overlap.index = res[key].overlap_rate;
                  classOverlap.model_name = res[key].model_name;
                  classOverlap.prop = '类覆盖率';
                  classOverlap.index = res[key].class_overlap_rate;
                  coverage.model_name = res[key].model_name;
                  coverage.prop = '重复率';
                  coverage.index = res[key].coverage_rate;
                  conflict.model_name = res[key].model_name;
                  conflict.prop = '矛盾率';
                  conflict.index = res[key].conflict_rate;

                  complexity.push(max);
                  complexity.push(size);
                  complexity.push(total);

                  specificity.push(overlap);
                  specificity.push(classOverlap);
                  specificity.push(coverage);
                  specificity.push(conflict);

                  consistency.push(newKey);
                }
              } else {
                for (let key in res) {
                  //console.log(key);
                  //复杂性
                  let max = {};
                  let size = {};
                  let total = {};
                  max.model_name = res[key].model_name;
                  max.prop = '最大规则长度';
                  max.index = res[key]['X8：max_length'];
                  size.model_name = res[key].model_name;
                  size.prop = '模型大小';
                  size.index = res[key]['X6：model_size'];
                  total.model_name = res[key].model_name;
                  total.prop = '规则总长度';
                  total.index = res[key]['X7：total_rule_length'];

                  //一致性
                  let newKey = res[key];
                  newKey.model_name = res[key].model_name;
                  newKey.consistency = res[key]['X1：consistency'];

                  //明确性
                  let overlap = {};
                  let classOverlap = {};
                  let coverage = {};
                  let conflict = {};

                  overlap.model_name = res[key].model_name;
                  overlap.prop = '覆盖率';
                  overlap.index = res[key]['X4：overlap_rate'];
                  classOverlap.model_name = res[key].model_name;
                  classOverlap.prop = '类覆盖率';
                  classOverlap.index = res[key]['X3：class_overlap_rate'];
                  coverage.model_name = res[key].model_name;
                  coverage.prop = '重复率';
                  coverage.index = res[key]['X2：coverage_rate'];
                  conflict.model_name = res[key].model_name;
                  conflict.prop = '矛盾率';
                  conflict.index = res[key]['X5：conflict_rate'];

                  complexity.push(max);
                  complexity.push(size);
                  complexity.push(total);

                  specificity.push(overlap);
                  specificity.push(classOverlap);
                  specificity.push(coverage);
                  specificity.push(conflict);

                  consistency.push(newKey);
                }
              }
              first[0] = consistency;
              first[1] = complexity;
              first[2] = specificity;
              //console.log('complexity', complexity);
              //console.log('consistency', consistency);
              setInterpretData2(first);
              //console.log(first);
              setEvaluateType('INTERPRET');
              consistency2 = consistency;
              //console.log(evaluateType);
              //console.log(interpretData2);
            } else {
              for (let key in res) {
                APL.push(res[key]);
                nodeNumber.push(res[key]);

                let duplicateAttr = {};
                let duplicateSubTree = {};

                duplicateAttr.model_name = res[key].model_name;
                duplicateAttr.index = res[key].duplicate_attr;
                duplicateAttr.prop = '重复属性比例';

                duplicateSubTree.model_name = res[key].model_name;
                duplicateSubTree.index = res[key].duplicate_subtree;
                duplicateSubTree.prop = '重复子树比例';


                repetitionRatio.push(duplicateSubTree);
                repetitionRatio.push(duplicateAttr)
              }
              //console.log(nodeNumber);
              first[0] = APL;
              first[1] = repetitionRatio;
              first[2] = nodeNumber;
              setInterpretData2(first);
              setEvaluateType('TableINTERPRET');
            }

            /*        setRadarData([{item: '可解释性', score: 6.5}, {item: '适应性', score: 0}, {item: '鲁棒性', score: 0}, {
                      item: '正确性',
                      score: 0
                    },]);*/
          }
        }
      } catch {
        history.push('/404');
        message.error("结果错误");
      }
    } else {
      if (params.location.query.imgId === undefined) {
        console.log(1);
        const data = await evaluateImgList(params.location.query.resultId);
        console.log(data);
        setInterpretImgList(data.data);
        setEvaluateType('ImgListINTERPRET')
      } else {
        console.log(2);
        const data = await evaluateImgResult(params.location.query.resultId, params.location.query.imgId);
        console.log(data);
        let result = JSON.parse(data.data.result);
        console.log(result);
        let key = Object.keys(result);
        const methodList = [];
        let final = [];
        for (let i of key) {
          methodList.push({label: i, value: i});
          final.push({
            methodName: i,
            originalImg: 'http://10.105.240.33:9000/images/' + data.data.imageUrl,
            Img: 'http://10.105.240.33:9000/images/' + result[i]
          });
        }
        console.log(final);
        setInterpretImgResult(final);
        setInterpretImgMethodList(methodList);
        setImgInterpretMethodType(methodList[0].label);
        console.log(result);
        setEvaluateType('ImgResultINTERPRET');
      }
    }
  }

  useEffect(() => {
    presentResult().then();
  }, []);


  const [modal, contextHolder] = Modal.useModal();

  return (
    <>
      <ProCard split="horizontal">

        {/*正确性评测结果内容*/}
        {evaluateType === "ACC" && (
          <ProCard title={<Typography.Title level={3}>正确性</Typography.Title>}>
            <ProCard>
              <ProTable
                request={async () => {
                  const msg = await evaluateResult(params.location.query.resultId);
                  //console.log(msg);
                  let data = [JSON.parse(msg.data.resultStr)];
                  //console.log('data', data);
                  let data1 = data[0]
                  Object.keys(data1).forEach((key) => {
                    console.log(data1[key]);
                    if (Math.floor(data1[key]) !== data1[key])
                      if (key !== 'F1_SCORE')
                        data1[key] = Number(data1[key]).toFixed(4);
                      else
                        data1[key] = Number(data1[key]).toFixed(2);
                    if (key !== 'BATCH_SIZE' && key !== 'F1_SCORE')
                      data1[key] = (data1[key] * 100).toFixed(2);
                  })
                  //console.log(data1);
                  data[0] = data1;
                  return {
                    data: data,
                    success: true,
                  }
                }}
                columns={accuracyColumns}
                search={false}
                options={false}
                pagination={false}
              />
            </ProCard>
          </ProCard>)}

        {/*适应性评测结果内容*/}
        {evaluateType === "ADAPT" && (
          <ProCard title={<Typography.Title level={3}>适应性</Typography.Title>} layout={"center"} split={"horizontal"}>
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
              }}>适应性测评结果指标</div>}
              width={'200px'}
              name="adaptBarType"
              placeholder={'准确率'}
              onChange={(e) => {
                //console.log(e);
                setAdaptBarType(e);
              }}
              options={[
                {label: '准确率', value: 'Acc'},
                {label: '召回率', value: 'Recall'},
                {label: '精确率', value: 'Precision'},
                {label: 'F1分数', value: 'F1Score'},
              ]
              }
            />
            {adaptBarType === 'Acc' && (
              <ProCard split={"horizontal"} colSpan={12} layout={"center"}>
                {/*准确率柱状图*/}
                <ProCard style={{height: '500px'}}>
                  <Column
                    autoFit={true}
                    data={adaptData2.noiseMethodList}
                    onReady={(plot) => {
                      plot.on('element:click', (...args: any) => {
                        //console.log(args);
                        let item;
                        if (args[0].data.data.methodName !== '原始情况') {
                          item = args[0].data.data.config;
                          /*                      item = args[0].data.data.config.split("{").join("{\n");
                                                item = item.split(",").join(",\n");
                                                item = item.split("}").join("\n}");*/
                          //console.log(item);
                          modal.info({
                            title: '配置信息', content: (
                              <>
                                <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                              </>
                            )
                          });
                        }
                      });
                    }}
                    isGroup={true}
                    legend={{
                      layout: 'horizontal',
                      flipPage: false
                    }}
                    xField={'methodName'}
                    yField={'change_clean_acc'}
                    seriesField={'methodName'}
                    xAxis={{
                      title: {
                        text: '扰动方法', style: {
                          cursor: 'pointer',
                          fontSize: 18,
                        }
                      },
                      label: {style: {fontWeight: 'bolder', fontSize: 10}},
                    }}
                    yAxis={{
                      title: {
                        text: '准确率(%)', style: {
                          cursor: 'pointer',
                          fontSize: 18,
                        }
                      },
                      label: {style: {fontWeight: 'bolder', fontSize: 12}},
                      tickCount: 6,
                      min: 0,
                      max: 100,
                    }}
                    maxColumnWidth={60}
                    minColumnWidth={40}
                    label={{
                      position: 'top',
                      offsetY: 10,
                      style: {fontSize: 9}
                    }}
                    /*            label={{
                                  // 可手动配置 label 数据标签位置
                                  position: 'top',
                                  // 'top', 'bottom', 'middle',
                                  // 配置样式
                                  style: {
                                    fill: '#000000',
                                    opacity: 1,
                                  },
                                }}*/
                    meta={{
                      methodName: {
                        alias: '方法',
                      },
                      change_clean_acc: {
                        alias: '准确率',
                      },
                    }}
                  />
                  {contextHolder}
                </ProCard>
                <ProCard layout={"center"}>
                  <div>在{adaptData2.batch_size}张测试图片上，进行了{adaptData2.noiseMethodList.length - 1}种噪声测试,在少量噪声干扰下，准确率平均下降{adaptData2.avgAccDec}%</div>
                </ProCard>
              </ProCard>
            )}
            {adaptBarType === 'Recall' && (
              <ProCard split={"horizontal"} colSpan={12} layout={"center"}>
                {/*召回率柱状图*/}
                <ProCard style={{height: '500px'}}>
                  <Column
                    autoFit={true}
                    data={adaptData2.noiseMethodList}
                    onReady={(plot) => {
                      plot.on('element:click', (...args: any) => {
                        //console.log(args);
                        let item;
                        if (args[0].data.data.methodName !== '原始情况') {
                          item = args[0].data.data.config;
                          /*                      item = args[0].data.data.config.split("{").join("{\n");
                                                item = item.split(",").join(",\n");
                                                item = item.split("}").join("\n}");*/
                          //console.log(item);
                          modal.info({
                            title: '配置信息', content: (
                              <>
                                <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                              </>
                            )
                          });
                        }
                      });
                    }}
                    isGroup={true}
                    legend={{
                      layout: 'horizontal',
                      flipPage: false
                    }}
                    xField={'methodName'}
                    yField={'RECALL'}
                    seriesField={'methodName'}
                    xAxis={{
                      title: {
                        text: '扰动方法', style: {
                          cursor: 'pointer',
                          fontSize: 18,
                        }
                      },
                      label: {style: {fontWeight: 'bolder', fontSize: 10}},
                    }}
                    yAxis={{
                      title: {
                        text: '召回率(%)', style: {
                          cursor: 'pointer',
                          fontSize: 18,
                        }
                      },
                      label: {style: {fontWeight: 'bolder', fontSize: 12}},
                      tickCount: 6,
                      min: 0,
                      max: 100,
                    }}
                    maxColumnWidth={60}
                    minColumnWidth={40}
                    label={{
                      position: 'top',
                      offsetY: 10,
                      style: {fontSize: 9}
                    }}
                    meta={{
                      methodName: {
                        alias: '方法',
                      },
                      RECALL: {
                        alias: '召回率',
                      },
                    }}
                  />
                  {contextHolder}
                </ProCard>
                <ProCard layout={"center"}>
                  <div>在{adaptData2.batch_size}张测试图片上，进行了{adaptData2.noiseMethodList.length - 1}种噪声测试,在少量噪声干扰下，召回率平均下降{adaptData2.avgRecDec}%</div>
                </ProCard>
              </ProCard>
            )}
            {adaptBarType === 'Precision' && (
              <ProCard split={"horizontal"} colSpan={12} layout={"center"}>
                {/*精确率柱状图*/}
                <ProCard style={{height: '500px'}}>
                  <Column
                    autoFit={true}
                    data={adaptData2.noiseMethodList}
                    onReady={(plot) => {
                      plot.on('element:click', (...args: any) => {
                        //console.log(args);
                        let item;
                        if (args[0].data.data.methodName !== '原始情况') {
                          item = args[0].data.data.config;
                          /*                      item = args[0].data.data.config.split("{").join("{\n");
                                                item = item.split(",").join(",\n");
                                                item = item.split("}").join("\n}");*/
                          //console.log(item);
                          modal.info({
                            title: '配置信息', content: (
                              <>
                                <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                              </>
                            )
                          });
                        }
                      });
                    }}
                    isGroup={true}
                    legend={{
                      layout: 'horizontal',
                      flipPage: false
                    }}
                    xField={'methodName'}
                    yField={'PRECISION'}
                    seriesField={'methodName'}
                    xAxis={{
                      title: {
                        text: '扰动方法', style: {
                          cursor: 'pointer',
                          fontSize: 18,
                        }
                      },
                      label: {style: {fontWeight: 'bolder', fontSize: 10}},
                    }}
                    yAxis={{
                      title: {
                        text: '精确率(%)', style: {
                          cursor: 'pointer',
                          fontSize: 18,
                        }
                      },
                      label: {style: {fontWeight: 'bolder', fontSize: 12}},
                      tickCount: 6,
                      min: 0,
                      max: 100,
                    }}
                    maxColumnWidth={60}
                    minColumnWidth={40}
                    label={{
                      position: 'top',
                      offsetY: 10,
                      style: {fontSize: 9}
                    }}
                    /*            label={{
                                  // 可手动配置 label 数据标签位置
                                  position: 'top',
                                  // 'top', 'bottom', 'middle',
                                  // 配置样式
                                  style: {
                                    fill: '#000000',
                                    opacity: 1,
                                  },
                                }}*/
                    meta={{
                      methodName: {
                        alias: '方法',
                      },
                      RECALL: {
                        alias: '召回率',
                      },
                    }}
                  />
                  {contextHolder}
                </ProCard>
                <ProCard layout={"center"}>
                  <div>在{adaptData2.batch_size}张测试图片上，进行了{adaptData2.noiseMethodList.length - 1}种噪声测试,在少量噪声干扰下，精确率平均下降{adaptData2.avgPreDec}%</div>
                </ProCard>
              </ProCard>
            )}
            {adaptBarType === 'F1Score' && (
              <ProCard split={"horizontal"} colSpan={12} layout={"center"}>
                {/*F1分数柱状图*/}
                <ProCard style={{height: '500px'}}>
                  <Column
                    autoFit={true}
                    data={adaptData2.noiseMethodList}
                    onReady={(plot) => {
                      plot.on('element:click', (...args: any) => {
                        //console.log(args);
                        let item;
                        if (args[0].data.data.methodName !== '原始情况') {
                          item = args[0].data.data.config;
                          /*                      item = args[0].data.data.config.split("{").join("{\n");
                                                item = item.split(",").join(",\n");
                                                item = item.split("}").join("\n}");*/
                          //console.log(item);
                          modal.info({
                            title: '配置信息', content: (
                              <>
                                <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                              </>
                            )
                          });
                        }
                      });
                    }}
                    isGroup={true}
                    legend={{
                      layout: 'horizontal',
                      flipPage: false
                    }}
                    xField={'methodName'}
                    yField={'F1_SCORE'}
                    seriesField={'methodName'}
                    xAxis={{
                      title: {
                        text: '扰动方法', style: {
                          cursor: 'pointer',
                          fontSize: 18,
                        }
                      },
                      label: {style: {fontWeight: 'bolder', fontSize: 10}},
                    }}
                    yAxis={{
                      title: {
                        text: 'F1分数', style: {
                          cursor: 'pointer',
                          fontSize: 18,
                        }
                      },
                      label: {style: {fontWeight: 'bolder', fontSize: 12}},
                      tickCount: 6,
                      min: 0,
                      max: 1,
                    }}
                    maxColumnWidth={60}
                    minColumnWidth={40}
                    label={{
                      position: 'top',
                      offsetY: 10,
                      style: {fontSize: 9}
                    }}
                    /*            label={{
                                  // 可手动配置 label 数据标签位置
                                  position: 'top',
                                  // 'top', 'bottom', 'middle',
                                  // 配置样式
                                  style: {
                                    fill: '#000000',
                                    opacity: 1,
                                  },
                                }}*/
                    meta={{
                      methodName: {
                        alias: '方法',
                      },
                      RECALL: {
                        alias: '召回率',
                      },
                    }}
                  />
                  {contextHolder}
                </ProCard>
                <ProCard layout={"center"}>
                  <div>在{adaptData2.batch_size}张测试图片上，进行了{adaptData2.noiseMethodList.length - 1}种噪声测试,在少量噪声干扰下，F1分数平均下降{adaptData2.avgF1Dec}</div>
                </ProCard>
              </ProCard>
            )}
          </ProCard>)}

        {/*鲁棒性评测结果内容*/}
        {evaluateType === "ROBUST" && (
          /*          <>
                      <ProCard colSpan={16} size={'default'} tabs={{type: 'card', centered: true,}}
                               title={<Typography.Title level={3}>鲁棒性</Typography.Title>}>
                        {/!*<ProCard split={"vertical"}>*!/}
                        <ProCard.TabPane key={'attack_success_rate'} tab={'攻击成功率'}>
                          <ProCard>
                            <Column
                              data={robustData2.attacks}
                              onReady={(plot) => {
                                plot.on('element:click', (...args: any) => {
                                  //console.log(args);
                                  let item;
                                  item = args[0].data.data.config;
                                  /!*                      item = args[0].data.data.config.split("{").join("{\n");
                                                        item = item.split(",").join(",\n");
                                                        item = item.split("}").join("\n}");*!/
                                  //console.log(item);
                                  modal.info({
                                    title: '配置信息', content: (
                                      <>
                                        <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                                      </>
                                    ),
                                  });
                                });
                              }}
                              //isGroup={true}
                              legend={{
                                layout: 'horizontal',
                                flipPage: false
                              }}
                              xField={'methodName'}
                              yField={'success_attack_rate'}
                              seriesField={'methodName'}
                              isGroup={true}
                              //seriesField={'methodName'}
                              xAxis={{
                                title: {text: '攻击方法'},
                                label: null,
                              }}
                              yAxis={{
                                title: {text: '攻击成功率(%)'},
                                tickCount: 6,
                                min: 0,
                                max: 100,
                              }}
                              /!*                color={(col) => {
                                                //console.log(col.methodName);
                                                switch (col.methodName) {
                                                  case 'L2FastGradientAttack':
                                                    return '#05f8d6';
                                                  case 'L2PGD':
                                                    return '#0082fc';
                                                  case 'L2BasicIterativeAttack':
                                                    return '#fdd845';
                                                  case 'L2DeepFoolAttack':
                                                    return '#22ed7c';
                                                  case 'LinfPGD':
                                                    return '#09b0d3';
                                                  case 'LinfFastGradientAttack':
                                                    return '#1d27c9';
                                                  case 'BoundaryAttack':
                                                    return '#f9e264 ';
                                                  default:
                                                    return '#000000';
                                                }
                                            }}*!/
                              maxColumnWidth={40}
                              minColumnWidth={40}
                              label={undefined}
                              /!*                label={{
                                                // 可手动配置 label 数据标签位置
                                                position: 'top',
                                                // 'top', 'bottom', 'middle',
                                                // 配置样式
                                                style: {
                                                  fill: '#000000',
                                                  opacity: 1,
                                                },
                                              }}*!/
                              meta={{
                                methodName: {
                                  alias: '方法',
                                },
                                success_attack_rate: {
                                  alias: '攻击成功率',
                                },
                              }}
                            />
                            {contextHolder}
                          </ProCard>
                        </ProCard.TabPane>
                        <ProCard.TabPane key={'ssim'} tab={'平均结构相似度'}>
                          <ProCard>
                            <Column
                              data={robustData2.attacks}
                              onReady={(plot) => {
                                plot.on('element:click', (...args: any) => {
                                  //console.log(args);
                                  let item;
                                  item = args[0].data.data.config;
                                  /!*                      item = args[0].data.data.config.split("{").join("{\n");
                                                        item = item.split(",").join(",\n");
                                                        item = item.split("}").join("\n}");*!/
                                  //console.log(item);
                                  modal.info({
                                    title: '配置信息', content: (
                                      <>
                                        <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                                      </>
                                    ),
                                  });
                                });
                              }}
                              isGroup={true}
                              legend={false}
                              xField={'methodName'}
                              yField={'ssim'}
                              seriesField={'methodName'}
                              xAxis={{
                                title: {text: '攻击方法'},
                                label: null,
                              }}
                              yAxis={{
                                title: {text: '平均结构相似度(%)'},
                                tickCount: 7,
                                min: 0,
                                max: 100,
                              }}
                              maxColumnWidth={40}
                              minColumnWidth={40}
                              label={undefined}
                              /!*                  label={{
                                                  // 可手动配置 label 数据标签位置
                                                  position: 'top',
                                                  // 'top', 'bottom', 'middle',
                                                  // 配置样式
                                                  style: {
                                                    fill: '#000000',
                                                    opacity: 1,
                                                  },
                                                }}*!/
                              meta={{
                                methodName: {
                                  alias: '方法',
                                },
                                ssim: {
                                  alias: '平均结构相似度',
                                },
                              }}
                            />
                            {contextHolder}
                          </ProCard>
                        </ProCard.TabPane>

                        <ProCard.TabPane key={'distortion'} tab={'平均失真度'}>
                          <ProCard>
                            <Column
                              /!*                data={robustData2.attacks}*!/
                              data={newDistortionFactor}
                              onReady={(plot) => {
                                plot.on('element:click', (...args: any) => {
                                  //console.log(args);
                                  let item;
                                  item = args[0].data.data.config;
                                  /!*                    item = args[0].data.data.config.split("{").join("{\n");
                                                      item = item.split(",").join(",\n");
                                                      item = item.split("}").join("\n}");*!/
                                  //console.log(item);
                                  modal.info({
                                    title: '配置信息', content: (
                                      <>
                                        <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                                      </>
                                    ),
                                  });
                                });
                              }}
                              isGroup={true}
                              legend={false}
                              xField={'distortionType'}
                              yField={'index'}
                              maxColumnWidth={40}
                              minColumnWidth={15}
                              xAxis={{
                                title: {text: '失真度类型'},
                                label: {style: {fontWeight: 'bolder', fontSize: 10}},
                              }}
                              yAxis={{
                                title: {text: '平均失真度'},
                                min: 0,
                                max: distortionFactor * 1.2,
                              }}
                              label={undefined}
                              /!*                label={{
                                                // 可手动配置 label 数据标签位置
                                                position: 'top',
                                                // 'top', 'bottom', 'middle',
                                                // 配置样式
                                                style: {
                                                  fill: '#000000',
                                                  opacity: 1,
                                                },
                                              }}*!/
                              seriesField={'methodName'}
                              meta={{
                                methodName: {
                                  alias: '方法',
                                },
                                distortion_factor: {
                                  alias: '平均失真度',
                                },
                              }}
                            />
                          </ProCard>
                        </ProCard.TabPane>
                        <ProCard.TabPane key={'psnr'} tab={'峰值信噪比'}>
                          <ProCard>
                            <Column
                              data={robustData2.attacks}
                              onReady={(plot) => {
                                plot.on('element:click', (...args: any) => {
                                  //console.log(args);
                                  let item;
                                  item = args[0].data.data.config;
                                  /!*                    item = args[0].data.data.config.split("{").join("{\n");
                                                      item = item.split(",").join(",\n");
                                                      item = item.split("}").join("\n}");*!/
                                  //console.log(item);
                                  modal.info({
                                    title: '配置信息', content: (
                                      <>
                                        <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                                      </>
                                    ),
                                  });
                                });
                              }}
                              xField={'methodName'}
                              yField={'psnr'}
                              isGroup={true}
                              legend={false}
                              seriesField={'methodName'}
                              xAxis={{
                                title: {text: '攻击方法'},
                                label: null,
                              }}
                              tooltip={{}}
                              yAxis={{
                                title: {text: '峰值信噪比'},
                                min: 0,
                                max: 160,
                              }}
                              maxColumnWidth={40}
                              minColumnWidth={40}
                              annotations={[]}
                              /!*                label={{
                                                // 可手动配置 label 数据标签位置
                                                position: 'top',
                                                // 'top', 'bottom', 'middle',
                                                // 配置样式
                                                style: {
                                                  fill: '#000000',
                                                  opacity: 1,
                                                },
                                              }}*!/
                              meta={{
                                methodName: {
                                  alias: '方法',
                                },
                                psnr: {
                                  alias: '峰值信噪比',
                                },
                              }}
                            />
                          </ProCard>
                        </ProCard.TabPane>
                        {/!*</ProCard>*!/}
                        <ProCard.TabPane key={'epsilon'} tab={'平均扰动大小'}>
                          <ProCard>
                            <Column
                              data={avgEpsilon}
                              xField={'epsilonType'}
                              yField={'index'}
                              isGroup={true}
                              legend={false}
                              seriesField={'methodName'}
                              maxColumnWidth={40}
                              minColumnWidth={15}
                              xAxis={{
                                title: {text: '扰动类型'},
                                label: {style: {fontWeight: 'bolder', fontSize: 10}},
                              }}
                              yAxis={{
                                title: {text: '平均扰动大小'},
                                /!*                  min: 0,
                                                  max: epsilon * 1.5,*!/
                              }}
                              label={false}
                              /!*                label={{
                                                // 可手动配置 label 数据标签位置
                                                position: 'top',
                                                // 'top', 'bottom', 'middle',
                                                // 配置样式
                                                style: {
                                                  fill: '#000000',
                                                  opacity: 1,
                                                },
                                              }}*!/
                              meta={{
                                methodName: {
                                  alias: '方法',
                                },
                                epsilon: {
                                  alias: '扰动大小',
                                },
                              }}
                            />
                          </ProCard>
                        </ProCard.TabPane>
                        {/!*          <ProCard colSpan={12}>
                      <Space>在XXX张测试图片上，使用了XX种对抗攻击，在对抗噪声干扰下，攻击成功率平均达到XXX，准确率平均下降XXX</Space>
                    </ProCard>*!/}
                      </ProCard>

                    </>*/
          <ProCard split={"horizontal"} title={<Typography.Title level={3}>鲁棒性</Typography.Title>} layout={"center"}>
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
              }}>鲁棒性测评结果指标</div>}
              width={'200px'}
              name="robustBarType"
              placeholder={'攻击成功率'}
              onChange={(e) => {
                //console.log(e);
                setRobustBarType(e);
              }}
              options={[
                {label: '攻击成功率', value: 'success_attack_rate'},
                {label: '平均结构相似度', value: 'ssim'},
                {label: '峰值信噪比', value: 'psnr'},
                {label: '平均失真度', value: 'distortion'},
                {label: '平均扰动大小（L1范数）', value: 'epsilonL1'},
                {label: '平均扰动大小（L2范数）', value: 'epsilonL2'},
                {label: '平均扰动大小（L∞范数）', value: 'epsilonLInfinity'},
              ]
              }
            />
            {/*<ProCard split={"vertical"}>*/}
            {robustBarType === 'success_attack_rate' && (
              <ProCard split={"horizontal"} layout={"center"}>
                <ProCard gutter={30} colSpan={24} style={{height: '500px'}}>
                  <ProCard type={"inner"} title={<Typography.Title type={'success'} level={3}>指标说明</Typography.Title>}
                           style={{height: '450px'}} bordered={true} colSpan={"30%"}>
                    <Typography style={{textIndent: '1em', fontSize: '15px'}}>
                      <Typography>
                        攻击成功率是指攻击成功的样本数在全部样本中的占比, 攻击成功率越高表明模型的鲁棒性越差。
                      </Typography>
                      <Typography>
                        对抗攻击方法根据原始样本生成对抗样本，观察原始样本和对抗样本在待评测模型中的预测结果，若预测结果不相同，则攻击成功。
                      </Typography>
                    </Typography>
                    {/*                    攻击成功率定义为模型识别对抗样本的结果不同于识别正常样本结果的比例。使用此指标可以评测模型的鲁棒性，攻击成功率越高表明模型的鲁棒性越差，计算公式如下:
                    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                      <mi>S</mi>
                      <mi>R</mi>
                      <mo>=</mo>
                      <mfrac>
                        <mn>1</mn>
                        <mi>n</mi>
                      </mfrac>
                      <munderover>
                        <mo data-mjx-texclass="OP">&#x2211;</mo>
                        <mrow>
                          <mi>i</mi>
                          <mo>=</mo>
                          <mn>1</mn>
                        </mrow>
                        <mrow>
                          <mi>n</mi>
                        </mrow>
                      </munderover>
                      <mo stretchy="false">(</mo>
                      <mi>f</mi>
                      <mo stretchy="false">(</mo>
                      <msub>
                        <mrow>
                          <mover>
                            <mi>x</mi>
                            <mo stretchy="false">^</mo>
                          </mover>
                        </mrow>
                        <mrow>
                          <mi>i</mi>
                        </mrow>
                      </msub>
                      <mo stretchy="false">)</mo>
                      <mo>&#x2260;</mo>
                      <mi>f</mi>
                      <mo stretchy="false">(</mo>
                      <msub>
                        <mi>x</mi>
                        <mrow>
                          <mi>i</mi>
                        </mrow>
                      </msub>
                      <mo stretchy="false">)</mo>
                      <mo stretchy="false">)</mo>
                    </math>
                    其中
                    <math xmlns="http://www.w3.org/1998/Math/MathML">
                      <msub>
                        <mi>x</mi>
                        <mrow>
                          <mi>i</mi>
                        </mrow>
                      </msub>
                    </math>
                    为原样本，
                    <math xmlns="http://www.w3.org/1998/Math/MathML">
                      <msub>
                        <mrow>
                          <mover>
                            <mi>x</mi>
                            <mo stretchy="false">^</mo>
                          </mover>
                        </mrow>
                        <mrow>
                          <mi>i</mi>
                        </mrow>
                      </msub>
                    </math>
                    为对抗样本，
                    n为样本数量，
                    f为模型，
                    f(x)为模型输出结果。*/}

                  </ProCard>
                  <ProCard type={"inner"} style={{height: '450px'}} bordered={true}>
                    <Column
                      data={robustData2.attacks}
                      //animation={false}
                      autoFit={true}
                      onReady={(plot) => {
                        plot.on('element:click', (...args: any) => {
                          //console.log(args);
                          let item;
                          item = args[0].data.data.config;
                          /*                      item = args[0].data.data.config.split("{").join("{\n");
                                                item = item.split(",").join(",\n");
                                                item = item.split("}").join("\n}");*/
                          //console.log(item);
                          modal.info({
                            title: '配置信息', content: (
                              <>
                                <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                              </>
                            ),
                          });
                        });
                      }}
                      //isGroup={true}
                      legend={{
                        layout: 'horizontal',
                        flipPage: false,
                      }}
                      xField={'methodName'}
                      yField={'success_attack_rate'}
                      seriesField={'methodName'}
                      isGroup={true}
                      //seriesField={'methodName'}
                      xAxis={{
                        title: {
                          text: '攻击方法', style: {
                            cursor: 'pointer',
                            fontSize: 18,
                          }
                        },
                        label: null,
                      }}
                      yAxis={{
                        title: {
                          text: '攻击成功率(%)', style: {
                            cursor: 'pointer',
                            fontSize: 18,
                          }
                        },
                        label: {style: {fontWeight: 'bolder', fontSize: 12}},
                        tickCount: 6,
                        min: 0,
                        max: 100,
                      }}
                      /*                color={(col) => {
                                        //console.log(col.methodName);
                                        switch (col.methodName) {
                                          case 'L2FastGradientAttack':
                                            return '#05f8d6';
                                          case 'L2PGD':
                                            return '#0082fc';
                                          case 'L2BasicIterativeAttack':
                                            return '#fdd845';
                                          case 'L2DeepFoolAttack':
                                            return '#22ed7c';
                                          case 'LinfPGD':
                                            return '#09b0d3';
                                          case 'LinfFastGradientAttack':
                                            return '#1d27c9';
                                          case 'BoundaryAttack':
                                            return '#f9e264 ';
                                          default:
                                            return '#000000';
                                        }
                                    }}*/
                      maxColumnWidth={40}
                      minColumnWidth={40}
                      label={{
                        position: 'top',
                        offsetY: 10,
                        style: {fontSize: 9}
                      }}
                      /*                label={{
                                        // 可手动配置 label 数据标签位置
                                        position: 'top',
                                        // 'top', 'bottom', 'middle',
                                        // 配置样式
                                        style: {
                                          fill: '#000000',
                                          opacity: 1,
                                        },
                                      }}*/
                      meta={{
                        methodName: {
                          alias: '方法',
                        },
                        success_attack_rate: {
                          alias: '攻击成功率',
                        },
                      }}
                    />
                    {contextHolder}
                  </ProCard>
                </ProCard>
              </ProCard>
            )}
            {robustBarType === 'ssim' && (
              <ProCard split={"horizontal"} layout={"center"}>
                <ProCard gutter={30} style={{height: '500px'}} colSpan={24}>
                  <ProCard type={"inner"} title={<Typography.Title type={'success'} level={3}>指标说明</Typography.Title>}
                           style={{height: '450px'}} bordered={true} colSpan={"30%"}>
                    <Typography style={{textIndent: '1em', fontSize: '15px'}}>
                      <Typography>
                        平均结构相似度是指对抗样本与原样本的总体相似程度，相似度越高表明对抗样本对原原样本的改动越小。
                      </Typography>
                      <Typography>
                        两个图片样本之间的结构相似性可以基于亮度、对比度和结构三个性质计算，结构相似性函数综合这三个性质，给出一个结构相似性得分。为所有的原始样本及其对应的对抗样本计算结构相似性，这些结构相似性得分的平均值即为平均结构相似度。
                      </Typography>
                    </Typography>
                    {/*                    平均结构相似度（Average Structural Similarity，ASS）是指所有对抗样本和对应的原始样本之间的平均结构相似性，
                    结构相似性（Structual Similarity，SSIM）基于两幅图片之间的亮度、对比度和结构来衡量样本的相似性。*/}
                  </ProCard>
                  <ProCard type={"inner"} style={{height: '450px'}} bordered={true}>
                    <Column
                      data={robustData2.attacks}
                      //animation={false}
                      onReady={(plot) => {
                        plot.on('element:click', (...args: any) => {
                          //console.log(args);
                          let item;
                          item = args[0].data.data.config;
                          /*                      item = args[0].data.data.config.split("{").join("{\n");
                                                item = item.split(",").join(",\n");
                                                item = item.split("}").join("\n}");*/
                          //console.log(item);
                          modal.info({
                            title: '配置信息', content: (
                              <>
                                <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                              </>
                            ),
                          });
                        });
                      }}
                      isGroup={true}
                      legend={{
                        layout: 'horizontal',
                        flipPage: false,
                      }}
                      xField={'methodName'}
                      yField={'ssim'}
                      seriesField={'methodName'}
                      xAxis={{
                        title: {
                          text: '攻击方法', style: {
                            cursor: 'pointer',
                            fontSize: 18,
                          }
                        },
                        label: null,
                      }}
                      yAxis={{
                        title: {
                          text: '平均结构相似度(%)', style: {
                            cursor: 'pointer',
                            fontSize: 18,
                          }
                        },
                        label: {style: {fontWeight: 'bolder', fontSize: 12}},
                        tickCount: 7,
                        min: 0,
                        max: 100,
                      }}
                      maxColumnWidth={40}
                      minColumnWidth={40}
                      label={{
                        position: 'top',
                        offsetY: 10,
                        style: {fontSize: 9}
                      }}
                      /*                  label={{
                                          // 可手动配置 label 数据标签位置
                                          position: 'top',
                                          // 'top', 'bottom', 'middle',
                                          // 配置样式
                                          style: {
                                            fill: '#000000',
                                            opacity: 1,
                                          },
                                        }}*/
                      meta={{
                        methodName: {
                          alias: '方法',
                        },
                        ssim: {
                          alias: '平均结构相似度',
                        },
                      }}
                    />
                    {contextHolder}
                  </ProCard>
                </ProCard>
              </ProCard>
            )}
            {robustBarType === 'distortion' && (
              <ProCard split={"horizontal"} layout={"center"}>
                <ProCard gutter={30} style={{height: '500px'}} colSpan={24}>
                  <ProCard type={"inner"} title={<Typography.Title type={'success'} level={3}>指标说明</Typography.Title>}
                           style={{height: '450px'}} bordered={true} colSpan={"30%"}>
                    <Typography style={{textIndent: '1em', fontSize: '15px'}}>
                      <Typography>
                        平均失真度用于描述生成的图片对抗样本和原始图片样本之间的距离，该指标越大，说明需要改变更多原始样本上的像素才能生成对抗样本。
                      </Typography>
                      <Typography>
                        计算距离有多种方法，本平台共使用了三种方法以计算失真度：
                        <Typography>（1）L1失真度使用曼哈顿距离；</Typography>
                        <Typography>（2）L2失真度使用欧氏距离；</Typography>
                        <Typography>（3）L∞失真度使用切比雪夫距离。</Typography>
                      </Typography>
                    </Typography>
                    {/*<Typography>
                      <ul>
                        <li>
                          平均L1失真度使用对抗样本与原始样本的平均曼哈顿距离衡量模型的鲁棒性，值越大说明需要改变更多原始样本上的像素才能生成对抗样本；
                        </li>
                        <li>
                          平均L2失真度使用对抗样本与原始样本的平均欧式距离衡量模型的鲁棒性，值越大说明需要在原始样本上添加更多的扰动才能生成对抗样本，即对抗样本总体特征改变幅值越大；
                        </li>
                        <li>
                          平均L∞失真度使用对抗样本与原始样本的平均切比雪夫距离衡量模型的鲁棒性，值越大表明对抗样本相较于原始样本的最大像素点改变值越大；
                        </li>
                      </ul>
                    </Typography>*/}

                  </ProCard>
                  <ProCard type={"inner"} style={{height: '450px'}} bordered={true}>
                    <Column
                      /*                data={robustData2.attacks}*/
                      data={newDistortionFactor}
                      //animation={false}
                      onReady={(plot) => {
                        plot.on('element:click', (...args: any) => {
                          //console.log(args);
                          let item;
                          item = args[0].data.data.config;
                          /*                    item = args[0].data.data.config.split("{").join("{\n");
                                              item = item.split(",").join(",\n");
                                              item = item.split("}").join("\n}");*/
                          //console.log(item);
                          modal.info({
                            title: '配置信息', content: (
                              <>
                                <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                              </>
                            ),
                          });
                        });
                      }}
                      isGroup={true}
                      legend={{
                        layout: 'horizontal',
                        flipPage: false
                      }}
                      xField={'distortionType'}
                      yField={'index'}
                      maxColumnWidth={40}
                      minColumnWidth={15}
                      xAxis={{
                        title: {
                          text: '失真度类型', style: {
                            cursor: 'pointer',
                            fontSize: 18,
                          }
                        },
                        label: {style: {fontWeight: 'bolder', fontSize: 10}},
                      }}
                      yAxis={{
                        title: {
                          text: '平均失真度', style: {
                            cursor: 'pointer',
                            fontSize: 18,
                          }
                        },
                        label: {style: {fontWeight: 'bolder', fontSize: 12}},
                        min: 0,
                        max: distortionFactor * 1.2,
                      }}
                      label={{
                        position: 'top',
                        offsetY: 10,
                        style: {fontSize: 9}
                      }}
                      /*                label={{
                                        // 可手动配置 label 数据标签位置
                                        position: 'top',
                                        // 'top', 'bottom', 'middle',
                                        // 配置样式
                                        style: {
                                          fill: '#000000',
                                          opacity: 1,
                                        },
                                      }}*/
                      seriesField={'methodName'}
                      meta={{
                        methodName: {
                          alias: '方法',
                        },
                        distortion_factor: {
                          alias: '平均失真度',
                        },
                      }}
                    />
                  </ProCard>
                </ProCard>
              </ProCard>
            )}
            {robustBarType === 'psnr' && (
              <ProCard split={"horizontal"} layout={"center"}>
                <ProCard gutter={30} style={{height: '500px'}} colSpan={24}>
                  <ProCard type={"inner"} title={<Typography.Title type={'success'} level={3}>指标说明</Typography.Title>}
                           style={{height: '450px'}} bordered={true} colSpan={"30%"}>
                    <Typography style={{textIndent: '1em', fontSize: '15px'}}>
                      峰值信噪比用于描述生成的图片对抗样本与原始图片样本的接近程度，该指标越大，对抗样本就越接近于原图。该指标实际上衡量两张图片中各个像素点的均方差，即两张图片中每一个像素点的差异大小。
                    </Typography>
                    {/*                    峰值信噪比（Peak Signal-to-Noise
                    Ratio，PSNR），是衡量图像质量的指标之一是，基于MSE(均方误差)定义，对给定一个大小为m*n的原始图像I和对其添加噪声后的噪声图像K，其MSE可定义为：
                    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                      <mi>M</mi>
                      <mi>S</mi>
                      <mi>E</mi>
                      <mo>=</mo>
                      <mfrac>
                        <mn>1</mn>
                        <mrow>
                          <mi>m</mi>
                          <mi>n</mi>
                        </mrow>
                      </mfrac>
                      <munderover>
                        <mo data-mjx-texclass="OP">&#x2211;</mo>
                        <mrow>
                          <mi>i</mi>
                          <mo>=</mo>
                          <mn>0</mn>
                        </mrow>
                        <mrow>
                          <mi>m</mi>
                          <mo>&#x2212;</mo>
                          <mn>1</mn>
                        </mrow>
                      </munderover>
                      <munderover>
                        <mo data-mjx-texclass="OP">&#x2211;</mo>
                        <mrow>
                          <mi>j</mi>
                          <mo>=</mo>
                          <mn>0</mn>
                        </mrow>
                        <mrow>
                          <mi>n</mi>
                          <mo>&#x2212;</mo>
                          <mn>1</mn>
                        </mrow>
                      </munderover>
                      <mo stretchy="false">[</mo>
                      <mo stretchy="false">(</mo>
                      <mi>I</mi>
                      <mo stretchy="false">(</mo>
                      <mi>x</mi>
                      <mo>,</mo>
                      <mi>y</mi>
                      <mo stretchy="false">)</mo>
                      <mo>&#x2212;</mo>
                      <mi>K</mi>
                      <mo stretchy="false">(</mo>
                      <mi>x</mi>
                      <mo>,</mo>
                      <mi>y</mi>
                      <mo stretchy="false">)</mo>
                      <msup>
                        <mo stretchy="false">]</mo>
                        <mrow>
                          <mn>2</mn>
                        </mrow>
                      </msup>
                    </math>
                    PSNR可定义为：
                    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                      <mi>P</mi>
                      <mi>S</mi>
                      <mi>N</mi>
                      <mi>R</mi>
                      <mo>=</mo>
                      <mn>10</mn>
                      <mo>&#xB7;</mo>
                      <mi>l</mi>
                      <mi>o</mi>
                      <msub>
                        <mi>g</mi>
                        <mrow>
                          <mn>10</mn>
                        </mrow>
                      </msub>
                      <mo stretchy="false">(</mo>
                      <mfrac>
                        <mrow>
                          <mi>M</mi>
                          <mi>A</mi>
                          <msubsup>
                            <mi>X</mi>
                            <mrow>
                              <mi>I</mi>
                            </mrow>
                            <mrow>
                              <mn>2</mn>
                            </mrow>
                          </msubsup>
                        </mrow>
                        <mrow>
                          <mi>M</mi>
                          <mi>S</mi>
                          <mi>E</mi>
                        </mrow>
                      </mfrac>
                      <mo stretchy="false">)</mo>
                    </math>
                    其中MAXI为图像的最大像素值，PSNR的单位为dB。若每个像素由8位二进制表示，则其值为2^8-1=255，
                    若原始图像是彩色图像，可以由以下方法进行计算： 计算RGB图像三个通道每个通道的MSE值再求平均值，进而求PSNR。*/}
                  </ProCard>
                  <ProCard type={"inner"} style={{height: '450px'}} bordered={true}>
                    <Column
                      data={robustData2.attacks}
                      //mation={false}
                      onReady={(plot) => {
                        plot.on('element:click', (...args: any) => {
                          //console.log(args);
                          let item;
                          item = args[0].data.data.config;
                          /*                    item = args[0].data.data.config.split("{").join("{\n");
                                              item = item.split(",").join(",\n");
                                              item = item.split("}").join("\n}");*/
                          //console.log(item);
                          modal.info({
                            title: '配置信息', content: (
                              <>
                                <div style={{whiteSpace: 'pre-line'}}>{item}</div>
                              </>
                            ),
                          });
                        });
                      }}
                      xField={'methodName'}
                      yField={'psnr'}
                      isGroup={true}
                      legend={{
                        layout: 'horizontal',
                        flipPage: false
                      }}
                      seriesField={'methodName'}
                      xAxis={{
                        title: {
                          text: '攻击方法', style: {
                            cursor: 'pointer',
                            fontSize: 18,
                          }
                        },
                        label: null,
                      }}
                      tooltip={{}}
                      yAxis={{
                        title: {
                          text: '峰值信噪比(dB)', style: {
                            cursor: 'pointer',
                            fontSize: 18,
                          }
                        },
                        label: {style: {fontWeight: 'bolder', fontSize: 12}},
                        min: 0,
                        max: 160,
                      }}
                      label={{
                        position: 'top',
                        offsetY: 10,
                        style: {fontSize: 9}
                      }}
                      maxColumnWidth={40}
                      minColumnWidth={40}
                      annotations={[]}
                      /*                label={{
                                        // 可手动配置 label 数据标签位置
                                        position: 'top',
                                        // 'top', 'bottom', 'middle',
                                        // 配置样式
                                        style: {
                                          fill: '#000000',
                                          opacity: 1,
                                        },
                                      }}*/
                      meta={{
                        methodName: {
                          alias: '方法',
                        },
                        psnr: {
                          alias: '峰值信噪比',
                        },
                      }}
                    />
                  </ProCard>
                </ProCard>
              </ProCard>
            )}
            {robustBarType === 'epsilonL1' && (
              <ProCard split={"horizontal"} layout={"center"}>
                <ProCard gutter={30} style={{height: '500px'}} colSpan={24}>
                  <ProCard type={"inner"} title={<Typography.Title type={'success'} level={3}>指标说明</Typography.Title>}
                           style={{height: '450px'}} bordered={true} colSpan={"30%"}>
                    <Typography style={{textIndent: '1em', fontSize: '15px'}}>
                      <Typography>
                        全部样本的扰动大小平均值即为平均扰动大小。该指标越大，说明想对该模型攻击成功需要的扰动幅度就越大。
                      </Typography>
                      <Typography>
                        对抗攻击方法基于原始样本生成对抗样本，对这两张图片来说，任取一像素点，计算它们在这一像素点大小的差值，即为该像素的扰动大小。平均扰动大小是基于样本中全部像素的扰动大小计算的。本平台共使用了三种计算方法：
                        <Typography>（1）L1范数法，计算所有像素扰动大小的绝对值之和；</Typography>
                        <Typography>（2）L2范数法，计算所有像素扰动大小的平方和，并对结果求平方根；</Typography>
                        <Typography>（3）L∞范数法，求最大的像素扰动大小。</Typography>
                      </Typography>
                    </Typography>
                    {/*<Typography >
                      平均扰动大小定义了对抗攻击中修改了每个像素的大小，这个大小可以使用不同的范数来度量，比较常用的范数是1范数、2范数和无穷范数：
                      <ul>
                        <li>
                          1范数(L1 norm):所有修改像素值绝对值之和。在数学定义中，1范数为
                          <math xmlns="http://www.w3.org/1998/Math/MathML" display={"block"}>
                            <msub>
                              <mrow data-mjx-texclass="INNER">
                                <mo data-mjx-texclass="OPEN">|</mo>
                                <mrow data-mjx-texclass="INNER">
                                  <mo data-mjx-texclass="OPEN">|</mo>
                                  <mi>x</mi>
                                  <mo data-mjx-texclass="CLOSE">|</mo>
                                </mrow>
                                <mo data-mjx-texclass="CLOSE">|</mo>
                              </mrow>
                              <mrow>
                                <mn>1</mn>
                              </mrow>
                            </msub>
                            <mo>=</mo>
                            <mrow>
                              <mstyle displaystyle="false" scriptlevel="0">
                                <munderover>
                                  <mo data-mjx-texclass="OP">&#x2211;</mo>
                                  <mrow>
                                    <mi>i</mi>
                                  </mrow>
                                  <mrow></mrow>
                                </munderover>
                              </mstyle>
                            </mrow>
                            <mrow data-mjx-texclass="INNER">
                              <mo data-mjx-texclass="OPEN">|</mo>
                              <msub>
                                <mi>x</mi>
                                <mrow>
                                  <mi>i</mi>
                                </mrow>
                              </msub>
                              <mo data-mjx-texclass="CLOSE">|</mo>
                            </mrow>
                          </math>
                        </li>
                        <li>
                          2范数(L2 norm):误差向量的欧拉范数。在数学定义中，2范数为
                          <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                            <msub>
                              <mrow data-mjx-texclass="INNER">
                                <mo data-mjx-texclass="OPEN">|</mo>
                                <mrow data-mjx-texclass="INNER">
                                  <mo data-mjx-texclass="OPEN">|</mo>
                                  <mi>x</mi>
                                  <mo data-mjx-texclass="CLOSE">|</mo>
                                </mrow>
                                <mo data-mjx-texclass="CLOSE">|</mo>
                              </mrow>
                              <mrow>
                                <mn>2</mn>
                              </mrow>
                            </msub>
                            <mo>=</mo>
                            <mo stretchy="false">(</mo>
                            <mrow>
                              <mstyle displaystyle="false" scriptlevel="0">
                                <munderover>
                                  <mo data-mjx-texclass="OP">&#x2211;</mo>
                                  <mrow>
                                    <mi>i</mi>
                                  </mrow>
                                  <mrow></mrow>
                                </munderover>
                              </mstyle>
                            </mrow>
                            <msubsup>
                              <mi>x</mi>
                              <mrow>
                                <mi>i</mi>
                              </mrow>
                              <mrow>
                                <mn>2</mn>
                              </mrow>
                            </msubsup>
                            <msup>
                              <mo stretchy="false">)</mo>
                              <mrow>
                                <mn>0.5</mn>
                              </mrow>
                            </msup>
                          </math>
                        </li>
                        <li>
                          无穷范数(L无穷 norm):所有修改像素值绝对值的最大值。在数学定义中，无穷范数为
                          <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                            <msub>
                              <mrow data-mjx-texclass="INNER">
                                <mo data-mjx-texclass="OPEN">|</mo>
                                <mrow data-mjx-texclass="INNER">
                                  <mo data-mjx-texclass="OPEN">|</mo>
                                  <mi>x</mi>
                                  <mo data-mjx-texclass="CLOSE">|</mo>
                                </mrow>
                                <mo data-mjx-texclass="CLOSE">|</mo>
                              </mrow>
                              <mrow>
                                <mi mathvariant="normal">&#x221E;</mi>
                              </mrow>
                            </msub>
                            <mo>=</mo>
                            <mi>m</mi>
                            <mi>a</mi>
                            <msub>
                              <mi>x</mi>
                              <mrow>
                                <mi>i</mi>
                              </mrow>
                            </msub>
                            <mrow data-mjx-texclass="INNER">
                              <mo data-mjx-texclass="OPEN">|</mo>
                              <msub>
                                <mi>x</mi>
                                <mrow>
                                  <mi>i</mi>
                                </mrow>
                              </msub>
                              <mo data-mjx-texclass="CLOSE">|</mo>
                            </mrow>
                          </math>
                        </li>
                      </ul>
                      其中
                      <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <mi>x</mi>
                      </math>
                      是修改图像后的差值，
                      <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <msub>
                          <mi>x</mi>
                          <mrow>
                            <mi>i</mi>
                          </mrow>
                        </msub>
                      </math>
                      是差值中的第像素。
                    </Typography>*/}
                  </ProCard>
                  <ProCard type={"inner"} style={{height: '450px'}} bordered={true}>
                    <ProCard bordered={false}>
                      <Column
                        data={avgEpsilonL1}
                        //animation={false}
                        xField={'epsilonType'}
                        yField={'index'}
                        isGroup={true}
                        legend={{
                          layout: 'horizontal',
                          flipPage: false
                        }}
                        seriesField={'methodName'}
                        maxColumnWidth={40}
                        minColumnWidth={15}
                        xAxis={{
                          title: {
                            text: '不同范数下的扰动大小', style: {
                              cursor: 'pointer',
                              fontSize: 18,
                            }
                          },
                          label: {style: {fontWeight: 'bolder', fontSize: 10}},
                        }}
                        yAxis={{
                          title: {
                            text: '平均扰动大小', style: {
                              cursor: 'pointer',
                              fontSize: 18,
                            }
                          },
                          label: {style: {fontWeight: 'bolder', fontSize: 12}},
                          /*                  min: 0,
                                            max: epsilon * 1.5,*/
                        }}
                        label={{
                          position: 'top',
                          offsetY: 10,
                          style: {fontSize: 9}
                        }}
                        /*                label={{
                                          // 可手动配置 label 数据标签位置
                                          position: 'top',
                                          // 'top', 'bottom', 'middle',
                                          // 配置样式
                                          style: {
                                            fill: '#000000',
                                            opacity: 1,
                                          },
                                        }}*/
                        meta={{
                          methodName: {
                            alias: '方法',
                          },
                          epsilon: {
                            alias: '扰动大小',
                          },
                        }}
                      />
                    </ProCard>

                  </ProCard>
                </ProCard>
              </ProCard>
            )}
            {robustBarType === 'epsilonL2' && (
              <ProCard split={"horizontal"} layout={"center"}>
                <ProCard gutter={30} style={{height: '500px'}} colSpan={24}>
                  <ProCard type={"inner"} title={<Typography.Title type={'success'} level={3}>指标说明</Typography.Title>}
                           style={{height: '450px'}} bordered={true} colSpan={"30%"}>
                    <Typography style={{textIndent: '1em', fontSize: '15px'}}>
                      <Typography>
                        全部样本的扰动大小平均值即为平均扰动大小。该指标越大，说明想对该模型攻击成功需要的扰动幅度就越大。
                      </Typography>
                      <Typography>
                        对抗攻击方法基于原始样本生成对抗样本，对这两张图片来说，任取一像素点，计算它们在这一像素点大小的差值，即为该像素的扰动大小。平均扰动大小是基于样本中全部像素的扰动大小计算的。本平台共使用了三种计算方法：
                        <Typography>（1）L1范数法，计算所有像素扰动大小的绝对值之和；</Typography>
                        <Typography>（2）L2范数法，计算所有像素扰动大小的平方和，并对结果求平方根；</Typography>
                        <Typography>（3）L∞范数法，求最大的像素扰动大小。</Typography>
                      </Typography>
                    </Typography>
                    {/*<Typography >
                      平均扰动大小定义了对抗攻击中修改了每个像素的大小，这个大小可以使用不同的范数来度量，比较常用的范数是1范数、2范数和无穷范数：
                      <ul>
                        <li>
                          1范数(L1 norm):所有修改像素值绝对值之和。在数学定义中，1范数为
                          <math xmlns="http://www.w3.org/1998/Math/MathML" display={"block"}>
                            <msub>
                              <mrow data-mjx-texclass="INNER">
                                <mo data-mjx-texclass="OPEN">|</mo>
                                <mrow data-mjx-texclass="INNER">
                                  <mo data-mjx-texclass="OPEN">|</mo>
                                  <mi>x</mi>
                                  <mo data-mjx-texclass="CLOSE">|</mo>
                                </mrow>
                                <mo data-mjx-texclass="CLOSE">|</mo>
                              </mrow>
                              <mrow>
                                <mn>1</mn>
                              </mrow>
                            </msub>
                            <mo>=</mo>
                            <mrow>
                              <mstyle displaystyle="false" scriptlevel="0">
                                <munderover>
                                  <mo data-mjx-texclass="OP">&#x2211;</mo>
                                  <mrow>
                                    <mi>i</mi>
                                  </mrow>
                                  <mrow></mrow>
                                </munderover>
                              </mstyle>
                            </mrow>
                            <mrow data-mjx-texclass="INNER">
                              <mo data-mjx-texclass="OPEN">|</mo>
                              <msub>
                                <mi>x</mi>
                                <mrow>
                                  <mi>i</mi>
                                </mrow>
                              </msub>
                              <mo data-mjx-texclass="CLOSE">|</mo>
                            </mrow>
                          </math>
                        </li>
                        <li>
                          2范数(L2 norm):误差向量的欧拉范数。在数学定义中，2范数为
                          <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                            <msub>
                              <mrow data-mjx-texclass="INNER">
                                <mo data-mjx-texclass="OPEN">|</mo>
                                <mrow data-mjx-texclass="INNER">
                                  <mo data-mjx-texclass="OPEN">|</mo>
                                  <mi>x</mi>
                                  <mo data-mjx-texclass="CLOSE">|</mo>
                                </mrow>
                                <mo data-mjx-texclass="CLOSE">|</mo>
                              </mrow>
                              <mrow>
                                <mn>2</mn>
                              </mrow>
                            </msub>
                            <mo>=</mo>
                            <mo stretchy="false">(</mo>
                            <mrow>
                              <mstyle displaystyle="false" scriptlevel="0">
                                <munderover>
                                  <mo data-mjx-texclass="OP">&#x2211;</mo>
                                  <mrow>
                                    <mi>i</mi>
                                  </mrow>
                                  <mrow></mrow>
                                </munderover>
                              </mstyle>
                            </mrow>
                            <msubsup>
                              <mi>x</mi>
                              <mrow>
                                <mi>i</mi>
                              </mrow>
                              <mrow>
                                <mn>2</mn>
                              </mrow>
                            </msubsup>
                            <msup>
                              <mo stretchy="false">)</mo>
                              <mrow>
                                <mn>0.5</mn>
                              </mrow>
                            </msup>
                          </math>
                        </li>
                        <li>
                          无穷范数(L无穷 norm):所有修改像素值绝对值的最大值。在数学定义中，无穷范数为
                          <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                            <msub>
                              <mrow data-mjx-texclass="INNER">
                                <mo data-mjx-texclass="OPEN">|</mo>
                                <mrow data-mjx-texclass="INNER">
                                  <mo data-mjx-texclass="OPEN">|</mo>
                                  <mi>x</mi>
                                  <mo data-mjx-texclass="CLOSE">|</mo>
                                </mrow>
                                <mo data-mjx-texclass="CLOSE">|</mo>
                              </mrow>
                              <mrow>
                                <mi mathvariant="normal">&#x221E;</mi>
                              </mrow>
                            </msub>
                            <mo>=</mo>
                            <mi>m</mi>
                            <mi>a</mi>
                            <msub>
                              <mi>x</mi>
                              <mrow>
                                <mi>i</mi>
                              </mrow>
                            </msub>
                            <mrow data-mjx-texclass="INNER">
                              <mo data-mjx-texclass="OPEN">|</mo>
                              <msub>
                                <mi>x</mi>
                                <mrow>
                                  <mi>i</mi>
                                </mrow>
                              </msub>
                              <mo data-mjx-texclass="CLOSE">|</mo>
                            </mrow>
                          </math>
                        </li>
                      </ul>
                      其中
                      <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <mi>x</mi>
                      </math>
                      是修改图像后的差值，
                      <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <msub>
                          <mi>x</mi>
                          <mrow>
                            <mi>i</mi>
                          </mrow>
                        </msub>
                      </math>
                      是差值中的第像素。
                    </Typography>*/}
                  </ProCard>
                  <ProCard type={"inner"} style={{height: '450px'}} bordered={true}>
                    <ProCard bordered={false}>
                      <Column
                        data={avgEpsilonL2}
                        //animation={false}
                        xField={'epsilonType'}
                        yField={'index'}
                        isGroup={true}
                        legend={{
                          layout: 'horizontal',
                          flipPage: false
                        }}
                        seriesField={'methodName'}
                        maxColumnWidth={40}
                        minColumnWidth={15}
                        xAxis={{
                          title: {
                            text: '不同范数下的扰动大小', style: {
                              cursor: 'pointer',
                              fontSize: 18,
                            }
                          },
                          label: {style: {fontWeight: 'bolder', fontSize: 10}},
                        }}
                        label={{
                          position: 'top',
                          offsetY: 10,
                          style: {fontSize: 9}
                        }}
                        /*                label={{
                                          // 可手动配置 label 数据标签位置
                                          position: 'top',
                                          // 'top', 'bottom', 'middle',
                                          // 配置样式
                                          style: {
                                            fill: '#000000',
                                            opacity: 1,
                                          },
                                        }}*/
                        meta={{
                          methodName: {
                            alias: '方法',
                          },
                          epsilon: {
                            alias: '扰动大小',
                          },
                        }}
                      />
                    </ProCard>
                  </ProCard>
                </ProCard>
              </ProCard>
            )}
            {robustBarType === 'epsilonLInfinity' && (
              <ProCard split={"horizontal"} layout={"center"}>
                <ProCard gutter={30} style={{height: '500px'}} colSpan={24}>
                  <ProCard type={"inner"} title={<Typography.Title type={'success'} level={3}>指标说明</Typography.Title>}
                           style={{height: '450px'}} bordered={true} colSpan={"30%"}>
                    <Typography style={{textIndent: '1em', fontSize: '15px'}}>
                      <Typography>
                        全部样本的扰动大小平均值即为平均扰动大小。该指标越大，说明想对该模型攻击成功需要的扰动幅度就越大。
                      </Typography>
                      <Typography>
                        对抗攻击方法基于原始样本生成对抗样本，对这两张图片来说，任取一像素点，计算它们在这一像素点大小的差值，即为该像素的扰动大小。平均扰动大小是基于样本中全部像素的扰动大小计算的。本平台共使用了三种计算方法：
                        <Typography>（1）L1范数法，计算所有像素扰动大小的绝对值之和；</Typography>
                        <Typography>（2）L2范数法，计算所有像素扰动大小的平方和，并对结果求平方根；</Typography>
                        <Typography>（3）L∞范数法，求最大的像素扰动大小。</Typography>
                      </Typography>
                    </Typography>
                    {/*<Typography >
                      平均扰动大小定义了对抗攻击中修改了每个像素的大小，这个大小可以使用不同的范数来度量，比较常用的范数是1范数、2范数和无穷范数：
                      <ul>
                        <li>
                          1范数(L1 norm):所有修改像素值绝对值之和。在数学定义中，1范数为
                          <math xmlns="http://www.w3.org/1998/Math/MathML" display={"block"}>
                            <msub>
                              <mrow data-mjx-texclass="INNER">
                                <mo data-mjx-texclass="OPEN">|</mo>
                                <mrow data-mjx-texclass="INNER">
                                  <mo data-mjx-texclass="OPEN">|</mo>
                                  <mi>x</mi>
                                  <mo data-mjx-texclass="CLOSE">|</mo>
                                </mrow>
                                <mo data-mjx-texclass="CLOSE">|</mo>
                              </mrow>
                              <mrow>
                                <mn>1</mn>
                              </mrow>
                            </msub>
                            <mo>=</mo>
                            <mrow>
                              <mstyle displaystyle="false" scriptlevel="0">
                                <munderover>
                                  <mo data-mjx-texclass="OP">&#x2211;</mo>
                                  <mrow>
                                    <mi>i</mi>
                                  </mrow>
                                  <mrow></mrow>
                                </munderover>
                              </mstyle>
                            </mrow>
                            <mrow data-mjx-texclass="INNER">
                              <mo data-mjx-texclass="OPEN">|</mo>
                              <msub>
                                <mi>x</mi>
                                <mrow>
                                  <mi>i</mi>
                                </mrow>
                              </msub>
                              <mo data-mjx-texclass="CLOSE">|</mo>
                            </mrow>
                          </math>
                        </li>
                        <li>
                          2范数(L2 norm):误差向量的欧拉范数。在数学定义中，2范数为
                          <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                            <msub>
                              <mrow data-mjx-texclass="INNER">
                                <mo data-mjx-texclass="OPEN">|</mo>
                                <mrow data-mjx-texclass="INNER">
                                  <mo data-mjx-texclass="OPEN">|</mo>
                                  <mi>x</mi>
                                  <mo data-mjx-texclass="CLOSE">|</mo>
                                </mrow>
                                <mo data-mjx-texclass="CLOSE">|</mo>
                              </mrow>
                              <mrow>
                                <mn>2</mn>
                              </mrow>
                            </msub>
                            <mo>=</mo>
                            <mo stretchy="false">(</mo>
                            <mrow>
                              <mstyle displaystyle="false" scriptlevel="0">
                                <munderover>
                                  <mo data-mjx-texclass="OP">&#x2211;</mo>
                                  <mrow>
                                    <mi>i</mi>
                                  </mrow>
                                  <mrow></mrow>
                                </munderover>
                              </mstyle>
                            </mrow>
                            <msubsup>
                              <mi>x</mi>
                              <mrow>
                                <mi>i</mi>
                              </mrow>
                              <mrow>
                                <mn>2</mn>
                              </mrow>
                            </msubsup>
                            <msup>
                              <mo stretchy="false">)</mo>
                              <mrow>
                                <mn>0.5</mn>
                              </mrow>
                            </msup>
                          </math>
                        </li>
                        <li>
                          无穷范数(L无穷 norm):所有修改像素值绝对值的最大值。在数学定义中，无穷范数为
                          <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                            <msub>
                              <mrow data-mjx-texclass="INNER">
                                <mo data-mjx-texclass="OPEN">|</mo>
                                <mrow data-mjx-texclass="INNER">
                                  <mo data-mjx-texclass="OPEN">|</mo>
                                  <mi>x</mi>
                                  <mo data-mjx-texclass="CLOSE">|</mo>
                                </mrow>
                                <mo data-mjx-texclass="CLOSE">|</mo>
                              </mrow>
                              <mrow>
                                <mi mathvariant="normal">&#x221E;</mi>
                              </mrow>
                            </msub>
                            <mo>=</mo>
                            <mi>m</mi>
                            <mi>a</mi>
                            <msub>
                              <mi>x</mi>
                              <mrow>
                                <mi>i</mi>
                              </mrow>
                            </msub>
                            <mrow data-mjx-texclass="INNER">
                              <mo data-mjx-texclass="OPEN">|</mo>
                              <msub>
                                <mi>x</mi>
                                <mrow>
                                  <mi>i</mi>
                                </mrow>
                              </msub>
                              <mo data-mjx-texclass="CLOSE">|</mo>
                            </mrow>
                          </math>
                        </li>
                      </ul>
                      其中
                      <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <mi>x</mi>
                      </math>
                      是修改图像后的差值，
                      <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <msub>
                          <mi>x</mi>
                          <mrow>
                            <mi>i</mi>
                          </mrow>
                        </msub>
                      </math>
                      是差值中的第像素。
                    </Typography>*/}
                  </ProCard>
                  <ProCard type={"inner"} style={{height: '450px'}} bordered={true}>
                    <ProCard bordered={false}>
                      <Column
                        data={avgEpsilonLInfinity}
                        //animation={false}
                        xField={'epsilonType'}
                        yField={'index'}
                        isGroup={true}
                        legend={{
                          layout: 'horizontal',
                          flipPage: false,
                        }}
                        seriesField={'methodName'}
                        maxColumnWidth={40}
                        minColumnWidth={15}
                        xAxis={{
                          title: {
                            text: '不同范数下的扰动大小', style: {
                              cursor: 'pointer',
                              fontSize: 18,
                            }
                          },
                          label: {style: {fontWeight: 'bolder', fontSize: 10}},
                        }}
                        label={{
                          position: 'top',
                          offsetY: 10,
                          style: {fontSize: 9},
                        }}
                        /*                label={{
                                          // 可手动配置 label 数据标签位置
                                          position: 'top',
                                          // 'top', 'bottom', 'middle',
                                          // 配置样式
                                          style: {
                                            fill: '#000000',
                                            opacity: 1,
                                          },
                                        }}*/
                        meta={{
                          methodName: {
                            alias: '方法',
                          },
                          epsilon: {
                            alias: '扰动大小',
                          },
                        }}
                      />
                    </ProCard>
                  </ProCard>
                </ProCard>
              </ProCard>
            )}
            <ProCard>
              <ProTable
                name={'attackTable'}
                bordered={true}
                pagination={false}
                columns={robustColumns}
                loading={false}
                search={false}
                options={false}
                scroll={{x: 1500}}
                request={async () => {
                  const data = robustDataTable.attacks;
                  for (let attack of data) {
                    attack.batch_size = robustData2.batch_size;
                    //attack.distortion_factor = attack.distortion_factor.toExponential();
                    attack.L1_distortion_factor = attack.distortion_factor[0].toFixed(2);
                    attack.L2_distortion_factor = attack.distortion_factor[1].toFixed(2);
                    attack.L_infinity_distortion_factor = attack.distortion_factor[2].toFixed(2);

                    attack.L1_avg_epsilon = attack.avg_epsilon[0].toFixed(2);
                    attack.L2_avg_epsilon = attack.avg_epsilon[1].toFixed(2);
                    attack.L_infinity_avg_epsilon = attack.avg_epsilon[2].toFixed(2);

                    if (typeof attack.ssim === 'number' && !isNaN(attack.ssim))
                      attack.ssim = attack.ssim.toFixed(2);
                    if (typeof attack.psnr === 'number' && !isNaN(attack.psnr))
                      attack.psnr = attack.psnr.toFixed(2);
                    if (typeof attack.success_attack_rate === 'number' && !isNaN(attack.success_attack_rate))
                      attack.success_attack_rate = attack.success_attack_rate.toFixed(2);
                  }
                  ;
                  return {
                    data: data,
                    success: true,
                  }
                }}
              />
            </ProCard>
            {/*</ProCard>*/}


          </ProCard>
        )}

        {/*可解释性评测结果内容*/}
        {/*        {evaluateType === "INTERPRET" && (
          <>
                      <ProCard  title={"可解释性(决策树代理模型)"}></ProCard>
        <ProCard split={"vertical"} bodyStyle={{padding: '80px'}}>
          <ProCard colSpan={12} split={"horizontal"} >
            <ProCard title={"一致性指标柱状图"} bodyStyle={{paddingBottom:'100px'}}>
            <Column name={"consistency"} {...consistencyConfig} />
            </ProCard>
            <ProCard title={"明确性指标柱状图"} bodyStyle={{paddingBottom:'100px'}}>
              <Column name={"specificity"} {...specificityConfig} />
            </ProCard>
          </ProCard>
          <ProCard title={"复杂性指标柱状图"} bodyStyle={{paddingBottom:'100px'}}>
            <Column name={"complexity"} {...complexityConfig} />
          </ProCard>
        </ProCard>
            {proxyType === 'rule' && (
              <>
                <Proxy_rule_bar interpretData2={interpretData2}></Proxy_rule_bar>
              </>
            )}
            {proxyType === 'tree' && (
              <>
                <Proxy_tree_bar interpretData2={interpretData2}></Proxy_tree_bar>
              </>
            )}
            {interpretType === 'topsis_ahp_entropy_rule' && (
              <Topsis_ahp_entropy_rule textParam={textParam} tableData={tableData}></Topsis_ahp_entropy_rule>
            )}
            {interpretType === 'fuzzy_ahp_rule' && (
              <Fuzzy_ahp_rule textParam={textParam} tableData={tableData}></Fuzzy_ahp_rule>
            )}
            {interpretType === 'grey_ahp_rule' && (
              <Grey_ahp_rule textParam={textParam} tableData={tableData}></Grey_ahp_rule>
            )}
            {interpretType === 'rsr_ahp_rule' && (
              <Rsr_ahp_rule textParam={textParam} tableData={tableData}></Rsr_ahp_rule>
            )}
            {interpretType === 'topsis_ahp_rule' && (
              <Topsis_ahp_rule textParam={textParam} tableData={tableData}></Topsis_ahp_rule>
            )}
            {interpretType === 'fuzzy_ahp_tree' && (
              <Fuzzy_ahp_tree textParam={textParam} tableData={tableData}></Fuzzy_ahp_tree>
            )}
            {interpretType === 'grey_ahp_tree' && (
              <Grey_ahp_tree textParam={textParam} tableData={tableData}></Grey_ahp_tree>
            )}
            {interpretType === 'rsr_ahp_tree' && (
              <Rsr_ahp_tree textParam={textParam} tableData={tableData}></Rsr_ahp_tree>
            )}
            {interpretType === 'topsis_ahp_tree' && (
              <Topsis_ahp_tree textParam={textParam} tableData={tableData}></Topsis_ahp_tree>
            )}
            {interpretType === 'topsis_ahp_entropy_tree' && (
              <Topsis_ahp_entropy_tree textParam={textParam} tableData={tableData}></Topsis_ahp_entropy_tree>
            )}
          </>)}*/}
        {evaluateType === 'ImgListINTERPRET' && (
          <>
            <ProCard colSpan={16}>
              <ProTable
                columns={interpretColumns}
                search={false}
                tableAlertRender={false}
                options={false}
                request={async () => {
                  const data = interpretImgList;

                  return {
                    data: data,
                    success: true,
                  }
                }}
              ></ProTable>
            </ProCard>
          </>
        )}
        {evaluateType === 'ImgResultINTERPRET' && (
          <>
            <ProCard split={"horizontal"} title={<Typography.Title level={3}>可解释性</Typography.Title>} layout={"center"}>
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
                }}>图片可解释性测评结果</div>}
                width={'200px'}
                name="interpretBarType"
                placeholder={imgInterpretMethodType}
                onChange={(e) => {
                  //console.log(e);
                  setImgInterpretMethodType(e);
                }}
                options={interpretImgMethodList}
              />
              <ProCard colSpan={20}>
                {
                  interpretImgResult.map((item) => {
                      return (
                        imgInterpretMethodType === item.methodName &&
                        (<ProCard split={"horizontal"}>
                            <ProCard split={"vertical"}
                                     title={<Typography.Title level={3}>{item.methodName}</Typography.Title>}
                                     layout={"center"}>
                              <Space>
                                <Image src={item.originalImg} height={200} width={200}></Image>
                                <Image src={item.Img} height={200} width={200}></Image>
                              </Space>
                            </ProCard>
                            <ProCard layout={"center"}>
                              <div>（左）输入实例；</div>
                              <br/>
                              <div>（右）{item.methodName}可解释性输出结果 右图色深部分表示模型在做出决策时更关注的部分</div>
                            </ProCard>
                          </ProCard>
                        )
                      )
                    }
                  )
                }
              </ProCard>
            </ProCard>
          </>
        )
        }

      </ProCard>
    </>
  );

};
