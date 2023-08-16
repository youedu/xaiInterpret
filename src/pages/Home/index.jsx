/* eslint no-undef: 0 */
/* eslint arrow-parens: 0 */
import React, { useEffect } from 'react';
import {history} from 'umi';
import { enquireScreen } from 'enquire-js';

import Banner5 from './Banner5';
import Content0 from './Content0';
import Content3 from './Content3';
import Footer0 from './Footer0';

import {
  Banner51DataSource,
  Content00DataSource,
  Content30DataSource,
  Footer01DataSource,
  Footer00DataSource,
} from './data.source';
import './less/antMotionStyle.less';

let isMobile;
enquireScreen((b) => {
  isMobile = b;
});

const { location = {} } = typeof window !== 'undefined' ? window : {};

export default class Home extends React.Component {

  constructor(props) {

    console.log(props);


    history.push('/evaluationrecord?MS_SESSION_ID='+props.location.query.MS_SESSION_ID+'&taskId='+props.location.query.taskId+'&projectId='+props.location.query.projectId)
    super(props);
    this.state = {
      isMobile,
      show: !location.port, // 如果不是 dva 2.0 请删除
    };
  }

  componentDidMount() {
    // 适配手机屏幕;
    enquireScreen((b) => {
      this.setState({ isMobile: !!b });
    });
    // dva 2.0 样式在组件渲染之后动态加载，导致滚动组件不生效；线上不影响；
    /* 如果不是 dva 2.0 请删除 start */
    if (location.port) {
      // 样式 build 时间在 200-300ms 之间;
      setTimeout(() => {
        this.setState({
          show: true,
        });
      }, 500);
    }
    /* 如果不是 dva 2.0 请删除 end */
  }

  render() {
    const children = [
      <Banner5
        id="Banner5_1"
        key="Banner5_1"
        dataSource={Banner51DataSource}
        isMobile={this.state.isMobile}
      />,
      <Content0
        id="Content0_0"
        key="Content0_0"
        dataSource={Content00DataSource}
        isMobile={this.state.isMobile}
      />,
/*      <Content3
        id="Content3_0"
        key="Content3_0"
        dataSource={Content30DataSource}
        isMobile={this.state.isMobile}
      />,*/
      <Footer0
        id="Footer0_1"
        key="Footer0_1"
        dataSource={Footer01DataSource}
        isMobile={this.state.isMobile}
      />,
/*      <Footer0
        id="Footer0_0"
        key="Footer0_0"
        dataSource={Footer00DataSource}
        isMobile={this.state.isMobile}
      />,*/
    ];
    return (
      <div
        className="templates-wrapper"
        ref={(d) => {
          this.dom = d;
        }}
      >
        {/* 如果不是 dva 2.0 替换成 {children} start */}
        {this.state.show && children}
        {/* 如果不是 dva 2.0 替换成 {children} end */}
      </div>
    );
  }
}

/*import React from 'react';
//import { enquireScreen } from 'enquire-js';

import Banner5 from './Banner5';
//import Content0 from './Content0';
//import Content3 from './Content3';
//import Footer0 from './Footer0';

export default () => {
  return <div>11</div>
}*/
