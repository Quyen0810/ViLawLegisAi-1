'use client'
import { Button, Card, Col, Form, Input, Row, Typography, Divider, Space, notification } from 'antd';
import { ArrowLeftOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined, SmileOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { authenticate } from '@/utils/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ModalReactive from './model.reactive';
import ModalChangePassword from './modal.change.password';

const { Title, Paragraph, Text } = Typography;

const Login = () => {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const [changePassword, setChangePassword] = useState(false);

    const onFinish = async (values: any) => {
        const { username, password } = values;
        setUserEmail("");
        //trigger sign-in
        const res = await authenticate(username, password);
        console.log(">>> check res: ", res)
        if (res?.error) {
            //error
            if (res?.code === 2) {
                setIsModalOpen(true);
                setUserEmail(username);
                return;
            }
            notification.error({
                message: "Error login",
                description: res?.error
            })

        } else {
            //redirect to /dashboard
            router.push('/');
        }
    };


    return (
        <>
            <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.1), transparent 22%), linear-gradient(135deg, #f8fafc 0%, #ecfeff 50%, #f9fafb 100%)' }}>
                <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '48px 16px' }}>
                    <Col xs={24} sm={20} md={14} lg={10} xl={8}>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                                <Title level={3} style={{ marginBottom: 4 }}>Chào mừng trở lại</Title>
                                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                    Đăng nhập để tiếp tục trải nghiệm ViLaw AI
                                </Paragraph>
                            </div>

                            <Card
                                style={{ borderRadius: 16, boxShadow: '0 20px 50px -24px rgba(15, 23, 42, 0.3)' }}
                                styles={{ body: { padding: '28px' } }}
                            >
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'linear-gradient(120deg, rgba(59,130,246,0.08), rgba(16,185,129,0.08))' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #2563eb, #22c55e)', color: '#fff' }}>
                                            <SafetyCertificateOutlined />
                                        </div>
                                        <div>
                                            <Text strong>Đăng nhập an toàn</Text>
                                            <Paragraph style={{ margin: 0 }} type="secondary">Bảo mật thông tin với xác thực đa tầng</Paragraph>
                                        </div>
                                    </div>

                                    <Form
                                        name="login"
                                        onFinish={onFinish}
                                        autoComplete="off"
                                        layout='vertical'
                                        requiredMark={false}
                                    >
                                        <Form.Item
                                            label="Email"
                                            name="username"
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

                                        <Form.Item style={{ marginBottom: 8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setChangePassword(true)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        color: '#3b82f6',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    Quên mật khẩu?
                                                </button>
                                            </div>
                                            <Button type="primary" htmlType="submit" block size="large">
                                                Đăng nhập
                                            </Button>
                                        </Form.Item>
                                    </Form>

                                    <Divider plain style={{ margin: '8px 0' }}>hoặc</Divider>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <ArrowLeftOutlined /> Về trang chủ
                                        </Link>
                                        <div>
                                            <Text type="secondary">Chưa có tài khoản? </Text>
                                            <Link href="/auth/register">Đăng ký ngay</Link>
                                        </div>
                                    </div>
                                </Space>
                            </Card>
                        </Space>
                    </Col>
                </Row>
            </div>
            <ModalReactive
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                userEmail={userEmail}
            />
            <ModalChangePassword
                isModalOpen={changePassword}
                setIsModalOpen={setChangePassword}
            />


        </>
    )
}

export default Login;