import {ProCard} from "@ant-design/pro-components";
import {Column} from "@ant-design/plots";

export default (params) => {
  console.log(params);
  return (
    <>
      <ProCard  title={"可解释性(规则代理模型)"}></ProCard>
      <ProCard split={"vertical"} bodyStyle={{padding: '80px'}}>
        <ProCard colSpan={12} split={"horizontal"} >
          <ProCard title={"一致性指标柱状图"} bodyStyle={{paddingBottom:'100px'}}>
            <Column
              data={params.interpretData2[0]}
              xField={'model_name'}
              yField={'consistency'}
              xAxis={{
                title: {text: '代理模型'},
              }}
              yAxis={{
                title: {text: '一致率'},
                tickCount: 7,
                min: 0,
                max: 1.2,
                /*                            min: 0,
                                            max: 1,*/
              }}
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
                methodName: {
                  alias: '方法',
                },
                consistency: {
                  alias: '一致率',
                },}}/>
          </ProCard>
          <ProCard title={"明确性指标柱状图"} >
            <Column name={"specificity"} data={params.interpretData2[2]}
                    isGroup={true}
                    xField={'model_name'}
                    yField={'index'}
                    xAxis={{
                      title: {text: '代理模型'},
                    }}
                    yAxis={{
                      title: {text: '指标'},
                      min: 0,
                      max: 1,
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
            />
          </ProCard>
        </ProCard>
        <ProCard title={"复杂性指标柱状图"} bodyStyle={{paddingBottom:'100px'}}>
          <Column name={"complexity"}
                  data={params.interpretData2[1]}
                  isGroup={true}
                  xField={'model_name'}
                  yField={'index'}
                  xAxis={{
                    title: {text: '代理模型'},
                  }}
                  yAxis={{
                    title: {text: '指标'},
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
    </>
  )
}
