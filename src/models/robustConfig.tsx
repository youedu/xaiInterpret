//在评测配置界面记录鲁棒性配置选项
import { useState} from 'react';

export default () => {
  const [robustEvaluationConfig, setRobustEvaluationConfig] = useState({});
  return { robustEvaluationConfig, setRobustEvaluationConfig }
};
