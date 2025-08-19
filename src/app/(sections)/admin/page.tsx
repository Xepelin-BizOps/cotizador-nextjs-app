"use client";

import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";
import { adminLogin } from "./actions";

interface LoginValues {
  email: string;
  password: string;
}

export default function AdminPage() {
  const router = useRouter();

  const onFinish = async (values: LoginValues) => {
    const res = await adminLogin(values.email, values.password);
    if (res.success) {
      message.success("Bienvenido");
      router.replace("/admin/companies");
    } else {
      message.error(res.message);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold">Acceso Administrador</h2>
      <Form onFinish={onFinish} className="mt-4" style={{ maxWidth: 300, width: "100%" }}>
        <Form.Item name="email" rules={[{ required: true, message: "Email requerido" }]}> 
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: "Password requerida" }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Ingresar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
