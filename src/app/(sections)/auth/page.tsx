"use client";
import { Alert, Spin } from "antd";
import useLogin from "./_fetures/hooks/useLogin";

export default function page() {
  // Login - PostMessage
  const { data } = useLogin();

  return (
    <div className="flex-1 flex flex-col items-center">
      <h2 className="m-4 text-2xl text-accent font-bold">Validar la sesión</h2>

      {data.isLoading && (
        <Spin tip="Validando sesión..." size="large" fullscreen />
      )}

      {data?.error && (
        <Alert
          showIcon
          type="error"
          message={"Error"}
          description={data.message}
        />
      )}
    </div>
  );
}
