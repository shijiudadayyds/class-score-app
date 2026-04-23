(function attachClassScoreUiRuntime(globalObject) {
  function createRuntime(options) {
    let currentModalHandler = null;
    let currentModalCleanup = null;
    let pendingModalConfig = null;

    function getUi() {
      return options.getUi();
    }

    function openModal(config) {
      const ui = getUi();
      if (ui.modalDialog.open) {
        pendingModalConfig = config;
        ui.modalDialog.close();
        return;
      }

      pendingModalConfig = null;
      ui.modalTitle.textContent = config.title || '操作';
      ui.modalBody.innerHTML = config.html || '';
      ui.modalSubmitBtn.hidden = Boolean(config.hideSubmit);
      ui.modalSubmitBtn.textContent = config.submitText || '确定';
      ui.modalSubmitBtn.className = config.submitClassName || 'mini-action mini-action-green';
      ui.modalCancelBtn.textContent = config.cancelText || '取消';
      currentModalHandler = typeof config.onSubmit === 'function' ? config.onSubmit : null;
      currentModalCleanup = typeof config.onOpen === 'function' ? config.onOpen(ui.modalBody) : null;
      ui.modalDialog.showModal();
    }

    async function handleModalSubmit(event) {
      const ui = getUi();
      event.preventDefault();

      if (!currentModalHandler) {
        closeModal();
        return;
      }

      const result = await currentModalHandler(new FormData(ui.modalForm), ui.modalBody);
      if (result !== false) {
        closeModal();
      }
    }

    function closeModal() {
      const ui = getUi();
      if (ui.modalDialog.open) {
        ui.modalDialog.close();
      }
    }

    function cleanupModal() {
      const ui = getUi();

      if (typeof currentModalCleanup === 'function') {
        currentModalCleanup();
      }

      currentModalHandler = null;
      currentModalCleanup = null;
      ui.modalBody.innerHTML = '';

      if (pendingModalConfig) {
        const nextConfig = pendingModalConfig;
        pendingModalConfig = null;
        openModal(nextConfig);
      }
    }

    function showToast(message) {
      const ui = getUi();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      ui.toastStack.appendChild(toast);

      globalObject.setTimeout(() => {
        toast.remove();
      }, 2500);
    }

    return {
      openModal,
      handleModalSubmit,
      closeModal,
      cleanupModal,
      showToast
    };
  }

  globalObject.ClassScoreUiRuntime = {
    createRuntime
  };
})(window);
