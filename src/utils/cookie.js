export default {
    get() {
      return window.localStorage.getItem('COOKIE');
    },
    save(COOKIE) {
      window.localStorage.setItem('COOKIE', COOKIE);
    },
  };
  