export default [
  {
    path: '/',
    component: './Welcome',
  },
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/Login',
      },
      {
        name: 'pwdReset',
        path: '/user/pwdReset',
        component: './user/pwdReset',
      },
      {
        component: './404',
        layout: 'top',
      },
    ],
  },
/*   {
    path: '/welcome',
    layout: 'top',
    name: '首页',
    //icon: 'smile',
    icon: 'home',
    component: './Home',
  }, */
/*   {
    path: '/',
    redirect: '/dataset',
  }, */

  {
    path: '/dataset',
    layout: 'top',
    name: '测评数据',
    icon: 'TableOutlined',
    component: './dataSet',

  },
  {
    path: '/modelset',
    layout: 'top',
    name: '模型列表',
    icon: 'DeploymentUnitOutlined',
    component: './modelSet',

  },
  {
    path: '/evaluationrecord',
    layout: 'top',
    name: ' 测评子任务记录',
    icon: 'ContainerOutlined',
    component: './evaluationRecord',
  },
  {
    name: 'recordCreate',
    layout: 'top',
    path: '/recordcreate',
    component: './recordCreate',
    hideInMenu: true
  },
  /*  {
      name: 'tabletest',
      layout: 'top',
      path: '/tabletest',
      component: './tableTest'
    },*/
  {
    name: 'evaluationresult',
    layout: 'top',
    path: '/evaluationresult',
    component: './evaluationResult',
    hideInMenu: true
  },
  /*  {
      name: 'cardtest',
      layout: 'top',
      path: '/cardtest',
      component: './cardTest'
    },*/
  /*  {
      name: 'hometest',
      layout: 'top',
      path: '/Hometest',
      component: './Home'
    },*/
  {
    component: './404',
    layout: 'top',
  },
];
