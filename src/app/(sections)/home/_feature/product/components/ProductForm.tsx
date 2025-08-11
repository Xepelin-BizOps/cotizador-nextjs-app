"use client";
import TypedInputNumber from "antd/es/input-number";
import { Form, Input, Button, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import { SaveOutlined } from "@ant-design/icons";
import useToast from "@/app/hooks/useToast";
import { useEffect, useState } from "react";
import { productTypes } from "@/app/constants/optionsSelects";
import { getCategories } from "../../../_actions";
import { transformToSelectOptions } from "@/utils/transformToSelectOptions";
import { requiredRule } from "@/utils/formRules";
import { createProduct, editProduct } from "../actions";
import type {
  CreateProductDto,
  EditProductDto,
} from "@/schemas/product/product.dto";
import { useAuthContext } from "@/app/hooks/useAuthContext";

interface Props {
  onCloseModal: () => void;
  isEdit?: boolean;
  dataEdit?: EditProductDto;
}

export default function ProductForm({ onCloseModal, dataEdit, isEdit }: Props) {
  console.log({ dataEdit });
  const [form] = Form.useForm();

  const authContext = useAuthContext();

  const [categories, setCategories] =
    useState<{ label: string; value: string }[]>();
  const [isLoading, setIsLoading] = useState(false);

  // GET Categories
  useEffect(() => {
    getCategories().then((data) =>
      setCategories(transformToSelectOptions(data || []))
    );
  });

  // Seteo la data para el edit cuando existe
  useEffect(() => {
    if (isEdit && dataEdit) {
      form.setFieldsValue({
        ...dataEdit,
        categoryId: String(dataEdit.categoryId),
        currencyId: String(dataEdit.currencyId),
      });
    }
  }, [dataEdit, isEdit, form]);

  const { contextHolder, showToast } = useToast();

  const onSubmitData = async (dataForm: CreateProductDto | EditProductDto) => {
    console.log({ dataForm });
    setIsLoading(true);

    const response = isEdit
      ? await editProduct(dataForm as EditProductDto, dataEdit?.id!)
      : await createProduct(dataForm);

    showToast({
      type: response.success ? "success" : "error",
      message: response.message,
    });

    response.success && form.resetFields();
    setIsLoading(false);
    response.success && onCloseModal();
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        name="login"
        layout="vertical"
        onFinish={onSubmitData}
        initialValues={{
          currencyId: authContext.value.currency.id,
          companyId: authContext.value.companyId,
        }}
      >
        {/* Campos ocultos */}
        <Form.Item name="currencyId" hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="companyId" hidden>
          <Input type="hidden" />
        </Form.Item>
        <div className="shadow-sm rounded-lg p-4 border border-accent-light-hover my-3">
          <p className="mb-3 font-semibold text-lg">Información del ítem</p>
          <div className="flex flex-col items-center md:flex-row md:justify-between md:gap-4">
            <Form.Item
              label="ID/SKU"
              name="sku"
              rules={[requiredRule]}
              className="w-full"
              normalize={(value: string) => value?.toUpperCase()}
            >
              <Input type="text" placeholder="SKU1234" />
            </Form.Item>
            <Form.Item
              label="Nombre"
              name="name"
              rules={[requiredRule]}
              className="w-full"
            >
              <Input placeholder="Nombre del ítem" />
            </Form.Item>

            <Form.Item
              label="Precio"
              name="price"
              rules={[requiredRule]}
              className="w-full"
            >
              <TypedInputNumber
                min={0}
                step={0.01}
                style={{ width: "100%" }}
                formatter={(value) => `$ ${value}`}
                placeholder="0,00"
              />
            </Form.Item>
          </div>

          <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between md:gap-4 mt-5">
            <Form.Item
              label="Categoría"
              name="categoryId"
              rules={[requiredRule]}
              className="w-full"
            >
              <Select
                placeholder="Seleccionar categoría"
                // loading={isLoading}
                options={categories}
              />
            </Form.Item>

            <Form.Item
              label="Tipo"
              name="type"
              rules={[requiredRule]}
              className="w-full"
            >
              <Select placeholder="Seleccionar tipo" options={productTypes} />
            </Form.Item>

            <Form.Item
              label="Descripción corta"
              name="shortDescription"
              rules={[
                requiredRule,
                { max: 255, message: "Máximo 255 caracteres" },
              ]}
              className="w-full"
            >
              <TextArea rows={2} placeholder="Descripción breve del ítem" />
            </Form.Item>
          </div>

          <Form.Item label="Descripción larga" name="longDescription">
            <TextArea rows={4} placeholder="Descripción detallada del ítem" />
          </Form.Item>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          icon={<SaveOutlined />}
        >
          {isEdit ? "Guardar cambios" : "Agregar ítem"}
        </Button>
      </Form>
    </>
  );
}
