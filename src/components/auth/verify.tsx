'use client'

import { Button, message, Row, Col, Form, Input, Divider, Card, Typography } from "antd";
import Link from "next/link";
import { sendRequest } from "@/utils/api";
import { useRouter } from "next/navigation";
import { ArrowLeftOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const Verify = (props: any) => {
  const router = useRouter();
  const { id } = props;

  const onFinish = async (values: any) => {
    const { _id, code } = values;
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/check-code`,
      method: "POST",
      body: {
          _id, code
      }
    });
    console.log(">>> check res: ", res)


    if (res?.data) {
      message.success("Kích hoạt tài khoản thành công.");
      setTimeout(() => {
        router.push(`/auth/login`);
      }, 1000);
    } else {
      message.error(res?.message || 'Kích hoạt thất bại');
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e0f2fe 0%, #f1f5f9 100%)",
        padding: 16,
      }}
    >
      <Card
        style={{
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.15)",
          borderRadius: 16,
        }}
        bordered={false}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#22c55e,#4ade80)",
              marginBottom: 16,
              boxShadow: "0 10px 25px rgba(22, 163, 74, 0.35)",
              color: "#fff",
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 32 }} />
          </div>
          <Title level={3} style={{ marginBottom: 8 }}>
            Kích hoạt tài khoản
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Nhập mã xác thực đã được gửi tới email của bạn để hoàn tất đăng ký.
          </Paragraph>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID tài khoản: <Text code>{id}</Text>
          </Text>
        </div>

        <Form name="verify" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Form.Item label="Id" name="_id" initialValue={id} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Mã xác thực"
            name="code"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mã xác thực!",
              },
              {
                pattern: /^\d{6}$/,
                message: "Mã xác thực phải là 6 chữ số!",
              },
            ]}
          >
            <Input 
              placeholder="Nhập mã gồm 6 số..." 
              maxLength={6}
              style={{ fontSize: 20, letterSpacing: 4, textAlign: 'center', fontWeight: 'bold' }}
            />
          </Form.Item>

          <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
            Nếu không thấy email, hãy kiểm tra thêm hộp thư <Text strong>Spam / Quảng cáo</Text>.
          </Paragraph>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block style={{ height: 40, fontWeight: 500 }}>
              Xác minh tài khoản
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Row justify="space-between" align="middle">
          <Col>
            <Link href={"/"}>
              <ArrowLeftOutlined /> Quay lại trang chủ
            </Link>
          </Col>
          <Col>
            <span style={{ fontSize: 13 }}>
              Đã có tài khoản? <Link href={"/auth/login"}>Đăng nhập</Link>
            </span>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Verify;
