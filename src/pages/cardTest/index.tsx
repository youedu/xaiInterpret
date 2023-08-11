import {ProCard} from '@ant-design/pro-components';
import RcResizeObserver from 'rc-resize-observer';
import {useState} from 'react';
import { history } from 'umi';

export default (params: any) => {
  console.log(params);
  history.push('/dataset?taskId='+params.location.query.taskId)
  const [responsive, setResponsive] = useState(false);

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <ProCard
        bordered
        headerBordered
        split={responsive ? 'horizontal' : 'vertical'}
      >
        <ProCard split="horizontal">
          <ProCard split="horizontal">
            <ProCard split={responsive ? 'horizontal' : 'vertical'}>
              <ProCard title="昨日全部流量">123</ProCard>
              <ProCard title="本月累计流量">234</ProCard>
              <ProCard title="今年累计流量">345</ProCard>
            </ProCard>
            <ProCard split="vertical">
              <ProCard title="运行中试验">12/56</ProCard>
              <ProCard title="历史试验总数">134 个</ProCard>
            </ProCard>
          </ProCard>
          <ProCard title="流量趋势">
            <div>图表</div>
            <div>图表</div>
            <div>图表</div>
            <div>图表</div>
            <div>图表</div>
          </ProCard>
        </ProCard>
        <ProCard title="流量占用情况">右侧内容</ProCard>
        <ProCard title="流量占用情况">右侧内容</ProCard>
      </ProCard>
    </RcResizeObserver>
  );
};
