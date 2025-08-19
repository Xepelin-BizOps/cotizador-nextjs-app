"use client";

import { Button, Form, Input, Select, message } from "antd";
import { createCompany } from "../actions";
import { Country } from "@prisma/client";

type Props = {
  currencies: { id: number; value: string }[];
};

interface FormValues {
  businessIdentifier: string;
  companyName: string;
  email: string;
  country: Country;
  currencyId: number;
}

export default function CompanyForm({ currencies }: Props) {
  const onFinish = async (values: FormValues) => {
    const res = await createCompany({
      businessIdentifier: values.businessIdentifier,
      companyName: values.companyName,
      email: values.email,
      country: values.country,
      currencyId: values.currencyId,
    });
    if (res.success) {
      message.success("Compañía creada");
    } else {
      message.error(res.message || "Error al crear compañía");
    }
  };

  return (
    <Form onFinish={onFinish} layout="vertical" style={{ maxWidth: 400 }}>
      <Form.Item
        label="Identificador"
        name="businessIdentifier"
        rules={[{ required: true, message: "Identificador requerido" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Nombre"
        name="companyName"
        rules={[{ required: true, message: "Nombre requerido" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: "Email requerido" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="País" name="country" rules={[{ required: true }]}> 
        <Select options={Object.values(Country).map((c) => ({ label: c, value: c }))} />
      </Form.Item>
      <Form.Item
        label="Moneda"
        name="currencyId"
        rules={[{ required: true, message: "Moneda requerida" }]}
      >
        <Select options={currencies.map((c) => ({ label: c.value, value: c.id }))} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Guardar
        </Button>
      </Form.Item>
    </Form>
  );
}
