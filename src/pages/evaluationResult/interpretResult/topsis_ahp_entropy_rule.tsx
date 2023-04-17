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
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;其中，一级指标的权重一致性、复杂性、明确性的权重使用AHP确定，一级指标下的二级指标的权重使用熵权法确定。由上表可知，一级指标（一致性、复杂性、明确性）中，{params.textParam[0]}的权重最大，为{params.textParam[1]}，
          复杂性中，{params.textParam[2]}的权重最大，为{params.textParam[3]}，明确性中，{params.textParam[4]}的权重最大，为{params.textParam[5]}。
        </div>
      </ProCard>
      <ProCard  title={<div style={{color: "red"}}>评估过程</div>}>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TOPSIS法根据评价对象分别与正负理想解的距离进行排序，从而进行相对优劣评价。
          <br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第一步：确定评价指标并确保评价指标同为正向趋势(值越大越好)；
            <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第二步：上表格中D+和D-分别表示评价对象与正负理想解的距离；
              <br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第三步：C表示评价对象与最优方案的接近程度，该值越大说明越接近最优方案。
        </div>
      </ProCard>
      <ProCard  title={<div style={{color: "red"}}>结果说明</div>}>
        <div>
          &emsp;&emsp;利用topsis对{params.textParam[6]}的解释性进行排序。TOPSIS法首先找出评价指标的正负理想解(A+和A-)，即最优值，接着计算出各评价对象分别与正负理想解的距离值D+和D-。根据D+和D-值，最终计算得出各评价对象与最优方案的接近程度(C值)，并可针对C值进行排序。
          由表1可得，{params.textParam[7]}与最优方案的接近程度最高，C值为{params.textParam[8]}。{params.textParam[7]}解释性最好。
        </div>
      </ProCard>
    </>
  )
}
