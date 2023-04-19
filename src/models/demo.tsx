import {useState} from 'react';

export default () => {
  const [dataSetId, setDataSetId] = useState(null);
  return {dataSetId, setDataSetId};
};
