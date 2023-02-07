import { useEffect, useRef } from "react";
import {
  addComponent,
  DEFAULT_CHANNEL,
  removeLastComponent,
} from "../ComponentHeap/ComponentHeap";

export function sendMessage(action, fields, hostId = DEFAULT_CHANNEL) {
  return new Promise((resolve, reject) => {
    const comp = (
      <GForm
        action={action}
        fields={fields}
        key={Date.now()}
        resolve={(e) => {
          removeLastComponent(hostId);
          resolve(e);
        }}
        reject={(e) => {
          removeLastComponent(hostId);
          reject(e);
        }}
      />
    );
    addComponent(comp);
  });
}

export function GForm(props) {
  const formRef = useRef();
  useEffect(() => {
    formRef.current.submit();
  }, [props]);
  const formId = Math.random();

  return (
    <>
      <form action={props.action} method="POST" target={formId} ref={formRef}>
        {Object.keys(props.fields || {}).map((fieldName) => {
          return (
            <input
              key={fieldName}
              type="hidden"
              name={fieldName}
              value={props.fields[fieldName]}
            />
          );
        })}
      </form>
      <iframe
        className="invisible"
        id={formId}
        name={formId}
        onLoad={props.resolve}
        onError={props.reject}
        title={formId}
      ></iframe>
    </>
  );
}
