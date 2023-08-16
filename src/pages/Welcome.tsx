import {PageContainer, ProCard} from '@ant-design/pro-components';
import {Alert, Card, Typography, Image} from 'antd';
import React, { useEffect } from 'react';
import {FormattedMessage, useIntl, history} from 'umi';
import styles from './Welcome.less';
import { tokenByCookie } from '@/services/ant-design-pro/api';
import token from '@/utils/token';


const CodePreview: React.FC = ({children}) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

const Welcome: React.FC = (props) => {
  // const intl = useIntl();

  console.log(props);
  const tokencookie = async ()=>{
    const data = await tokenByCookie();
    console.log(data);
    const data2 = await tokenByCookie();
    console.log(data2);
  }
  useEffect(()=>{
    //tokencookie();
  })

  history.push('/evaluationrecord?MS_SESSION_ID='+props.location.query.MS_SESSION_ID+'&taskId='+props.location.query.taskId+'&projectId='+props.location.query.projectId)

  return (
    <>
      <ProCard bodyStyle={{
        fontFamily: 'Poppins',
        fontStyle: "normal",
        fontWeight: 700,
        fontSize: '48.83px',
        lineHeight: '73px',
        color: '#373737',
        position: 'absolute',
        width: '602px',
        height: '74px',
        left: '135px',
        top: '5px',
      }
      }>
        可信AI检测平台
      </ProCard>
      <ProCard bodyStyle={{
        fontFamily: 'Poppins',
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: '20px',
        lineHeight: '24px',
        color: '#7b7b7b',
        position: 'absolute',
        width: '586px',
        height: '76px',
        left: '135px',
        top: '80px',
      }
      }>
        平台面向模型开发者，针对模型正确性、鲁棒性、可解释性、安全性测试提供产品化的解决方案。平台支持图像、文本、图的鲁棒性测评，集成了学术界和工业界主流攻击算法。用户只需要提交待测评模型和评估数据，选择相应算法，平台即可对模型进行正确性、鲁棒性等测评，生成评估报告。
      </ProCard>
      <ProCard bodyStyle={{
        position: 'absolute',
        width: '150px',
        height: '80px',
        left: '1200px',
        top: '80px',
      }
      }>
        <Image src={'/img.png'}></Image>
      </ProCard>

      <ProCard bodyStyle={{
        fontFamily: 'Poppins',
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: '39px',
        lineHeight: '59px',
        color: '#373737',
        position: 'absolute',
        width: '257px',
        height: '59px',
        left: '642px',
        top: '232px',
      }
      }>
        平台特点
      </ProCard>
      <ProCard style={{
        fontFamily: 'Poppins',
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: '20px',
        lineHeight: '24px',
        color: '#FF5300',
        position: 'absolute',
        width: '370px',
        left: '135px',
        top: '330px',
      }}
               title={<label style={{
                 fontFamily: 'Poppins',
                 fontStyle: "normal",
                 fontWeight: 700,
                 fontSize: '32px',
                 lineHeight: '24px',
                 color: '#FF5300',
                 width: '370px',
                 height: '270px',
               }}>一站式模型检测平台</label>}
               bodyStyle={{
                 fontFamily: 'Poppins',
                 fontStyle: "normal",
                 fontWeight: 400,
                 fontSize: '20px',
                 lineHeight: '24px',
                 color: '#7b7b7b',
                 width: '370px',
                 height: '200px',
               }}>
        平台提供一站式AI模型安全评测服务，平台支持用户在线上传模型，自动对模型的鲁棒性、可解释性等开展评测。
      </ProCard>
      <ProCard style={{
        fontFamily: 'Poppins',
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: '20px',
        lineHeight: '24px',
        color: '#FF5300',
        position: 'absolute',
        width: '370px',
        left: '550px',
        top: '330px',
      }}
               title={<label style={{
                 fontFamily: 'Poppins',
                 fontStyle: "normal",
                 fontWeight: 700,
                 fontSize: '32px',
                 lineHeight: '24px',
                 color: '#FF5300',
                 width: '370px',
                 height: '270px',
               }}>自定义数据集</label>}
               bodyStyle={{
                 fontFamily: 'Poppins',
                 fontStyle: "normal",
                 fontWeight: 400,
                 fontSize: '20px',
                 lineHeight: '24px',
                 color: '#7b7b7b',
                 width: '370px',
                 height: '200px',
               }}>
        除内置测试集以外，平台支持用户根据实际业务场景需求创建自定义数据集，深度测评模型安全性。
      </ProCard>
      <ProCard style={{
        fontFamily: 'Poppins',
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: '20px',
        lineHeight: '24px',
        color: '#FF5300',
        position: 'absolute',
        width: '370px',
        left: '965px',
        top: '330px',
      }}
               title={<label style={{
                 fontFamily: 'Poppins',
                 fontStyle: "normal",
                 fontWeight: 700,
                 fontSize: '32px',
                 lineHeight: '24px',
                 color: '#FF5300',
                 width: '370px',
                 height: '270px',
               }}>标准化可信测评体系</label>}
               bodyStyle={{
                 fontFamily: 'Poppins',
                 fontStyle: "normal",
                 fontWeight: 400,
                 fontSize: '20px',
                 lineHeight: '24px',
                 color: '#7b7b7b',
                 width: '370px',
                 height: '200px',
               }}>
        平台拥有一套科学的、分层级多维度的AI可信度量标准和评分体系，由点及面全方位测评AI可信性。
      </ProCard>

    </>


  );

  {/*        <Alert
          message={intl.formatMessage({
            id: 'pages.welcome.alertMessage',
            defaultMessage: 'Faster and stronger heavy-duty components have been released.',
          })}
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 24,
          }}
        />
        <Typography.Text strong>
          <a
            href="https://procomponents.ant.design/components/table"
            rel="noopener noreferrer"
            target="__blank"
          >
            <FormattedMessage id="pages.welcome.link" defaultMessage="Welcome" />
          </a>        </Typography.Text>
        <CodePreview>yarn add @ant-design/pro-components</CodePreview>*/
  }


};

export default Welcome;
