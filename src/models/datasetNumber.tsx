import {useState} from 'react';

export default () => {
  const [dataSetNumber, setDataSetNumber] = useState(0);
  return {dataSetNumber, setDataSetNumber};
};
