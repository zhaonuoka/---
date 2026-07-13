import { useState, useEffect, useRef } from 'react'
import {
  Upload,
  Button,
  Table,
  Modal,
  Form,
  Input,
  message,
  Space,
  Card,
  Spin,
} from 'antd'
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { knowledgeApi, type Document } from '@/api/knowledge'

function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const uploadRef = useRef<{ upload: (options: { file: File }) => void }>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const response = await knowledgeApi.listDocs()
      setDocuments(response.data.data || [])
    } catch (error) {
      message.error('加载文档失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (options: { file: File }) => {
    setLoading(true)
    try {
      await knowledgeApi.uploadDoc(options.file)
      message.success('上传成功')
      loadDocuments()
    } catch {
      message.error('上传失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record: Document) => {
    setEditingDoc(record)
    form.setFieldsValue({
      content: record.content,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该文档吗？',
      onOk: () => {
        setLoading(true)
        knowledgeApi
          .deleteDoc(id)
          .then(() => {
            message.success('删除成功')
            loadDocuments()
          })
          .catch(() => {
            message.error('删除失败')
          })
          .finally(() => {
            setLoading(false)
          })
      },
    })
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingDoc) {
        setLoading(true)
        knowledgeApi
          .editDoc(editingDoc.id, values.content)
          .then(() => {
            message.success('保存成功')
            setIsModalVisible(false)
            form.resetFields()
            loadDocuments()
          })
          .catch(() => {
            message.error('保存失败')
          })
          .finally(() => {
            setLoading(false)
          })
      }
    })
  }

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined />
          {text}
        </span>
      ),
    },
    {
      title: '类型',
      dataIndex: 'file_type',
      key: 'file_type',
      render: (text: string) => (
        <span
          style={{
            background: '#f0f5ff',
            color: '#1677ff',
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {text.toUpperCase()}
        </span>
      ),
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (size: number) => {
        if (size > 1024 * 1024) {
          return `${(size / (1024 * 1024)).toFixed(2)} MB`
        }
        return `${(size / 1024).toFixed(2)} KB`
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Document) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="知识库管理"
        extra={
          <Upload
            ref={uploadRef}
            accept=".txt,.md,.pdf,.doc,.docx"
            beforeUpload={(file) => {
              handleUpload({ file })
              return false
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} type="primary">
              上传文档
            </Button>
          </Upload>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={documents}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title="编辑文档内容"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        width={700}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="content"
            label="文档内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea
              rows={10}
              placeholder="请输入文档内容"
              style={{ resize: 'vertical' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default KnowledgePage
