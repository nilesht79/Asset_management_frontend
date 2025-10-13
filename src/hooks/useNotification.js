import { notification } from 'antd';

export const useNotification = () => {
  const showSuccess = (message, description = '') => {
    notification.success({
      message,
      description,
      placement: 'topRight',
      duration: 3,
    });
  };

  const showError = (message, description = '') => {
    notification.error({
      message,
      description,
      placement: 'topRight',
      duration: 4,
    });
  };

  const showInfo = (message, description = '') => {
    notification.info({
      message,
      description,
      placement: 'topRight',
      duration: 3,
    });
  };

  const showWarning = (message, description = '') => {
    notification.warning({
      message,
      description,
      placement: 'topRight',
      duration: 3,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
