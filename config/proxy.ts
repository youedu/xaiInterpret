/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */

export default {
  dev: {
    '/api/file': {
      // 要代理的地址
      target: 'http://10.105.240.103:9201',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: {'^/api/file': ''},
    },
    '/api/': {
      // 要代理的地址
      target: 'http://10.105.240.103:9201',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: {'^/api': ''},
    },
  },
  test: {
    '/api/file': {
      // 要代理的地址
      target: 'http://10.105.240.103:9201',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: {'^/api/file': ''},
    },
    '/api/': {
      target: 'http://10.105.240.103:9201',
      changeOrigin: true,
      pathRewrite: {'^/api': ''},
    },
  },
  pre: {
    '/api/file': {
      // 要代理的地址
      target: 'http://10.105.240.103:9201',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: {'^/api/file': ''},
    },
    '/api/': {
      target: 'http://10.105.240.103:9201',
      changeOrigin: true,
      pathRewrite: {'^/api': ''},
    },
  },
};

/*export default {
  dev: {
    '/api/file': {
      // 要代理的地址
      target: 'http://10.105.240.103:9201',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: {'^/api/file': ''},
    },
    '/api/': {
      // 要代理的地址
      target: 'http://10.112.184.21:8000',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: {'^/api': '^/api'},
    },
  },
  test: {
    '/api/file': {
      // 要代理的地址
      target: 'http://10.105.240.103:9201',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: {'^/api/file': ''},
    },
    '/api/': {
      target: 'http://10.112.184.21:8000',
      changeOrigin: true,
      pathRewrite: { '^/api': '^/api' },
    },
  },
  pre: {
    '/api/file': {
      // 要代理的地址
      target: 'http://10.105.240.103:9201',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: {'^/api/file': ''},
    },
    '/api/': {
      target: 'http://10.112.184.21:8000',
      changeOrigin: true,
      pathRewrite: { '^/api': '^/api' },
    },
  },
};*/
