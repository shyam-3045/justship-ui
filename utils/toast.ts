import { Bounce, toast } from "react-toastify";

type Theme = "light" | "dark";

const getBaseConfig = (theme: Theme = "dark") => ({
  className: "toast-auto",
  position: "top-right" as const,
  autoClose: 3250,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme,
  transition: Bounce,
});

export function toastSuccess(msg: string, theme: Theme = "dark") {
  toast.success(msg, getBaseConfig(theme));
}

export function toastFailure(msg: string, theme: Theme = "dark") {
  toast.error(msg, getBaseConfig(theme));
}
