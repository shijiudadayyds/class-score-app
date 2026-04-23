(function attachClassScoreShopRuntime(globalObject) {
  function createRuntime(options) {
    function isPetShopEffectType(effectType) {
      return effectType === 'pet-egg' || effectType === 'snack' || effectType === 'revive';
    }

    function getPetShopItems(board) {
      return options.getShopItems(board).filter((item) => isPetShopEffectType(item.effectType));
    }

    function getScoreShopItems(board) {
      return options.getShopItems(board).filter((item) => !isPetShopEffectType(item.effectType));
    }

    function reopenPetShopLater() {
      globalObject.setTimeout(() => {
        if (options.getSelectedStudent()) {
          openPetShopModal();
        }
      }, 0);
    }

    function purchaseShopItem(itemId) {
      const board = options.getActiveBoard();
      const student = options.getSelectedStudent();
      const item = getScoreShopItems(board).find((shopItem) => shopItem.id === itemId);

      if (!board || !student || !item) {
        options.showToast('当前学生或商品不存在。');
        return;
      }
      if (item.enabled === false) {
        options.showToast('该商品当前已下架。');
        return;
      }
      if (student.score < item.cost) {
        options.showToast('积分不足，无法兑换。');
        return;
      }

      options.changeStudentScore(student, -item.cost, `积分兑换：${item.name}`, '积分商城');
      options.updateStudentInventory(student, item.id, 1);
      options.commitState(`${student.name} 已在积分商城兑换 ${item.name}。`);
      options.reopenShopLater();
    }

    function purchasePetShopItem(itemId) {
      const board = options.getActiveBoard();
      const student = options.getSelectedStudent();
      const item = getPetShopItems(board).find((shopItem) => shopItem.id === itemId);

      if (!board || !student || !item) {
        options.showToast('当前学生或宠物商品不存在。');
        return;
      }
      if (item.enabled === false) {
        options.showToast('该商品当前已下架。');
        return;
      }
      if (student.score < item.cost) {
        options.showToast('积分不足，无法兑换。');
        return;
      }

      options.changeStudentScore(student, -item.cost, `宠物兑换：${item.name}`, '宠物商城');
      if (item.effectType === 'pet-egg') {
        if (!student.petCollection || typeof student.petCollection !== 'object') {
          student.petCollection = options.createDefaultPetCollection();
        }
        student.petCollection.incubatingEggs.push(options.createIncubatingEgg(item.id));
        options.commitState(`${student.name} 已兑换 ${item.name}，并直接放入孵化仓。`);
        options.reopenPetHomeLater();
        return;
      }

      options.updateStudentInventory(student, item.id, 1);
      options.commitState(`${student.name} 已在宠物商城兑换 ${item.name}。`);
      reopenPetShopLater();
    }

    function renderShopModal(board, student) {
      const shopItems = getScoreShopItems(board);
      const backpackItems = options.getBackpackItems(board, student)
        .filter((item) => !isPetShopEffectType(item.effectType));

      return `
        <div class="pet-modal-toolbar">
          <button class="mini-action mini-action-green" type="button" data-action="open-pet-shop">宠物商城</button>
          <button class="mini-action" type="button" data-action="edit-shop-rules">编辑商城规则</button>
        </div>
        <section class="pet-student-summary">
          <div>
            <p class="card-kicker">积分商城</p>
            <h3>${options.escapeHtml(student.name)}</h3>
            <p class="modal-help">这里仅显示普通积分商品。宠物蛋、零食、复活币已拆分到独立的宠物商城。</p>
          </div>
          <div class="shop-score-pill ${options.scoreTone(student.score)}">${options.formatSignedScore(student.score)}</div>
        </section>
        <section class="modal-panel">
          <h3>普通积分商品</h3>
          ${shopItems.length > 0 ? `
            <div class="shop-grid">
              ${shopItems.map((item) => {
                const ownedCount = options.getStudentInventoryCount(student, item.id);
                const canBuy = item.enabled !== false && student.score >= item.cost;
                return `
                  <article class="shop-card ${item.enabled === false ? 'is-disabled' : ''}">
                    <div class="shop-card-top">
                      <span class="shop-card-icon">${options.escapeHtml(item.icon || options.getDefaultShopIcon(item.effectType))}</span>
                      <div>
                        <strong>${options.escapeHtml(item.name)}</strong>
                        <small>${options.escapeHtml(options.getShopEffectTypeLabel(item.effectType))}</small>
                      </div>
                    </div>
                    <p class="modal-help">${options.escapeHtml(item.description || '可在积分商城中兑换。')}</p>
                    <div class="shop-card-bottom">
                      <div class="preview-tag-row">
                        <span class="preview-tag">需要 ${item.cost} 积分</span>
                        <span class="preview-tag">已拥有 ${ownedCount}</span>
                      </div>
                      <button class="mini-action ${canBuy ? 'mini-action-orange' : ''}" type="button" data-action="buy-shop-item" data-item-id="${item.id}" ${canBuy ? '' : 'disabled'}>
                        ${item.enabled === false ? '已下架' : student.score < item.cost ? '积分不足' : '立即兑换'}
                      </button>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          ` : '<div class="empty-state">当前还没有配置普通积分商品，可以在“编辑商城规则”里新增。</div>'}
        </section>
        <section class="modal-panel">
          <h3>普通背包</h3>
          ${backpackItems.length > 0
            ? `<div class="preview-tag-row">${backpackItems.map((item) => `<span class="preview-tag">${options.escapeHtml(item.icon || options.getDefaultShopIcon(item.effectType))} ${options.escapeHtml(item.name)} × ${item.count}</span>`).join('')}</div>`
            : '<div class="empty-state">当前还没有普通积分商品进入背包。</div>'}
        </section>
      `;
    }

    function openShopModal() {
      const board = options.getActiveBoard();
      const student = options.getSelectedStudent();

      if (!board || !student) {
        options.showToast('请先选中学生，再打开积分商城。');
        return;
      }

      options.openModal({
        title: '积分商城',
        hideSubmit: true,
        cancelText: '关闭',
        html: renderShopModal(board, student),
        onOpen: (body) => {
          const handleClick = (event) => {
            const actionNode = event.target.closest('[data-action]');
            const action = actionNode?.dataset.action;
            const itemId = actionNode?.dataset.itemId || '';

            if (!action) {
              return;
            }
            if (action === 'buy-shop-item') {
              purchaseShopItem(itemId);
              return;
            }
            if (action === 'edit-shop-rules') {
              options.openShopEditorModal();
              return;
            }
            if (action === 'open-pet-shop') {
              openPetShopModal();
            }
          };

          body.addEventListener('click', handleClick);
          return () => {
            body.removeEventListener('click', handleClick);
          };
        }
      });
    }

    function renderPetShopModal(board, student) {
      const petItems = getPetShopItems(board);
      const eggItems = petItems.filter((item) => item.effectType === 'pet-egg');
      const supplyItems = petItems.filter((item) => item.effectType !== 'pet-egg');
      const incubatingEggs = options.getIncubatingEggs(student);
      const pets = options.getStudentPets(student);
      const feedCount = options.getFeedableItems(board, student).reduce((sum, item) => sum + item.count, 0);
      const reviveCount = options.getReviveItems(board, student).reduce((sum, item) => sum + item.count, 0);

      return `
        <div class="pet-modal-toolbar">
          <button class="mini-action mini-action-green" type="button" data-action="open-pet-home">宠物家园</button>
          <button class="mini-action" type="button" data-action="open-score-shop">积分商城</button>
          <button class="mini-action" type="button" data-action="edit-shop-rules">编辑商城规则</button>
        </div>
        <section class="pet-student-summary">
          <div>
            <p class="card-kicker">宠物商城</p>
            <h3>${options.escapeHtml(student.name)}</h3>
            <p class="modal-help">宠物蛋会在购买后直接放入孵化仓；零食和复活币会进入宠物背包。</p>
          </div>
          <div class="shop-score-pill ${options.scoreTone(student.score)}">${options.formatSignedScore(student.score)}</div>
        </section>
        <section class="modal-panel">
          <h3>孵化与成长</h3>
          <div class="preview-tag-row">
            <span class="preview-tag">宠物 ${pets.length} 只</span>
            <span class="preview-tag">孵化仓 ${incubatingEggs.length} 格</span>
            <span class="preview-tag">零食 ${feedCount} 件</span>
            <span class="preview-tag">复活币 ${reviveCount} 枚</span>
          </div>
        </section>
        <section class="modal-panel">
          <h3>宠物蛋</h3>
          ${eggItems.length > 0 ? `
            <div class="shop-grid">
              ${eggItems.map((item) => {
                const canBuy = item.enabled !== false && student.score >= item.cost;
                return `
                  <article class="shop-card ${item.enabled === false ? 'is-disabled' : ''}">
                    <div class="shop-card-top">
                      <span class="shop-card-icon">${options.escapeHtml(item.icon || options.getDefaultShopIcon(item.effectType))}</span>
                      <div>
                        <strong>${options.escapeHtml(item.name)}</strong>
                        <small>${options.escapeHtml(options.getShopEffectTypeLabel(item.effectType))} · 默认孵化 7 天</small>
                      </div>
                    </div>
                    <p class="modal-help">${options.escapeHtml(item.description || '购买后直接进入孵化仓，可用积分继续加速。')}</p>
                    <div class="shop-card-bottom">
                      <div class="preview-tag-row">
                        <span class="preview-tag">需要 ${item.cost} 积分</span>
                        <span class="preview-tag">购买后直接孵化</span>
                      </div>
                      <button class="mini-action ${canBuy ? 'mini-action-orange' : ''}" type="button" data-action="buy-pet-shop-item" data-item-id="${item.id}" ${canBuy ? '' : 'disabled'}>
                        ${item.enabled === false ? '已下架' : student.score < item.cost ? '积分不足' : '兑换并入仓'}
                      </button>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          ` : '<div class="empty-state">当前没有上架宠物蛋商品。</div>'}
        </section>
        <section class="modal-panel">
          <h3>零食与复活</h3>
          ${supplyItems.length > 0 ? `
            <div class="shop-grid">
              ${supplyItems.map((item) => {
                const ownedCount = options.getStudentInventoryCount(student, item.id);
                const canBuy = item.enabled !== false && student.score >= item.cost;
                return `
                  <article class="shop-card ${item.enabled === false ? 'is-disabled' : ''}">
                    <div class="shop-card-top">
                      <span class="shop-card-icon">${options.escapeHtml(item.icon || options.getDefaultShopIcon(item.effectType))}</span>
                      <div>
                        <strong>${options.escapeHtml(item.name)}</strong>
                        <small>${options.escapeHtml(options.getShopEffectTypeLabel(item.effectType))}${item.effectType === 'snack' ? ` · 成长 +${item.growthGain}` : ''}</small>
                      </div>
                    </div>
                    <p class="modal-help">${options.escapeHtml(item.description || '兑换后进入宠物背包。')}</p>
                    <div class="shop-card-bottom">
                      <div class="preview-tag-row">
                        <span class="preview-tag">需要 ${item.cost} 积分</span>
                        <span class="preview-tag">已拥有 ${ownedCount}</span>
                      </div>
                      <button class="mini-action ${canBuy ? 'mini-action-orange' : ''}" type="button" data-action="buy-pet-shop-item" data-item-id="${item.id}" ${canBuy ? '' : 'disabled'}>
                        ${item.enabled === false ? '已下架' : student.score < item.cost ? '积分不足' : '兑换到背包'}
                      </button>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          ` : '<div class="empty-state">当前没有上架宠物补给商品。</div>'}
        </section>
      `;
    }

    function openPetShopModal() {
      const board = options.getActiveBoard();
      const student = options.getSelectedStudent();

      if (!board || !student) {
        options.showToast('请先选中学生，再打开宠物商城。');
        return;
      }

      options.openModal({
        title: '宠物商城',
        hideSubmit: true,
        cancelText: '关闭',
        html: renderPetShopModal(board, student),
        onOpen: (body) => {
          const handleClick = (event) => {
            const actionNode = event.target.closest('[data-action]');
            const action = actionNode?.dataset.action;
            const itemId = actionNode?.dataset.itemId || '';

            if (!action) {
              return;
            }
            if (action === 'buy-pet-shop-item') {
              purchasePetShopItem(itemId);
              return;
            }
            if (action === 'open-pet-home') {
              options.openPetHomeModal();
              return;
            }
            if (action === 'open-score-shop') {
              openShopModal();
              return;
            }
            if (action === 'edit-shop-rules') {
              options.openShopEditorModal();
            }
          };

          body.addEventListener('click', handleClick);
          return () => {
            body.removeEventListener('click', handleClick);
          };
        }
      });
    }

    return {
      isPetShopEffectType,
      getPetShopItems,
      getScoreShopItems,
      reopenPetShopLater,
      purchaseShopItem,
      purchasePetShopItem,
      renderShopModal,
      openShopModal,
      renderPetShopModal,
      openPetShopModal
    };
  }

  globalObject.ClassScoreShopRuntime = {
    createRuntime
  };
})(window);
