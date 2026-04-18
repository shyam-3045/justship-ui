import { Bounce, toast } from "react-toastify";

const baseConfig = {
  className: "toast-auto",
  position: "top-center" as const,
  autoClose: 3250,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  progress: undefined,
  theme: "light" as const,
  transition: Bounce,
};

export function toastSuccess(msg: string) {
  toast.success(msg, baseConfig);
}

export function toastFailure(msg: string) {
  toast.error(msg, baseConfig);
}
