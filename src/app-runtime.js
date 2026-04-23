(function attachClassScoreAppRuntime(globalObject) {
  function createRuntime(options) {
    const historyState = {
      undo: [],
      redo: []
    };
    const maxHistory = Number.isFinite(Number(options.maxHistory))
      ? Number(options.maxHistory)
      : 40;
    const saveDelayMs = Number.isFinite(Number(options.saveDelayMs))
      ? Number(options.saveDelayMs)
      : 220;

    let saveTimer = null;
    let lastCommittedSnapshot = null;

    function serializeState() {
      return options.buildSerializableState();
    }

    function createSnapshot() {
      return JSON.stringify(options.buildSnapshotPayload(serializeState));
    }

    function restoreSnapshot(snapshotText) {
      const snapshot = JSON.parse(snapshotText);
      options.restoreSnapshotPayload(snapshot);
    }

    function pushHistorySnapshot(target, snapshot) {
      target.push(snapshot);
      if (target.length > maxHistory) {
        target.shift();
      }
    }

    function syncWidgetState() {
      const payload = options.buildWidgetPayload();
      options.updateWidgetState(payload);
      return payload;
    }

    function scheduleSave() {
      globalObject.clearTimeout(saveTimer);
      saveTimer = globalObject.setTimeout(async () => {
        await options.saveState(serializeState());
      }, saveDelayMs);
    }

    function undoLastAction() {
      if (historyState.undo.length === 0) {
        options.showToast('当前没有可撤销的操作。');
        return;
      }

      const currentSnapshot = createSnapshot();
      const previousSnapshot = historyState.undo.pop();
      pushHistorySnapshot(historyState.redo, currentSnapshot);
      restoreSnapshot(previousSnapshot);
      lastCommittedSnapshot = createSnapshot();
      options.renderAll();
      syncWidgetState();
      scheduleSave();
      options.showToast('已撤销上一步。');
    }

    function redoLastAction() {
      if (historyState.redo.length === 0) {
        options.showToast('当前没有可恢复的操作。');
        return;
      }

      const currentSnapshot = createSnapshot();
      const nextSnapshot = historyState.redo.pop();
      pushHistorySnapshot(historyState.undo, currentSnapshot);
      restoreSnapshot(nextSnapshot);
      lastCommittedSnapshot = createSnapshot();
      options.renderAll();
      syncWidgetState();
      scheduleSave();
      options.showToast('已恢复上一步。');
    }

    function commitState(message) {
      if (lastCommittedSnapshot) {
        pushHistorySnapshot(historyState.undo, lastCommittedSnapshot);
        historyState.redo = [];
      }

      options.beforeCommit();
      lastCommittedSnapshot = createSnapshot();
      options.renderAll();
      syncWidgetState();
      scheduleSave();

      if (message) {
        options.showToast(message);
      }
    }

    return {
      historyState,
      serializeState,
      createSnapshot,
      restoreSnapshot,
      pushHistorySnapshot,
      undoLastAction,
      redoLastAction,
      commitState,
      scheduleSave,
      syncWidgetState,
      getLastCommittedSnapshot() {
        return lastCommittedSnapshot;
      },
      setLastCommittedSnapshot(snapshot) {
        lastCommittedSnapshot = snapshot;
      }
    };
  }

  globalObject.ClassScoreAppRuntime = {
    createRuntime
  };
})(window);
