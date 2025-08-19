import React, { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, Select, Table } from "antd";
import { CloseOutlined, SaveOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { requiredRule } from "@/utils/formRules";
import TextArea from "antd/es/input/TextArea";
import { QuotationStatus } from "@prisma/client";
import useToast from "@/app/hooks/useToast";
import { useProductItemColumns } from "../hooks/useProductItemColumns";
import { calculateTotals } from "@/utils/functions";
import type {
  CreateQuoteDto,
  CreateQuoteItemDto,
  EditQuoteDto,
  EditQuoteItemDto,
} from "@/schemas/quote/quote.dto";
import type { QuoteSection } from "../quote-types";
import { createQuote, editQuote } from "../actions";
import dayjs from "dayjs";
import { quoteStatusOptions } from "@/app/constants/optionsSelects";
import { useAuthContext } from "@/app/hooks/useAuthContext";

const DEFAULT_SECTIONS: { key: string; title: string }[] = [
  { key: "serviceDescription", title: "Descripción del Servicio" },
  { key: "paymentConditions", title: "Condiciones de Pago" },
  { key: "validityWarranty", title: "Vigencia y Garantías" },
  { key: "paymentMethod", title: "Forma de Pago" },
  { key: "exclusions", title: "Exclusiones" },
  { key: "termsConditions", title: "Términos y Condiciones" },
];

interface Props {
  toggleForm: (type: "create" | "edit" | null, data?: EditQuoteDto) => void;
  isEdit: boolean;
  dataEdit?: EditQuoteDto;
  optionsProducts: { label: string; value: number }[];
  optionsClients: { label: string; value: number }[];
}

// tomar los dto que cree con zod (manejar create y edit) en un solo type
type QuoteItemStateType = CreateQuoteItemDto | EditQuoteItemDto;

export default function QuoteForm({
  isEdit,
  toggleForm,
  dataEdit,
  optionsProducts,
  optionsClients,
}: Props) {
  const authContext = useAuthContext();
  const [form] = Form.useForm<CreateQuoteDto>();
  const { showToast, contextHolder } = useToast();

  // <ProductItem[] | []>
  const [items, setItems] = useState<QuoteItemStateType[] | []>(
    dataEdit ? dataEdit.items : []
  );
  const [sections, setSections] = useState<QuoteSection[]>(
    dataEdit?.sections || []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Si llega la data setear para el edit
  useEffect(() => {
    if (isEdit && dataEdit) {
      const { items, ...rest } = dataEdit;

      // Si hay fecha, convertirla a dayjs
      const preparedValues = {
        ...rest,
        quotationDate: dayjs(rest.quotationDate),
        clientId: rest.clientId,
      };

      // saco los items y me quedo con lo otro nomas
      form.setFieldsValue(preparedValues);
      setSections(dataEdit.sections || []);
    } else {
      form.resetFields();
      setSections([]);
    }
  }, [dataEdit, isEdit, form]);

  const addProduct = (productId: number) => {
    setItems((oldItems) => {
      const exists = oldItems.find((item) => item.productId === productId);

      if (exists) {
        // Sumar en 1 la cantidad
        return oldItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // lo buscamos a partir de su id
        const productFound = optionsProductsFormat.find(
          (product) => product.value === productId
        );

        if (!productFound) return oldItems;

        // Agregagamos el producto
        return [
          ...oldItems,
          {
            productName: productFound.name,
            productId: Number(productId),
            quantity: 1,
            unitPrice: Number(productFound.price),
          },
        ];
      }
    });
  };

  const updateItem = (
    productId: number,
    key: "quantity" | "unitPrice",
    value: number
  ) => {
    setItems((oldItems) =>
      oldItems.map((item) =>
        item.productId === productId ? { ...item, [key]: value } : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setItems((oldItems) =>
      oldItems.filter((item) => item.productId !== productId)
    );
  };

  const productItemColumns = useProductItemColumns(updateItem, removeItem);

  // ----- Sections -----
  const addSection = (key: string) => {
    const def = DEFAULT_SECTIONS.find((s) => s.key === key);
    if (!def) return;
    setSections((prev) => {
      if (prev.find((s) => s.title === def.title)) return prev;
      return [...prev, { title: def.title, content: "" }];
    });
  };

  const addCustomSection = () => {
    setSections((prev) => [...prev, { title: "Nueva Sección", content: "" }]);
  };

  const updateSection = (
    index: number,
    key: "title" | "content",
    value: string
  ) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[index] = { ...newSections[index], [key]: value };
      return newSections;
    });
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  // Funcion para calcular totales
  const { ivaAmount, subtotal, total } = calculateTotals(items, 16);

  // Render options Select
  const optionsProductsFormat = optionsProducts.map((product) => {
    const [name, sku, price] = (product.label as string).split(" - ");

    return {
      value: product.value, // Solo el ID como value
      label: (
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-gray-500">{sku}</div>
          </div>
          <div className="text-sm font-medium pr-2">${price}</div>
        </div>
      ),
      searchValue: `${name} ${sku}`, // campo se usa solo para la búsqueda
      price: price,
      name: name,
    };
  });

  const onSubmitData = async (dataForm: CreateQuoteDto | EditQuoteDto) => {
    setIsLoading(true);

    const dataSend: CreateQuoteDto = {
      ...dataForm,
      items: items, // Agregamos los items del state
      clientId: Number(dataForm.clientId),
      sections: sections,
    };

    const response =
      isEdit && dataEdit
        ? await editQuote(dataSend as EditQuoteDto, dataEdit.id!)
        : await createQuote(dataSend);

    showToast({
      type: response.success ? "success" : "error",
      message: response.message,
      onClose: () => response.success && toggleForm(null),
      duration: 1,
    });

    setIsLoading(false);
    if (response.success) form.resetFields();
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-[60vh] p-4">
        <div className="flex justify-between items-start w-full mb-7">
          <h2 className="text-lg font-semibold ">Nueva cotización</h2>

          <Button
            icon={<CloseOutlined className="cursor-pointer" />}
            variant="outlined"
            color="primary"
            onClick={() => toggleForm(null, undefined)}
          >
            Cerrar
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          className="mt-10"
          initialValues={{
            status: QuotationStatus.DRAFT,
            companyId: authContext.value.companyId,
          }}
          onFinish={onSubmitData}
        >
          <Form.Item name="status" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="companyId" hidden>
            <Input type="hidden" />
          </Form.Item>
          <div className="flex flex-col gap-10 md:flex-row md:overflow-x-auto  md:justify-start">
            <div className="w-full lg:w-[60%] xl:w-[70%]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
                <Form.Item
                  label="Clientes"
                  name="clientId"
                  className="mb-3 w-full"
                  rules={[requiredRule]}
                >
                  <Select
                    placeholder="Selecciona un cliente"
                    options={optionsClients}
                    notFoundContent="No hay resultados."
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    allowClear
                  />
                </Form.Item>
                {isEdit && (
                  <Form.Item
                    label="Estado"
                    name="status"
                    className="mb-3 md:w-[28rem]"
                    rules={[requiredRule]}
                  >
                    <Select
                      placeholder={"Selecciona el estado"}
                      options={quoteStatusOptions}
                      notFoundContent="No hay resultados."
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      allowClear
                    />
                  </Form.Item>
                )}
                <Form.Item
                  label="Fecha"
                  name="quotationDate"
                  className="mb-3 md:w-[26rem]"
                  rules={[requiredRule]}
                >
                  <DatePicker
                    placeholder="Selecciona una fecha"
                    className="w-full"
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>

              <div className="flex flex-col">
                <Form.Item label="Productos" className="mb-3 w-full">
                  <Select
                    showSearch
                    placeholder="Selecciona los productos: Búsca por Nombre o SKU"
                    filterOption={(input, option) =>
                      typeof option?.searchValue === "string" &&
                      option.searchValue
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={optionsProductsFormat}
                    onSelect={(value) => {
                      addProduct(Number(value));
                    }}
                    value={null}
                  />
                </Form.Item>

                <div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Productos seleccionados
                    </h3>

                    <div className="border rounded-lg z-10 border-gray-200">
                      <Table
                        rowKey="productId"
                        className=" rounded-lg"
                        columns={productItemColumns}
                        dataSource={items}
                        pagination={false}
                        rowHoverable={false}
                        locale={{
                          emptyText: "No hay productos seleccionados todavía",
                        }}
                        scroll={{ x: "max-content" }}
                      />
                    </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Secciones</h3>
              <div className="flex flex-col gap-2 mb-4">
                <Select
                  placeholder="Agregar sección"
                  options={DEFAULT_SECTIONS.filter(
                    (s) => !sections.find((sec) => sec.title === s.title)
                  ).map((s) => ({ label: s.title, value: s.key }))}
                  onSelect={(value) => addSection(String(value))}
                  value={undefined}
                />
                <Button
                  icon={<PlusOutlined />}
                  type="dashed"
                  onClick={addCustomSection}
                >
                  Agregar sección personalizada
                </Button>
              </div>

              {sections.map((section, index) => (
                <div
                  key={index}
                  className="mb-4 border border-gray-200 p-3 rounded-md"
                >
                  <Input
                    className="mb-2"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(index, "title", e.target.value)
                    }
                  />
                  <TextArea
                    rows={3}
                    value={section.content}
                    onChange={(e) =>
                      updateSection(index, "content", e.target.value)
                    }
                  />
                  <Button
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeSection(index)}
                    className="mt-2"
                    danger
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          </div>
            <div className="w-full md:min-w-[18rem] lg:w-[40%] xl:w-[30%] border-l border-gray-200 bg-accent-light p-5 rounded-lg md:h-full overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Vista previa</h3>
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={index}>
                    <h4 className="font-semibold">{section.title}</h4>
                    <p className="text-sm whitespace-pre-line">{section.content}</p>
                  </div>
                ))}

                {items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Productos</h4>
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.productName} x{item.quantity}
                        </span>
                        <span>
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Subtotal:</p>
                  <p className="font-medium">${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">IVA (16%):</p>
                  <p className="font-medium">${ivaAmount.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                  <h3 className="font-semibold text-gray-900">Total:</h3>
                  <p className="font-bold text-lg text-gray-900">${total.toFixed(2)}</p>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<SaveOutlined />}
              >
                {isEdit ? "Guardar cambios" : "Crear cotización"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
}
