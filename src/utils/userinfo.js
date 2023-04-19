export default {
  get() {
    return window.sessionStorage.getItem('userInfo');
  },
  save(userInfo) {
    window.sessionStorage.setItem('userInfo', userInfo);
  },
};
