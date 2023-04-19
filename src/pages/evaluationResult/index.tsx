import {useState, useEffect} from 'react';
import {Column} from '@ant-design/plots';
import {ProTable} from "@ant-design/pro-components";
import type {ProColumns} from "@ant-design/pro-components";
import {message, Modal, Typography} from 'antd';
import {ProCard} from '@ant-design/pro-components';
import {evaluateResult, evaluateConfigResult} from "@/services/ant-design-pro/api";
import {history} from "umi";


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


//(正确性表格
const accuracyColumns: ProColumns[] = [
  {
    title: <b>样本数量</b>,
    dataIndex: 'BATCH_SIZE',
    valueType: "digit"
  },
  {
    title: <b>测试集准确率(%)</b>,
    dataIndex: 'ACC',
    valueType: "digit"
  },
  {
    title: <b>测试集召回率(%)</b>,
    dataIndex: 'RECALL',
    valueType: "digit"
  },
  {
    title: <b>测试集精确率(%)</b>,
    dataIndex: 'PRECISION',
    valueType: "digit"
  },
  {
    title: <b>F1分数</b>,
    dataIndex: 'F1_SCORE',
    valueType: "digit"
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
  },
  {
    title: <b>样本数</b>,
    dataIndex: 'batch_size',
    valueType: 'digit',
  },
  {
    title: <b>攻击成功率(%)</b>,
    dataIndex: 'success_attack_rate',
    valueType: 'digit',
  },
  {
    title: <b>平均结构相似度(%)</b>,
    dataIndex: 'ssim',
    valueType: 'digit',
  },
  {
    title: <b>峰值信噪比</b>,
    dataIndex: 'psnr',
  },
  {
    title: <b>L1失真度</b>,
    dataIndex: 'L1_distortion_factor',
    valueType: 'digit',
  },
  {
    title: <b>L2失真度</b>,
    dataIndex: 'L2_distortion_factor',
    valueType: 'digit',
  },
  {
    title: <b>L∞失真度</b>,
    dataIndex: 'L_infinity_distortion_factor',
    valueType: 'digit',
  },
  {
    title: <b>平均扰动大小（L1范数）</b>,
    dataIndex: 'L1_avg_epsilon',
    valueType: 'digit',
  },
  {
    title: <b>平均扰动大小（L2范数）</b>,
    dataIndex: 'L2_avg_epsilon',
    valueType: 'digit',
  },
  {
    title: <b>平均扰动大小（L∞范数）</b>,
    dataIndex: 'L_infinity_avg_epsilon',
    valueType: 'digit',
  },
  /*  {
      title: '扰动大小',
      dataIndex: 'epsilon',
    },*/
];
//鲁棒性表格)


export default (params) => {
  let obj;
  const [evaluateType, setEvaluateType] = useState('');
  const [adaptData2, setAdaptData2] = useState({});
  const [robustData2, setRobustData2] = useState();
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
  const [avgEpsilon, setAvgEpsilon] = useState([]);

  //可解释性展示类型
  const [interpretType, setInterpretType] = useState('');

  //设置评估模型类型
  const [proxyType, setProxyType] = useState('');

  const config = async () => {
    const data = await evaluateResult(params.location.query.resultId);
    const configRes = await evaluateConfigResult(params.location.query.resultId);
    /*    configRes.data.resultStr =  data.data.resultStr.replaceAll('Infinity', '0');
        configRes.data.resultStr =  data.data.resultStr.replaceAll('NaN', '0');*/

    ////console.log(configRes);
    const configData = configRes.data;
    //console.log(configData);
    //console.log(data.data);
    data.data.resultStr = data.data.resultStr.replaceAll('Infinity', '0');
    data.data.resultStr = data.data.resultStr.replaceAll('NaN', '0');


    try {
      if (data.code === "00000" && data.data.resultStr !== '') {
        // //console.log(data.data.resultStr);
        obj = data.data;

        //console.log(obj);

        if (obj.evaluateType === '鲁棒性') {
          const res = JSON.parse(obj.resultStr);
          let max = 0;
          let maxFactor = 0;
          let newDistortionFactor = [];
          let avgEpsilon = [];
          res.attacks = res.attacks.map((item) => {
            if (max < item.epsilon)
              max = item.epsilon;
            /*          if (maxFactor < item.distortion_factor[0])
                        maxFactor = item.distortion_factor;*/
            maxFactor = Math.max(maxFactor, item.distortion_factor[0], item.distortion_factor[1], item.distortion_factor[2])
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
            //console.log(Number(item.success_attack_rate * 100).toFixed(1));
            item.success_attack_rate = Number((Number(item.success_attack_rate.toFixed(3)) * 100).toFixed(1));
            ////console.log(typeof item.success_attack_rate, item.success_attack_rate);
            console.log(item);

            /*//console.log(typeof(item.distortion_factor));*/
            /*        if(item.distortion_factor < 0.001)
                      item.distortion_factor = 0.00001;*/
            return item;
          })
          console.log(res);
          setRobustData2(res);
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
            avgEpsilon.push({
              epsilonType: "L1平均扰动大小",
              methodName: item.methodName,
              index: item.avg_epsilon[0],
              epsilon: item.epsilon,
              config: configData[index].config,
            });
            avgEpsilon.push({
              epsilonType: "L2平均扰动大小",
              methodName: item.methodName,
              index: item.avg_epsilon[1],
              epsilon: item.epsilon,
              config: configData[index].config,
            });
            avgEpsilon.push({
              epsilonType: "L∞平均扰动大小",
              methodName: item.methodName,
              index: item.avg_epsilon[2],
              epsilon: item.epsilon,
              config: configData[index].config,
            });
          });
          //setRobustData2(JSON.parse(obj.resultStr));
          setNewDistortionFactor(newDistortionFactor);
          setAvgEpsilon(avgEpsilon);
          setDistortionFactor(maxFactor);
          //console.log(max);
          //console.log(res);
          //setRobustData2(res);
          //console.log(res.attacks);
          //console.log(robustData2);
          setEvaluateType('ROBUST');
          //console.log(evaluateType);
        }
        if (obj.evaluateType === '正确性') {
          setEvaluateType('ACC');
          //console.log(evaluateType);
        }
        if (obj.evaluateType === '适应性') {
          const res = JSON.parse(obj.resultStr);
          let avgDec: string;
          res.noiseMethodList.forEach((item: object, index: number) => {
            item.config = configData[index].config;
            avgDec = avgDec + res.clean_acc - item.change_clean_acc;
            item.change_clean_acc = parseFloat((item.change_clean_acc * 100).toFixed(2));
            console.log(parseFloat('1400.00'));
          });
          avgDec = ((avgDec / res.noiseMethodList.length) * 100).toFixed(2);
          res.avgDec = avgDec;
          res.noiseMethodList.unshift({'methodName': '原始情况', 'change_clean_acc': res.clean_acc * 100});
          setAdaptData2(res);
          console.log(adaptData2);
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
            setEvaluateType('INTERPRET');
          }

          /*        setRadarData([{item: '可解释性', score: 6.5}, {item: '适应性', score: 0}, {item: '鲁棒性', score: 0}, {
                    item: '正确性',
                    score: 0
                  },]);*/
        }
      }
    } catch {
      //console.log("1");
      history.push('/404');
      message.error("结果错误");
    }
    /*    else{
          history.push('/404');
          message.error("结果错误");
        }*/
  }
  // config();

  //(雷达图)
  const [radarData, setRadarData] = useState([]);

  useEffect(() => {
    //asyncFetch();
    config();
  }, []);

  const radarConfig = {
    data: radarData,
    xField: 'item',
    yField: 'score',
    meta: {
      score: {
        alias: '分数',
        min: 0,
        max: 10,
      },
    },
    xAxis: {
      line: null,
      tickLine: null,
      grid: {
        line: {
          style: {
            lineDash: null,
          },
        },
      },
    },
    // 开启辅助点
    point: {
      size: 2,
    },
  };
  // 雷达图)

  const [modal, contextHolder] = Modal.useModal();

  // @ts-ignore
  return (
    <>
      <ProCard split="horizontal">

        {/*        <RcResizeObserver
          key="resize-observer"
          onResize={(offset) => {
            setResponsive(offset.width < 596);
          }}
        >
          <ProCard.Group title="核心指标" direction={responsive ? 'column' : 'row'} >
            <ProCard colSpan={2} size={'default'}>
              <Statistic title="今日UV" value={79.0} precision={2} />
            </ProCard>
            <Divider type={responsive ? 'horizontal' : 'vertical'} />
            <ProCard>
              <Statistic title="冻结金额" value={112893.0} precision={2} />
            </ProCard>
            <Divider type={responsive ? 'horizontal' : 'vertical'} />
            <ProCard>
              <Statistic title="信息完整度" value={93} suffix="/ 100" />
            </ProCard>
            <Divider type={responsive ? 'horizontal' : 'vertical'} />
            <ProCard>
              <Statistic title="冻结金额" value={112893.0} />
            </ProCard>
          </ProCard.Group>
        </RcResizeObserver>*/}
        {/*        <ProCard split="vertical" title="综合评测">
          <ProCard><Radar {...radarConfig} /></ProCard>
          <ProCard>
            <Space direction={"vertical"} size={"middle"}>
            <div>模型评分详情</div>

              {evaluateType === "ACC" && (<>
            <div>正确性</div>
            在200张测试图片上，准确率达到XXX，召回率达到XXX，精确率达到XXX，f1分数达到XXX
              </>)}

              {evaluateType === "ADAPT" && (<>
            <div>适应性</div>
            在少量普通噪声干扰下能保持XXX的top-1分类准确率
              </>
              )}

              {evaluateType === "ROBUST" && (<>
            <div>鲁棒性</div>
            在少量对抗噪声干扰下能保持XXX的top-1分类准确率，鲁棒性下界epsilon达到8/255
                </>
                )}

              {evaluateType === "INTERPRET" && (<>
            <div>可解释性</div>
            该XAI的综合可解释性评分为6.5
              </>
                )}
            </Space>
          </ProCard>

        </ProCard>*/}

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
                      data1[key] = data1[key] * 100;
                    //data1[key] = 94.00;
                    console.log(data1[key]);
                    console.log(94.00);
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

        {evaluateType === "ADAPT" && (
          <ProCard title={<Typography.Title level={3}>适应性</Typography.Title>} layout={"center"} split={"horizontal"}>
            <ProCard colSpan={16}>
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
                  title: {text: '扰动方法'},
                  label: {style: {fontWeight: 'bolder', fontSize: 10}},
                }}
                yAxis={{
                  title: {text: '正确率(%)'},
                  tickCount: 6,
                  min: 0,
                  max: 100,
                }}
                maxColumnWidth={40}
                minColumnWidth={40}
                label={undefined}
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
                    alias: '正确率',
                  },
                }}
              />
              {contextHolder}
            </ProCard>
            <ProCard colSpan={10}>
              <div>在{adaptData2.batch_size}张测试图片上，进行了{adaptData2.noiseMethodList.length - 1}种噪声测试,在少量噪声干扰下，正确率平均下降{adaptData2.avgDec}%</div>
            </ProCard>
          </ProCard>)}

        {evaluateType === "ROBUST" && (
          <ProCard split={"horizontal"} title={<Typography.Title level={3}>鲁棒性</Typography.Title>} layout={"center"}
                   bodyStyle={{padding: '80px'}}>
            <ProCard split={"vertical"}>
              <ProCard split={"horizontal"} colSpan={12}>
                <ProCard title={"攻击成功率"}>
                  <Column
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
                      flipPage: false
                    }}
                    data={robustData2.attacks}
                    xField={'methodName'}
                    yField={'success_attack_rate'}
                    seriesField={'methodName'}
                    isGroup={true}
                    //seriesField={'methodName'}
                    xAxis={{
                      title: {text: '攻击方法'},
                      label: {rotate: -0.4, style: {fontWeight: 'bolder', fontSize: 10}},
                    }}
                    yAxis={{
                      title: {text: '攻击成功率(%)'},
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
                    minColumnWidth={20}
                    label={undefined}
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
                <ProCard title={"平均结构相似度"}>
                  <Column
                    data={robustData2.attacks}
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
                      flipPage: false
                    }}
                    xField={'methodName'}
                    yField={'ssim'}
                    seriesField={'methodName'}
                    xAxis={{
                      title: {text: '攻击方法'},
                      label: {rotate: -0.4, style: {fontWeight: 'bold', fontSize: 10}}
                    }}
                    yAxis={{
                      title: {text: '平均结构相似度(%)'},
                      tickCount: 7,
                      min: 0,
                      max: 100,
                    }}
                    maxColumnWidth={40}
                    minColumnWidth={20}
                    label={undefined}
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
              <ProCard split={"horizontal"} colSpan={12}>
                <ProCard title={"平均失真度"}>
                  <Column
                    /*                data={robustData2.attacks}*/
                    data={newDistortionFactor}
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
                      title: {text: '失真度类型'},
                      label: {style: {fontWeight: 'bolder', fontSize: 10}},
                    }}
                    yAxis={{
                      title: {text: '平均失真度'},
                      min: 0,
                      max: distortionFactor * 1.2,
                    }}
                    label={undefined}
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
                <ProCard title={"峰值信噪比"}>
                  <Column
                    data={robustData2.attacks}
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
                      title: {text: '攻击方法'},
                      label: {rotate: -0.4, style: {fontWeight: 'bolder', fontSize: 10}}
                    }}
                    tooltip={{}}
                    yAxis={{
                      title: {text: '峰值信噪比'},
                      min: 0,
                      max: 160,
                    }}
                    maxColumnWidth={40}
                    minColumnWidth={20}
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
            <ProCard title={"平均扰动大小"}>
              <Column
                data={avgEpsilon}
                xField={'epsilonType'}
                yField={'index'}
                isGroup={true}
                legend={{
                  layout: 'horizontal',
                  flipPage: false
                }}
                seriesField={'methodName'}
                maxColumnWidth={40}
                xAxis={{
                  title: {text: '扰动类型'},
                  label: {style: {fontWeight: 'bolder', fontSize: 10}},
                }}
                yAxis={{
                  title: {text: '平均扰动大小'},
                  /*                  min: 0,
                                    max: epsilon * 1.5,*/
                }}
                label={false}
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
            <ProCard>
              <ProTable
                bordered={true}
                pagination={false}
                columns={robustColumns}
                search={false}
                options={false}
                scroll={{x: 1500}}
                request={async () => {
                  const data = robustData2.attacks;

                  for (let attack of data) {
                    attack.batch_size = robustData2.batch_size;
                    //attack.distortion_factor = attack.distortion_factor.toExponential();
                    attack.L1_distortion_factor = attack.distortion_factor[0].toExponential();
                    attack.L2_distortion_factor = attack.distortion_factor[1].toExponential();
                    attack.L_infinity_distortion_factor = attack.distortion_factor[2].toExponential();

                    attack.L1_avg_epsilon = attack.avg_epsilon[0].toExponential();
                    attack.L2_avg_epsilon = attack.avg_epsilon[1].toExponential();
                    attack.L_infinity_avg_epsilon = attack.avg_epsilon[2].toExponential();

                    if (typeof attack.ssim === 'number' && !isNaN(attack.ssim))
                      attack.ssim = attack.ssim.toFixed(1);
                    if (typeof attack.psnr === 'number' && !isNaN(attack.psnr))
                      attack.psnr = attack.psnr.toFixed(1);
                    if (typeof attack.success_attack_rate === 'number' && !isNaN(attack.success_attack_rate))
                      attack.success_attack_rate = attack.success_attack_rate.toFixed(1);

                  }
                  ;
                  //console.log(data);
                  return {
                    data: data,
                    success: true,
                  }
                }}
              />
            </ProCard>
            {/*          <ProCard colSpan={12}>
            <Space>在XXX张测试图片上，使用了XX种对抗攻击，在对抗噪声干扰下，攻击成功率平均达到XXX，准确率平均下降XXX</Space>
          </ProCard>*/}
          </ProCard>)}

        {evaluateType === "INTERPRET" && (
          <>
            {/*          <ProCard  title={"可解释性(决策树代理模型)"}></ProCard>
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
        </ProCard>*/}
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
          </>)}

      </ProCard>
    </>
  );

};
