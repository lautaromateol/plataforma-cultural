import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { toast } from "sonner";

type RequestType = InferRequestType<
  (typeof client.api.auth)["resend-mail"]["$patch"]
>["json"];
type ResponseType = {
  message: string;
  status: number;
};
export function useResendMail() {
  const {
    mutate: resendMail,
    isPending: isResendingMail,
  } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth["resend-mail"]["$patch"]({
        json,
      });

      if (response.status !== 200) {
        const errorData = await response.json();
        const error = new Error(errorData.message);
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      const data = await response.json();

      return {
        ...data,
        status: response.status,
      };
    },
    onSuccess: (data) => toast.success(data.message),
    onError: (error) => toast.error(error.message),
  });

  return { resendMail, isResendingMail };
}
