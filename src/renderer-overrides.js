const shopRuntime = window.ClassScoreShopRuntime.createRuntime({
  getActiveBoard: () => getActiveBoard(),
  getSelectedStudent: () => getSelectedStudent(),
  getShopItems: (board) => getShopItems(board),
  getBackpackItems: (board, student) => getBackpackItems(board, student),
  getFeedableItems: (board, student) => getFeedableItems(board, student),
  getReviveItems: (board, student) => getReviveItems(board, student),
  getIncubatingEggs: (student) => getIncubatingEggs(student),
  getStudentPets: (student) => getStudentPets(student),
  getStudentInventoryCount: (student, itemId) => getStudentInventoryCount(student, itemId),
  getDefaultShopIcon: (effectType) => getDefaultShopIcon(effectType),
  getShopEffectTypeLabel: (effectType) => getShopEffectTypeLabel(effectType),
  changeStudentScore: (student, delta, itemName, note) => changeStudentScore(student, delta, itemName, note),
  updateStudentInventory: (student, itemId, delta) => updateStudentInventory(student, itemId, delta),
  commitState: (message) => commitState(message),
  reopenShopLater: () => reopenShopLater(),
  reopenPetHomeLater: () => reopenPetHomeLater(),
  createDefaultPetCollection: () => createDefaultPetCollection(),
  createIncubatingEgg: (itemId) => createIncubatingEgg(itemId),
  openModal: (config) => openModal(config),
  openShopEditorModal: () => openShopEditorModal(),
  openPetHomeModal: () => openPetHomeModal(),
  showToast: (message) => showToast(message),
  escapeHtml: (value) => escapeHtml(value),
  scoreTone: (score) => scoreTone(score),
  formatSignedScore: (score) => formatSignedScore(score)
});

const petRuntime = window.ClassScorePetRuntime.createRuntime();

function isPetShopEffectType(effectType) {
  return shopRuntime.isPetShopEffectType(effectType);
}

function getPetShopItems(board) {
  return shopRuntime.getPetShopItems(board);
}

function getScoreShopItems(board) {
  return shopRuntime.getScoreShopItems(board);
}

function reopenPetShopLater() {
  return shopRuntime.reopenPetShopLater();
}

function purchaseShopItem(itemId) {
  return shopRuntime.purchaseShopItem(itemId);
}

function purchasePetShopItem(itemId) {
  return shopRuntime.purchasePetShopItem(itemId);
}

function renderShopModal(board, student) {
  return shopRuntime.renderShopModal(board, student);
}

function openShopModal() {
  return shopRuntime.openShopModal();
}

function renderPetShopModal(board, student) {
  return shopRuntime.renderPetShopModal(board, student);
}

function openPetShopModal() {
  return shopRuntime.openPetShopModal();
}

function purchaseAndReviveActivePet() {
  return petRuntime.purchaseAndReviveActivePet();
}

function renderPetBattleModal(board, student) {
  return petRuntime.renderPetBattleModal(board, student);
}

function openPetBattleModal() {
  return petRuntime.openPetBattleModal();
}

function renderPetHomeModal(board, student) {
  return petRuntime.renderPetHomeModal(board, student);
}

function openPetHomeModal() {
  return petRuntime.openPetHomeModal();
}

function renderPetAvatarMarkup(speciesId, label = '') {
  return petRuntime.renderPetAvatarMarkup(speciesId, label);
}
