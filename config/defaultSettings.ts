import { Settings as LayoutSettings } from '@ant-design/pro-components';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = /*{

  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Ant Design Pro',
  pwa: false,
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  iconfontUrl: '',
};*/
  {
    "navTheme": "dark",
    "primaryColor": "#1890ff",
    "layout": "top",
    "contentWidth": "Fixed",
    "fixedHeader": true,
    "fixSiderbar": true,
    "pwa": false,
    "headerHeight": 48,
    "splitMenus": false,
    "footerRender": false,
    "title": '人工智能可信测试平台',
    menu: {
      locale: false,
    },
  };

export default Settings;

