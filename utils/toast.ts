import { Bounce, toast } from "react-toastify";

type Theme = "light" | "dark";

const getBaseConfig = (theme: Theme = "dark") => ({
  className: "toast-shell",
  progressClassName: "toast-progress",
  position: "top-right" as const,
  autoClose: 4200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 45,
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
