//在评测配置界面记录配置选项
import {useState} from 'react';

export default () => {
  const [evaluationConfig, setEvaluationConfig] = useState({});
  return {evaluationConfig, setEvaluationConfig}
};
