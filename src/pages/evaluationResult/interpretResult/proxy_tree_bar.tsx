import {ProCard} from "@ant-design/pro-components";
import {Column} from "@ant-design/plots";
import {Typography} from "antd";

export default (params) => {
  console.log(params.interpretData2);
  let complexity = [];
  for (const item of params.interpretData2[0]){
    complexity.push({
      model_name: item.model_name,
      index: item['node count'],
      prop: '节点数量',
    });
    complexity.push({
      model_name: item.model_name,
      index: item.APL,
      prop: '平均路径长度',
    });
  }
  return (
    <>
      <ProCard  title={<Typography.Title level={3}>可解释性（决策树代理模型）</Typography.Title>}></ProCard>
      <ProCard split={"vertical"} bodyStyle={{padding: '80px'}}>
        <ProCard colSpan={12} split={"horizontal"} >
          <ProCard title={"一致性指标柱状图"} >
            <Column name={"specificity"} data={params.interpretData2[2]}
/*                    isGroup={true}*/
                    xField={'model_name'}
                    yField={'AUC'}
                    legend={true}
                    isGroup={true}
                    seriesField={'model_name'}
                    xAxis={{
                      title: {text: '代理模型'},
                      label: {rotate: -0.4, style: {fontWeight: 'bolder', fontSize: 10}},
                    }}
                    yAxis={{
                      title: {text: 'AUC'},
                      min: 0,
                      max: 1,
                    }}
                    //seriesField={'prop'}
                    maxColumnWidth={40}
                    label={{
                      // 可手动配置 label 数据标签位置
                      position: 'top',
                      // 'top', 'bottom', 'middle',
                      // 配置样式
                      style: {
                        fill: '#000000',
                        opacity: 1,
                      },
                    }}
                    meta={{
                      'node count': {
                        alias: '节点数量',
                      },
                      }}
            />
          </ProCard>

          <ProCard title={"明确性指标柱状图"} bodyStyle={{paddingBottom:'100px'}}>
            <Column name={"complexity"}
                    data={params.interpretData2[1]}
                    isGroup={true}
                    xField={'model_name'}
                    yField={'index'}
                    xAxis={{
                      title: {text: '代理模型'},
                      label: {rotate: -0.4, style: {fontWeight: 'bolder', fontSize: 10}},
                    }}
                    yAxis={{
                      title: {text: '指标'},
                      tickCount: 7,
                      min: 0,
                      max: 1.2,
                      /*                          min: 0,
                                                max: 1,*/
                    }}
                    seriesField={'prop'}
                    maxColumnWidth={40}
                    label={{
                      // 可手动配置 label 数据标签位置
                      position: 'top',
                      // 'top', 'bottom', 'middle',
                      // 配置样式
                      style: {
                        fill: '#000000',
                        opacity: 1,
                      },
                    }}
                    meta={{
                      max: {
                        alias: '最大长度',
                      },
                      size: {
                        alias: '模型尺寸',
                      },
                      total: {
                        alias: '总长度'
                      }
                      ,}}/>
          </ProCard>
        </ProCard>
        <ProCard title={"复杂性指标柱状图"} bodyStyle={{paddingBottom:'100px'}}>
          <Column
            //data={params.interpretData2[0]}
            data = {complexity}
            xField={'model_name'}
            yField={'index'}
            //legend={true}
            isGroup={true}
            seriesField={'prop'}
            xAxis={{
              title: {text: '代理模型'},
              label: {rotate: -0.4, style: {fontWeight: 'bolder', fontSize: 10}},
            }}
            yAxis={{
              title: {text: '指标'},
              /*                tickCount: 7,
                              min: 0,
                              max: 1.2,*/
              /*                            min: 0,
                                          max: 1,*/
            }}
            maxColumnWidth={40}
            label={false}
            /*              label={{
                            position: 'top',
                            style: {
                              fill: '#000000',
                              opacity: 1,
                            },
                          }}*/
            meta={{
              model_name: {
                alias: '模型名称',
              },
              APL: {
                alias: '平均路径长度',
              },
              'node_count': {
                alias: '节点数量',
              },
            }}/>
        </ProCard>

      </ProCard>
    </>
  )
}
