import { useState } from "react";

export const useProjectDetailPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [tabContext, setTabContext] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const handleNavigateToTab = (tab, context = null) => {
    setActiveTab(tab);
    setTabContext(context);
  };

  const openEditModal = () => setIsEditOpen(true);

  const requestCloseEditModal = () => {
    if (
      isFormDirty &&
      !window.confirm(
        "Perubahan yang belum disimpan akan hilang. Tutup form edit ini?"
      )
    )
      return;
    setIsEditOpen(false);
    setIsFormDirty(false);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setIsFormDirty(false);
  };

  return {
    activeTab,
    setActiveTab,
    tabContext,
    setTabContext,
    isEditOpen,
    isFormDirty,
    setIsFormDirty,
    handleNavigateToTab,
    openEditModal,
    requestCloseEditModal,
    closeEditModal,
  };
};
