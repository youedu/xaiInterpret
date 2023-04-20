import Footer from '@/components/Footer';
import {pwdReset, testGetCaptcha} from '@/services/ant-design-pro/api';
import {getFakeCaptcha} from '@/services/ant-design-pro/login';
import {Form, Button, Row, Col} from 'antd';
import token from '@/utils/token';
import Field from 'react';
import {Link} from 'umi';

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
import {Alert, message, Tabs} from 'antd';
import React, {useState} from 'react';
import {FormattedMessage, history, SelectLang, useIntl, useModel} from 'umi';
import styles from './index.less';


const LoginMessage: React.FC<{
  content: string;
}> = ({content}) => (
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

  //表单数据
  const [form] = Form.useForm();

  const intl = useIntl();

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 重置密码
      //console.log(values);
      const msg = await pwdReset({...values});
      //console.log(msg);
      if (msg.code === '00000') {
        const defaultLoginSuccessMessage = '密码修改成功';
        message.success(defaultLoginSuccessMessage);
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const {query} = history.location;
        const {redirect} = query as { redirect: string };
        history.push('user/login');
        return;
      }
      message.error(msg.message);
      // 如果失败去设置用户错误信息
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = '重置密码失败';
      message.error(defaultLoginFailureMessage);
    }
  };

  const {status, type: loginType} = userLoginState;

  // @ts-ignore
  return (
    <div className={styles.container}>
      {/*      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div>*/}
      <div className={styles.content}>
        <LoginForm
          form={form}
          submitter={{
            // 配置按钮文本
            searchConfig: {
              submitText: '提交',
            },
          }}
          logo={<img alt="logo" src="/logo.svg"/>}
          title="人工智能可信测试平台"
          subTitle='重置密码'
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
                        <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.icon} />,*/
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.pwdResetParams);
          }}
        >
          {status === 'error' && loginType === 'register' && <LoginMessage content="验证码错误"/>}
          <>
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: <MobileOutlined className={styles.prefixIcon}/>,
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
            <ProFormCaptcha
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon}/>,
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
              onGetCaptcha={async (phone) => {
                const result = await testGetCaptcha({
                  'type': 0, 'mobile': form.getFieldValue('mobile')
                });
                if (result.code === '00000') {
                  message.success(`获取验证码成功！验证码为：${result.data}`);
                  return;
                } else {
                  message.error(result.message);
                }
              }}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon}/>,
              }}
              placeholder={'请输入新密码'}
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
            <ProFormText.Password
              name="passwordRepeat"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon}/>,
              }}
              placeholder={'请再次输入新密码'}
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
          </>
        </LoginForm>
      </div>
      <Footer/>
    </div>
  );
};

export default Login;
