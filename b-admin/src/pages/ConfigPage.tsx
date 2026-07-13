import { useState, useEffect } from 'react'
import { Card, Form, Select, Button, message, Space, Spin } from 'antd'
import { SettingOutlined, PictureOutlined, AudioOutlined } from '@ant-design/icons'
import { configApi, type AvatarConfig } from '@/api/config'

const { Option } = Select

const modelOptions = [
  { value: 'haru', label: 'Haru - 青春少女' },
  { value: 'mei', label: 'Mei - 知性女士' },
  { value: 'liam', label: 'Liam - 阳光少年' },
  { value: 'chen', label: 'Chen - 成熟男士' },
]

const voiceOptions = [
  { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓 - 温柔女声' },
  { value: 'zh-CN-YunxiNeural', label: '云希 - 清澈女声' },
  { value: 'zh-CN-YunyangNeural', label: '云扬 - 温暖男声' },
  { value: 'zh-CN-YufanNeural', label: '宇凡 - 活力男声' },
]

const skinColorOptions = [
  { value: '#D4A853', label: '自然肤色' },
  { value: '#E8C89D', label: '白皙肤色' },
  { value: '#C4A77D', label: '健康肤色' },
  { value: '#A67C52', label: '古铜肤色' },
]

const defaultConfig: AvatarConfig = {
  model: 'haru',
  voice: 'zh-CN-XiaoxiaoNeural',
  skin_color: '#D4A853',
}

function ConfigPage() {
  const [config, setConfig] = useState<AvatarConfig>(defaultConfig)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const response = await configApi.getAvatarConfig()
      const data = response.data
      setConfig({
        model: data.model || defaultConfig.model,
        voice: data.voice || defaultConfig.voice,
        skin_color: data.skin_color || defaultConfig.skin_color,
      })
      form.setFieldsValue({
        model: data.model || defaultConfig.model,
        voice: data.voice || defaultConfig.voice,
        skin_color: data.skin_color || defaultConfig.skin_color,
      })
    } catch (error) {
      message.error('加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      setLoading(true)
      configApi
        .updateAvatarConfig(values)
        .then(() => {
          setConfig(values)
          message.success('配置保存成功')
        })
        .catch(() => {
          message.error('保存失败')
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', gap: 24 }}>
        <Card
          title="数字人配置"
          style={{ flex: 1 }}
          extra={<SettingOutlined />}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={config}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              name="model"
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SettingOutlined />
                  数字人模型
                </span>
              }
              rules={[{ required: true, message: '请选择数字人模型' }]}
            >
              <Select placeholder="请选择数字人模型">
                {modelOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="skin_color"
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PictureOutlined />
                  肤色选择
                </span>
              }
              rules={[{ required: true, message: '请选择肤色' }]}
            >
              <Select placeholder="请选择肤色">
                {skinColorOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: option.value,
                          border: '1px solid #ddd',
                        }}
                      />
                      {option.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="voice"
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AudioOutlined />
                  语音选择
                </span>
              }
              rules={[{ required: true, message: '请选择语音' }]}
            >
              <Select placeholder="请选择语音">
                {voiceOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSave} loading={loading}>
                  保存配置
                </Button>
                <Button
                  onClick={() => {
                    form.setFieldsValue(defaultConfig)
                    setConfig(defaultConfig)
                    message.info('已恢复默认配置')
                  }}
                >
                  恢复默认
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card
          title="当前配置预览"
          style={{ width: 360 }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 24,
            }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${config.skin_color}, ${config.skin_color}88)`,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 60,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              🤖
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                {modelOptions.find((m) => m.value === config.model)?.label}
              </div>
              <div style={{ color: '#666', fontSize: 14 }}>
                <div>语音：{voiceOptions.find((v) => v.value === config.voice)?.label}</div>
                <div style={{ marginTop: 4 }}>
                  肤色：
                  <span
                    style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: config.skin_color,
                      marginLeft: 8,
                      verticalAlign: 'middle',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Spin>
  )
}

export default ConfigPage
