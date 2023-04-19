import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import {BookOutlined, LinkOutlined} from '@ant-design/icons';
import type {Settings as LayoutSettings} from '@ant-design/pro-components';
import {PageLoading, SettingDrawer} from '@ant-design/pro-components';
import type {RunTimeLayoutConfig} from 'umi';
import {history, Link} from 'umi';
import defaultSettings from '../config/defaultSettings';
import {currentUser as queryCurrentUser} from './services/ant-design-pro/api';
import {ErrorShowType, RequestConfig} from "@@/plugin-request/request";
import logo from '../public/ai.png'
import token from "@/utils/token";
import userinfo from "@/utils/userinfo";
import {loginOut} from "@/components/RightContent/AvatarDropdown";
import {message, notification} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {stringify} from "querystring";

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';


/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading/>,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      //console.log("hello world")
      return msg.data;
    } catch (error) {
      //console.log(history.location.pathname);
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面且不是welcome界面，执行
  if (history.location.pathname !== loginPath && history.location.pathname !== '/welcome') {
    if (token.get() !== null) {
      //代替下方的获取用户信息函数
      const userInfo = token.get();
      const userInfo_base64 = userInfo.split('.')[1];
      // base64解码
      const userInfo_string = Buffer.from(userInfo_base64, 'base64').toString('binary');
      const userInfo_obj = JSON.parse(userInfo_string);
      //console.log(typeof(userInfo_obj), userInfo_obj);
      userInfo_obj.name = userInfo_obj.user_name;
      userInfo_obj.userid = userInfo_obj.id;

      // const currentUser = await fetchUserInfo();
      return {
        fetchUserInfo,
        currentUser: userInfo_obj,
        settings: defaultSettings,
      };
    }

  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

//新增拦截器
/*const authHeaderInterceptor = (url: string, options: RequestConfig) => {
  const authHeader = { Authorization: 'Bearer123' };
  return {
    url: `${url}`,
    options: { ...options, interceptors: true, headers: authHeader },
  };
};

export const request: RequestConfig = {
  // 新增自动添加AccessToken的请求前拦截器
  requestInterceptors: [authHeaderInterceptor],
};*/

const demoResponseInterceptors = (response: Response, options: RequestConfig) => {
  if (response.status === 401) {
    //console.log(401);
    token.save(null);

    const {query = {}, search, pathname} = history.location;
    const {redirect} = query;
    // Note: There may be security issues, please note

    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  }
  return response;
};
const errorConfig = (error) => {
  //@custom
  //这个是下面配置的响应体转换器
  //console.log('test');
  const errorAdaptor =
    error?.request?.options?.errorConfig?.adaptor || ((resData: any) => resData);
  const DEFAULT_ERROR_PAGE = '/exception';

  // @ts-ignore
  if (error?.request?.options?.skipErrorHandler) {
    throw error;
  }
  let errorInfo;

  if (error.name === 'ResponseError' && error.data && error.request) {
    const ctx = {
      req: error.request,
      res: error.response,
    };
    errorInfo = errorAdaptor(error.data, ctx);
    //console.log(errorInfo);
    //message.error(errorInfo.message);

    /*    if(errorInfo?.message !== null)
          {
            message.error(errorInfo.message);
            //return;
          }*/
    //@custom
    //
    //非标准格式或异常状态码时处理，符合标准格式转为BizError
    /*      if (errorInfo?.success === undefined) {
            errorInfo = {
              success: false,
              errorMessage: `${ctx?.res?.statusText} (#${ctx?.res?.status})`,
            };
          }*/
    error.message = errorInfo?.errorMessage || error.message;
    error.data = error.data;
    error.info = errorInfo;
  }
  errorInfo = error.info;
  if (errorInfo) {
    const errorMessage = errorInfo?.message;
    const errorCode = errorInfo?.code;
    const errorPage =
      error?.request?.options?.errorConfig?.errorPage || DEFAULT_ERROR_PAGE;

    switch (errorInfo?.showType) {
      case ErrorShowType.SILENT:
        //console.log(0);
        // do nothing
        break;
      case ErrorShowType.WARN_MESSAGE:
        //console.log(1);
        message.warn(errorMessage || '异常');
        break;
      case ErrorShowType.ERROR_MESSAGE:
        //console.log(2);
        message.error(errorMessage || '异常');
        break;
      case ErrorShowType.NOTIFICATION:
        //console.log(3);
        notification.open({
          description: errorMessage,
          message: errorCode,
        });
        break;
      case ErrorShowType.REDIRECT:
        //console.log(4);
        // @ts-ignore
        history.push({
          pathname: errorPage,
          query: {errorCode, errorMessage},
        });
        // redirect to error page
        break;
      default:
        //console.log(5);
        message.error(errorMessage || '后台异常');
        break;
    }
  } else {
    //console.log(6);
    //message.error(error.message || 'Request error, please retry.');
  }
  throw error;
}

export const request: RequestConfig = {
  errorHandler: errorConfig,
  responseInterceptors: [demoResponseInterceptors],
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({initialState, setInitialState}) => {
  return {
    //logo: <img src="https://icons.iconarchive.com/icons/bensow/trapez-for-adobe-cs6/128/Ai-icon.png"/>,
    logo: logo,
    rightContentRender: () => <RightContent/>,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => /*<Footer />*/ <div></div>,
    onPageChange: () => {
      const {location} = history;
      // 如果没有登录，重定向到 login(且当前页面不是首页或重置密码页面)
      if (location.pathname !== '/user/pwdReset')
        if (!initialState?.currentUser && location.pathname !== loginPath) {
          if (location.pathname != '/welcome')
            history.push(loginPath);
        }
    },
    links: []/*isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
          <Link to="/~docs" key="docs">
            <BookOutlined />
            <span>业务组件文档</span>
          </Link>,
        ]
      : []*/,
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
/*            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />*/
            <></>
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};
