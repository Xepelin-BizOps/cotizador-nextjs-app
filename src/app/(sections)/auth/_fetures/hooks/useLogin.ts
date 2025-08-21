"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/app/hooks/useAuthContext";
import { authMe, login } from "../action";

type Currency = { id: number; value: string };
type UserData = { id: number; email: string; companyId: number; currency: Currency };
type ResAuthMe = { success: boolean; message: string; data: UserData | null };
type AuthMessage = { type?: string; token?: string };

function isAuthMessage(data: unknown): data is AuthMessage {
  return typeof data === "object" && data !== null && ("token" in data || "type" in data);
}

function getAllowedOrigins() {
  const raw = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? "";
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const allowAll = list.includes("*");
  return { list, allowAll };
}

type HookState = {
  isLoading: boolean;
  data: unknown;
  message: string;
  error: boolean;
};

type UseLoginReturn = HookState & {
  setData: React.Dispatch<React.SetStateAction<HookState>>;
};

export default function useLogin(): UseLoginReturn {
  const router = useRouter();
  const { setValue } = useAuthContext();

  const [data, setData] = useState<HookState>({
    isLoading: false,
    data: null,
    message: "",
    error: false,
  });

  useEffect(() => {
    const { list: allowedOrigins, allowAll } = getAllowedOrigins();

    const handleMessage = async (event: MessageEvent<unknown>) => {
      const authMsg = isAuthMessage(event.data) ? event.data : undefined;

      console.log("[useLogin] postMessage recibido", {
        origin: event.origin,
        allowAll,
        allowedOrigins,
        dataType: typeof event.data,
        hasToken: !!(authMsg && typeof authMsg.token === "string"),
        type: authMsg?.type,
      });

      if (!allowAll && !allowedOrigins.includes(event.origin)) {
        console.warn("[useLogin] postMessage bloqueado por origen NO permitido", {
          origin: event.origin,
          allowedOrigins,
        });
        return;
      }

      if (!authMsg?.token) return;
      const token = authMsg.token;

      try {
        setData((s) => ({ ...s, isLoading: true, message: "" }));

        await login(token, event.origin);

        const res: ResAuthMe = await authMe();
        if (!res.success || !res.data) throw new Error("AuthMe sin datos");

        // setValue espera al usuario (UserData)
        setValue(res.data);

        router.push("/home");
      } catch {
        setData((s) => ({
          ...s,
          error: true,
          message: "No se pudo autenticar",
          isLoading: false,
        }));
      } finally {
        setData((s) => ({ ...s, isLoading: false }));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router, setValue]);

  return { ...data, setData };
}
