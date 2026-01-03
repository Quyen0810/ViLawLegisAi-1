'use client'
import React from 'react';
import { Card, Col, Divider, Form, Input, Row, Typography, Button, Space, notification } from 'antd';
import { ArrowLeftOutlined, MailOutlined, LockOutlined, UserOutlined, SmileOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { sendRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
const { Title, Paragraph, Text } = Typography;
const Register = () => {
    const router = useRouter();

    const onFinish = async (values: any) => {
      const { email, password, name } = values;
      const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`,
        method: "POST",
        body: {
            email, password, name
        }
    })
    if (res?.data) {
        router.push(`/verify/${res?.data?._id}`);
    } else {
        notification.error({
            message: "Register error",
            description: res?.message
        })
      }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 15% 20%, rgba(94,234,212,0.12), transparent 25%), radial-gradient(circle at 85% 0%, rgba(59,130,246,0.12), transparent 22%), linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f9fafb 100%)' }}>
            <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '48px 16px' }}>
                <Col xs={24} sm={20} md={14} lg={10} xl={8}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ marginBottom: 4 }}>Tạo tài khoản mới</Title>
                            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                Gia nhập ViLaw để trải nghiệm trợ lý pháp lý AI
                            </Paragraph>
                        </div>

                        <Card
                            style={{ borderRadius: 16, boxShadow: '0 20px 50px -24px rgba(15, 23, 42, 0.3)' }}
                            styles={{ body: { padding: '28px' } }}
                        >
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'linear-gradient(120deg, rgba(59,130,246,0.08), rgba(16,185,129,0.08))' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #22c55e, #3b82f6)', color: '#fff' }}>
                                        <SmileOutlined />
                                    </div>
                                    <div>
                                        <Text strong>Tạo tài khoản trong 1 phút</Text>
                                        <Paragraph style={{ margin: 0 }} type="secondary">Nhận mã kích hoạt qua email ngay lập tức</Paragraph>
                                    </div>
                                </div>

                                <Form
                                    name="register"
                                    onFinish={onFinish}
                                    autoComplete="off"
                                    layout='vertical'
                                    requiredMark={false}
                                >
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email' },
                                            { type: 'email', message: 'Email không hợp lệ' }
                                        ]}
                                    >
                                        <Input size="large" prefix={<MailOutlined />} placeholder="you@example.com" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Mật khẩu"
                                        name="password"
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                                    >
                                        <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Họ và tên"
                                        name="name"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                    >
                                        <Input size="large" prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                                    </Form.Item>

                                    <Form.Item style={{ marginBottom: 8 }}>
                                        <Button type="primary" htmlType="submit" block size="large">
                                            Đăng ký
                                        </Button>
                                    </Form.Item>
                                </Form>

                                <Divider plain style={{ margin: '8px 0' }}>hoặc</Divider>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <ArrowLeftOutlined /> Về trang chủ
                                    </Link>
                                    <div>
                                        <Text type="secondary">Đã có tài khoản? </Text>
                                        <Link href="/auth/login">Đăng nhập</Link>
                                    </div>
                                </div>
                            </Space>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default Register;