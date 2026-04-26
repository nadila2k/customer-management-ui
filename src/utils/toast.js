import { toast } from "react-toastify";

const base = {
  autoClose: 3500,
  pauseOnHover: true,
  closeOnClick: true
};

export function toastSuccess(message, options) {
  return toast.success(message, { ...base, ...options });
}

export function toastWarning(message, options) {
  return toast.warn(message, { ...base, ...options });
}

export function toastError(message, options) {
  return toast.error(message, { ...base, ...options });
}

export function toastInfo(message, options) {
  return toast.info(message, { ...base, ...options });
}
