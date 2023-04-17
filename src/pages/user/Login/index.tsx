import Footer from '@/components/Footer';
import { login, testLogin, testRegister, testGetCaptcha } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {Form, Button, Row, Col} from 'antd';
import token from '@/utils/token';
import userinfo from "@/utils/userinfo";
import Field from 'react';
import {Link, request} from 'umi';

let access = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site' ? 'admin' : '';

import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  ProForm,
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import { FormattedMessage, history, SelectLang, useIntl, useModel } from 'umi';
import styles from './index.less';
// import {values} from "lodash";

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon={true}
  />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('login');
  const { initialState, setInitialState } = useModel('@@initialState');

  //表单数据
  const [form] = Form.useForm();

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    //console.log("userInfo:", userInfo);
    if (userInfo) {
      //console.log("用户信息获取成功");
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const handleTestLogin = async () => {
    try {
      const values = form.getFieldValue();
      //console.log(values);
      const data = await testLogin(values);
/*      request('/api/user', {
        params: {
          name: 1,
        },
        skipErrorHandler: true,
      });*/
      //console.log(data);
      if(data.code === "00000")
      {
        access = "user";
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        const userInfo_base64 = data.data.token.split('.')[1];
        //console.log(userInfo_base64);
        //token.save(1);
        token.save(data.data.token);
        userinfo.save({account: form.getFieldValue('account'), password: form.getFieldValue('password')});
        // base64解码
        const userInfo_string = Buffer.from(userInfo_base64, 'base64').toString('binary');
        let userInfo_obj = JSON.parse(userInfo_string);
        //console.log(typeof(userInfo_obj), userInfo_obj);
        userInfo_obj.name = userInfo_obj.user_name;
        userInfo_obj.userid = userInfo_obj.id;
        // 设置用户信息
        //console.log(setInitialState);
        await setInitialState((s) => ({
          ...s,
          currentUser: userInfo_obj,
        }));

        //await fetchUserInfo();
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        //history.push(redirect || '/');
        history.push("/welcome");
        return;
      }
      else
      {
        message.error(data.message);
      }
      //console.log(data);
      // 如果失败去设置用户错误信息
      setUserLoginState(data);
    }catch (error){
      //console.log("error");
    }
  };
  const handleTestRegister = async () => {
    try {
      const values = form.getFieldValue();
      //console.log(values);
      const data = await testRegister(values);
      //console.log(data);
      if(data.code === "00000")
      {
        message.success('注册成功');
        setType('login');
/*        access = "user";
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        const userInfo_base64 = data.data.token.split('.')[1];
        console.log(userInfo_base64);
        token.save(data.data.token);
        // base64解码
        const userInfo_string = Buffer.from(userInfo_base64, 'base64').toString('binary');
        console.log(typeof(userInfo));
        let userInfo_obj = JSON.parse(userInfo_string);
        console.log(typeof(userInfo_obj), userInfo_obj);
        userInfo_obj.name = userInfo_obj.user_name;
        userInfo_obj.userid = userInfo_obj.id;
        // 设置用户信息
        console.log(setInitialState);
        await setInitialState((s) => ({
          ...s,
          currentUser: userInfo_obj,
        }));

        //await fetchUserInfo();
        /!** 此方法会跳转到 redirect 参数所在的位置 *!/
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        history.push(redirect || '/');
        return;*/
      }
      //console.log(data);
      // 如果失败去设置用户错误信息
      //setUserLoginState(data);
    }catch (error){
      message.error('注册失败');
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      //console.log(values);
      const msg = await login({ ...values, type });
      //console.log(msg);
      if (msg.status === 'ok') {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        history.push(redirect || '/');
        return;
      }
      //console.log(msg);
      // 如果失败去设置用户错误信息
      setUserLoginState(msg);
    }
    catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;

  // @ts-ignore
  return (
    <div className={styles.container} >
{/*      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div>*/}
      <div className={styles.content}>
        <LoginForm
          form={form}
          submitter={false}
          logo={<img alt="logo" src="/logo.svg" />}
          title="人工智能可信测试平台"
          /*subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}*/
          initialValues={{
            autoLogin: false,
          }}
          actions={[
/*            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="其他登录方式"
            />,
            <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.icon} />,
            <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.icon} />,
            <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.icon} />,*/
          ]}
/*          onFinish={async (values) => {
            await handleTestLogin(values as API.LoginParams);
          }}*/
        >

          <Tabs activeKey={type} onChange={setType} items={[
            {
              label: `账号密码登录`,
              key: 'login',
            },
            {
              label: `注册`,
              key: 'register',
            },
          ]}>
            <Tabs.TabPane
              key="login"
/*              tab={intl.formatMessage({
                id: 'pages.login.accountLogin.tab',
                defaultMessage: '登录',
              })}*/
            />
            <Tabs.TabPane
              key="register"
/*              tab={intl.formatMessage({
                id: 'pages.login.phoneLogin.tab',
                defaultMessage: '注册',
              })}*/
            />
          </Tabs>

          {status === 'error' && loginType === 'login' && (
            <LoginMessage
              content={/*intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误',
              })*/'账号或密码错误'}
            />
          )}
          {type === 'login' && (
            <>
              <ProFormText
                name="account"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={/*intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '账号',
                })*/'账号'}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入账号!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={/*intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码: ant.design',
                })*/'密码'}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />

              <Form.Item>
{/*              <ProFormCheckbox noStyle name="autoLogin">
                <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
              </ProFormCheckbox>*/}
              <Link style={{
                  float: 'right',
                }}
                 to="/user/pwdReset"
              >
                <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
              </Link>
              </Form.Item>

                <Form.Item style={{
                  marginBottom: 100,
                }}>
                  <Button block type={'primary'} size={'large'} onClick={async () => {
                    await handleTestLogin();
                  }}>
                    登录
                  </Button>
                </Form.Item>

            </>
          )}

          {status === 'error' && loginType === 'register' && <LoginMessage content="验证码错误" />}
          {type === 'register' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={/*intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名',
                })*/'用户名'}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password_register"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={/*intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码: ant.design',
                })*/'密码'}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />

              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={styles.prefixIcon} />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />

              <Form.Item>
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (mobile) => {
                  const result = await testGetCaptcha({
                    'type': 1, 'mobile': form.getFieldValue('mobile'),
                  });
                  if (result.code === '00000') {
                    message.success(`获取验证码成功！验证码为：${result.data}`);
                    return;
                  }else{
                    message.error(result.message);
                  }

                }}
              />
              </Form.Item>

                <Form.Item >
                  <Button block type={'primary'} onClick={async () => {
                    await handleTestRegister();
                  }}>
                    注册
                  </Button>
                </Form.Item>

            </>
          )}

        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
