'use client'

import { useHasMounted } from "@/utils/customHook";
import { Button, Divider, Form, Input, Modal, notification, Result, Steps, Typography } from "antd";
import { SmileOutlined, SolutionOutlined, UserOutlined, SafetyCertificateOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";

const ModalReactive = (props: any) => {
    const { isModalOpen, setIsModalOpen, userEmail } = props;
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();
    const [userId, setUserId] = useState("");
    const [loadingStep0, setLoadingStep0] = useState(false);
    const [loadingStep1, setLoadingStep1] = useState(false);

    const hasMounted = useHasMounted();


    useEffect(() => {
        if (userEmail) {
            form.setFieldValue("email", userEmail)
        }
    }, [userEmail]);

    const handleClose = () => {
        setIsModalOpen(false);
        setCurrent(0);
        setUserId("");
        form.resetFields();
    };

    if (!hasMounted) return <></>;

    const onFinishStep0 = async (values: any) => {
        const { email } = values;
        setLoadingStep0(true);
        const res = await sendRequest<IBackendRes<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/retry-active`,
            method: "POST",
            body: {
                email
            }
        }).finally(() => setLoadingStep0(false));

        if (res?.data) {
            setUserId(res?.data?._id)
            setCurrent(1);
        } else {
            notification.error({
                message: "Call APIs error",
                description: res?.message
            })
        }

    }

    const onFinishStep1 = async (values: any) => {
        const { code } = values;
        setLoadingStep1(true);
        const res = await sendRequest<IBackendRes<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/check-code`,
            method: "POST",
            body: {
                code, _id: userId
            }
        }).finally(() => setLoadingStep1(false));

        if (res?.data) {
            setCurrent(2);
        } else {
            notification.error({
                message: "Call APIs error",
                description: res?.message
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
                        background: "linear-gradient(135deg,#22c55e,#4ade80)",
                        color: "#fff",
                        boxShadow: "0 10px 25px rgba(22, 163, 74, 0.25)",
                    }}>
                        <SafetyCertificateOutlined style={{ fontSize: 24 }} />
                    </div>
                    <div>
                        <Typography.Title level={4} style={{ margin: 0 }}>Kích hoạt tài khoản</Typography.Title>
                        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                            Hoàn tất 2 bước để mở khóa tài khoản của bạn.
                        </Typography.Paragraph>
                    </div>
                </div>

                <Steps
                    current={current}
                    items={[
                        {
                            title: 'Login',
                            // status: 'finish',
                            icon: <UserOutlined />,
                        },
                        {
                            title: 'Verification',
                            // status: 'finish',
                            icon: <SolutionOutlined />,
                        },

                        {
                            title: 'Done',
                            // status: 'wait',
                            icon: <SmileOutlined />,
                        },
                    ]}
                />
                {current === 0 &&
                    <>
                        <div style={{ margin: "20px 0 12px" }}>
                            <Typography.Title level={5} style={{ marginBottom: 4 }}>Gửi lại mã xác thực</Typography.Title>
                            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                                Tài khoản của bạn chưa kích hoạt. Vui lòng kiểm tra email để nhận mã mới.
                            </Typography.Paragraph>
                        </div>
                        <Form
                            name="verify"
                            onFinish={onFinishStep0}
                            autoComplete="off"
                            layout='vertical'
                            form={form}
                        >
                            <Form.Item
                                label=""
                                name="email"
                            >
                                <Input disabled value={userEmail} />
                            </Form.Item>
                            <Form.Item
                            >
                                <Button type="primary" htmlType="submit" icon={<MailOutlined />} loading={loadingStep0} block>
                                    Gửi mã kích hoạt
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                }

                {current === 1 &&
                    <>
                        <div style={{ margin: "20px 0 12px" }}>
                            <Typography.Title level={5} style={{ marginBottom: 4 }}>Nhập mã xác nhận</Typography.Title>
                            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                                Dán mã gồm 6 ký tự được gửi tới email của bạn.
                            </Typography.Paragraph>
                        </div>

                        <Form
                            name="verify2"
                            onFinish={onFinishStep1}
                            autoComplete="off"
                            layout='vertical'

                        >
                            <Form.Item
                                label="Code"
                                name="code"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your code!',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập mã gồm 6 ký tự" prefix={<KeyOutlined />} />
                            </Form.Item>
                            <Form.Item
                            >
                                <Button type="primary" htmlType="submit" icon={<SafetyCertificateOutlined />} loading={loadingStep1} block>
                                    Kích hoạt ngay
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
                        title="Kích hoạt thành công!"
                        subTitle="Tài khoản của bạn đã được mở khóa. Vui lòng đăng nhập lại."
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

export default ModalReactive;