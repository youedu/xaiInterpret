import { outLogin } from '@/services/ant-design-pro/api';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, message, Spin } from 'antd';
import type { ItemType } from 'antd/lib/menu/hooks/useItems';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { history, useModel } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import token from "@/utils/token";

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
export const loginOut = async () => {
  const data = await outLogin();
  if (data.code = '00000') {
    message.success('退出登录成功');
  }
  token.save(null);
  const { query = {}, search, pathname } = history.location;
  const { redirect } = query;
  // Note: There may be security issues, please note

  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      /*      search: stringify({
              redirect: pathname + search,
            }),*/
    });
  }
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  //const { currentUser, setCurrentUser } = useModel('currentUser')

  const logOut = async () => {
    const data = await outLogin();
    if (data.code = '00000') {
      message.success('退出登录成功');
    }
    token.save(null);
    await setInitialState((s) => ({
    }));
    const { query = {}, search, pathname } = history.location;
    const { redirect } = query;
    // Note: There may be security issues, please note

    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        /*      search: stringify({
                redirect: pathname + search,
              }),*/
      });
    }
  };
  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;

      if (key === 'logout') {
        loginOut().then();
        return;
      }

      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      {/*      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />*/}
      <Avatar size={50} className={styles.avatar}
        icon={<UserOutlined />} alt="avatar" />
    </span>
  );

  if (!initialState) {
    console.log(1)
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    console.log(currentUser);
    return loading;
  }

  const menuItems: ItemType[] = [
    ...(menu
      ? [
        {
          key: 'center',
          icon: <UserOutlined />,
          label: '个人中心',
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: '个人设置',
        },
        {
          type: 'divider' as const,
        },
      ]
      : []),
    /*     {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
        }, */
  ];

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick} items={menuItems} />
  );

  return (
    <HeaderDropdown overlay={menuHeaderDropdown} overlayStyle={{ height: '70px' }}>
      <span className={`${styles.action} ${styles.account}`} style={{ height: '70px' }}>
        <Avatar size={50} className={styles.avatar} src={currentUser.avatar}
          icon={<UserOutlined />} alt="avatar" />
        <span className={`${styles.name} anticon`} style={{ fontSize: '17px' }}>{'你好，' + currentUser.name}</span>
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;
