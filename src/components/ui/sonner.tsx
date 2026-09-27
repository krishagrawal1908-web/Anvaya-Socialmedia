import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      richColors
      position="bottom-right"
      {...props}
    />
  );
};

export { Toaster };
