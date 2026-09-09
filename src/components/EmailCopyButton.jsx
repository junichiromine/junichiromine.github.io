import { useRef, useState } from 'react';
import { Toast } from '@base-ui/react/toast';
import { Tooltip } from '@base-ui/react/tooltip';

const copyToastManager = Toast.createToastManager();

function CopyToastViewport() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Portal>
      <Toast.Viewport className="copy-toast-viewport">
        {toasts.map((toast) => (
          <Toast.Positioner key={toast.id} toast={toast} className="copy-toast-positioner">
            <Toast.Root toast={toast} className="copy-toast">
              <Toast.Content>
                <Toast.Description className="copy-toast-description" />
              </Toast.Content>
            </Toast.Root>
          </Toast.Positioner>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

export default function EmailCopyButton({ email }) {
  const [copied, setCopied] = useState(false);
  const triggerRef = useRef(null);
  const [localPart, domainPart] = email.split('@');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // clipboard API unavailable; the mailto link still works as a fallback.
    }

    setCopied(true);
    copyToastManager.add({
      description: 'コピーしました',
      positionerProps: { anchor: triggerRef.current, sideOffset: 10 },
      timeout: 1500,
      onClose() {
        setCopied(false);
      },
    });
  };

  return (
    <Toast.Provider toastManager={copyToastManager}>
      <Tooltip.Provider>
        <Tooltip.Root disabled={copied}>
          <Tooltip.Trigger
            ref={triggerRef}
            render={<a href={`mailto:${email}`} className="email-link" />}
            closeOnClick={false}
            onClick={(event) => {
              event.preventDefault();
              handleCopy();
            }}
          >
            {localPart}@<wbr />
            {domainPart}
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={8}>
              <Tooltip.Popup className="email-tooltip">クリックでコピー</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
      <CopyToastViewport />
    </Toast.Provider>
  );
}
