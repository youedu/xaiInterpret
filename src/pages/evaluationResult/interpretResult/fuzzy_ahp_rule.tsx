import {ProCard, ProList} from "@ant-design/pro-components";
import {Table} from "antd";
import {ColumnsType} from "antd/es/table";
import React from "react";

const IconText = ({icon, text}: { icon: any; text: string }) => (
  <span>
    {React.createElement(icon, {style: {marginInlineEnd: 8}})}
    {text}
  </span>
);

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
  console.log(params.tableData);

  const dataSource = [
    {
      title: '权重分布',
    },
    {
      title: '评估过程',
    },
    {
      title: '结果说明',
    },
  ];
  return (
    <>
      <Table pagination={false} title={() => <div style={{color: "red", fontSize: "20px"}}>规则的指标权重表</div>}
             columns={columns} dataSource={params.tableData} bordered/>
      <ProList<{ title: string }>
        /*        toolBarRender={() => {
                  return [
                    <Button key="3" type="primary">
                      新建
                    </Button>,
                  ];
                }}*/
        itemLayout="vertical"
        rowKey="id"
        //headerTitle="结果说明"
        dataSource={dataSource}
        metas={{
          title: {},
          /*          description: {
                      render: () => (
                        <>
                          <Tag>语雀专栏</Tag>
                          <Tag>设计语言</Tag>
                          <Tag>蚂蚁金服</Tag>
                        </>
                      ),
                    },*/
          /*          actions: {
                      render: () => [
                        <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                        <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                        <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                      ],
                    },*/
          /*          extra: {
                      render: () => (
                        <img
                          width={272}
                          alt="logo"
                          src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                        />
                      ),
                    },*/
          content: {
            render: (dom, entity, index, action, schema) => {
              console.log(index);
              if (index === 0) {
                return (
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;由上表可知，一级指标（一致性、复杂性、明确性）中，{params.textParam[0]}的权重最大，为{params.textParam[1]}，
                    复杂性中，{params.textParam[2]}的权重最大，为{params.textParam[3]}，明确性中，{params.textParam[4]}的权重最大，为{params.textParam[5]}。
                  </div>
                )
              } else if (index === 1) {
                return (
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;模糊综合评价借助模糊数学的一些概念，对实际的综合评价问题提供评价，即模糊综合评价以模糊数学为基础，应用模糊关系合成原理，将一些边界不清、不易定量的因素定量化，进而进行综合性评价的一种方法。
                    <br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第一步：确定评价指标和评语集；
                    <br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第二步：确定权重向量矩阵A和构造权重判断矩阵R；
                    <br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第三步：计算权重并进行决策评价。
                  </div>
                )
              } else if (index === 2) {
                return (
                  <div>
                    &emsp;&emsp;针对7个指标，以及1个评语集（很好、较好、一般、不好），进行模糊综合评价。首先利用层次分析法建立向量矩阵A，然后通过隶属函数计算得到模糊关系矩阵，最终分析出评语集的权重值，分别为{params.textParam[6]}，确定各评语的重要性分值为[90,
                    80, 65, 30]，得到{params.textParam[8]}的综合得分为{params.textParam[7]}。{params.textParam[9]}
                  </div>
                )
              }
            },
          },
        }}
      />
{/*      <ProCard title={<div style={{color: "red"}}>权重分布</div>}>
        <div className="row">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;由上表可知，一级指标（一致性、复杂性、明确性）中，{params.textParam[0]}的权重最大，为{params.textParam[1]}，
          复杂性中，{params.textParam[2]}的权重最大，为{params.textParam[3]}，明确性中，{params.textParam[4]}的权重最大，为{params.textParam[5]}。
        </div>
      </ProCard>
      <ProCard title={<div style={{color: "red"}}>评估过程</div>}>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;模糊综合评价借助模糊数学的一些概念，对实际的综合评价问题提供评价，即模糊综合评价以模糊数学为基础，应用模糊关系合成原理，将一些边界不清、不易定量的因素定量化，进而进行综合性评价的一种方法。
          <br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第一步：确定评价指标和评语集；
          <br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第二步：确定权重向量矩阵A和构造权重判断矩阵R；
          <br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;第三步：计算权重并进行决策评价。
        </div>

      </ProCard>
      <ProCard title={<div style={{color: "red"}}>结果说明</div>}>
        <div>
          &emsp;&emsp;针对7个指标，以及1个评语集（很好、较好、一般、不好），进行模糊综合评价。首先利用层次分析法建立向量矩阵A，然后通过隶属函数计算得到模糊关系矩阵，最终分析出评语集的权重值，分别为{params.textParam[6]}，确定各评语的重要性分值为[90,
          80, 65, 30]，得到{params.textParam[8]}的综合得分为{params.textParam[7]}。{params.textParam[9]}
        </div>
      </ProCard>*/}
    </>
  )
}
