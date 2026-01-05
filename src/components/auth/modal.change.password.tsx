'use client'

import { useHasMounted } from "@/utils/customHook";
import { Button, Divider, Form, Input, Modal, notification, Result, Steps, Typography } from "antd";
import { SmileOutlined, SolutionOutlined, UserOutlined, LockOutlined, MailOutlined, KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useState } from "react";
import { sendRequest } from "@/utils/api";

const ModalChangePassword = (props: any) => {
    const { isModalOpen, setIsModalOpen } = props;
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();
    const [userEmail, setUserEmail] = useState("");
    const [loadingStep0, setLoadingStep0] = useState(false);
    const [loadingStep1, setLoadingStep1] = useState(false);

    const hasMounted = useHasMounted();

    if (!hasMounted) return <></>;

    const handleClose = () => {
        setIsModalOpen(false);
        setCurrent(0);
        setUserEmail("");
        form.resetFields();
    };

    const onFinishStep0 = async (values: any) => {
        const { email } = values;
        setLoadingStep0(true);
        const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
        const res = await sendRequest<IBackendRes<any>>({
            url: `${backendUrl}/api/v1/auth/retry-password`,
            method: "POST",
            body: {
                email
            }
        }).finally(() => setLoadingStep0(false));

        if (res?.data) {
            setUserEmail(res?.data?.email );
            setCurrent(1);
        } else {
            notification.error({
                message: "Lỗi gửi email",
                description: res?.message || "Không thể gửi email. Vui lòng thử lại sau."
            })
        }
    }

    const onFinishStep1 = async (values: any) => {
        const { code, password, confirmPassword } = values;
        if (password !== confirmPassword) {
            notification.error({
                message: "Mật khẩu không khớp",
                description: "Mật khẩu và xác nhận mật khẩu không giống nhau. Vui lòng kiểm tra lại."
            })
            return;
        }
        setLoadingStep1(true);
        const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
        const res = await sendRequest<IBackendRes<any>>({
            url: `${backendUrl}/api/v1/auth/change-password`,
            method: "POST",
            body: {
                code, password, confirmPassword, email: userEmail
            }
        }).finally(() => setLoadingStep1(false));

        if (res?.data) {
            setCurrent(2);
        } else {
            notification.error({
                message: "Lỗi đổi mật khẩu",
                description: res?.message || "Không thể đổi mật khẩu. Vui lòng thử lại sau."
            })
        }
    }

    return (
        <>
            <Modal
                title={null}
                open={isModalOpen}
                onOk={handleClose}
                onCancel={handleClose}
                maskClosable={false}
                footer={null}
            >
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        color: "#fff",
                        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.25)",
                    }}>
                        <LockOutlined style={{ fontSize: 24 }} />
                    </div>
                    <div>
                        <Typography.Title level={4} style={{ margin: 0 }}>Đổi mật khẩu</Typography.Title>
                        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                            Hoàn tất 2 bước để đặt lại mật khẩu của bạn.
                        </Typography.Paragraph>
                    </div>
                </div>

                <Steps
                    current={current}
                    items={[
                        {
                            title: 'Email',
                            icon: <MailOutlined />,
                        },
                        {
                            title: 'Đổi mật khẩu',
                            icon: <SolutionOutlined />,
                        },
                        {
                            title: 'Hoàn thành',
                            icon: <SmileOutlined />,
                        },
                    ]}
                />

                {current === 0 &&
                    <>
                        <div style={{ margin: "20px 0 12px" }}>
                            <Typography.Title level={5} style={{ marginBottom: 4 }}>Nhập email tài khoản</Typography.Title>
                            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                                Chúng tôi sẽ gửi mã xác thực đến email của bạn để đổi mật khẩu.
                            </Typography.Paragraph>
                        </div>
                        <Form
                            name="change-password"
                            onFinish={onFinishStep0}
                            autoComplete="off"
                            layout='vertical'
                            form={form}
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
                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<MailOutlined />} loading={loadingStep0} block size="large">
                                    Gửi mã xác thực
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                }

                {current === 1 &&
                    <>
                        <div style={{ margin: "20px 0 12px" }}>
                            <Typography.Title level={5} style={{ marginBottom: 4 }}>Nhập mã và mật khẩu mới</Typography.Title>
                            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                                Nhập mã xác thực đã gửi đến email và mật khẩu mới của bạn.
                            </Typography.Paragraph>
                        </div>

                        <Form
                            name="change-pass-2"
                            onFinish={onFinishStep1}
                            autoComplete="off"
                            layout='vertical'
                            form={form}
                        >
                            <Form.Item
                                label="Mã xác thực"
                                name="code"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mã xác thực!',
                                    },
                                ]}
                            >
                                <Input size="large" placeholder="Nhập mã gồm 6 ký tự" prefix={<KeyOutlined />} />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu mới"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mật khẩu mới!',
                                    },
                                    {
                                        min: 6,
                                        message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                                    },
                                ]}
                            >
                                <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
                            </Form.Item>

                            <Form.Item
                                label="Xác nhận mật khẩu"
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng xác nhận mật khẩu!',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<SafetyCertificateOutlined />} loading={loadingStep1} block size="large">
                                    Đổi mật khẩu
                                </Button>
                            </Form.Item>
                        </Form>
                        <Divider style={{ margin: "8px 0 0" }} />
                        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12 }}>
                            Không thấy email? Kiểm tra hộp thư <Typography.Text strong>Spam / Quảng cáo</Typography.Text> hoặc gửi lại bước trước.
                        </Typography.Paragraph>
                    </>
                }

                {current === 2 &&
                    <Result
                        status="success"
                        title="Đổi mật khẩu thành công!"
                        subTitle="Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại với mật khẩu mới."
                        extra={[
                            <Button type="primary" key="close" onClick={handleClose}>
                                Đóng
                            </Button>,
                        ]}
                    />
                }
            </Modal>
        </>
    )
}

export default ModalChangePassword;