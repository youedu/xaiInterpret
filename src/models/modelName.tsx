import {useState} from 'react';

export default () => {
  const [modelName, setModelName] = useState({modelName: null, modelId: null, modelUrl: null});
  return {modelName, setModelName};
};
