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
          rowSpan: index === 1 ? 4 : index === 5 ? 3 : index === 0 ? 1 : 0,
        })
      },
      {
        title: '权重',
        dataIndex: 'normWeight',
        onCell: (_, index) => ({
          rowSpan: index === 1 ? 4 : index === 5 ? 3 : index === 0 ? 1 : 0,
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
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;灰色关联分析法用于评分值与“参考值”（母序列）的相似程度，进而针对评价项进行评价。
          <br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第一步：确定“参考值”（母序列）；
            <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第二步：针对数据进行无量纲化处理；
              <br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第三步：计算关联系数，关联系数表示某项与“参考值”（母序列）的相关程度；
                <br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第四步：结合关联系数值计算关联度。
        </div>

      </ProCard>
      <ProCard  title={<div style={{color: "red"}}>结果说明</div>}>
        <div className="row">
          &emsp;&emsp;从上表可知，针对5个评价项(AUC、APL、节点数量、重复子树比例、重复属性比例)，以及{params.textParam[6]}项数据进行灰色关联度分析，由于没有输入“参考值”，因而默认以每个评价项的最优值作为“参考值”进行分析，使用灰色关联度分析时，分辨系数取0.5，结合关联系数计算公式计算出关联系数值，并根据关联系数值，然后计算出关联度值用于评价判断。
          <br/>
            &emsp;&emsp;结合上述关联系数结果进行加权处理，最终得出关联度值，使用关联度值针对{params.textParam[6]}个评价对象进行评价排序；
            <br/>
              &emsp;&emsp;关联度值介于0~1之间，该值越大代表其与“参考值”（母序列）之间的相关性越强，也即意味着其评价越高。从上表可以看出：针对本次{params.textParam[6]}个评价项，关联度由高到低的排序依次为：{params.textParam[7]}。
        </div>
      </ProCard>
    </>
  )
}
