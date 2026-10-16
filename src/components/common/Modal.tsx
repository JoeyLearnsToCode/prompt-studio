import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    fullscreen: 'max-w-full w-full h-full m-0',
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out-expo duration-standard"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-expo duration-fast"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* 不用 backdrop-blur：淡入期间每帧都要重算整页模糊，在重页面上会明显掉帧 */}
          <div className="fixed inset-0 bg-masthead/50 dark:bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out-expo duration-standard"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in-expo duration-fast"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Dialog.Panel
                className={`transform overflow-hidden rounded-md paper text-surface-onSurface dark:text-surface-onSurfaceDark shadow-float border border-border dark:border-border-dark transition-[opacity,transform] ${sizeClasses[size]}`}
              >
                {title && (
                  <>
                    {/* 齿孔撕线只在报头下沿出现一次；弹层用发丝线分隔，避免母题降级成壁纸 */}
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold px-6 py-4 border-b border-border dark:border-border-dark text-surface-onSurface dark:text-surface-onSurfaceDark"
                    >
                      {title}
                    </Dialog.Title>
                  </>
                )}
                <div className="p-6">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
