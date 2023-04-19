 const data = [
  {
    type: '家具家电',
    sales: 38,
  },
  {
    type: '粮油副食',
    sales: 52,
  },
  {
    type: '生鲜水果',
    sales: 61,
  },
  {
    type: '美容洗护',
    sales: 145,
  },
  {
    type: '母婴用品',
    sales: 48,
  },
  {
    type: '进口食品',
    sales: 38,
  },
  {
    type: '食品饮料',
    sales: 38,
  },
  {
    type: '家庭清洁',
    sales: 38,
  },
];

export const consistencyConfig = {
  data: [{type: 'XAI', sales: 0.863}],
  xField: 'type',
  yField: 'sales',
  columnWidthRatio: 0.15,
  legend: {
    layout: 'horizontal',
    position: 'right'
  },
  label: {
    // 可手动配置 label 数据标签位置
    position: 'middle',
    // 'top', 'bottom', 'middle',
    // 配置样式
    style: {
      fill: '#FFFFFF',
      opacity: 0.6,
    },
  },
  xAxis: {
    label: {
      autoHide: true,
      autoRotate: false,
    },
  },
  meta: {
    type: {
      alias: '类别',
    },
    sales: {
      alias: '销售额',
    },
  },
};

 export const stabilityConfig = {
   data: [{type: 'XAI', sales: 0.994}],
   xField: 'type',
   yField: 'sales',
   columnWidthRatio: 0.15,
   label: {
     // 可手动配置 label 数据标签位置
     position: 'middle',
     // 'top', 'bottom', 'middle',
     // 配置样式
     style: {
       fill: '#FFFFFF',
       opacity: 0.6,
     },
   },
   xAxis: {
     label: {
       autoHide: true,
       autoRotate: false,
     },
   },
   meta: {
     type: {
       alias: '类别',
     },
     sales: {
       alias: '销售额',
     },
   },
 };
 export const adequacyConfig = {
   data: [{type: 'XAI', sales: 0.641}],
   xField: 'type',
   yField: 'sales',
   columnWidthRatio: 0.15,
   label: {
     // 可手动配置 label 数据标签位置
     position: 'middle',
     // 'top', 'bottom', 'middle',
     // 配置样式
     style: {
       fill: '#FFFFFF',
       opacity: 0.6,
     },
   },
   xAxis: {
     label: {
       autoHide: true,
       autoRotate: false,
     },
   },
   meta: {
     type: {
       alias: '类别',
     },
     sales: {
       alias: '销售额',
     },
   },
 };
 export const specificityConfig = {
   data: [{type: 'subtree', sales: 0.888},{type: 'attribute', sales: 0.666}],
   xField: 'type',
   yField: 'sales',
   columnWidthRatio: 0.3,
   label: {
     // 可手动配置 label 数据标签位置
     position: 'middle',
     // 'top', 'bottom', 'middle',
     // 配置样式
     style: {
       fill: '#FFFFFF',
       opacity: 0.6,
     },
   },
   xAxis: {
     label: {
       autoHide: true,
       autoRotate: false,
     },
   },
   meta: {
     type: {
       alias: '类别',
     },
     sales: {
       alias: '销售额',
     },
   },
 };
 export const complexityConfig = {
   data: [{type: 'route', sales: 2.955},{type: 'number', sales: 11}],
   xField: 'type',
   yField: 'sales',
   columnWidthRatio: 0.3,
   label: {
     // 可手动配置 label 数据标签位置
     position: 'middle',
     // 'top', 'bottom', 'middle',
     // 配置样式
     style: {
       fill: '#FFFFFF',
       opacity: 0.6,
     },
   },
   xAxis: {
     label: {
       autoHide: true,
       autoRotate: false,
     },
   },
   meta: {
     type: {
       alias: '类别',
     },
     sales: {
       alias: '销售额',
     },
   },
 };
 export const causalityConfig = {
   data: [{type: 'XAI', sales: 0.165}],
   xField: 'type',
   yField: 'sales',
   columnWidthRatio: 0.15,
   label: {
     // 可手动配置 label 数据标签位置
     position: 'middle',
     // 'top', 'bottom', 'middle',
     // 配置样式
     style: {
       fill: '#FFFFFF',
       opacity: 0.6,
     },
   },
   xAxis: {
     label: {
       autoHide: true,
       autoRotate: false,
     },
   },
   meta: {
     type: {
       alias: '类别',
     },
     sales: {
       alias: '销售额',
     },
   },
 };
 export const validityConfig = {
   data: [{type: 'rule', sales: 1000},{type: 'term', sales: 1000}],
   xField: 'type',
   yField: 'sales',
   columnWidthRatio: 0.3,
   label: {
     // 可手动配置 label 数据标签位置
     position: 'middle',
     // 'top', 'bottom', 'middle',
     // 配置样式
     style: {
       fill: '#FFFFFF',
       opacity: 0.6,
     },
   },
   xAxis: {
     label: {
       autoHide: true,
       autoRotate: false,
     },
   },
   meta: {
     type: {
       alias: '类别',
     },
     sales: {
       alias: '销售额',
     },
   },
 };
