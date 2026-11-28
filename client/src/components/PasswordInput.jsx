import { useState } from "react";
import { inputCls } from "./ui";

// Password box with a "show / hide" eye button
export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={`${inputCls} pr-16`} />
      <button type="button" onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-blue-700 px-2 py-1">
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
