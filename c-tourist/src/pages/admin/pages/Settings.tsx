import { Card, Form, Input, Slider, Switch, Button } from 'antd'

const Settings: React.FC = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统配置</h2>

      <Card title="数字人配置" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="数字人名称">
            <Input placeholder="AI 导游" defaultValue="AI 导游" />
          </Form.Item>
          <Form.Item label="Live2D 模型 URL">
            <Input placeholder="/models/haru/haru.model3.json" />
          </Form.Item>
          <Form.Item label="语音音量">
            <Slider defaultValue={70} />
          </Form.Item>
          <Form.Item label="自动播放语音">
            <Switch defaultChecked />
          </Form.Item>
          <Button type="primary">保存配置</Button>
        </Form>
      </Card>

      <Card title="推荐参数配置">
        <Form layout="vertical">
          <Form.Item label="推荐数量">
            <Slider defaultValue={5} min={1} max={20} />
          </Form.Item>
          <Form.Item label="启用个性化推荐">
            <Switch defaultChecked />
          </Form.Item>
          <Button type="primary">保存参数</Button>
        </Form>
      </Card>
    </div>
  )
}

export default Settings
