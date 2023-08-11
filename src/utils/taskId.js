export default {
    get() {
      return window.localStorage.getItem('TASKID');
    },
    save(taskId) {
      window.localStorage.setItem('TASKID', taskId);
    },
  };
  