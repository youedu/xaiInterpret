import {Settings as LayoutSettings} from '@ant-design/pro-components';

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
    "navTheme": "light",
    "primaryColor": "#1890ff",
    "layout": "top",
    "contentWidth": "Fixed",
    "fixedHeader": false,
    "fixSiderbar": true,
    "pwa": false,
    "headerHeight": 70,
    "splitMenus": false,
    "footerRender": false,
    "title": '可信AI检测平台',
    //"title": false,
    menu: {
      locale: false,
    },
  };


export default Settings;

