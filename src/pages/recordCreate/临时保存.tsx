import {
  EditableProTable, ModalForm,
  ProCard,
  ProFormCheckbox,
  ProFormSelect, ProFormTextArea,
  ProFormUploadButton
} from "@ant-design/pro-components";
import {dataSetFile, interpretMethod, robustMethod, safeMethod} from "@/services/ant-design-pro/api";
import {Button, Form, message, Space, Upload} from "antd";
import {MinusOutlined, PlusOutlined} from "@ant-design/icons";
import React from "react";

<Form.Item>
  <ProFormSelect
    fieldProps={{
      onChange: (event: React.SetStateAction<number>) => {
        setType(event);

        robustActionRef.current?.reload();
        adaptActionRef.current?.reload();


        setRobustEvaluationConfig({test: true});
        console.log(true);
        setEvaConfig({test: true});

        setSelectedRowKeys([]);
        setEditableRowKeys([]);
        setRobustEditableRowKeys([]);
        setRobustSelectedRowKeys([]);
      }
    }}
    name="evaType"
    width="sm"
    initialValue={1}
    options={[
      {label: '正确性测试', value: 1},
      {label: '鲁棒性测试', value: 2},
      {label: '适应性测试', value: 3},
      {label: '可解释性测试', value: 4}
    ]
    }/>
</Form.Item>

{
  type === 1 && (
    <ProFormCheckbox.Group
      fieldProps={{
        onChange: (event) => {
          console.log(event);
          setAccConfig(event);
        },
      }}
      name='type1'
      layout={'vertical'}
      options={[
        {
          label: '准确率',
          value: 1,
        },
        {
          label: '召回率',
          value: 2,
        },
        {
          label: '精确率',
          value: 3,
        },
        {
          label: 'f1分数',
          value: 4,
        },
      ]}
    />
  )
}
2.
鲁棒性
{
  type === 2 && (
    <>
      <EditableProTable
        fieldProps={{
          name: 'safe'
        }}
        rowSelection={robustRowSelection}
        tableAlertRender={false}
        rowKey="categoryId"
        scroll={{
          x: 960,
        }}
        formRef={formRef}
        actionRef={robustActionRef}
        headerTitle="方法配置"
        maxLength={5}
        // 关闭默认的新建按钮
        recordCreatorProps={false}
        columns={robustColumns}
        /*        request={async () => ({
                  data: defaultData,
                  total: 3,
                  success: true,
                })}*/
        request={async (
          // 第一个参数 params 查询表单和 params 参数的结合
          // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
          params: T & {
            pageSize: number;
            current: number;
          },
          sort,
          filter,
        ) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          const msg = await safeMethod(props.props.location.query.taskTypeId);
          console.log(msg);
          if (msg.code === '00000') {
            return {
              data: msg.data.methodList,
              // success 请返回 true，
              // 不然 table 会停止解析数据，即使有数据
              success: true,
              // 不传会使用 data 的长度，如果是分页一定要传
              total: msg.data.total,
            };
          } else
            message.error(msg.message);
          return false;
        }}
        onChange={setDataSource}
        editable={{
          form,
          editableKeys: robustEditableKeys,
          onChange: setRobustEditableRowKeys,
          actionRender: (row, config, dom) => [dom.save, dom.cancel],
        }}
      />
    </>
  )
}
3.
适应性
{
  type === 3 && (
    <>
      <EditableProTable
        fieldProps={{
          name: 'robust'
        }}
        rowSelection={rowSelection}
        tableAlertRender={false}
        rowKey="categoryId"
        scroll={{
          x: 960,
        }}
        actionRef={adaptActionRef}
        headerTitle="方法配置"
        maxLength={5}
        // 关闭默认的新建按钮
        recordCreatorProps={false}
        columns={adaptColumns}
        /*        request={async () => ({
                  data: defaultData,
                  total: 3,
                  success: true,
                })}*/
        request={async (
          // 第一个参数 params 查询表单和 params 参数的结合
          // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
          params: T & {
            pageSize: number;
            current: number;
          },
          sort,
          filter,
        ) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          const msg = await robustMethod(props.props.location.query.taskTypeId);
          console.log(msg);
          if (msg.code === '00000') {
            return {
              data: msg.data.methodList,
              // success 请返回 true，
              // 不然 table 会停止解析数据，即使有数据
              success: true,
              // 不传会使用 data 的长度，如果是分页一定要传
              total: msg.data.total,
            };
          } else
            message.error(msg.message);
          return false;
        }}

        value={dataSource}
        onChange={setDataSource}
        editable={{
          form,
          editableKeys,
          onChange: setEditableRowKeys,
          actionRender: (row, config, dom) => [dom.save, dom.cancel],
        }}
      />
    </>
  )
}
4.
可解释性
{
  type === 4 && (
    <>
      <Form>
        <ProCard bordered bodyStyle={{backgroundColor: '#fafafa',}} size={'small'}>
          数据集选择：
        </ProCard>
        <Form.Item>
          <ProFormUploadButton
            /*            fieldProps={{
                          headers: { 'authorization': 'Bearer ' + token.get(),
                           'content-type': 'multipart/form-data; boundary=<calculated when request is sent>'}
                        }}*/
            //fileList={fileList}
            rules={[{required: true}]}
            tooltip={'请上传数据集文件'}
            label="数据文件"
            name=" dataSetFile"
            title="选取文件"
            max={1}
            accept={".zip,.csv"}
            //action={'/api/micro-model-dataset-service/minio/dataset/upload'}
            fieldProps={{
              beforeUpload: (file) => {
                const isZip = (file.name.split('.').reverse()[0] === 'zip' || file.name.split('.').reverse()[0] === 'csv');
                console.log(isZip);
                if (!isZip) {
                  message.error(`${file.name}文件格式不正确`);
                  return Upload.LIST_IGNORE;
                }
                return true;
              },
              onChange: async (info) => {
                if (info.file.status === 'done') {
                  const data = await dataSetFile(info.file.originFileObj);
                  if (data.code === '00000') {
                    console.log(data.data.url);
                  } else {
                    message.error(data.message);
                  }
                }
                return false;
              },
              listType: "text"
            }}
            /*            onChange={async (info) => {
                          if(info.file.status === 'done'){
                            const data = await dataSetFile(info.file.originFileObj);
                            if(data.code === '00000') {
                              console.log(data.data.url);
                              setDataSetUrl(data.data.url);
                            }
                            else{
                              message.error(data.message);
                            }
                          }
                        }
                        }*/
          >
          </ProFormUploadButton>
        </Form.Item>
        <ProCard bordered bodyStyle={{backgroundColor: '#fafafa',}} size={'small'}>
          代理模型类型：
        </ProCard>
        <Form.Item>
          <ProFormSelect
            width={'200px'}
            name="modelType"
            initialValue={'rule'}
            onChange={(e) => {
              console.log(e);
              setModelType(e);
            }}
            options={[
              {label: '规则模型', value: 'rule'},
              {label: '决策树模型', value: 'tree'},
            ]
            }/>
        </Form.Item>
        <ProCard bordered bodyStyle={{backgroundColor: '#fafafa',}} size={'small'} colSpan={24}>
          <ProCard colSpan={8} bodyStyle={{backgroundColor: '#fafafa',}} layout="left" size={'small'}>
            黑盒模型选择：
          </ProCard>
          <ProCard colSpan={8} bodyStyle={{backgroundColor: '#fafafa',}} layout="left" size={'small'}>
            代理模型选择：
          </ProCard>
          <ProCard colSpan={2} bodyStyle={{backgroundColor: '#fafafa',}} size={'small'}></ProCard>
          <ProCard colSpan={6} bodyStyle={{backgroundColor: '#fafafa',}} layout="left" size={'small'}>
            评估模型选择：
          </ProCard>
        </ProCard>

        <ProCard colSpan={24} size={'small'}>
          <ProCard colSpan={6} layout="left">
            <ProFormSelect
              label={'XAI1'}
              width={'200px'}
              initialValue={1}
              options={[
                {label: '规则模型', value: 1},
                {label: '决策树模型', value: 2},
              ]
              }/>
            <ProFormSelect
              label={'XAI2'}
              width={'200px'}
              initialValue={1}
              options={[
                {label: '规则模型', value: 1},
                {label: '决策树模型', value: 2},
              ]
              }/>
          </ProCard>
          <ProCard colSpan={6} layout="left">
            <ProFormSelect
              width={'200px'}
              initialValue={1}
              options={[
                {label: '规则模型', value: 1},
                {label: '决策树模型', value: 2},
              ]
              }/>
            <ProFormSelect
              width={'200px'}
              initialValue={1}
              options={[
                {label: '规则模型', value: 1},
                {label: '决策树模型', value: 2},
              ]
              }/>
          </ProCard>
          <ProCard colSpan={18} split={'vertical'} size={'small'}>
            <Form.List name="users">
              {(fields, {add, remove}) => {
                console.log(fields);
                return (
                  <>
                    {fields.map(({key, name, ...restField}) => (
                      <ProCard colSpan={18} size={'small'}>
                        <ProCard colSpan={1} layout={'center'} size={'small'}>{"XAI" + (name + 1).toString()}</ProCard>
                        <ProCard colSpan={8} layout={'left'} size={'small'}>
                          <ProFormSelect
                            //label={"XAI"+(name+1).toString()}
                            name={[name, 'sight']}
                            style={{width: 200}}>
                          </ProFormSelect>
                        </ProCard>
                        <ProCard colSpan={8} layout={'center'} size={'small'}>
                          <ProFormSelect
                            name={[name, 'last']}
                            style={{width: 200}}>
                          </ProFormSelect>
                        </ProCard>
                      </ProCard>
                    ))}
                    <ProCard colSpan={4} size={'small'}>
                      <Form.Item>
                        <Space>
                          <Button type="primary" onClick={() => add()} icon={<PlusOutlined/>}>
                            添加
                          </Button>
                          <Button type="primary" onClick={() => {
                            if (fields.length !== 0)
                              remove(fields.at(-1).name);
                          }}
                                  icon={<MinusOutlined/>}>
                            删除
                          </Button>
                        </Space>
                      </Form.Item>
                    </ProCard>
                  </>
                );
              }}
            </Form.List>
          </ProCard>
          <ProCard colSpan={6} layout="left" size={'small'}>
            <Form.Item>
              <ProFormSelect
                name='evaModelType'
                placeholder={'请选择评估模型类型'}
                dependencies={['modelType']}
                request={async () => {
                  const msg = await interpretMethod(modelType, 3).catch((error) => {
                    console.log('error');
                  });
                  console.log(msg.data);
                  return msg.data.map(function (item) {
                    console.log(JSON.parse(item.config));
                    return {label: item.displayName, value: item.interpretMethod}
                  })
                }}
              />
            </Form.Item>
          </ProCard>
        </ProCard>
        <ProCard bordered bodyStyle={{backgroundColor: '#fafafa',}} size={'small'}>
          评估模型参数设置：
        </ProCard>
        <ProCard size={'small'}>
          <ModalForm
            title="评估模型参数配置"
            //name={item.value}
            trigger={<a>参数配置</a>}
            onFinish={async (values) => {
              console.log('value:', values);
              //message.success(evaluationConfig[0]);
              return true;
            }}
          >
            <Form.Item label={<a>配置文档</a>} labelCol={{span: 3, offset: 22}}>
            </Form.Item>
            <a>配置文档</a>
            <Form.Item>
              <ProFormTextArea
                name='config'
                fieldProps={{
                  defaultValue: '{\n' +
                    '//以下3行为规则、决策树都需配置的项\n' +
                    '"consistency_complexity":3,\n' +
                    '"consistency_specificity":4,\n' +
                    '"complexity_specificity":1,\n' +
                    '}' + '{\n' +
                    '"CoverageRate_ClassCoverage":1,\n' +
                    '}',
                  autoSize: true
                }}
              />
            </Form.Item>
          </ModalForm>
        </ProCard>
      </Form>
    </>
  )
}
