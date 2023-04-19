import {ProCard} from "@ant-design/pro-components";
import {Table} from "antd";
import {ColumnsType} from "antd/es/table";

const columns: ColumnsType = [
  {
    title: '准则层',
    children: [
      {
        title: '指标',
        dataIndex: 'normIndex',
        onCell: (_, index) => ({
          rowSpan: index === 1 ? 2 : index === 3 ? 2 : index === 0 ? 1 : 0,
        })
      },
      {
        title: '权重',
        dataIndex: 'normWeight',
        onCell: (_, index) => ({
          rowSpan: index === 1 ? 2 : index === 3 ? 2 : index === 0 ? 1 : 0,
        })
      }
    ],
  },
  {
    title: '指标层',
    children: [
      {
        title: '指标',
        dataIndex: 'indexIndex',
      },
      {
        title: '权重',
        dataIndex: 'indexWeight',
      }
    ],
  },
  {
    title: '综合',
    children: [
      {
        title: '权重',
        dataIndex: 'weight',
      }
    ],
  },
];


export default (params: any) => {
  //console.log(params.tableData);

  return (
    <>
      <Table pagination={false} title={()=><div style={{color: "red", fontSize: "20px"}}>规则的指标权重表</div>} columns={columns} dataSource={params.tableData} bordered />
      <ProCard  title={<div style={{color: "red"}}>权重分布</div>}  >
        <div className="row">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;由上表可知，一级指标（一致性、复杂性、明确性）中，{params.textParam[0]}的权重最大，为{params.textParam[1]}，
          复杂性中，{params.textParam[2]}的权重最大，为{params.textParam[3]}，明确性中，{params.textParam[4]}的权重最大，为{params.textParam[5]}。
        </div>
      </ProCard>
      <ProCard  title={<div style={{color: "red"}}>评估过程</div>}>
        <div className="row">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RSR法（秩和比法）是一种有效的多指标评估方法，RSR综合评估法的基本原理是:在一个矩阵中,通过秩转换获得无量纲统计量RSR;在此基础上,运用参数统计分析的概念与方法研究RSR的分布;并以RSR值对评估对象的优劣直接排序或分档排序,从而对评估对象作出综合评估。计算的RSR越大,评估对象越优。
          <br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第一步：计算RSR。对每个评估对象的各指标编秩，利用AHP计算指标权重获得加权RSR值。
            <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第二步：确定RSR的分布。列出各组频数和累计频数，确定各组RSR的秩次范围和平均秩次，计算向下累计频率，并转换为概率单位。
              <br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第三步：计算回归方程。以累计频率所对应的概率单位为自变量,计算计算直线回归方程，求RSR估计值。
                <br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第四步：分档排序。按合理分档和最佳分档原则进行分档。
        </div>

      </ProCard>
      <ProCard  title={<div style={{color: "red"}}>结果说明</div>}>
        <div className="row">
          &emsp;&emsp;利用RSR对{params.textParam[6]}的解释性进行排序。依据计算出的RSR估计值对个评价对象进行排序，由表2可得，各评估对象的排序为{params.textParam[7]},
          各评估对象对应的分档等级为{params.textParam[8]}，可知{params.textParam[9]}解释性最好。
        </div>
      </ProCard>
    </>
  )
}
