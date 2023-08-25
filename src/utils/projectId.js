export default {
    get() {
      return window.localStorage.getItem('PROJECT');
    },
    save(PROJECT) {
      window.localStorage.setItem('PROJECT', PROJECT);
    },
  };
  